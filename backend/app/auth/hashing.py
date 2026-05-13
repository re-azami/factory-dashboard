"""Password hashing — bcrypt.

bcrypt is chosen over argon2-cffi because it has prebuilt wheels for every
platform we deploy on (no C toolchain required in the slim Python image).
"""
from __future__ import annotations

import bcrypt


def hash_password(plaintext: str) -> str:
    """Return a bcrypt hash (utf-8 string) of `plaintext`.

    bcrypt has a 72-byte input limit. We hard-fail on longer input rather
    than silently truncating — silent truncation lets two different
    passwords share a hash.
    """
    if not isinstance(plaintext, str) or plaintext == "":
        raise ValueError("password must be a non-empty string")
    encoded = plaintext.encode("utf-8")
    if len(encoded) > 72:
        raise ValueError("password exceeds bcrypt's 72-byte limit")
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(plaintext: str, hashed: str) -> bool:
    """Check `plaintext` against a stored bcrypt hash. Never raises."""
    if not plaintext or not hashed:
        return False
    try:
        return bcrypt.checkpw(plaintext.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False
