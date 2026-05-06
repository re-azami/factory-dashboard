"""Sidebar navigation switches between the three pages."""
from unittest.mock import patch

from streamlit.testing.v1 import AppTest


def test_sidebar_radio_options(app_path, fake_json):
    with patch("httpx.get", return_value=fake_json([])):
        at = AppTest.from_file(app_path).run()
    options = at.sidebar.radio[0].options
    assert options == ["💬 Chat", "📂 Upload Data", "📋 Query History"]


def test_default_selection_is_chat(app_path):
    at = AppTest.from_file(app_path).run()
    assert at.sidebar.radio[0].value == "💬 Chat"


def test_can_switch_to_upload(app_path):
    at = AppTest.from_file(app_path).run()
    at.sidebar.radio[0].set_value("📂 Upload Data").run()
    assert any("Upload Excel Data" in t.value for t in at.title)


def test_can_switch_to_history(app_path, fake_json):
    with patch("httpx.get", return_value=fake_json([])):
        at = AppTest.from_file(app_path).run()
        at.sidebar.radio[0].set_value("📋 Query History").run()
    assert any("Query History" in t.value for t in at.title)
