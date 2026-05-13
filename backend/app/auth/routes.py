"""Authentication routes — `/auth/login`, `/auth/logout`, `/auth/me`.

Login issues a JWT access token. Logout is stateless (no server-side
revocation): the client discards the token. `/auth/me` resolves the bearer
token to the current user plus their sorted permission list.
"""
from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.hashing import verify_password
from app.auth.jwt_tokens import encode_access_token
from app.config import settings
from app.database import get_db
from app.models import User, UserPermission


router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schemas ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int = Field(..., description="Token lifetime in seconds.")


class LogoutResponse(BaseModel):
    status: Literal["ok"] = "ok"


class MeResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    permissions: list[str] = Field(
        ..., description="Sorted list of permission names granted to the user."
    )


_INVALID_CREDS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="invalid username or password",
)
_DISABLED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="account disabled",
)


# ── Routes ───────────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Exchange username + password for a JWT access token",
)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Verify credentials and return a signed access token on success.

    Unknown username and wrong password collapse to the same 401 message so
    we don't leak which usernames exist. An inactive account with the
    correct password returns a distinct 401 — the user needs to know they
    can't log in, but no extra info reaches an unauthenticated attacker.
    """
    user = db.query(User).filter(User.username == req.username).first()
    if user is None:
        raise _INVALID_CREDS
    if not verify_password(req.password, user.password_hash):
        raise _INVALID_CREDS
    if not user.is_active:
        raise _DISABLED

    token = encode_access_token(user.id)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_minutes * 60,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Acknowledge logout (stateless — client discards the token)",
)
def logout() -> LogoutResponse:
    """No-op on the server side. The token remains valid until it expires;
    clients must drop it locally. A future ticket can add a revocation list
    if needed."""
    return LogoutResponse()


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Return the authenticated user and their permission list",
)
def me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeResponse:
    """Return id, username, active flag, and a sorted permissions list."""
    rows = (
        db.query(UserPermission.permission_name)
        .filter(UserPermission.user_id == user.id)
        .all()
    )
    permissions = sorted({r[0] for r in rows})
    return MeResponse(
        id=user.id,
        username=user.username,
        is_active=user.is_active,
        permissions=permissions,
    )
