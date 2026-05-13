"""AUTH-002 — verify the auth HTTP endpoints and tightened CORS.

There is no login UI yet (AUTH-003 lands that), so this e2e suite hits the
backend at the HTTP boundary using Playwright's APIRequestContext
(`page.request`). The frontend is also smoke-loaded as a regression guard
mirroring AUTH-001.

Covered:
  - POST /auth/login happy path + credential / validation failure modes
  - GET  /auth/me happy path + missing / garbage / malformed Authorization
  - POST /auth/logout (stateless — always 200 ok)
  - CORS — Origin echo only for the configured FRONTEND_ORIGIN
  - Streamlit still loads with title "Factory Dashboard"

Admin-credential-dependent tests skip cleanly when ADMIN_USERNAME /
ADMIN_PASSWORD aren't set (same pattern as test_auth_001_seed.py). The CORS,
malformed-header, missing-fields, and frontend-load tests run unconditionally
since they don't require any seeded credentials.
"""
import os

import pytest
from playwright.sync_api import Page, expect

# Each test requires the canonical permission list from the backend code,
# so the e2e suite needs the `backend` package on the path. This mirrors
# the sys.path bootstrap in test_auth_001_seed.py.
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2] / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.auth.permissions import PERMISSION_NAMES  # noqa: E402


ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

# The CORS allowlist is the Streamlit frontend origin published by docker-compose.
ALLOWED_ORIGIN = "http://localhost:8501"
EVIL_ORIGIN = "http://evil.example.com"

# Shared, human-readable invalid-creds message — the backend returns the same
# string for "wrong password" and "unknown user" so callers can't enumerate.
INVALID_CREDS_DETAIL = "invalid username or password"


def _admin_creds_required():
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        pytest.skip("ADMIN_USERNAME/ADMIN_PASSWORD not set in the environment")


def _login(page: Page, backend_url: str, username: str, password: str):
    return page.request.post(
        f"{backend_url}/auth/login",
        data={"username": username, "password": password},
    )


def _get_admin_token(page: Page, backend_url: str) -> str:
    resp = _login(page, backend_url, ADMIN_USERNAME, ADMIN_PASSWORD)
    assert resp.status == 200, f"admin login failed: {resp.status} {resp.text()}"
    body = resp.json()
    return body["access_token"]


# ── /auth/login ───────────────────────────────────────────────────────────────


class TestLogin:
    def test_login_with_valid_admin_returns_bearer_token(self, page: Page, backend_url):
        _admin_creds_required()
        resp = _login(page, backend_url, ADMIN_USERNAME, ADMIN_PASSWORD)
        assert resp.status == 200, resp.text()
        body = resp.json()
        assert isinstance(body.get("access_token"), str)
        assert body["access_token"], "access_token must be non-empty"
        assert body.get("token_type") == "bearer"
        assert isinstance(body.get("expires_in"), int)
        assert body["expires_in"] > 0

    def test_login_with_wrong_password_returns_401(self, page: Page, backend_url):
        _admin_creds_required()
        resp = _login(page, backend_url, ADMIN_USERNAME, ADMIN_PASSWORD + "_nope")
        assert resp.status == 401, resp.text()
        body = resp.json()
        assert body.get("detail") == INVALID_CREDS_DETAIL

    def test_login_with_unknown_username_returns_401_same_detail(
        self, page: Page, backend_url
    ):
        # Whether the user exists or the password is wrong, the response must
        # be indistinguishable — no enumeration.
        resp = _login(page, backend_url, "definitely_not_a_real_user", "whatever")
        assert resp.status == 401, resp.text()
        body = resp.json()
        assert body.get("detail") == INVALID_CREDS_DETAIL

    def test_login_with_missing_fields_returns_422(self, page: Page, backend_url):
        resp = page.request.post(f"{backend_url}/auth/login", data={})
        assert resp.status == 422, resp.text()

    def test_login_with_empty_strings_returns_422(self, page: Page, backend_url):
        # Pydantic min_length=1 on both fields.
        resp = page.request.post(
            f"{backend_url}/auth/login",
            data={"username": "", "password": ""},
        )
        assert resp.status == 422, resp.text()


# ── /auth/me ──────────────────────────────────────────────────────────────────


class TestMe:
    def test_me_with_admin_token_returns_full_identity(self, page: Page, backend_url):
        _admin_creds_required()
        token = _get_admin_token(page, backend_url)
        resp = page.request.get(
            f"{backend_url}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status == 200, resp.text()
        body = resp.json()
        assert "id" in body
        assert body.get("username") == ADMIN_USERNAME
        assert body.get("is_active") is True
        perms = body.get("permissions")
        assert isinstance(perms, list)
        missing = set(PERMISSION_NAMES) - set(perms)
        assert not missing, f"admin /auth/me missing permissions: {missing}"

    def test_me_without_token_returns_401(self, page: Page, backend_url):
        resp = page.request.get(f"{backend_url}/auth/me")
        assert resp.status == 401, resp.text()

    def test_me_with_garbage_token_returns_401(self, page: Page, backend_url):
        resp = page.request.get(
            f"{backend_url}/auth/me",
            headers={"Authorization": "Bearer notajwt"},
        )
        assert resp.status == 401, resp.text()

    def test_me_with_non_bearer_scheme_returns_401(self, page: Page, backend_url):
        # The dependency must reject anything that isn't a Bearer token, even
        # if the value looks vaguely credential-shaped.
        resp = page.request.get(
            f"{backend_url}/auth/me",
            headers={"Authorization": "Basic admin:admin"},
        )
        assert resp.status == 401, resp.text()


# ── /auth/logout ──────────────────────────────────────────────────────────────


class TestLogout:
    def test_logout_without_token_returns_ok(self, page: Page, backend_url):
        # Logout is stateless on the server — JWTs aren't tracked, so logout is
        # purely a client-side hint and always responds 200 {status: "ok"}.
        resp = page.request.post(f"{backend_url}/auth/logout")
        assert resp.status == 200, resp.text()
        assert resp.json() == {"status": "ok"}

    def test_logout_with_valid_token_returns_ok(self, page: Page, backend_url):
        _admin_creds_required()
        token = _get_admin_token(page, backend_url)
        resp = page.request.post(
            f"{backend_url}/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status == 200, resp.text()
        assert resp.json() == {"status": "ok"}


# ── CORS regression ───────────────────────────────────────────────────────────


class TestCors:
    """The tightened CORS middleware must only echo the configured FRONTEND_ORIGIN."""

    def test_allowed_origin_is_echoed_back(self, page: Page, backend_url):
        resp = page.request.fetch(
            f"{backend_url}/health",
            headers={"Origin": ALLOWED_ORIGIN},
        )
        assert resp.status == 200, resp.text()
        # Header lookup is case-insensitive via Playwright's normalized dict.
        assert resp.headers.get("access-control-allow-origin") == ALLOWED_ORIGIN

    def test_disallowed_origin_is_not_echoed(self, page: Page, backend_url):
        resp = page.request.fetch(
            f"{backend_url}/health",
            headers={"Origin": EVIL_ORIGIN},
        )
        # The request still succeeds (CORS is a browser-side enforcement) but
        # the disallowed origin must NOT be reflected in the response header.
        allow_origin = resp.headers.get("access-control-allow-origin")
        assert allow_origin != EVIL_ORIGIN, (
            f"backend echoed disallowed Origin back as allow-origin: {allow_origin!r}"
        )


# ── Frontend regression guard ────────────────────────────────────────────────


class TestFrontendStillLoads:
    """Streamlit smoke — auth endpoints + CORS tightening must not regress the UI."""

    def test_frontend_renders_chat_input(self, page: Page):
        page.goto("/")
        expect(page).to_have_title("Factory Dashboard")
        expect(
            page.get_by_placeholder("Type your question (Persian or English)...")
        ).to_be_visible()
