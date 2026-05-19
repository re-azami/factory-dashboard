"""
End-to-end tests for UI-001c: Angular SPA query history page.

The SPA at port 4200 exposes a Persian query-history surface at ``/history``
that fetches ``GET /history?limit=N`` from the FastAPI backend (port 8000)
and renders each ``query_log`` row as an ``<article>`` with the question,
metadata, answer, and an expandable list of tool calls. This file verifies
the *observable* contract of that page:

* Persian chrome renders (slider label, refresh button, and either a list of
  entries or the empty-state hint).
* After driving the chat backend with a unique marker question, the same
  question becomes visible in the history list.
* Expanding the tool-calls panel for that entry reveals the ``execute_sql``
  payload.
* The header's ``تاریخچه`` menu button navigates to ``/history`` and the
  history page renders.

Locator policy (mirrors test_ui_001a_scaffold.py and test_ui_001b_chat.py):

* role/label/text/placeholder-based locators for visible UI.
* ``page.evaluate(...)`` only for ``page.url`` / localStorage reads — none
  are needed here, but the convention is documented for consistency.
* Disambiguate duplicated Persian strings by scoping to ARIA landmarks
  (``banner`` for the header, ``main`` for the page body). ``<article>`` is
  used as a semantic landmark via ``get_by_role("article")`` so we never
  reach for a Material CSS class.

NO Material CSS class selectors. NO xpath. NO ``:nth-child``.

Note on the page-header menu (inspected at
``frontend-spa/src/app/shared/page/header/page-header.component.html``):
each ``IPageMenu`` entry whose ``children`` array has length 1 renders as a
single ``<button mat-button>`` whose click handler navigates directly via
``Router.navigate`` (no Material ``<mat-menu>`` dropdown). The HISTORY entry
currently has exactly one child (``app.component.ts`` lines 26–30), so
``test_history_menu_link_navigates`` clicks the top-level
``تاریخچه`` button and asserts the URL lands on ``/history`` — it does NOT
chase a phantom submenu item that the template would not render in this
case.

Note on the Material expansion-panel header: ``<mat-expansion-panel-header>``
maps to ``role="button"`` (Material's CDK marks the header div with
``role="button"`` and an ``aria-expanded`` state). The accessible name is
derived from the ``<mat-panel-title>`` text content, so the header is
locatable via ``get_by_role("button", name=re.compile(r"فراخوانی ابزارها"))``.

Note on ``require_stack``: the session-scoped autouse fixture in
``tests/e2e/conftest.py`` insists on Streamlit (port 8501) being reachable.
That is a session-wide pre-condition for the whole e2e suite, so these
history tests will not run unless Streamlit is also up. We do NOT loosen it
from this file (the spec forbids modifying conftest.py); see the report
back to Stage 4.
"""
import json
import re
from uuid import uuid4

import httpx
from playwright.sync_api import Page, expect


# ---------- Persian copy (exact codepoints — no transliteration) -------------

PAGE_TITLE = "تاریخچه پرسش‌ها"
SLIDER_LABEL = "نمایش آخرین N پرسش"
REFRESH_BUTTON_LABEL = "بارگذاری مجدد"
EMPTY_STATE = "پرسشی ثبت نشده است"
TOOL_CALLS_EXPANDER_PREFIX = "فراخوانی ابزارها"
ABOUT_LABEL = "درباره نرم‌افزار"
MENU_TOP_LABEL = "تاریخچه"
MENU_CHILD_LABEL = "تاریخچه پرسش‌ها"


# ---------- Bootstrap helpers ------------------------------------------------


def _wait_for_bootstrap(page: Page) -> None:
    """Wait until Angular has bootstrapped ``<app-root>``.

    Before bootstrap ``<app-root>`` contains only the loading placeholder from
    ``src/index.html``; after bootstrap the Angular app inserts its component
    tree so ``<app-root>`` has more than one child. We then wait for the
    about button — the canonical "header rendered, app interactive" signal
    used across the existing UI-001a / UI-001b tests.
    """
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


def _goto_history(page: Page, spa_url: str) -> None:
    """Navigate to ``/history`` and wait for Angular bootstrap."""
    page.goto(f"{spa_url}/history")
    _wait_for_bootstrap(page)


def _seed_history_row(backend_url: str, question: str) -> None:
    """POST a question to ``/chat`` and drain the NDJSON stream to completion.

    Returning from this function guarantees the row has been committed to
    ``query_log`` (the backend writes the row after the generator finishes
    yielding). We use a long timeout because real LLM round-trips can take
    well over a minute against deep-mode models.

    Errors here are real precondition failures — propagate them so the
    operator sees the cause rather than letting the assertion silently fail.
    """
    with httpx.stream(
        "POST",
        f"{backend_url}/chat",
        json={"question": question},
        timeout=httpx.Timeout(180.0, connect=10.0),
    ) as r:
        r.raise_for_status()
        # Drain every NDJSON event; the backend only commits the query_log
        # row once the generator has fully run.
        for _line in r.iter_lines():
            # Optional sanity-check that lines parse — keeps the drain from
            # being silently skipped if the response is buffered weirdly.
            stripped = _line.strip() if _line else ""
            if not stripped:
                continue
            json.loads(stripped)


# ---------- Tests ------------------------------------------------------------


def test_history_page_renders_persian_chrome(page: Page, spa_url, require_spa):
    """The history page renders its slider label, refresh button, and either
    a list of entries OR the empty-state.

    We deliberately do NOT pre-seed a row here — the page must render its
    chrome regardless of data state. To stay deterministic across both
    states we assert that *either* the empty-state text is visible *or* at
    least one ``<article>`` exists inside ``<main>``. ``<article>`` maps to
    ``role="article"`` automatically, so the lookup stays inside the allowed
    locator set and never reaches for a Material CSS class.
    """
    _goto_history(page, spa_url)

    # Slider label (the visible <label for="historyLimit">).
    expect(page.get_by_text(SLIDER_LABEL, exact=True)).to_be_visible()

    # Refresh button — match on its visible Persian text (the button's
    # accessible name is the inner <span> text).
    expect(
        page.get_by_role("button", name=REFRESH_BUTTON_LABEL)
    ).to_be_visible()

    # Either at least one entry is visible OR the empty-state is shown.
    # Scope both probes to the ``main`` landmark so the header chrome can
    # never satisfy them by accident.
    main = page.get_by_role("main")
    empty_hint = main.get_by_text(EMPTY_STATE, exact=True)
    first_article = main.get_by_role("article").first

    # Wait briefly for the initial HTTP fetch to resolve and the page to
    # commit to one of the two states. ``Locator.or_`` returns a locator
    # that matches whichever side resolves first; ``expect(...)`` then
    # asserts at least one is visible.
    expect(empty_hint.or_(first_article).first).to_be_visible(timeout=15_000)


def test_history_lists_recent_entries(
    page: Page, spa_url, backend_url, require_spa
):
    """Posting a question via ``POST /chat`` makes it appear on ``/history``."""
    marker = uuid4().hex[:8]
    question = (
        f"How many downtime events are there in 1405? (test_ui_001c::{marker})"
    )
    _seed_history_row(backend_url, question)

    _goto_history(page, spa_url)

    # Locate by the unique marker substring — scoped to main so any header
    # chrome that incidentally renders similar text cannot satisfy the
    # assertion. The marker is short and unique, so ``.first`` is safe.
    main = page.get_by_role("main")
    expect(main.get_by_text(marker).first).to_be_visible(timeout=15_000)


def test_history_tool_calls_expander_reveals_payload(
    page: Page, spa_url, backend_url, require_spa
):
    """Expanding «فراخوانی ابزارها (N)» on an entry reveals ``execute_sql``."""
    marker = uuid4().hex[:8]
    question = (
        f"How many downtime events are there in 1405? (test_ui_001c::{marker})"
    )
    _seed_history_row(backend_url, question)

    _goto_history(page, spa_url)

    main = page.get_by_role("main")

    # Wait for our specific entry to render.
    expect(main.get_by_text(marker).first).to_be_visible(timeout=15_000)

    # Pin the assertion to the article that contains our marker. ``<article>``
    # maps to ``role="article"`` so we stay inside the allowed locator set.
    # ``filter(has_text=marker)`` narrows to the right entry when prior runs
    # have left other rows in the table.
    entry_article = main.get_by_role("article").filter(has_text=marker).first

    # The expander header renders as ``role="button"`` (Material
    # mat-expansion-panel-header). Its accessible name starts with
    # «فراخوانی ابزارها» followed by «(N)», so a regex match is safest.
    expander = entry_article.get_by_role(
        "button", name=re.compile(re.escape(TOOL_CALLS_EXPANDER_PREFIX))
    )
    expect(expander).to_be_visible(timeout=15_000)
    expander.click()

    # After expansion the tool-call body renders the tool name verbatim.
    # ``get_by_text`` with a substring (exact=False is the default) matches
    # the ``<span class="ltr-inline">execute_sql</span>`` inside the panel.
    expect(
        entry_article.get_by_text("execute_sql").first
    ).to_be_visible(timeout=10_000)


def test_history_menu_link_navigates(page: Page, spa_url, require_spa):
    """The header «تاریخچه» menu button navigates to ``/history``.

    The HISTORY entry in ``app.component.ts`` declares a single child
    (``{ title: 'تاریخچه پرسش‌ها', action: ['/history'] }``), and the
    page-header template renders single-child menu entries as a direct
    ``<button mat-button>`` (NOT a Material dropdown). So one click on the
    top-level button navigates immediately. If a future change splits the
    HISTORY menu into multiple children the template will switch to the
    dropdown branch and ``MENU_CHILD_LABEL`` would become clickable inside a
    ``role="menu"`` — this test would then fail loudly on the URL assertion,
    which is the desired signal.
    """
    # Start on the chat page (root redirects to /chat per UI-001b).
    page.goto(f"{spa_url}/chat")
    _wait_for_bootstrap(page)

    # The header's menu button title is «تاریخچه» (top-level menu entry).
    # Scope to the banner landmark so the same Persian string elsewhere on
    # the page (page title, footer chrome, etc.) cannot satisfy this lookup.
    banner = page.get_by_role("banner")
    history_button = banner.get_by_role("button", name=MENU_TOP_LABEL)
    expect(history_button).to_be_visible()
    history_button.click()

    # After the click the SPA navigates to /history. Angular's
    # ``Router.navigate`` resolves on a microtask after the click handler
    # returns, so ``page.url`` is not updated synchronously; poll via
    # ``expect(page).to_have_url`` (allow an optional trailing slash exactly
    # like test_root_redirects_to_chat).
    expect(page).to_have_url(re.compile(r"/history/?$"), timeout=5_000)

    # Confirm landing by asserting the page's slider label is visible (this
    # text only exists on the history page, never on chrome).
    expect(page.get_by_text(SLIDER_LABEL, exact=True)).to_be_visible(
        timeout=10_000
    )
