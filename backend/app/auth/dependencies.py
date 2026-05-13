"""FastAPI dependencies for authentication and permission checks.

`get_current_user` resolves an `Authorization: Bearer <token>` header to an
active `User` row; `require_permission(name)` builds a dependency that
additionally enforces the user owns a given permission.

All failures surface as 401 (unauthenticated) or 403 (authenticated but
lacking permission). The exact reason a token was rejected is intentionally
collapsed into a generic message so we don't leak hints to attackers.
"""
from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt_tokens import TokenError, decode_access_token
from app.database import get_db
from app.models import User, UserPermission


_INVALID_TOKEN = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="invalid or expired token",
    headers={"WWW-Authenticate": "Bearer"},
)


def _extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise _INVALID_TOKEN
    parts = authorization.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise _INVALID_TOKEN
    return parts[1].strip()


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the bearer token to an active `User` row, else raise 401."""
    token = _extract_bearer(authorization)
    try:
        payload = decode_access_token(token)
    except TokenError:
        raise _INVALID_TOKEN

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise _INVALID_TOKEN

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _INVALID_TOKEN
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="account disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_permission(name: str):
    """Build a dependency that asserts the current user owns permission `name`."""

    def _dep(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        owned = (
            db.query(UserPermission)
            .filter(
                UserPermission.user_id == user.id,
                UserPermission.permission_name == name,
            )
            .first()
        )
        if owned is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"missing permission: {name}",
            )
        return user

    return _dep
