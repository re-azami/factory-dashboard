"""Tests for app.auth.seed.seed_admin."""
import logging

import pytest

from app.auth.hashing import verify_password
from app.auth.permissions import PERMISSION_NAMES
from app.auth.seed import seed_admin
from app.models import Permission, User, UserPermission


class TestSeedAdminFreshDB:
    def test_creates_admin_and_grants_all_permissions(self, in_memory_db):
        admin = seed_admin(in_memory_db, username="admin", password="pw")

        assert admin is not None
        assert admin.username == "admin"
        assert admin.is_active is True

        # Password is hashed, not stored plaintext.
        assert admin.password_hash != "pw"
        assert verify_password("pw", admin.password_hash) is True

        # Every canonical permission exists and is granted.
        perm_names = {p.name for p in in_memory_db.query(Permission).all()}
        assert perm_names == set(PERMISSION_NAMES)

        granted = {gp.permission_name for gp in in_memory_db.query(UserPermission).all()}
        assert granted == set(PERMISSION_NAMES)

    def test_can_use_custom_permission_list(self, in_memory_db):
        admin = seed_admin(
            in_memory_db,
            username="admin",
            password="pw",
            permission_names=("alpha", "beta"),
        )
        assert admin is not None
        granted = {gp.permission_name for gp in in_memory_db.query(UserPermission).all()}
        assert granted == {"alpha", "beta"}


class TestSeedAdminIdempotency:
    def test_does_nothing_when_users_already_exist(self, in_memory_db):
        seed_admin(in_memory_db, username="admin", password="pw")
        first_count = in_memory_db.query(User).count()
        first_grants = in_memory_db.query(UserPermission).count()

        # Calling again must be a no-op.
        result = seed_admin(in_memory_db, username="admin", password="different-pw")
        assert result is None
        assert in_memory_db.query(User).count() == first_count
        assert in_memory_db.query(UserPermission).count() == first_grants

    def test_does_not_overwrite_existing_admin_password(self, in_memory_db):
        seed_admin(in_memory_db, username="admin", password="original")
        seed_admin(in_memory_db, username="admin", password="new")
        admin = in_memory_db.query(User).one()
        assert verify_password("original", admin.password_hash) is True
        assert verify_password("new", admin.password_hash) is False


class TestSeedAdminMissingCredentials:
    @pytest.mark.parametrize(
        ("username", "password"),
        [(None, "pw"), ("admin", None), ("", "pw"), ("admin", ""), (None, None)],
    )
    def test_skipped_when_credentials_missing(self, in_memory_db, username, password, caplog):
        with caplog.at_level(logging.WARNING):
            result = seed_admin(in_memory_db, username=username, password=password)
        assert result is None
        assert in_memory_db.query(User).count() == 0
        # No permissions created either — we shouldn't pre-populate without an admin.
        assert in_memory_db.query(Permission).count() == 0
        assert any("admin seed" in rec.message.lower() for rec in caplog.records)
