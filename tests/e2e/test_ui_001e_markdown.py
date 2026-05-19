"""
End-to-end test for UI-001e: Markdown rendering in chat assistant messages.

The SPA's chat surface renders assistant text blocks through ``<markdown>``
(ngx-markdown), so Markdown syntax in the LLM reply must be converted to real
semantic HTML — `**bold**` → ``<strong>`` and pipe tables → ``<table>``. This
test asks the agent for a reply that reliably contains both, then asserts:

1. The rendered DOM contains at least one ``<strong>`` element and one
   ARIA ``table``.
2. The literal Markdown characters (``**`` and ``|---|``) do NOT leak through
   into the chat surface text (i.e. they were consumed by the renderer).

Locator policy (mirrors test_ui_001b_chat.py):

* Allowed: ``get_by_role``, ``get_by_placeholder``, ``get_by_text``, and
  ``locator("strong")``. The ``<strong>`` tag is a *semantic HTML element*
  from the WHATWG spec — it is not an Angular Material class. The forbidden
  category in the locator rules is framework-specific CSS class selectors
  (e.g. ``.mat-toolbar``), which will change between Material versions.
  Asserting on the rendered semantic outcome of the Markdown-to-HTML
  conversion via the ``<strong>`` tag is the natural way to verify that
  conversion happened and survives Material upgrades.
* ``page.get_by_role("main")`` scopes assertions to the chat surface to
  avoid clashing with any other DOM (header/footer chrome).

NO Material CSS class selectors. NO xpath. NO ``:nth-child``.
"""
from playwright.sync_api import Page, expect


# ---------- Persian copy (exact codepoints — no transliteration) -------------

COMPOSER_PLACEHOLDER = "سؤال خود را به فارسی یا انگلیسی بنویسید…"
SEND_BUTTON_LABEL = "ارسال پیام"
STREAMING_INDICATOR = "در حال پاسخ‌گویی…"
ABOUT_LABEL = "درباره نرم‌افزار"

# Markdown-targeted prompt: explicitly asks the agent for **bold** column
# headers AND a pipe table. Mirroring the proven phrasing pattern from
# tests/e2e/test_ui_001b_chat.py (English question against the seeded 1405
# dataset) keeps the agent on a well-trodden path that reliably returns data.
QUESTION = (
    "Show me a markdown table of the top 3 downtime reasons in 1405. "
    "Use a Markdown pipe table with columns 'reason' and 'count', and bold "
    "the column headers."
)


# ---------- Bootstrap helpers (verbatim from test_ui_001b_chat.py) -----------


def _wait_for_bootstrap(page: Page) -> None:
    """Wait until Angular has bootstrapped ``<app-root>``."""
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


def _goto_chat(page: Page, spa_url: str) -> None:
    """Navigate to ``/chat`` and wait for Angular bootstrap."""
    page.goto(f"{spa_url}/chat")
    _wait_for_bootstrap(page)


# ---------- Test -------------------------------------------------------------


def test_assistant_renders_markdown_bold_and_table(
    page: Page, spa_url, require_spa
):
    """Asking for a bolded pipe table renders ``<strong>`` + ``<table>`` (not literal `**` / `|`)."""
    _goto_chat(page, spa_url)

    # Submit the markdown-targeted question.
    composer = page.get_by_placeholder(COMPOSER_PLACEHOLDER)
    composer.fill(QUESTION)
    page.get_by_role("button", name=SEND_BUTTON_LABEL).click()

    main = page.get_by_role("main")

    # User message echoes back into the chat area — confirms the submit landed.
    expect(main.get_by_text(QUESTION).first).to_be_visible(timeout=10_000)

    # Wait for the streaming indicator to disappear — the agent has finished
    # (round-trip with table rendering can take a while, so allow 3 minutes).
    expect(page.get_by_text(STREAMING_INDICATOR)).to_be_hidden(timeout=180_000)

    # ---- Positive assertions: semantic HTML rendered ------------------------
    # ``locator("strong")`` is a tag-name locator on a semantic HTML element
    # (WHATWG-spec, not framework-specific). It is the natural way to verify
    # that the `**bold**` Markdown was converted to a real DOM element rather
    # than left as literal asterisks. This is NOT in the forbidden category of
    # Angular Material CSS class selectors.
    strong = main.locator("strong").first
    expect(strong).to_be_visible(timeout=10_000)

    # ARIA role "table" matches the rendered ``<table>`` element produced by
    # the pipe-table syntax. Using ``get_by_role`` keeps us on the allowed
    # locator list and survives whatever wrapper element ngx-markdown emits.
    expect(main.get_by_role("table").first).to_be_visible(timeout=10_000)

    # Loose substring check on the first ``<strong>``: ngx-markdown also bolds
    # table headers in pipe tables via ``<th>`` in many configurations, but
    # the test only asserts that the FIRST ``<strong>`` is one of the
    # expected column headers (or their Persian equivalents). Loose match
    # because the LLM may translate or wrap the headers.
    strong_text = (strong.text_content() or "").strip().lower()
    expected_header_fragments = (
        "reason",
        "count",
        # Persian equivalents the agent may use.
        "علت",
        "دلیل",
        "تعداد",
        "شمار",
    )
    assert any(frag.lower() in strong_text for frag in expected_header_fragments), (
        f"Expected first <strong> text to contain one of "
        f"{expected_header_fragments!r}, got {strong_text!r}"
    )

    # ---- Negative assertions: literal Markdown chars must NOT leak ---------
    # The user's question contains no asterisks, so any ``**`` in the chat
    # surface text content means the Markdown-to-HTML conversion failed.
    main_text = main.text_content() or ""
    assert main_text.count("**") == 0, (
        "Found literal '**' in chat surface text — the assistant message did "
        "NOT render Markdown bold. main text was:\n" + main_text
    )
    # Pipe-table separator row literal — its presence proves the pipe table
    # was rendered as raw text instead of a real ``<table>``.
    assert main_text.count("|---|") == 0, (
        "Found literal '|---|' in chat surface text — the assistant message "
        "did NOT render the Markdown pipe table. main text was:\n" + main_text
    )
