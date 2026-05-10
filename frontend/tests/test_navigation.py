"""Sidebar navigation switches between the two pages."""
from unittest.mock import patch

from streamlit.testing.v1 import AppTest


def test_sidebar_radio_options(app_path, fake_json):
    with patch("httpx.get", return_value=fake_json([])):
        at = AppTest.from_file(app_path).run()
    options = at.sidebar.radio[0].options
    assert options == ["💬 Chat", "📋 Query History"]


def test_default_selection_is_chat(app_path):
    at = AppTest.from_file(app_path).run()
    assert at.sidebar.radio[0].value == "💬 Chat"


def test_can_switch_to_history(app_path, fake_json):
    with patch("httpx.get", return_value=fake_json([])):
        at = AppTest.from_file(app_path).run()
        at.sidebar.radio[0].set_value("📋 Query History").run()
    assert any("Query History" in t.value for t in at.title)
