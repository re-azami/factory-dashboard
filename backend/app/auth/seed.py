"""Seed the admin user + canonical permissions on first startup.

Behaviour:
  - Permission rows are upserted every call (cheap, idempotent — keeps the
    table in sync if a new name is added to `PERMISSION_NAMES`).
  - The admin user is created only when the `users` table is empty.
    Once any user exists the seed is a no-op, so re-running it after
    real users have been added cannot accidentally re-create the admin.
"""
from __future__ import annotations

import logging
from typing import Iterable

from sqlalchemy.orm import Session

from app.auth.hashing import hash_password
from app.auth.permissions import PERMISSION_NAMES
from app.models import Permission, User, UserPermission

log = logging.getLogger(__name__)


def _ensure_permissions(db: Session, names: Iterable[str]) -> None:
    """Insert any permission name from `names` that isn't already a row."""
    existing = {p.name for p in db.query(Permission).all()}
    new = [Permission(name=n) for n in names if n not in existing]
    if new:
        db.add_all(new)
        db.flush()


def seed_admin(
    db: Session,
    *,
    username: str | None,
    password: str | None,
    permission_names: Iterable[str] = PERMISSION_NAMES,
) -> User | None:
    """Idempotently seed the admin user.

    Returns the created `User`, or `None` if seeding was skipped (because
    users already exist, or credentials are missing).
    """
    names = tuple(permission_names)

    if db.query(User).count() > 0:
        return None

    if not username or not password:
        log.warning("Skipping admin seed: ADMIN_USERNAME and/or ADMIN_PASSWORD not set")
        return None

    _ensure_permissions(db, names)

    admin = User(username=username, password_hash=hash_password(password), is_active=True)
    db.add(admin)
    db.flush()  # populate admin.id

    for name in names:
        db.add(UserPermission(user_id=admin.id, permission_name=name))

    db.commit()
    log.info("Seeded admin user %r with %d permissions", username, len(names))
    return admin
