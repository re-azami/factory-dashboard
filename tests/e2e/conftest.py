"""
End-to-end tests against the live stack (FastAPI on 8000, Angular SPA on 4200).

Run with:
    pytest tests/e2e                    # headless
    pytest tests/e2e --headed           # watch the browser
"""
import os

import httpx
import pytest


BACKEND_URL = os.environ.get("E2E_BACKEND_URL", "http://localhost:8000")
SPA_URL = os.environ.get("E2E_SPA_URL", "http://localhost:4200")


@pytest.fixture(scope="session", autouse=True)
def require_stack():
    """Fail fast with a clear message if backend isn't reachable."""
    for label, url in [("backend", f"{BACKEND_URL}/docs")]:
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
def spa_url():
    return SPA_URL


@pytest.fixture
def require_spa(spa_url):
    """Fail fast with a clear message if the Angular SPA isn't reachable."""
    try:
        r = httpx.get(spa_url, timeout=5.0)
    except httpx.HTTPError as e:
        pytest.exit(f"E2E precondition failed: spa unreachable at {spa_url} ({e})")
    if r.status_code >= 500:
        pytest.exit(f"E2E precondition failed: spa returned {r.status_code} at {spa_url}")
