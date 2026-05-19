"""
Lock-in tests for the UI-001d Streamlit retirement.

This file verifies the retirement is complete and irreversible: port 8501 is no
longer served by anything, the legacy ``frontend/`` directory has been removed
from the repository, and the Angular SPA is the surviving frontend serving the
Persian dashboard (``داشبورد کارخانه``) at its root URL.
"""
import re
from pathlib import Path

import httpx
from playwright.sync_api import expect


def test_streamlit_port_not_served():
    # Documented exception to the "no try/except around assertions" rule:
    # the test's PASS condition is "connection refused / timeout". The
    # try/except IS the assertion mechanism here — it is not hiding a
    # failing assertion, it is verifying that the network call fails.
    try:
        response = httpx.get("http://localhost:8501/", timeout=2.0)
    except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout):
        return  # PASS: nothing is listening on 8501 — Streamlit is retired.
    raise AssertionError(
        f"Streamlit appears to have been resurrected on :8501 "
        f"(status {response.status_code}). The frontend/ directory was "
        f"removed in UI-001d; if Streamlit is back, the retirement regressed."
    )


def test_frontend_directory_absent():
    repo_root = Path(__file__).resolve().parents[2]
    assert (repo_root / "frontend").exists() is False, (
        "Legacy frontend/ directory is back. UI-001d removed it; if it has "
        "returned, the Streamlit retirement has regressed."
    )


def test_spa_root_serves_persian_title(page, spa_url, require_spa):
    page.goto(spa_url)
    expect(page).to_have_title(re.compile("داشبورد کارخانه"))
