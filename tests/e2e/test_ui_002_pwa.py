"""
End-to-end tests for UI-002: PWA support.

Covers the observable PWA contract added in UI-002:

* The Web App Manifest at ``/manifest.webmanifest`` is served with the
  spec-mandated ``application/manifest+json`` Content-Type and contains a
  full Persian metadata block (name, short_name, start_url, display,
  theme_color, background_color, plus an icons array with both ``any`` and
  ``maskable`` purposes and the 192x192 + 512x512 PWA minimum sizes).
* Every icon referenced by the manifest resolves to a real image asset.
* ``index.html`` ships the manifest link, the ``theme-color`` meta, the
  Apple-specific PWA meta tags, and an ``apple-touch-icon`` link so iOS
  honors the install affordance.
* The Angular-emitted service worker registers on a cold load over
  ``http://localhost:4200`` (Chromium permits SW registration on loopback
  even without HTTPS).
* The header's "نصب اپلیکیشن" install button is hidden by default — Chrome
  headless will not fire ``beforeinstallprompt`` without user-engagement
  heuristics, so the default state is "no captured prompt, button hidden".
* Dispatching a synthetic ``beforeinstallprompt`` event surfaces the
  install button on both desktop and mobile viewports, exercising the
  ``PwaService`` → header ``canInstall`` data flow end-to-end.

Locator policy (mirrors test_ui_001a_scaffold.py):

* role/label/text/aria-name based locators for visible UI. The install
  button is scoped to ``page.get_by_role("banner")`` so that even though
  the string "نصب اپلیکیشن" only lives in the header today, the lookup
  remains pinned to the header landmark for forward-compatibility.

Allowed exceptions (documented in the task spec and CLAUDE.md):

* ``page.evaluate(...)`` — used to (a) read the service-worker
  registration state from ``navigator.serviceWorker``, and (b) synthesize
  a ``beforeinstallprompt`` event. Chrome's real prompt requires
  user-engagement heuristics that headless Chromium cannot satisfy, so
  the only deterministic way to test the install-button UI binding is to
  dispatch the event from JavaScript.

NO Material CSS class selectors. NO xpath. NO ``:nth-child``.
"""
import json

import httpx
from playwright.sync_api import Page, expect


ABOUT_LABEL = "درباره نرم‌افزار"
INSTALL_LABEL = "نصب اپلیکیشن"
PAGE_TITLE = "داشبورد کارخانه"


def _goto_and_wait_for_bootstrap(page: Page, spa_url: str) -> None:
    """Open the SPA and wait until Angular has bootstrapped ``<app-root>``.

    Mirror of the helper in test_ui_001a_scaffold.py: wait until
    ``<app-root>`` has more than one child (Angular has replaced the
    placeholder), then wait for the about button as the canonical
    "header rendered" signal.
    """
    page.goto(spa_url)
    page.wait_for_function(
        "() => { const r = document.querySelector('app-root');"
        " return !!r && r.children.length > 1; }"
    )
    expect(page.get_by_role("button", name=ABOUT_LABEL)).to_be_visible()


# --------------------------------------------------------------------------- #
# HTTP-level tests (no browser)
# --------------------------------------------------------------------------- #


def test_manifest_served_with_correct_content_type(spa_url, require_spa):
    """``/manifest.webmanifest`` must be served with the spec MIME type and
    carry the Persian PWA metadata block."""
    response = httpx.get(f"{spa_url}/manifest.webmanifest", timeout=5.0)
    assert response.status_code == 200, (
        f"expected 200, got {response.status_code} for /manifest.webmanifest"
    )

    content_type = response.headers.get("content-type", "")
    assert content_type.startswith("application/manifest+json"), (
        f"expected Content-Type to start with application/manifest+json, "
        f"got {content_type!r}"
    )

    data = json.loads(response.content)

    assert data["name"] == PAGE_TITLE, (
        f"manifest.name mismatch: {data.get('name')!r}"
    )
    assert data["short_name"] == PAGE_TITLE, (
        f"manifest.short_name mismatch: {data.get('short_name')!r}"
    )
    assert data["start_url"] == "./", (
        f"manifest.start_url mismatch: {data.get('start_url')!r}"
    )
    assert data["display"] == "standalone", (
        f"manifest.display mismatch: {data.get('display')!r}"
    )
    assert data["theme_color"] == "#384d54", (
        f"manifest.theme_color mismatch: {data.get('theme_color')!r}"
    )
    assert data["background_color"] == "#eef2f6", (
        f"manifest.background_color mismatch: {data.get('background_color')!r}"
    )

    icons = data["icons"]
    assert len(icons) >= 8, (
        f"expected at least 8 icon entries, got {len(icons)}"
    )

    purposes_seen = set()
    sizes_seen = set()
    for entry in icons:
        src = entry.get("src", "")
        sizes = entry.get("sizes", "")
        type_ = entry.get("type", "")
        purpose = entry.get("purpose", "")

        assert src, f"icon entry has empty src: {entry}"
        assert sizes, f"icon entry has empty sizes: {entry}"
        assert type_.startswith("image/"), (
            f"icon entry has non-image type {type_!r}: {entry}"
        )
        assert purpose in {"any", "maskable"}, (
            f"icon entry has unsupported purpose {purpose!r}: {entry}"
        )

        purposes_seen.add(purpose)
        sizes_seen.add(sizes)

    assert "maskable" in purposes_seen, (
        "manifest icons must include at least one purpose='maskable' entry "
        "for Android adaptive icons"
    )
    assert "192x192" in sizes_seen, (
        "manifest icons must include a 192x192 entry (PWA minimum)"
    )
    assert "512x512" in sizes_seen, (
        "manifest icons must include a 512x512 entry (PWA minimum)"
    )


def test_manifest_icons_resolve(spa_url, require_spa):
    """Every icon ``src`` listed in the manifest must resolve to a real
    image with non-empty bytes and a sensible ``image/*`` MIME type."""
    response = httpx.get(f"{spa_url}/manifest.webmanifest", timeout=5.0)
    assert response.status_code == 200
    icons = json.loads(response.content)["icons"]

    base = spa_url.rstrip("/") + "/"
    for entry in icons:
        src = entry["src"]
        icon_url = base + src.lstrip("./")
        icon_resp = httpx.get(icon_url, timeout=5.0)
        assert icon_resp.status_code == 200, (
            f"icon {src!r} returned {icon_resp.status_code} at {icon_url}"
        )
        icon_ct = icon_resp.headers.get("content-type", "")
        assert icon_ct.startswith("image/"), (
            f"icon {src!r} served with non-image Content-Type {icon_ct!r}"
        )
        assert len(icon_resp.content) > 0, (
            f"icon {src!r} served with empty body"
        )


def test_index_html_links_manifest_and_apple_icons(spa_url, require_spa):
    """``index.html`` must wire up the manifest link, the theme-color meta,
    and the Apple PWA meta + touch-icon tags."""
    response = httpx.get(f"{spa_url}/", timeout=5.0)
    assert response.status_code == 200, (
        f"expected 200 for /, got {response.status_code}"
    )

    body = response.text

    assert '<link rel="manifest" href="manifest.webmanifest"' in body, (
        "index.html is missing the manifest link"
    )
    assert '<meta name="theme-color" content="#384d54"' in body, (
        "index.html is missing the theme-color meta"
    )
    assert '<meta name="apple-mobile-web-app-capable"' in body, (
        "index.html is missing the apple-mobile-web-app-capable meta"
    )
    assert '<link rel="apple-touch-icon"' in body, (
        "index.html is missing the apple-touch-icon link"
    )


# --------------------------------------------------------------------------- #
# Browser tests
# --------------------------------------------------------------------------- #


def test_service_worker_registers(page: Page, spa_url, require_spa):
    """Angular's ``ngsw-worker.js`` registers when the SPA loads.

    Chromium permits service-worker registration over plain ``http://`` only
    on ``localhost`` (or HTTPS); the SPA at ``localhost:4200`` qualifies.
    The Angular registration strategy is ``registerWhenStable:30000``, so on
    a cold cache the SW can take up to 30s to register — hence the 30s
    timeout on ``wait_for_function``.

    Uses ``page.evaluate(...)`` to read the registration state from
    ``navigator.serviceWorker``, which is the documented allowed exception
    for inspecting browser APIs that have no DOM/aria surface.
    """
    _goto_and_wait_for_bootstrap(page, spa_url)

    page.wait_for_function(
        "() => 'serviceWorker' in navigator"
        " && navigator.serviceWorker.getRegistration()"
        "      .then(reg => !!reg && (reg.active || reg.installing || reg.waiting))",
        timeout=30000,
    )

    scope = page.evaluate(
        "() => navigator.serviceWorker.getRegistration()"
        ".then(r => r ? r.scope : null)"
    )
    assert scope is not None, "service worker did not register"
    assert scope.endswith("/"), (
        f"service worker scope should end with '/', got {scope!r}"
    )


def test_install_button_hidden_by_default(page: Page, spa_url, require_spa):
    """Without a ``beforeinstallprompt`` event, the header install button
    must not render. Headless Chromium will not fire the real event without
    user-engagement heuristics, so this is the natural default state."""
    _goto_and_wait_for_bootstrap(page, spa_url)

    install_button = page.get_by_role("banner").get_by_role(
        "button", name=INSTALL_LABEL
    )
    expect(install_button).to_have_count(0)


def test_install_button_visible_when_beforeinstallprompt_fires(
    page: Page, spa_url, require_spa
):
    """Dispatching a synthetic ``beforeinstallprompt`` event must flip
    ``PwaService.canInstall`` to true and surface the header button.

    Allowed-exception: ``page.evaluate(...)`` is used to construct the
    event. Chrome's real prompt requires user-engagement heuristics that
    headless cannot satisfy, so synthesizing the event is the only
    deterministic way to exercise the UI binding.
    """
    _goto_and_wait_for_bootstrap(page, spa_url)

    # Sanity: button starts hidden.
    install_button = page.get_by_role("banner").get_by_role(
        "button", name=INSTALL_LABEL
    )
    expect(install_button).to_have_count(0)

    page.evaluate(
        """
        () => {
          const evt = new Event('beforeinstallprompt', { cancelable: true });
          evt.prompt = () => Promise.resolve();
          evt.userChoice = Promise.resolve({ outcome: 'dismissed' });
          window.dispatchEvent(evt);
        }
        """
    )

    expect(install_button).to_be_visible()


def test_install_button_reachable_on_mobile_viewport(
    page: Page, spa_url, require_spa
):
    """The install affordance must remain reachable on a phone-sized
    viewport (375x667 — iPhone SE / Android baseline). This validates the
    UI-002 checklist line "Install prompt — reachable on mobile" and
    pre-confirms the UI-004 mobile-reachability line."""
    page.set_viewport_size({"width": 375, "height": 667})
    _goto_and_wait_for_bootstrap(page, spa_url)

    install_button = page.get_by_role("banner").get_by_role(
        "button", name=INSTALL_LABEL
    )
    expect(install_button).to_have_count(0)

    page.evaluate(
        """
        () => {
          const evt = new Event('beforeinstallprompt', { cancelable: true });
          evt.prompt = () => Promise.resolve();
          evt.userChoice = Promise.resolve({ outcome: 'dismissed' });
          window.dispatchEvent(evt);
        }
        """
    )

    expect(install_button).to_be_visible()
