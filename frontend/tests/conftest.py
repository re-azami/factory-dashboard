"""
Shared fixtures for frontend tests.

We use streamlit.testing.v1.AppTest to drive the Streamlit script
in-process — no browser required. All HTTP calls to the backend are
mocked via httpx so the tests don't need a running API.
"""
import os
import sys
from pathlib import Path

# Set BACKEND_URL before app.py imports os.getenv()
os.environ.setdefault("BACKEND_URL", "http://test-backend:8000")

# frontend/ on sys.path so AppTest can find app.py reliably
FRONTEND_ROOT = Path(__file__).resolve().parents[1]
if str(FRONTEND_ROOT) not in sys.path:
    sys.path.insert(0, str(FRONTEND_ROOT))

import pytest


APP_PATH = str(FRONTEND_ROOT / "app.py")


@pytest.fixture
def app_path():
    """Absolute path to the Streamlit app entrypoint."""
    return APP_PATH


class FakeStreamResponse:
    """Mimics the context manager returned by httpx.stream().

    `chunks` is a list of strings. Each string is yielded verbatim by both
    iter_text() and iter_lines() — for NDJSON tests, pass one full JSON object
    per chunk (the frontend uses iter_lines() now).
    """
    def __init__(self, chunks, status_code=200):
        self._chunks = chunks
        self.status_code = status_code

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def raise_for_status(self):
        if self.status_code >= 400:
            import httpx
            raise httpx.HTTPStatusError(
                f"status {self.status_code}",
                request=None,
                response=type("R", (), {"status_code": self.status_code, "text": "err"})(),
            )

    def iter_text(self):
        for c in self._chunks:
            yield c

    def iter_lines(self):
        for c in self._chunks:
            # Caller is responsible for passing one logical line per chunk;
            # strip trailing newlines so the test author can include them or not.
            yield c.rstrip("\n")


class FakeJSONResponse:
    """Mimics httpx.Response for httpx.post / httpx.get."""
    def __init__(self, json_data, status_code=200, text=""):
        self._json = json_data
        self.status_code = status_code
        self.text = text or str(json_data)

    def raise_for_status(self):
        if self.status_code >= 400:
            import httpx
            raise httpx.HTTPStatusError(
                f"status {self.status_code}", request=None,
                response=type("R", (), {"status_code": self.status_code, "text": self.text})(),
            )

    def json(self):
        return self._json


@pytest.fixture
def fake_stream():
    return FakeStreamResponse


@pytest.fixture
def fake_json():
    return FakeJSONResponse
