"""Tests for app.auth.hashing."""
import pytest

from app.auth.hashing import hash_password, verify_password


class TestHashPassword:
    def test_returns_string_distinct_from_plaintext(self):
        plaintext = "correct horse battery staple"
        hashed = hash_password(plaintext)
        assert isinstance(hashed, str)
        assert hashed != plaintext

    def test_same_plaintext_produces_different_hashes(self):
        """bcrypt embeds a random salt — two hashes of the same input must differ."""
        a = hash_password("hunter2")
        b = hash_password("hunter2")
        assert a != b

    def test_persian_passwords_supported(self):
        hashed = hash_password("کلمه عبور")
        assert verify_password("کلمه عبور", hashed) is True

    def test_rejects_empty_string(self):
        with pytest.raises(ValueError):
            hash_password("")

    def test_rejects_password_above_72_bytes(self):
        # bcrypt silently truncates above 72 bytes — better to fail loudly.
        with pytest.raises(ValueError):
            hash_password("a" * 73)


class TestVerifyPassword:
    def test_matches_correct_password(self):
        hashed = hash_password("s3cret")
        assert verify_password("s3cret", hashed) is True

    def test_rejects_wrong_password(self):
        hashed = hash_password("s3cret")
        assert verify_password("wrong", hashed) is False

    def test_rejects_empty_inputs(self):
        hashed = hash_password("s3cret")
        assert verify_password("", hashed) is False
        assert verify_password("s3cret", "") is False

    def test_rejects_malformed_hash_without_raising(self):
        assert verify_password("s3cret", "not-a-bcrypt-hash") is False
