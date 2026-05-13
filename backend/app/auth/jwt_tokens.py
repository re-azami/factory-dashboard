"""JWT encode/decode helpers — HS256 via PyJWT.

The module is named `jwt_tokens` (not `jwt`) so it never shadows the top-level
`jwt` package from PyJWT when re-imported. AUTH-002 keeps the scheme simple:
one access token, no refresh, no server-side revocation list.

`encode_access_token` and `decode_access_token` both fail loudly with a
custom `TokenError` (so callers can render a stable 401 message) when the
configured `JWT_SECRET` is missing — we only check that at call time, never
at import, so unit tests that don't touch auth aren't forced to set the var.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from app.config import settings


class TokenError(Exception):
    """Raised when a JWT cannot be issued or verified.

    Used uniformly for: missing secret, expired token, bad signature,
    malformed payload, wrong `type` claim. The dependency layer turns this
    into a 401 with a fixed message so we never leak the exact reason.
    """


_ACCESS_TYPE = "access"


def _require_secret() -> str:
    if not settings.jwt_secret:
        raise TokenError("JWT_SECRET is not configured")
    return settings.jwt_secret


def encode_access_token(
    user_id: int,
    *,
    expires_in_minutes: int | None = None,
    now: datetime | None = None,
) -> str:
    """Issue a signed access token for `user_id`.

    `now` and `expires_in_minutes` are injectable for deterministic tests.
    """
    secret = _require_secret()
    issued = now or datetime.now(timezone.utc)
    minutes = expires_in_minutes if expires_in_minutes is not None else settings.jwt_access_token_minutes
    expires = issued + timedelta(minutes=minutes)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "iat": int(issued.timestamp()),
        "exp": int(expires.timestamp()),
        "type": _ACCESS_TYPE,
    }
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def decode_access_token(
    token: str,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Verify and decode an access token. Raises `TokenError` on any failure.

    `now` is injectable for deterministic tests. When supplied, we disable
    PyJWT's wall-clock `exp` check and compare against the provided instant
    instead, so a token issued at a frozen `t0` can be decoded at `t0+δ`
    without depending on real time.
    """
    secret = _require_secret()
    decode_options: dict[str, Any] = {}
    if now is not None:
        # We'll verify `exp` manually against the injected `now` below;
        # tell PyJWT not to do its own wall-clock comparison.
        decode_options["verify_exp"] = False
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.jwt_algorithm],
            options=decode_options or None,
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError("invalid token") from exc

    if now is not None:
        exp = payload.get("exp")
        if exp is None or int(now.timestamp()) >= int(exp):
            raise TokenError("token has expired")

    if payload.get("type") != _ACCESS_TYPE:
        raise TokenError("wrong token type")
    if "sub" not in payload:
        raise TokenError("token is missing subject")
    return payload
