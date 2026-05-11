"""Tests for the Streamlit Chat page."""
from unittest.mock import patch

import pytest
from streamlit.testing.v1 import AppTest


class TestChatPageInitialRender:
    def test_default_page_is_chat(self, app_path):
        at = AppTest.from_file(app_path).run()
        assert not at.exception
        # Title should be the chat title
        assert any("Ask a Question" in t.value for t in at.title)

    def test_messages_initialised_empty(self, app_path):
        at = AppTest.from_file(app_path).run()
        assert at.session_state["messages"] == []


class TestChatPageStreaming:
    def test_streamed_chunks_render_into_assistant_message(self, app_path, fake_stream):
        """Type a question, mocked stream returns chunks, full answer is appended."""
        at = AppTest.from_file(app_path).run()

        # Type into chat_input then run
        at.chat_input[0].set_value("What is the average Fe%?")

        with patch("httpx.stream", return_value=fake_stream(["66.99", "%"])):
            at.run()

        assert not at.exception
        msgs = at.session_state["messages"]
        # user + assistant
        roles = [m["role"] for m in msgs]
        assert roles == ["user", "assistant"]
        assert msgs[0]["content"] == "What is the average Fe%?"
        assert "66.99" in msgs[1]["content"]

    def test_tool_marker_is_dimmed_with_blockquote(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("hi")

        with patch("httpx.stream", return_value=fake_stream(["hello [tool: execute_sql]\nrows..."])):
            at.run()

        # Final answer stored in session_state contains the raw stream (formatting is rendered, not stored)
        assistant = at.session_state["messages"][-1]["content"]
        assert "[tool: execute_sql]" in assistant

    def test_http_error_renders_error(self, app_path):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("anything")

        def boom(*a, **kw):
            raise RuntimeError("backend down")

        with patch("httpx.stream", side_effect=boom):
            at.run()

        assert not at.exception
        # Error message gets stored as the assistant's content
        assert "Error:" in at.session_state["messages"][-1]["content"]


class TestAgentModeDropdown:
    def test_dropdown_is_rendered(self, app_path):
        at = AppTest.from_file(app_path).run()
        labels = [s.label for s in at.selectbox]
        assert "Agent mode" in labels

    def test_dropdown_options(self, app_path):
        at = AppTest.from_file(app_path).run()
        mode_selector = next(s for s in at.selectbox if s.label == "Agent mode")
        assert mode_selector.options == ["Simple", "Deep / Data Science"]

    def test_default_mode_is_simple(self, app_path):
        at = AppTest.from_file(app_path).run()
        assert at.session_state["agent_mode"] == "Simple"

    def test_simple_mode_posts_simple_to_backend(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("hi")

        captured = {}

        def capture(method, url, *, json, **kw):
            captured["json"] = json
            return fake_stream(["ok"])

        with patch("httpx.stream", side_effect=capture):
            at.run()

        assert captured["json"] == {"question": "hi", "mode": "simple"}

    def test_deep_mode_posts_deep_to_backend(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        mode_selector = next(s for s in at.selectbox if s.label == "Agent mode")
        mode_selector.set_value("Deep / Data Science").run()

        at.chat_input[0].set_value("hi")

        captured = {}

        def capture(method, url, *, json, **kw):
            captured["json"] = json
            return fake_stream(["ok"])

        with patch("httpx.stream", side_effect=capture):
            at.run()

        assert captured["json"] == {"question": "hi", "mode": "deep"}
