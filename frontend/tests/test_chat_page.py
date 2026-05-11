"""Tests for the Streamlit Chat page."""
import json
from unittest.mock import patch

import pytest
from streamlit.testing.v1 import AppTest


def _events(*evts) -> list[str]:
    """Encode events as NDJSON lines for the fake stream."""
    return [json.dumps(e) + "\n" for e in evts]


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
    def test_text_events_render_into_assistant_message(self, app_path, fake_stream):
        """Type a question, stream text events, the joined text is stored."""
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("What is the average Fe%?")

        stream = fake_stream(_events(
            {"type": "text", "content": "66.99"},
            {"type": "text", "content": "%"},
        ))
        with patch("httpx.stream", return_value=stream):
            at.run()

        assert not at.exception
        msgs = at.session_state["messages"]
        assert [m["role"] for m in msgs] == ["user", "assistant"]
        assert msgs[0]["content"] == "What is the average Fe%?"

        # Assistant message is structured: one text block holding "66.99%"
        blocks = msgs[1]["blocks"]
        text_blocks = [b for b in blocks if b["type"] == "text"]
        assert any("66.99" in b["content"] for b in text_blocks)

    def test_tool_call_becomes_structured_block(self, app_path, fake_stream):
        """A tool_start + tool_end pair produces a single 'tool' block with args + output."""
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("how many rows?")

        stream = fake_stream(_events(
            {"type": "tool_start", "id": "tu_1", "name": "execute_sql",
             "args": {"query": "SELECT COUNT(*) FROM downtime"}},
            {"type": "tool_end", "id": "tu_1", "name": "execute_sql",
             "output": json.dumps({"row_count": 1, "rows": [{"count": 214}]})},
            {"type": "text", "content": "There are 214 events."},
        ))
        with patch("httpx.stream", return_value=stream):
            at.run()

        blocks = at.session_state["messages"][-1]["blocks"]
        tool_blocks = [b for b in blocks if b["type"] == "tool"]
        assert len(tool_blocks) == 1
        assert tool_blocks[0]["name"] == "execute_sql"
        assert tool_blocks[0]["args"] == {"query": "SELECT COUNT(*) FROM downtime"}
        assert "214" in tool_blocks[0]["output"]

    def test_text_before_and_after_tool_call_are_separate_blocks(self, app_path, fake_stream):
        """Text→tool→text must produce three blocks in order, not one merged."""
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("q")

        stream = fake_stream(_events(
            {"type": "text", "content": "Let me check."},
            {"type": "tool_start", "id": "tu_2", "name": "execute_sql", "args": {"query": "SELECT 1"}},
            {"type": "tool_end", "id": "tu_2", "name": "execute_sql", "output": "{}"},
            {"type": "text", "content": "Done."},
        ))
        with patch("httpx.stream", return_value=stream):
            at.run()

        kinds = [b["type"] for b in at.session_state["messages"][-1]["blocks"]]
        assert kinds == ["text", "tool", "text"]

    def test_error_event_renders_and_persists(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("loop forever")

        stream = fake_stream(_events(
            {"type": "error", "message": "Reached maximum tool iterations."},
        ))
        with patch("httpx.stream", return_value=stream):
            at.run()

        assert not at.exception
        blocks = at.session_state["messages"][-1]["blocks"]
        error_blocks = [b for b in blocks if b["type"] == "error"]
        assert error_blocks
        assert "maximum tool iterations" in error_blocks[0]["message"].lower()

    def test_http_error_renders_error(self, app_path):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("anything")

        def boom(*a, **kw):
            raise RuntimeError("backend down")

        with patch("httpx.stream", side_effect=boom):
            at.run()

        assert not at.exception
        blocks = at.session_state["messages"][-1]["blocks"]
        assert any(b["type"] == "error" and "backend down" in b["message"] for b in blocks)


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
            return fake_stream(_events({"type": "text", "content": "ok"}))

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
            return fake_stream(_events({"type": "text", "content": "ok"}))

        with patch("httpx.stream", side_effect=capture):
            at.run()

        assert captured["json"] == {"question": "hi", "mode": "deep"}


class TestClearChat:
    def test_clear_chat_button_is_rendered(self, app_path):
        at = AppTest.from_file(app_path).run()
        assert any("Clear chat" in b.label for b in at.button)

    def test_clear_chat_resets_messages(self, app_path):
        at = AppTest.from_file(app_path).run()
        at.session_state["messages"] = [
            {"role": "user", "content": "old question"},
            {"role": "assistant", "blocks": [{"type": "text", "content": "old answer"}]},
        ]
        clear_btn = next(b for b in at.button if "Clear chat" in b.label)
        clear_btn.click().run()
        assert not at.exception
        assert at.session_state["messages"] == []


class TestModeTimeouts:
    def test_simple_mode_uses_short_timeout(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        at.chat_input[0].set_value("hi")

        captured = {}

        def capture(method, url, *, json, timeout, **kw):
            captured["timeout"] = timeout
            return fake_stream(_events({"type": "text", "content": "ok"}))

        with patch("httpx.stream", side_effect=capture):
            at.run()

        assert captured["timeout"] == 300

    def test_deep_mode_uses_long_timeout(self, app_path, fake_stream):
        at = AppTest.from_file(app_path).run()
        mode_selector = next(s for s in at.selectbox if s.label == "Agent mode")
        mode_selector.set_value("Deep / Data Science").run()
        at.chat_input[0].set_value("hi")

        captured = {}

        def capture(method, url, *, json, timeout, **kw):
            captured["timeout"] = timeout
            return fake_stream(_events({"type": "text", "content": "ok"}))

        with patch("httpx.stream", side_effect=capture):
            at.run()

        assert captured["timeout"] == 3600
