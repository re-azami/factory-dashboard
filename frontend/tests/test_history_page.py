"""Tests for the Streamlit Query History page."""
from unittest.mock import patch

import pytest
from streamlit.testing.v1 import AppTest


def _switch_to_history(at):
    at.sidebar.radio[0].set_value("📋 Query History")
    at.run()
    return at


class TestHistoryPage:
    def test_renders_title_and_slider(self, app_path, fake_json):
        with patch("httpx.get", return_value=fake_json([])):
            at = AppTest.from_file(app_path).run()
            _switch_to_history(at)

        assert any("Query History" in t.value for t in at.title)
        # Slider for last N queries
        assert any(s.label == "Show last N queries" for s in at.slider)

    def test_renders_entries_in_expanders(self, app_path, fake_json):
        sample = [
            {
                "id": 2,
                "asked_at": "2026-05-04T12:00:00",
                "question": "How many downtime events?",
                "answer": "There are 214.",
                "llm_provider": "anthropic",
                "tool_calls": [{"tool": "execute_sql", "input": {"query": "SELECT 1"}, "output": "{}"}],
            },
            {
                "id": 1,
                "asked_at": "2026-05-03T08:00:00",
                "question": "Average Fe%?",
                "answer": "66.99%",
                "llm_provider": "openai",
                "tool_calls": None,
            },
        ]

        with patch("httpx.get", return_value=fake_json(sample)):
            at = AppTest.from_file(app_path).run()
            _switch_to_history(at)

        # Some markdown call should mention the provider
        rendered = " ".join(m.value for m in at.markdown)
        assert "anthropic" in rendered
        assert "openai" in rendered

    def test_backend_failure_renders_error(self, app_path):
        with patch("httpx.get", side_effect=RuntimeError("backend gone")):
            at = AppTest.from_file(app_path).run()
            _switch_to_history(at)

        assert any("Could not load history" in e.value for e in at.error)
