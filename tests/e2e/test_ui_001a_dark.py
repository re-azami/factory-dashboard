"""
End-to-end tests for UI-001a-dark: light/dark color-mode toggle.

The SPA at port 4200 exposes a header button that flips between light and dark
theme. The choice is persisted in ``localStorage`` under the key
``factory-dashboard:color-mode`` and re-applied on the next visit. A
pre-bootstrap IIFE in ``src/index.html`` adds the ``dark-mode`` class to
``<html>`` before Angular boots so users don't see a flash of light content
when they previously chose dark.

Locator policy (mirrors test_ui_001a_scaffold.py):

* role/label/text/aria-name based locators for visible UI
* ``page.locator("html")`` only for the ``dark-mode`` class read
* ``page.evaluate(...)`` only for computed CSS reads and localStorage access

NO Material CSS class selectors. NO xpath. NO ``:nth-child``.
"""
import re

import pytest
from playwright.sync_api import Page, expect


PAGE_TITLE = "داشبورد کارخانه"
ABOUT_LABEL = "درباره نرم‌افزار"
TOGGLE_TO_DARK = "تغییر به حالت تاریک"
TOGGLE_TO_LIGHT = "تغییر به حالت روشن"
COLOR_MODE_STORAGE_KEY = "factory-dashboard:color-mode"

# Reference light tokens — must match test_ui_001a_scaffold.EXPECTED_TOKENS for
# the overlapping keys.
EXPECTED_LIGHT_TOKENS = {
    "primary": (56, 77, 84),
    "accent": (228, 190, 146),
    "background": (238, 242, 246),
    "warn": (255, 49, 27),
    "highlight": (247, 249, 251),
    "border": (220, 220, 220),
    "white": (255, 255, 255),
    "black": (36, 29, 29),
    "gray": (100, 100, 100),
}

# Reference dark tokens — copied verbatim from
# frontend-spa/theme/style/factory/color.scss html.dark-mode block.
EXPECTED_DARK_TOKENS = {
    "primary": (170, 195, 205),
    "accent": (228, 190, 146),  # unchanged
    "background": (24, 28, 32),
    "warn": (255, 89, 67),
    "highlight": (34, 40, 45),
    "border": (60, 65, 70),
    "white": (34, 40, 45),
    "black": (238, 242, 246),
    "gray": (160, 160, 160),
}


def _goto_and_wait_for_bootstrap(page: Page, spa_url: str) -> None:
    """Open the SPA and wait until Angular has bootstrapped ``<app-root>``.

    Mirrors the helper in test_ui_001a_scaffold.py. Bootstrap is complete when
    the about button (a fixed part of the header chrome) is visible.
    """
    page.goto(spa_url)
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


def _parse_rgb(value: str) -> tuple[int, int, int]:
    """Parse a CSS ``rgb(...)`` / ``rgba(...)`` string into an (r, g, b) tuple."""
    nums = re.findall(r"\d+(?:\.\d+)?", value)
    assert len(nums) >= 3, f"could not parse rgb channels from {value!r}"
    return (int(float(nums[0])), int(float(nums[1])), int(float(nums[2])))


def _read_color_tokens(page: Page) -> dict[str, tuple[int, int, int]]:
    """Read the relevant CSS custom properties off ``:root``.

    Returns a dict keyed by the short token name (matches EXPECTED_*_TOKENS).
    """
    raw = page.evaluate(
        """
        () => {
          const r = getComputedStyle(document.documentElement);
          return {
            primary: r.getPropertyValue('--primaryColor').trim(),
            accent: r.getPropertyValue('--accentColor').trim(),
            background: r.getPropertyValue('--backgroundColor').trim(),
            warn: r.getPropertyValue('--warnColor').trim(),
            highlight: r.getPropertyValue('--highlightColor').trim(),
            border: r.getPropertyValue('--borderColor').trim(),
            white: r.getPropertyValue('--whiteColor').trim(),
            black: r.getPropertyValue('--blackColor').trim(),
            gray: r.getPropertyValue('--grayColor').trim(),
          };
        }
        """
    )
    for name, value in raw.items():
        assert value, f"--{name}Color is unset on :root (got {value!r})"
    return {name: _parse_rgb(value) for name, value in raw.items()}


@pytest.fixture(autouse=True)
def reset_color_mode(page: Page, spa_url: str):
    """Ensure every test starts from a clean LIGHT state.

    Navigates to the SPA origin once (so the localStorage access is valid for
    the right origin), clears the persisted color mode, removes the
    ``dark-mode`` class if some other test left it on, then yields.

    Doing this here rather than in the shared conftest keeps the side-effect
    scoped to this test file.
    """
    page.goto(spa_url)
    page.evaluate(
        f"() => {{ window.localStorage.removeItem('{COLOR_MODE_STORAGE_KEY}'); "
        f"document.documentElement.classList.remove('dark-mode'); }}"
    )
    yield
    # Best-effort cleanup so a failing test doesn't leak state into the next.
    try:
        page.evaluate(
            f"() => {{ window.localStorage.removeItem('{COLOR_MODE_STORAGE_KEY}'); "
            f"document.documentElement.classList.remove('dark-mode'); }}"
        )
    except Exception:
        # Page may already be closed; cleanup is best-effort, not a guarantee.
        pass


def test_toggle_button_visible_with_persian_aria_label(
    page: Page, spa_url, require_spa
):
    """Initial load shows the toggle button with the LIGHT-mode aria-label."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    toggle = page.get_by_role("button", name=TOGGLE_TO_DARK)
    expect(toggle).to_be_visible()


def test_toggle_button_lives_in_header_banner(page: Page, spa_url, require_spa):
    """The toggle button is rendered inside the header (banner) landmark."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    header = page.get_by_role("banner")
    toggle = header.get_by_role("button", name=TOGGLE_TO_DARK)
    expect(toggle).to_be_visible()


def test_initial_state_has_no_dark_mode_class(page: Page, spa_url, require_spa):
    """Before any user action ``<html>`` must NOT carry the ``dark-mode`` class."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    expect(page.locator("html")).not_to_have_class(re.compile(r".*dark-mode.*"))
    has_class = page.evaluate(
        "() => document.documentElement.classList.contains('dark-mode')"
    )
    assert has_class is False, "dark-mode class should be absent on initial load"


def test_click_toggle_enters_dark_mode(page: Page, spa_url, require_spa):
    """Clicking the toggle adds ``dark-mode``, flips the aria-label, and the icon."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    header = page.get_by_role("banner")
    header.get_by_role("button", name=TOGGLE_TO_DARK).click()

    # Class is now present.
    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))

    # Aria-label flipped to the DARK-state copy.
    expect(header.get_by_role("button", name=TOGGLE_TO_LIGHT)).to_be_visible()

    # Icon text inside the toggle button is the Material Icons Outlined ligature
    # ``light_mode``. Use get_by_text scoped to the now-DARK-state button so we
    # don't have to read the underlying <mat-icon> element directly.
    expect(
        header.get_by_role("button", name=TOGGLE_TO_LIGHT).get_by_text(
            "light_mode"
        )
    ).to_be_visible()


def test_dark_mode_css_custom_properties_applied(page: Page, spa_url, require_spa):
    """After entering DARK, the dark palette is exposed via :root custom properties."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    page.get_by_role("banner").get_by_role(
        "button", name=TOGGLE_TO_DARK
    ).click()

    # Wait until Angular's class application has settled. Reading the class on
    # <html> is the canonical "DARK is active" signal.
    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))

    actual = _read_color_tokens(page)
    assert actual == EXPECTED_DARK_TOKENS, (
        f"DARK CSS token mismatch.\n  expected: {EXPECTED_DARK_TOKENS}\n"
        f"  actual:   {actual}"
    )


def test_light_mode_css_custom_properties_applied_initially(
    page: Page, spa_url, require_spa
):
    """Before any toggle click, the light palette is exposed on :root."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    actual = _read_color_tokens(page)
    assert actual == EXPECTED_LIGHT_TOKENS, (
        f"LIGHT CSS token mismatch.\n  expected: {EXPECTED_LIGHT_TOKENS}\n"
        f"  actual:   {actual}"
    )


def test_toggle_twice_returns_to_light(page: Page, spa_url, require_spa):
    """LIGHT → DARK → LIGHT round-trip restores every observable LIGHT property."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    header = page.get_by_role("banner")

    # First click: LIGHT → DARK.
    header.get_by_role("button", name=TOGGLE_TO_DARK).click()
    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))

    # Second click: DARK → LIGHT.
    header.get_by_role("button", name=TOGGLE_TO_LIGHT).click()

    # No dark-mode class.
    expect(page.locator("html")).not_to_have_class(re.compile(r".*dark-mode.*"))

    # Aria-label is back to the LIGHT-state copy.
    expect(header.get_by_role("button", name=TOGGLE_TO_DARK)).to_be_visible()

    # Background token is back to the light value.
    actual = _read_color_tokens(page)
    assert actual["background"] == EXPECTED_LIGHT_TOKENS["background"], (
        f"--backgroundColor not restored to LIGHT after toggle round-trip: "
        f"got {actual['background']!r}"
    )


def test_localstorage_persists_across_reload(page: Page, spa_url, require_spa):
    """Choosing DARK once survives a full page reload."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    page.get_by_role("banner").get_by_role(
        "button", name=TOGGLE_TO_DARK
    ).click()
    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))

    stored = page.evaluate(
        f"() => window.localStorage.getItem('{COLOR_MODE_STORAGE_KEY}')"
    )
    assert stored == "DARK", (
        f"localStorage[{COLOR_MODE_STORAGE_KEY!r}] should be 'DARK' after toggle, "
        f"got {stored!r}"
    )

    # Reload from scratch — Angular re-bootstraps and the persisted choice must
    # be honored.
    page.reload()
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(
        page.get_by_role("banner").get_by_role("button", name=TOGGLE_TO_LIGHT)
    ).to_be_visible()

    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))

    actual = _read_color_tokens(page)
    assert actual["background"] == EXPECTED_DARK_TOKENS["background"], (
        f"--backgroundColor not DARK after reload: got {actual['background']!r}"
    )


def test_pre_bootstrap_script_prevents_fouc(page: Page, spa_url, require_spa):
    """The IIFE in index.html applies ``dark-mode`` before Angular renders.

    Strategy: visit the SPA once, write ``'DARK'`` into the persisted storage,
    then reload. At ``domcontentloaded`` (i.e. before Angular finishes
    bootstrapping ``<app-root>``) the ``<html>`` element must already carry
    ``dark-mode`` — that's the work the inline IIFE in ``src/index.html`` does.
    """
    # First visit just primes the origin so localStorage is writable.
    _goto_and_wait_for_bootstrap(page, spa_url)
    page.evaluate(
        f"() => window.localStorage.setItem('{COLOR_MODE_STORAGE_KEY}', 'DARK')"
    )

    # Reload and check the class BEFORE waiting for Angular bootstrap. The
    # inline IIFE in <head> runs before <app-root> is hydrated, so by
    # ``domcontentloaded`` the class is already in place.
    page.goto(spa_url, wait_until="domcontentloaded")
    has_class_before_bootstrap = page.evaluate(
        "() => document.documentElement.classList.contains('dark-mode')"
    )
    assert has_class_before_bootstrap is True, (
        "Expected the pre-bootstrap IIFE in src/index.html to apply "
        "'dark-mode' on <html> before Angular bootstraps, but the class was "
        "missing at domcontentloaded."
    )

    # Now let Angular finish bootstrapping and confirm the state stays DARK
    # (the AppService constructor must NOT clobber the pre-applied class).
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.locator("html")).to_have_class(re.compile(r".*dark-mode.*"))
    expect(
        page.get_by_role("banner").get_by_role("button", name=TOGGLE_TO_LIGHT)
    ).to_be_visible()
