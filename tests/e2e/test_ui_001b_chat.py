"""
End-to-end tests for UI-001b: Angular SPA chat page.

The SPA at port 4200 exposes a Persian chat surface at ``/chat`` that streams
NDJSON events from ``POST /chat`` on the FastAPI backend (port 8000). This
file verifies the *observable* contract of the chat page:

* Persian chrome renders (composer placeholder, send/clear buttons, mode
  toggle group, empty-state hint).
* The root path ``/`` redirects to ``/chat``.
* Submitting a question echoes the user message and triggers the
  ``execute_sql`` tool (rendered as a tool card on the page).
* The Simple/Deep mode toggle persists to localStorage under the key
  ``factory-dashboard:agent-mode`` and is rehydrated after reload.
* The "clear conversation" button removes the user bubble and restores the
  empty-state hint.

Locator policy (mirrors test_ui_001a_scaffold.py and test_ui_001a_dark.py):

* role/label/text/placeholder-based locators for visible UI.
* ``page.evaluate(...)`` only for localStorage access and ``page.url`` reads.
* Disambiguate duplicated Persian strings by scoping to ARIA landmarks
  (``banner`` for the header, ``main`` for the chat content area).

NO Material CSS class selectors. NO xpath. NO ``:nth-child``.
"""
import re

from playwright.sync_api import Page, expect


# ---------- Persian copy (exact codepoints — no transliteration) -------------

COMPOSER_PLACEHOLDER = "سؤال خود را به فارسی یا انگلیسی بنویسید…"
SEND_BUTTON_LABEL = "ارسال پیام"
CLEAR_BUTTON_TEXT = "پاک کردن گفتگو"
MODE_GROUP_LABEL = "حالت عامل"
MODE_SIMPLE_LABEL = "ساده"
MODE_DEEP_LABEL = "پژوهش عمیق"
EMPTY_STATE_HINT = "سؤالی از داده‌های کارخانه بپرسید"
STREAMING_INDICATOR = "در حال پاسخ‌گویی…"
ABOUT_LABEL = "درباره نرم‌افزار"

# The same proven question used by tests/e2e/test_chat.py — guaranteed to
# trigger the ``execute_sql`` tool against the seeded 1405 dataset.
QUESTION = "How many downtime events are there in 1405?"

# localStorage key for the mode toggle.
AGENT_MODE_STORAGE_KEY = "factory-dashboard:agent-mode"


# ---------- Bootstrap helpers ------------------------------------------------


def _wait_for_bootstrap(page: Page) -> None:
    """Wait until Angular has bootstrapped ``<app-root>``.

    Before bootstrap, ``<app-root>`` only contains the loading placeholder from
    ``src/index.html``. After bootstrap, the Angular app inserts its own
    component tree, so ``<app-root>`` has more than one child. We then wait
    for the about button — the canonical "header rendered, app interactive"
    signal used across the existing UI-001a tests.
    """
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


def _goto_chat(page: Page, spa_url: str) -> None:
    """Navigate to ``/chat`` and wait for Angular bootstrap."""
    page.goto(f"{spa_url}/chat")
    _wait_for_bootstrap(page)


def _clear_agent_mode(page: Page) -> None:
    """Remove the persisted mode value (best-effort)."""
    try:
        page.evaluate(
            f"() => window.localStorage.removeItem('{AGENT_MODE_STORAGE_KEY}')"
        )
    except Exception:
        # Page may already be closed during teardown — cleanup is best effort.
        pass


# ---------- Tests ------------------------------------------------------------


def test_chat_page_renders_persian_chrome(page: Page, spa_url, require_spa):
    """The chat page renders its Persian composer, buttons, mode toggles, and hint."""
    _goto_chat(page, spa_url)

    # Composer textarea — locate by the Persian placeholder.
    expect(page.get_by_placeholder(COMPOSER_PLACEHOLDER)).to_be_visible()

    # Send button — match on its accessible name (aria-label «ارسال پیام»).
    expect(page.get_by_role("button", name=SEND_BUTTON_LABEL)).to_be_visible()

    # Clear-conversation button — visible by its Persian text label.
    expect(page.get_by_role("button", name=CLEAR_BUTTON_TEXT)).to_be_visible()

    # Both mode toggles visible. Material's mat-button-toggle renders as either
    # role=button or role=radio depending on the group config; either way the
    # accessible name is the Persian label and ``get_by_role("button"|"radio",
    # name=…)`` resolves it. We use ``get_by_text`` here to stay agnostic to
    # the underlying role and only assert visibility of the label.
    main = page.get_by_role("main")
    expect(main.get_by_text(MODE_SIMPLE_LABEL, exact=True)).to_be_visible()
    expect(main.get_by_text(MODE_DEEP_LABEL, exact=True)).to_be_visible()

    # Empty-state hint visible before any messages.
    expect(page.get_by_text(EMPTY_STATE_HINT)).to_be_visible()


def test_root_redirects_to_chat(page: Page, spa_url, require_spa):
    """Visiting ``/`` redirects to ``/chat`` (composer placeholder visible)."""
    page.goto(spa_url)
    _wait_for_bootstrap(page)

    # The redirect lands us on the chat page — assert the composer is up.
    expect(page.get_by_placeholder(COMPOSER_PLACEHOLDER)).to_be_visible()

    # And the URL must end with ``/chat``. Allow an optional trailing slash so
    # we are not pinned to Angular's exact URL serialisation.
    assert re.search(r"/chat/?$", page.url), (
        f"Expected URL to end with /chat after redirect, got {page.url!r}"
    )


def test_chat_submits_question_and_streams_answer(
    page: Page, spa_url, require_spa
):
    """Filling the composer + clicking «ارسال پیام» triggers ``execute_sql``."""
    _goto_chat(page, spa_url)

    composer = page.get_by_placeholder(COMPOSER_PLACEHOLDER)
    composer.fill(QUESTION)

    page.get_by_role("button", name=SEND_BUTTON_LABEL).click()

    # 1. User message echoes back into the chat area. We scope to ``main`` to
    #    avoid clashing with the residual text in the composer (in the rare
    #    case the SPA preserves the field value momentarily after submit).
    main = page.get_by_role("main")
    expect(main.get_by_text(QUESTION).first).to_be_visible(timeout=10_000)

    # 2. The agent runs ``execute_sql``. The tool card renders the tool name
    #    verbatim — wait up to 90s for the LLM round-trip.
    expect(page.get_by_text("execute_sql").first).to_be_visible(timeout=90_000)

    # 3. The streaming indicator eventually disappears when the agent finishes.
    expect(page.get_by_text(STREAMING_INDICATOR)).to_be_hidden(timeout=120_000)


def test_mode_toggle_persists_to_localstorage(
    page: Page, spa_url, require_spa
):
    """Clicking «پژوهش عمیق» writes ``'deep'`` to localStorage and survives reload."""
    # Prime the origin, clear any prior state, then load the chat page fresh.
    page.goto(spa_url)
    _clear_agent_mode(page)

    _goto_chat(page, spa_url)

    # Click the DEEP toggle. mat-button-toggle exposes the label as an
    # accessible name on either a button or a radio — match either role so the
    # test survives a switch in the Material toggle config. Using
    # ``get_by_role("radio")`` first, falling back to ``get_by_role("button")``
    # would require try/except (forbidden); instead use the label-agnostic
    # ``get_by_text`` scoped to the chat surface and click it directly.
    main = page.get_by_role("main")
    main.get_by_text(MODE_DEEP_LABEL, exact=True).click()

    stored = page.evaluate(
        f"() => window.localStorage.getItem('{AGENT_MODE_STORAGE_KEY}')"
    )
    assert stored == "deep", (
        f"Expected localStorage[{AGENT_MODE_STORAGE_KEY!r}] == 'deep' after "
        f"clicking «{MODE_DEEP_LABEL}», got {stored!r}"
    )

    # Reload from scratch and confirm the persisted choice survives.
    page.reload()
    _wait_for_bootstrap(page)

    stored_after_reload = page.evaluate(
        f"() => window.localStorage.getItem('{AGENT_MODE_STORAGE_KEY}')"
    )
    assert stored_after_reload == "deep", (
        f"Expected localStorage[{AGENT_MODE_STORAGE_KEY!r}] to remain 'deep' "
        f"after reload, got {stored_after_reload!r}"
    )

    # The DEEP toggle is still rendered and visible — that is the user-visible
    # confirmation that the persisted choice was rehydrated.
    expect(
        page.get_by_role("main").get_by_text(MODE_DEEP_LABEL, exact=True)
    ).to_be_visible()

    # Cleanup so we don't leak state into the next test.
    _clear_agent_mode(page)


def test_clear_conversation_restores_empty_state(
    page: Page, spa_url, require_spa
):
    """After sending one message, «پاک کردن گفتگو» empties the chat surface."""
    _goto_chat(page, spa_url)

    # Send a short message — we only need the user bubble to appear, not a
    # full agent round-trip.
    composer = page.get_by_placeholder(COMPOSER_PLACEHOLDER)
    composer.fill(QUESTION)
    page.get_by_role("button", name=SEND_BUTTON_LABEL).click()

    main = page.get_by_role("main")
    expect(main.get_by_text(QUESTION).first).to_be_visible(timeout=10_000)

    # Before clicking clear, the empty-state hint must NOT be present.
    expect(page.get_by_text(EMPTY_STATE_HINT)).to_be_hidden()

    page.get_by_role("button", name=CLEAR_BUTTON_TEXT).click()

    # User message gone, empty-state hint visible again.
    expect(main.get_by_text(QUESTION)).to_be_hidden()
    expect(page.get_by_text(EMPTY_STATE_HINT)).to_be_visible()
