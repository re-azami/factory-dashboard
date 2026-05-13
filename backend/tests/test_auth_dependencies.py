"""Tests for app.auth.dependencies (get_current_user, require_permission).

Covers edge cases 5, 6, 7, 8, 17, 18, 19 from the AUTH-002 plan.

We spin up a tiny FastAPI app with two stub routes that exercise the two
dependencies directly. The shared `get_db` is overridden to use an in-memory
SQLite engine seeded with three users:
  * id=10 active, with permission "use_simple_chat"
  * id=20 active, no permissions
  * id=30 inactive, with permission "use_simple_chat"
"""
from __future__ import annotations

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.dependencies import get_current_user, require_permission
from app.auth.hashing import hash_password
from app.auth.jwt_tokens import encode_access_token
from app.database import Base, get_db
from app.models import Permission, User, UserPermission
import app.models  # noqa: F401 — register tables on Base.metadata


# ── Test app + fixtures ──────────────────────────────────────────────────────
def _build_app(SessionLocal) -> FastAPI:
    """Build a throwaway FastAPI app with stub routes for the two deps."""
    app = FastAPI()

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    @app.get("/whoami")
    def whoami(user: User = Depends(get_current_user)):
        return {"id": user.id, "username": user.username}

    @app.get("/needs-perm")
    def needs_perm(user: User = Depends(require_permission("use_simple_chat"))):
        return {"id": user.id}

    return app


@pytest.fixture
def deps_client():
    """In-memory SQLite engine + FastAPI test app seeded with three users."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    db = SessionLocal()
    try:
        db.add(Permission(name="use_simple_chat"))
        db.flush()
        # Explicit IDs so tests can mint tokens for known/unknown user_ids.
        db.add(User(id=10, username="alice", password_hash=hash_password("x"), is_active=True))
        db.add(User(id=20, username="bob", password_hash=hash_password("x"), is_active=True))
        db.add(User(id=30, username="carol", password_hash=hash_password("x"), is_active=False))
        db.flush()
        db.add(UserPermission(user_id=10, permission_name="use_simple_chat"))
        db.add(UserPermission(user_id=30, permission_name="use_simple_chat"))
        db.commit()
    finally:
        db.close()

    app = _build_app(SessionLocal)
    with TestClient(app) as c:
        yield c
    engine.dispose()


# ── Edge case 5: missing/empty Authorization header → 401 ────────────────────
class TestMissingAuthorization:
    def test_no_header_returns_401(self, deps_client):
        resp = deps_client.get("/whoami")
        assert resp.status_code == 401

    def test_empty_header_returns_401(self, deps_client):
        resp = deps_client.get("/whoami", headers={"Authorization": ""})
        assert resp.status_code == 401


# ── Edge case 6: malformed headers → 401 ─────────────────────────────────────
class TestMalformedHeader:
    @pytest.mark.parametrize(
        "header",
        [
            "NotBearer xxx",
            "Bearer",
            "Bearer ",  # trailing space, empty token
            "Basic abc",
        ],
    )
    def test_malformed_header_returns_401(self, deps_client, header):
        resp = deps_client.get("/whoami", headers={"Authorization": header})
        assert resp.status_code == 401


# ── Edge case 7: token for non-existent user_id → 401 ────────────────────────
class TestUnknownUser:
    def test_unknown_user_id_returns_401(self, deps_client):
        token = encode_access_token(99999)  # no such user in fixture
        resp = deps_client.get(
            "/whoami", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 401


# ── Edge case 8: inactive user → 401 "account disabled" ──────────────────────
class TestInactiveUser:
    def test_inactive_user_returns_401_with_disabled_message(self, deps_client):
        token = encode_access_token(30)  # carol, is_active=False
        resp = deps_client.get(
            "/whoami", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 401
        assert resp.json()["detail"] == "account disabled"


# ── Happy path for get_current_user (used as a control) ──────────────────────
class TestActiveUserSucceeds:
    def test_valid_token_for_active_user_returns_200(self, deps_client):
        token = encode_access_token(10)  # alice
        resp = deps_client.get(
            "/whoami", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        assert resp.json() == {"id": 10, "username": "alice"}


# ── Edge case 17: require_permission allows when granted ─────────────────────
class TestRequirePermissionGranted:
    def test_user_with_permission_gets_200(self, deps_client):
        token = encode_access_token(10)  # alice has use_simple_chat
        resp = deps_client.get(
            "/needs-perm", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        assert resp.json() == {"id": 10}


# ── Edge case 18: require_permission denies when missing → 403 ───────────────
class TestRequirePermissionMissing:
    def test_user_without_permission_gets_403(self, deps_client):
        token = encode_access_token(20)  # bob has no permissions
        resp = deps_client.get(
            "/needs-perm", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 403
        # Distinguishable from 401 by status code and message
        assert "use_simple_chat" in resp.json()["detail"]


# ── Edge case 19: no token at all → 401, not 403 ─────────────────────────────
class TestRequirePermissionNoToken:
    def test_no_token_at_all_returns_401_before_permission_check(self, deps_client):
        resp = deps_client.get("/needs-perm")
        assert resp.status_code == 401  # NOT 403 — auth check must fire first

    def test_invalid_token_returns_401_before_permission_check(self, deps_client):
        resp = deps_client.get(
            "/needs-perm", headers={"Authorization": "Bearer garbage.token.here"}
        )
        assert resp.status_code == 401
