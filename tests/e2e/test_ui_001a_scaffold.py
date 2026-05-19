"""
End-to-end tests for UI-001a: Angular SPA scaffold (light-only).

The SPA runs on port 4200 (see ``spa_url`` fixture in conftest.py). These tests
verify the *observable* contract of the scaffold mirrored from
``temp/frontend-true/apps/admin/``:

* The document is RTL Persian: ``<html lang="fa" dir="rtl">``.
* The browser-tab title is the Persian string ``"داشبورد کارخانه"``.
* The dashboard route renders the placeholder text
  ``"صفحه چت و تاریخچه به‌زودی اضافه می‌شوند"``.
* The header renders the app title, a "داشبورد" menu entry (as a Material
  button), and an info button with ``aria-label="درباره نرم‌افزار"``.
* The reference color tokens (``--primaryColor``, ``--accentColor``,
  ``--backgroundColor``, ``--warnColor``) are applied verbatim on ``:root``.
* The Iran-Yekan font (family name ``Yekan`` in
  ``theme/fonts/yekan/iran-yekan.css``) is the effective font on the body.

Locator policy: only role/label/text-based locators are used.

Allowed exceptions (documented in the task spec):

* ``page.locator("html")`` — used only to inspect the ``lang`` and ``dir``
  attributes. These have no ARIA role and are themselves the observable
  contract for RTL/i18n.
* ``page.evaluate(...)`` — used only to read computed CSS values
  (``--primaryColor`` etc. on ``:root`` and ``font-family`` on ``<body>``).
  That is the only way to verify that the CSS tokens are actually applied.

NOTE on dark mode: an earlier pass of UI-001a expected a color-mode toggle and
a ``factory-dashboard:color-mode`` localStorage key. Per explicit user direction
that work is **deferred** to a follow-up task (UI-001a-dark), so the scaffold
is light-only and the previous ``test_ui_001a_theme.py`` was removed.
"""
import re

from playwright.sync_api import Page, expect


PAGE_TITLE = "داشبورد کارخانه"
# UI-001b moved the dashboard to ``/dashboard`` (root now redirects to ``/chat``)
# and updated the placeholder copy. Keep this in sync with
# ``frontend-spa/src/app/pages/dashboard/dashboard.component.html``.
DASHBOARD_PLACEHOLDER = "به‌زودی نمودارها و خلاصه‌های روزانه اینجا اضافه می‌شود."
MENU_DASHBOARD = "داشبورد"
ABOUT_LABEL = "درباره نرم‌افزار"

# Reference tokens copied verbatim from theme/style/factory/color.scss.
EXPECTED_TOKENS = {
    "primary": (56, 77, 84),
    "accent": (228, 190, 146),
    "background": (238, 242, 246),
    "warn": (255, 49, 27),
}


def _goto_and_wait_for_bootstrap(page: Page, spa_url: str) -> None:
    """Open the SPA and wait until Angular has bootstrapped ``<app-root>``.

    Before bootstrap, ``<app-root>`` contains just a single ``<div
    class="app-loading">`` placeholder (see ``src/index.html``). After
    bootstrap, the Angular app inserts its own component tree, so we wait
    until ``<app-root>`` has *more than one* child (the original placeholder
    plus the rendered ``<app-page>``), then additionally wait for the about
    button — the canonical "header rendered, app interactive" signal.
    """
    page.goto(spa_url)
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


def _parse_rgb(value: str) -> tuple[int, int, int]:
    """Parse a CSS ``rgb(...)`` / ``rgba(...)`` string into an (r, g, b) tuple.

    Browsers serialise CSS color values inconsistently (commas vs. spaces,
    optional alpha, varying whitespace), so we extract the numeric channels
    with a regex rather than rely on exact string equality.
    """
    nums = re.findall(r"\d+(?:\.\d+)?", value)
    assert len(nums) >= 3, f"could not parse rgb channels from {value!r}"
    return (int(float(nums[0])), int(float(nums[1])), int(float(nums[2])))


def test_spa_loads_with_persian_title(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    assert page.title() == PAGE_TITLE
    expect(page.locator("html")).to_have_attribute("lang", "fa")
    expect(page.locator("html")).to_have_attribute("dir", "rtl")


def test_dashboard_placeholder_renders(page: Page, spa_url, require_spa):
    # UI-001b: dashboard moved off ``/`` (root now redirects to ``/chat``).
    # Navigate explicitly to ``/dashboard`` to verify the placeholder renders.
    page.goto(f"{spa_url}/dashboard")
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()

    expect(page.get_by_text(DASHBOARD_PLACEHOLDER)).to_be_visible()


def test_header_renders_app_title(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    # ``داشبورد کارخانه`` appears in the <title>, in the header
    # (``applicationTitle``), and in the dashboard <h1>. The browser tab is
    # not visible to ``.first`` text queries (it lives in <head>), but the
    # header version comes before the <h1>. Take ``.first`` to pin to the
    # header occurrence and assert it is visible to a sighted user.
    title_in_header = page.get_by_text(PAGE_TITLE).first
    expect(title_in_header).to_be_visible()


def test_header_menu_renders_dashboard_entry(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    # The single-child menu item renders as ``<button mat-button>`` (see
    # page-header.component.html, lines 14-20), so it has the implicit
    # ``button`` role. The same Persian label ("داشبورد") also appears in the
    # footer (``contentinfo`` landmark), so scope the lookup to the page
    # header's ``banner`` landmark to pin it to the header occurrence.
    header = page.get_by_role("banner")
    dashboard_button = header.get_by_role("button", name=MENU_DASHBOARD)
    expect(dashboard_button).to_be_visible()

    dashboard_button.click()

    # UI-001b: the menu entry routes to ``['/dashboard']`` (see
    # app.component.ts) since root now redirects to ``/chat``. After the
    # click the URL must land on ``/dashboard`` (optionally trailing slash).
    expect(page).to_have_url(re.compile(r".*/dashboard/?$"))


def test_about_button_has_correct_aria_label(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    about_button = page.get_by_role("button", name=ABOUT_LABEL)
    expect(about_button).to_be_visible()


def test_reference_color_tokens_applied(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    # Read the computed values of the four CSS custom properties on :root.
    # ``getPropertyValue`` returns the declared string verbatim, which the
    # browser MAY normalise (e.g. ``rgb(56, 77, 84)`` vs ``rgb(56 77 84)``);
    # we normalise on the Python side via ``_parse_rgb``.
    raw = page.evaluate(
        """
        () => {
          const r = getComputedStyle(document.documentElement);
          return {
            primary: r.getPropertyValue('--primaryColor').trim(),
            accent: r.getPropertyValue('--accentColor').trim(),
            background: r.getPropertyValue('--backgroundColor').trim(),
            warn: r.getPropertyValue('--warnColor').trim(),
          };
        }
        """
    )

    # Sanity: every token must have been declared (non-empty string).
    for name in ("primary", "accent", "background", "warn"):
        assert raw[name], f"--{name}Color is unset on :root (got {raw[name]!r})"

    actual = {name: _parse_rgb(raw[name]) for name in raw}
    assert actual == EXPECTED_TOKENS, (
        f"CSS token mismatch.\n  expected: {EXPECTED_TOKENS}\n  actual:   {actual}\n"
        f"  raw values: {raw}"
    )


def test_iran_yekan_font_loads(page: Page, spa_url, require_spa):
    _goto_and_wait_for_bootstrap(page, spa_url)

    # ``theme/style/styles.scss`` sets ``font-family: Yekan`` on the universal
    # selector ``*``, so the body's computed ``font-family`` must include the
    # family name ``Yekan`` (case-insensitive). Browsers may add quotes or
    # fallback families, so we substring-match rather than equality-match.
    font_family = page.evaluate(
        "() => getComputedStyle(document.body).fontFamily"
    )
    assert font_family, "body font-family is unset"
    assert "yekan" in font_family.lower(), (
        f"expected 'Yekan' in body font-family, got: {font_family!r}"
    )
