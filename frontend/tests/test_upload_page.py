"""Tests for the Streamlit Upload Data page."""
from unittest.mock import patch, MagicMock

import httpx
import pytest
from streamlit.testing.v1 import AppTest


def _switch_to_upload(at):
    """Click the sidebar radio to navigate to the Upload page."""
    at.sidebar.radio[0].set_value("📂 Upload Data")
    at.run()
    return at


class TestUploadPageRender:
    def test_renders_source_selectbox_with_factory_default(self, app_path):
        at = AppTest.from_file(app_path).run()
        _switch_to_upload(at)
        assert any("Upload Excel Data" in t.value for t in at.title)

        # selectbox lists all sources, factory first
        sb = at.selectbox[0]
        assert sb.options == ["factory", "kitchen", "store", "weighing", "sales"]
        assert sb.value == "factory"

    def test_enrich_button_present(self, app_path):
        at = AppTest.from_file(app_path).run()
        _switch_to_upload(at)
        labels = [b.label for b in at.button]
        assert "Run enrichment now" in labels


class TestEnrichmentButton:
    def test_success_renders_count(self, app_path, fake_json):
        at = AppTest.from_file(app_path).run()
        _switch_to_upload(at)

        run_btn = next(b for b in at.button if b.label == "Run enrichment now")
        run_btn.click()

        with patch("httpx.post", return_value=fake_json({"rows_enriched": 12})):
            at.run()

        assert any("Enriched 12 rows" in s.value for s in at.success)

    def test_backend_error_renders_error(self, app_path):
        at = AppTest.from_file(app_path).run()
        _switch_to_upload(at)

        run_btn = next(b for b in at.button if b.label == "Run enrichment now")
        run_btn.click()

        with patch("httpx.post", side_effect=RuntimeError("connection refused")):
            at.run()

        assert any("connection refused" in e.value for e in at.error)
