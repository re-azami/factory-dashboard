"""Tests for app.auth.jwt_tokens.

Covers edge cases 1, 2, 3, 4 from the AUTH-002 plan plus the boundary case
of a 1-minute quickly-expiring token and a missing-secret guard.

Edge categories NOT applicable to this file:
  - Duplicate rows: this module is stateless — there is no DB and no row uniqueness to test.
  - Calendar conversion: JWT uses Unix timestamps; no Jalali ↔ Gregorian work happens here.
  - LLM provider switches: this module never touches backend/app/llm/.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.auth import jwt_tokens
from app.auth.jwt_tokens import (
    TokenError,
    decode_access_token,
    encode_access_token,
)
from app.config import settings


# ── 1. Roundtrip ─────────────────────────────────────────────────────────────
class TestRoundtrip:
    def test_encode_then_decode_returns_same_sub_and_type(self):
        token = encode_access_token(42)
        payload = decode_access_token(token)
        assert payload["sub"] == "42"
        assert payload["type"] == "access"

    def test_payload_contains_iat_and_exp(self):
        token = encode_access_token(7)
        payload = decode_access_token(token)
        assert isinstance(payload["iat"], int)
        assert isinstance(payload["exp"], int)
        assert payload["exp"] > payload["iat"]

    def test_default_expiry_uses_settings_minutes(self):
        """The default lifetime is taken from settings and `exp` is enforced.

        Verified three ways against an injected, frozen clock:
          1. `exp - iat` equals `settings.jwt_access_token_minutes * 60`.
          2. Decoding at `t0 + 5s` (well inside the window) succeeds.
          3. Decoding at `t0 + default_minutes + 1m` (just past the window) fails.
        """
        t0 = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        token = encode_access_token(1, now=t0)

        # (1) Structural: the lifetime really is `settings.jwt_access_token_minutes`.
        payload = decode_access_token(token, now=t0 + timedelta(seconds=5))
        assert payload["exp"] - payload["iat"] == settings.jwt_access_token_minutes * 60

        # (2) Inside the window: still decodable.
        assert payload["sub"] == "1"

        # (3) Just past the window: expired.
        past_expiry = t0 + timedelta(minutes=settings.jwt_access_token_minutes + 1)
        with pytest.raises(TokenError):
            decode_access_token(token, now=past_expiry)


# ── 2. Expired token ─────────────────────────────────────────────────────────
class TestExpiry:
    def test_expired_token_raises(self):
        """Token issued in the past with a tiny expiry must fail to decode now."""
        past = datetime.now(timezone.utc) - timedelta(hours=1)
        token = encode_access_token(1, expires_in_minutes=1, now=past)
        with pytest.raises(TokenError):
            decode_access_token(token)

    def test_one_minute_boundary_expiry(self):
        """Boundary: 1-minute token issued 2 minutes ago is expired."""
        old = datetime.now(timezone.utc) - timedelta(minutes=2)
        token = encode_access_token(1, expires_in_minutes=1, now=old)
        with pytest.raises(TokenError):
            decode_access_token(token)

    def test_fresh_one_minute_token_still_valid(self):
        """A token with 1-minute lifetime issued right now is still decodable."""
        token = encode_access_token(1, expires_in_minutes=1)
        payload = decode_access_token(token)
        assert payload["sub"] == "1"


# ── 3. Tampered signature ────────────────────────────────────────────────────
class TestTamperedSignature:
    def test_flipped_signature_char_raises(self):
        token = encode_access_token(1)
        # JWT format: header.payload.signature — mangle the last char of the
        # signature so the HMAC no longer matches.
        last = token[-1]
        flipped = "a" if last != "a" else "b"
        tampered = token[:-1] + flipped
        with pytest.raises(TokenError):
            decode_access_token(tampered)

    def test_flipped_payload_char_raises(self):
        """Mangling a payload byte also invalidates the signature."""
        token = encode_access_token(1)
        # Tweak a char in the payload segment (between the two dots).
        first_dot = token.index(".")
        second_dot = token.index(".", first_dot + 1)
        middle_idx = (first_dot + second_dot) // 2
        original = token[middle_idx]
        replacement = "A" if original != "A" else "B"
        tampered = token[:middle_idx] + replacement + token[middle_idx + 1:]
        with pytest.raises(TokenError):
            decode_access_token(tampered)


# ── 4. Wrong secret ──────────────────────────────────────────────────────────
class TestWrongSecret:
    def test_decode_with_different_secret_raises(self, monkeypatch):
        token = encode_access_token(1)
        # Now swap the secret in-place; decoding the same token must fail.
        # Use a >=32-byte secret so PyJWT doesn't emit `InsecureKeyLengthWarning`.
        monkeypatch.setattr(
            settings,
            "jwt_secret",
            "a-totally-different-secret-of-at-least-32-bytes-long",
        )
        with pytest.raises(TokenError):
            decode_access_token(token)


# ── Malformed token / wrong type ─────────────────────────────────────────────
class TestMalformedAndWrongType:
    def test_complete_garbage_string_raises(self):
        with pytest.raises(TokenError):
            decode_access_token("not.even.a.token")

    def test_empty_token_raises(self):
        with pytest.raises(TokenError):
            decode_access_token("")

    def test_wrong_type_claim_raises(self):
        """A token whose payload says type=refresh must be rejected."""
        import jwt as pyjwt

        payload = {
            "sub": "1",
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int((datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp()),
            "type": "refresh",
        }
        token = pyjwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        with pytest.raises(TokenError):
            decode_access_token(token)

    def test_missing_sub_claim_raises(self):
        import jwt as pyjwt

        payload = {
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int((datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp()),
            "type": "access",
        }
        token = pyjwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        with pytest.raises(TokenError):
            decode_access_token(token)


# ── Missing JWT_SECRET guard ─────────────────────────────────────────────────
class TestMissingSecret:
    def test_encode_raises_when_secret_empty(self, monkeypatch):
        monkeypatch.setattr(jwt_tokens.settings, "jwt_secret", "")
        with pytest.raises(TokenError):
            encode_access_token(1)

    def test_decode_raises_when_secret_empty(self, monkeypatch):
        # Issue while a secret is configured.
        token = encode_access_token(1)
        monkeypatch.setattr(jwt_tokens.settings, "jwt_secret", "")
        with pytest.raises(TokenError):
            decode_access_token(token)
