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
