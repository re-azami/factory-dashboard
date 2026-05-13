"""Tests for the User / Permission / UserPermission ORM models."""
import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Permission, User, UserPermission


class TestUser:
    def test_create_user(self, in_memory_db):
        u = User(username="alice", password_hash="hash")
        in_memory_db.add(u)
        in_memory_db.commit()

        row = in_memory_db.query(User).one()
        assert row.username == "alice"
        assert row.password_hash == "hash"
        assert row.is_active is True
        assert row.created_at is not None

    def test_username_is_unique(self, in_memory_db):
        in_memory_db.add(User(username="alice", password_hash="h1"))
        in_memory_db.commit()
        in_memory_db.add(User(username="alice", password_hash="h2"))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()
        in_memory_db.rollback()


class TestPermission:
    def test_name_is_primary_key(self, in_memory_db):
        in_memory_db.add(Permission(name="add_user"))
        in_memory_db.commit()
        in_memory_db.add(Permission(name="add_user"))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()
        in_memory_db.rollback()


class TestUserPermission:
    def test_grant_links_user_and_permission(self, in_memory_db):
        u = User(username="alice", password_hash="h")
        in_memory_db.add(u)
        in_memory_db.add(Permission(name="add_user"))
        in_memory_db.commit()

        in_memory_db.add(UserPermission(user_id=u.id, permission_name="add_user"))
        in_memory_db.commit()

        link = in_memory_db.query(UserPermission).one()
        assert link.user_id == u.id
        assert link.permission_name == "add_user"

    def test_duplicate_grant_rejected(self, in_memory_db):
        u = User(username="alice", password_hash="h")
        in_memory_db.add(u)
        in_memory_db.add(Permission(name="add_user"))
        in_memory_db.commit()

        in_memory_db.add(UserPermission(user_id=u.id, permission_name="add_user"))
        in_memory_db.commit()
        in_memory_db.add(UserPermission(user_id=u.id, permission_name="add_user"))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()
        in_memory_db.rollback()

    def test_deleting_user_cascades_to_user_permissions(self, in_memory_db):
        # SQLite enforces FK cascades only when the pragma is on.
        in_memory_db.execute(__import__("sqlalchemy").text("PRAGMA foreign_keys=ON"))

        u = User(username="alice", password_hash="h")
        in_memory_db.add(u)
        in_memory_db.add(Permission(name="add_user"))
        in_memory_db.commit()

        in_memory_db.add(UserPermission(user_id=u.id, permission_name="add_user"))
        in_memory_db.commit()
        assert in_memory_db.query(UserPermission).count() == 1

        in_memory_db.delete(u)
        in_memory_db.commit()
        assert in_memory_db.query(UserPermission).count() == 0
