"""AUTH-001 — verify the auth tables, admin seed, and factory_ro REVOKE.

There is no login UI yet (AUTH-003 lands that), so the assertions that can be
made today are at the system boundary:

  - migration 005 created `users`, `permissions`, `user_permissions`
  - the lifespan-hook seed populated an admin row (when env vars are set)
  - the seeded password is bcrypt-hashed, not plaintext
  - the seeded admin has every canonical permission
  - the factory_ro role used by the SQL agent CANNOT read these tables

The Angular SPA is also smoke-loaded with Playwright as a regression
guard — the new lifespan code path must not break startup.

The full Playwright login-flow check is AUTH-010's responsibility; once
login UI exists the assertions here will be reused from a browser context.
"""
import os

import httpx
import psycopg
import pytest
from playwright.sync_api import Page, expect

# Each test requires the canonical permission list from the backend code,
# so the e2e suite needs the `backend` package on the path. conftest.py
# handles cwd-relative imports; this is the explicit-import variant.
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2] / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.auth.hashing import verify_password  # noqa: E402
from app.auth.permissions import PERMISSION_NAMES  # noqa: E402


# These match the docker-compose published ports + the seeded credentials.
# Tests skip cleanly (not fail) when ADMIN_USERNAME/PASSWORD aren't set — the
# seed is intentionally optional, so the test should be too.
DB_DSN_RW = os.environ.get(
    "E2E_DATABASE_URL",
    "postgresql://factory:factory@localhost:5432/factory",
)
DB_DSN_RO = os.environ.get(
    "E2E_DATABASE_URL_RO",
    "postgresql://factory_ro:factory_ro@localhost:5432/factory",
)
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


@pytest.fixture
def db_rw():
    conn = psycopg.connect(DB_DSN_RW)
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def db_ro():
    conn = psycopg.connect(DB_DSN_RO)
    try:
        yield conn
    finally:
        conn.close()


class TestSchema:
    """Migration 005 created the three auth tables with the expected columns."""

    def test_users_table_has_expected_columns(self, db_rw):
        cols = _columns(db_rw, "users")
        for required in ("id", "username", "password_hash", "is_active", "created_at"):
            assert required in cols, f"users.{required} missing"

    def test_permissions_table_has_expected_columns(self, db_rw):
        cols = _columns(db_rw, "permissions")
        assert "name" in cols
        assert "created_at" in cols

    def test_user_permissions_table_has_expected_columns(self, db_rw):
        cols = _columns(db_rw, "user_permissions")
        for required in ("user_id", "permission_name", "created_at"):
            assert required in cols, f"user_permissions.{required} missing"


class TestFactoryRoCannotReadAuthTables:
    """Security boundary — the SQL agent's read-only role must not see hashes."""

    @pytest.mark.parametrize("table", ["users", "permissions", "user_permissions"])
    def test_factory_ro_select_is_denied(self, db_ro, table):
        with db_ro.cursor() as cur:
            with pytest.raises(psycopg.errors.InsufficientPrivilege):
                cur.execute(f"SELECT 1 FROM {table} LIMIT 1")
            db_ro.rollback()


class TestAdminSeed:
    """The lifespan-hook seed populated the admin and granted every permission."""

    def setup_method(self):
        if not ADMIN_USERNAME or not ADMIN_PASSWORD:
            pytest.skip("ADMIN_USERNAME/ADMIN_PASSWORD not set in the environment")

    def test_admin_user_row_exists(self, db_rw):
        with db_rw.cursor() as cur:
            cur.execute(
                "SELECT username, password_hash, is_active FROM users WHERE username = %s",
                (ADMIN_USERNAME,),
            )
            row = cur.fetchone()
        assert row is not None, f"no users row for {ADMIN_USERNAME!r}"
        username, password_hash, is_active = row
        assert username == ADMIN_USERNAME
        assert is_active is True
        # bcrypt hashes start with $2 and are never the plaintext.
        assert password_hash != ADMIN_PASSWORD
        assert password_hash.startswith("$2"), f"not a bcrypt hash: {password_hash!r}"
        assert verify_password(ADMIN_PASSWORD, password_hash) is True

    def test_all_canonical_permissions_exist(self, db_rw):
        with db_rw.cursor() as cur:
            cur.execute("SELECT name FROM permissions")
            names = {r[0] for r in cur.fetchall()}
        missing = set(PERMISSION_NAMES) - names
        assert not missing, f"missing permission rows: {missing}"

    def test_admin_has_every_permission(self, db_rw):
        with db_rw.cursor() as cur:
            cur.execute(
                """
                SELECT up.permission_name
                FROM user_permissions up
                JOIN users u ON u.id = up.user_id
                WHERE u.username = %s
                """,
                (ADMIN_USERNAME,),
            )
            granted = {r[0] for r in cur.fetchall()}
        missing = set(PERMISSION_NAMES) - granted
        assert not missing, f"admin missing permissions: {missing}"


class TestBackendStillHealthy:
    """The new lifespan hook (admin seed) must not break startup."""

    def test_health_endpoint_responds(self, backend_url):
        r = httpx.get(f"{backend_url}/health", timeout=5.0)
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestFrontendStillLoads:
    """SPA smoke — auth migration + seed must not regress the chat UI."""

    def test_frontend_renders_chat_input(self, page: Page):
        # The Angular SPA serves the chat page at /chat; / redirects there.
        # Persian title + placeholder per the SPA's Iran-Yekan / RTL design.
        page.goto("/")
        expect(page).to_have_title("داشبورد کارخانه")
        expect(
            page.get_by_placeholder("سؤال خود را به فارسی یا انگلیسی بنویسید…")
        ).to_be_visible()


# ── helpers ───────────────────────────────────────────────────────────────────


def _columns(conn: psycopg.Connection, table: str) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            """,
            (table,),
        )
        return {r[0] for r in cur.fetchall()}
