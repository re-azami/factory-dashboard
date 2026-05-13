"""Tests for the /auth/login, /auth/logout, /auth/me HTTP routes.

Covers edge cases 9, 10, 11, 12, 13, 14, 15, 16, 22 from the AUTH-002 plan.

Uses the same engine-per-test pattern as test_main_endpoints.py: a fresh
in-memory SQLite engine, `app.main.SessionLocal` patched so the lifespan
admin seed runs against the test engine, and `dependency_overrides[get_db]`
pointed at the test session.

For each test we manually seed users in the fixture rather than relying on
ADMIN_USERNAME/ADMIN_PASSWORD env vars — this keeps the tests deterministic
and decoupled from the host env.
"""
from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.hashing import hash_password
from app.auth.jwt_tokens import encode_access_token
from app.auth.permissions import PERMISSION_NAMES
from app.database import Base, get_db
from app.main import app as fastapi_app
from app.models import Permission, User, UserPermission
import app.models  # noqa: F401 — register tables on Base.metadata


@pytest.fixture
def client_factory():
    """Yield a factory `(seed_fn) -> TestClient` so each test seeds its own users.

    The factory creates a fresh in-memory SQLite engine, runs `seed_fn(db)`
    against it, then enters a TestClient bound to that engine.
    """
    engines = []
    patchers = []
    clients = []

    def _factory(seed_fn=None):
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=engine)
        TestSession = sessionmaker(bind=engine)

        if seed_fn is not None:
            db = TestSession()
            try:
                seed_fn(db)
                db.commit()
            finally:
                db.close()

        def override_get_db():
            db = TestSession()
            try:
                yield db
            finally:
                db.close()

        fastapi_app.dependency_overrides[get_db] = override_get_db
        # Lifespan opens SessionLocal() to seed admin — point at the test engine.
        p = patch("app.main.SessionLocal", TestSession)
        p.start()
        patchers.append(p)
        engines.append(engine)

        c = TestClient(fastapi_app)
        c.__enter__()
        clients.append(c)
        return c

    try:
        yield _factory
    finally:
        for c in clients:
            c.__exit__(None, None, None)
        for p in patchers:
            p.stop()
        fastapi_app.dependency_overrides.clear()
        for e in engines:
            e.dispose()


def _seed_user(
    db,
    *,
    username: str,
    password: str,
    is_active: bool = True,
    permissions: list[str] | None = None,
) -> User:
    """Helper: create a permission row + user + grants. Returns the User."""
    perms = permissions or []
    existing = {p.name for p in db.query(Permission).all()}
    for name in perms:
        if name not in existing:
            db.add(Permission(name=name))
    db.flush()
    user = User(
        username=username,
        password_hash=hash_password(password),
        is_active=is_active,
    )
    db.add(user)
    db.flush()
    for name in perms:
        db.add(UserPermission(user_id=user.id, permission_name=name))
    db.flush()
    return user


# ── Edge case 9: unknown username → 401 generic ──────────────────────────────
class TestLoginUnknownUsername:
    def test_unknown_username_returns_401_generic(self, client_factory):
        c = client_factory()  # empty DB
        resp = c.post("/auth/login", json={"username": "ghost", "password": "x"})
        assert resp.status_code == 401
        assert resp.json()["detail"] == "invalid username or password"


# ── Edge case 10: wrong password → same generic 401 (no enumeration) ─────────
class TestLoginWrongPassword:
    def test_wrong_password_returns_same_generic_401(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(db, username="alice", password="correct-pw")
        )
        resp = c.post(
            "/auth/login", json={"username": "alice", "password": "wrong-pw"}
        )
        assert resp.status_code == 401
        # Same message as unknown-username — must not leak enumeration.
        assert resp.json()["detail"] == "invalid username or password"


# ── Edge case 11: inactive user with correct password → 401 "account disabled"
class TestLoginInactiveUser:
    def test_inactive_user_correct_pw_returns_account_disabled(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(
                db, username="carol", password="pw", is_active=False
            )
        )
        resp = c.post("/auth/login", json={"username": "carol", "password": "pw"})
        assert resp.status_code == 401
        detail = resp.json()["detail"]
        assert detail == "account disabled"
        # Distinct from the generic enumeration-safe message.
        assert detail != "invalid username or password"


# ── Edge case 12: missing body fields → 422 (Pydantic) ───────────────────────
class TestLoginMissingFields:
    def test_missing_password_returns_422(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/login", json={"username": "alice"})
        assert resp.status_code == 422

    def test_missing_username_returns_422(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/login", json={"password": "x"})
        assert resp.status_code == 422

    def test_empty_body_returns_422(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/login", json={})
        assert resp.status_code == 422


# ── Edge case 13: empty username/password strings → 422 (min_length=1) ───────
class TestLoginEmptyStrings:
    def test_empty_username_returns_422(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/login", json={"username": "", "password": "x"})
        assert resp.status_code == 422

    def test_empty_password_returns_422(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/login", json={"username": "alice", "password": ""})
        assert resp.status_code == 422


# ── Login happy path (control) ───────────────────────────────────────────────
class TestLoginSuccess:
    def test_valid_credentials_return_token(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(db, username="alice", password="pw")
        )
        resp = c.post("/auth/login", json={"username": "alice", "password": "pw"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["token_type"] == "bearer"
        assert isinstance(body["access_token"], str) and body["access_token"]
        assert body["expires_in"] > 0


# ── Edge case 14: /auth/me returns ALL granted permissions ───────────────────
class TestMeAllPermissions:
    def test_admin_with_all_permissions(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(
                db,
                username="admin",
                password="pw",
                permissions=list(PERMISSION_NAMES),
            )
        )
        login = c.post("/auth/login", json={"username": "admin", "password": "pw"})
        token = login.json()["access_token"]
        resp = c.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["username"] == "admin"
        assert body["is_active"] is True
        # Permissions list is sorted and deduped — covers every name.
        assert body["permissions"] == sorted(set(PERMISSION_NAMES))


# ── Edge case 15: /auth/me returns empty permissions list ────────────────────
class TestMeNoPermissions:
    def test_user_without_permissions_gets_empty_list(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(db, username="nobody", password="pw")
        )
        login = c.post("/auth/login", json={"username": "nobody", "password": "pw"})
        token = login.json()["access_token"]
        resp = c.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["permissions"] == []


# ── Edge case 16: Persian username roundtrip ─────────────────────────────────
class TestPersianUsername:
    def test_persian_username_login_and_me(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(db, username="کاربر", password="رمز")
        )
        login = c.post("/auth/login", json={"username": "کاربر", "password": "رمز"})
        assert login.status_code == 200
        token = login.json()["access_token"]
        resp = c.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["username"] == "کاربر"


# ── Edge case 22: /auth/logout returns 200 with or without a token ───────────
class TestLogout:
    def test_logout_without_token_returns_200(self, client_factory):
        c = client_factory()
        resp = c.post("/auth/logout")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_logout_with_token_returns_200(self, client_factory):
        c = client_factory(
            lambda db: _seed_user(db, username="alice", password="pw")
        )
        login = c.post("/auth/login", json={"username": "alice", "password": "pw"})
        token = login.json()["access_token"]
        resp = c.post(
            "/auth/logout", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


# ── /auth/me without a token must 401 ────────────────────────────────────────
class TestMeRequiresAuth:
    def test_me_without_token_returns_401(self, client_factory):
        c = client_factory()
        resp = c.get("/auth/me")
        assert resp.status_code == 401

    def test_me_with_invalid_token_returns_401(self, client_factory):
        c = client_factory()
        resp = c.get(
            "/auth/me", headers={"Authorization": "Bearer not.a.real.token"}
        )
        assert resp.status_code == 401

    def test_me_with_token_for_missing_user_returns_401(self, client_factory):
        c = client_factory()  # empty DB
        token = encode_access_token(123456)
        resp = c.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
