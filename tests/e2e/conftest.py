"""
End-to-end tests against the live stack (FastAPI on 8000, Streamlit on 8501).

Run with:
    pytest tests/e2e                    # headless
    pytest tests/e2e --headed           # watch the browser
    pytest tests/e2e --base-url=...     # point at a different frontend
"""
import os

import httpx
import pytest


BACKEND_URL = os.environ.get("E2E_BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.environ.get("E2E_FRONTEND_URL", "http://localhost:8501")


@pytest.fixture(scope="session", autouse=True)
def require_stack():
    """Fail fast with a clear message if backend or frontend isn't reachable."""
    for label, url in [("backend", f"{BACKEND_URL}/docs"), ("frontend", FRONTEND_URL)]:
        try:
            r = httpx.get(url, timeout=5.0)
        except httpx.HTTPError as e:
            pytest.exit(f"E2E precondition failed: {label} unreachable at {url} ({e})")
        if r.status_code >= 500:
            pytest.exit(f"E2E precondition failed: {label} returned {r.status_code} at {url}")


@pytest.fixture
def backend_url():
    return BACKEND_URL


@pytest.fixture
def frontend_url():
    return FRONTEND_URL
