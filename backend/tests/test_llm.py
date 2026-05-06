"""Tests for the LLM abstraction layer (provider switching, response wrapping, format conversion)."""
import importlib
import json
from unittest.mock import MagicMock, patch

import pytest

from app.llm.base import LLMResponse


# ── LLMResponse ───────────────────────────────────────────────────────────────

class TestLLMResponse:
    def test_no_tool_calls_means_does_not_want_tool(self):
        r = LLMResponse(content="hi", tool_calls=None, stop_reason="end_turn")
        assert r.wants_tool is False
        assert r.tool_calls == []

    def test_empty_list_does_not_want_tool(self):
        r = LLMResponse(content="hi", tool_calls=[], stop_reason="end_turn")
        assert r.wants_tool is False

    def test_with_tool_call_wants_tool(self):
        r = LLMResponse(
            content="",
            tool_calls=[{"name": "execute_sql", "input": {"query": "SELECT 1"}}],
            stop_reason="tool_use",
        )
        assert r.wants_tool is True

    def test_raw_is_attached(self):
        raw = {"id": "msg_123"}
        r = LLMResponse(content="x", tool_calls=[], stop_reason="end_turn", raw=raw)
        assert r.raw is raw


# ── get_llm_client ────────────────────────────────────────────────────────────

class TestGetLLMClient:
    def test_anthropic_returns_claude_client(self, monkeypatch):
        from app import llm
        from app.llm import claude

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        # Don't actually call the network — patch the SDK constructor
        with patch.object(claude.anthropic, "Anthropic", return_value=MagicMock()):
            client = llm.get_llm_client()
            assert isinstance(client, claude.ClaudeClient)

    def test_openai_returns_compat_client(self, monkeypatch):
        from app import llm
        from app.llm import openai_compat

        monkeypatch.setattr(llm.settings, "llm_provider", "openai")
        with patch.object(openai_compat, "OpenAI", return_value=MagicMock()):
            client = llm.get_llm_client()
            assert isinstance(client, openai_compat.OpenAICompatClient)

    def test_ollama_returns_compat_client(self, monkeypatch):
        from app import llm
        from app.llm import openai_compat

        monkeypatch.setattr(llm.settings, "llm_provider", "ollama")
        with patch.object(openai_compat, "OpenAI", return_value=MagicMock()) as ctor:
            client = llm.get_llm_client()
            assert isinstance(client, openai_compat.OpenAICompatClient)
            # When ollama is selected, base_url and api_key come from ollama settings
            kwargs = ctor.call_args.kwargs
            assert "base_url" in kwargs

    def test_unknown_provider_raises(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "magicmock")
        with pytest.raises(ValueError, match="Unknown LLM_PROVIDER"):
            llm.get_llm_client()


# ── Claude client format ──────────────────────────────────────────────────────

class TestClaudeClient:
    def _build_response(self, blocks, stop_reason="end_turn"):
        resp = MagicMock()
        resp.content = blocks
        resp.stop_reason = stop_reason
        return resp

    def test_extracts_plain_text(self):
        from app.llm.claude import ClaudeClient

        text_block = MagicMock()
        text_block.text = "The Fe% is 66.99%"
        text_block.type = "text"

        with patch("anthropic.Anthropic") as ctor:
            ctor.return_value.messages.create.return_value = self._build_response([text_block])
            client = ClaudeClient()
            r = client.chat(system="s", messages=[{"role": "user", "content": "q"}], tools=[])

        assert "66.99" in r.content
        assert r.tool_calls == []
        assert r.stop_reason == "end_turn"

    def test_extracts_tool_use(self):
        from app.llm.claude import ClaudeClient

        tool_block = MagicMock(spec=["type", "name", "input", "id"])
        tool_block.type = "tool_use"
        tool_block.name = "execute_sql"
        tool_block.input = {"query": "SELECT 1"}
        tool_block.id = "tu_abc"

        with patch("anthropic.Anthropic") as ctor:
            ctor.return_value.messages.create.return_value = self._build_response(
                [tool_block], stop_reason="tool_use"
            )
            client = ClaudeClient()
            r = client.chat(system="s", messages=[], tools=[])

        assert r.wants_tool
        assert r.tool_calls[0]["name"] == "execute_sql"
        assert r.tool_calls[0]["id"] == "tu_abc"
        assert r.tool_calls[0]["input"] == {"query": "SELECT 1"}

    def test_build_tool_result_message_uses_anthropic_format(self):
        from app.llm.claude import ClaudeClient

        with patch("anthropic.Anthropic"):
            client = ClaudeClient()

        msg = client.build_tool_result_message(
            tool_call={"id": "tu_1", "name": "execute_sql", "input": {}},
            result='{"row_count": 0}',
        )

        assert msg["role"] == "user"
        assert msg["content"][0]["type"] == "tool_result"
        assert msg["content"][0]["tool_use_id"] == "tu_1"
        assert msg["content"][0]["content"] == '{"row_count": 0}'


# ── OpenAI-compat client format ───────────────────────────────────────────────

class TestOpenAICompatClient:
    def _make_response(self, content=None, tool_calls=None):
        message = MagicMock()
        message.content = content
        message.tool_calls = tool_calls

        choice = MagicMock()
        choice.message = message

        resp = MagicMock()
        resp.choices = [choice]
        return resp

    def test_extracts_plain_text(self):
        from app.llm import openai_compat
        from app.llm.openai_compat import OpenAICompatClient

        with patch.object(openai_compat, "OpenAI") as ctor:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = self._make_response(content="42")
            ctor.return_value = mock_client

            c = OpenAICompatClient()
            r = c.chat(system="s", messages=[], tools=[])

        assert r.content == "42"
        assert r.tool_calls == []
        assert r.stop_reason == "end_turn"

    def test_extracts_tool_call(self):
        from app.llm import openai_compat
        from app.llm.openai_compat import OpenAICompatClient

        tc = MagicMock()
        tc.id = "call_1"
        tc.function.name = "execute_sql"
        tc.function.arguments = json.dumps({"query": "SELECT 1"})

        with patch.object(openai_compat, "OpenAI") as ctor:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = self._make_response(tool_calls=[tc])
            ctor.return_value = mock_client

            c = OpenAICompatClient()
            r = c.chat(system="s", messages=[], tools=[])

        assert r.wants_tool
        assert r.tool_calls[0]["name"] == "execute_sql"
        assert r.tool_calls[0]["input"] == {"query": "SELECT 1"}
        assert r.tool_calls[0]["id"] == "call_1"
        assert r.stop_reason == "tool_use"

    def test_build_tool_result_message_uses_openai_format(self):
        from app.llm import openai_compat
        from app.llm.openai_compat import OpenAICompatClient

        with patch.object(openai_compat, "OpenAI"):
            c = OpenAICompatClient()
        msg = c.build_tool_result_message(
            tool_call={"id": "call_xyz", "name": "execute_sql", "input": {}},
            result='{"ok":true}',
        )
        assert msg == {"role": "tool", "tool_call_id": "call_xyz", "content": '{"ok":true}'}

    def test_anthropic_tool_definition_converts_to_openai_function(self):
        from app.llm.openai_compat import _to_openai_tool

        anth = {
            "name": "execute_sql",
            "description": "Run a query.",
            "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}},
        }
        out = _to_openai_tool(anth)
        assert out == {
            "type": "function",
            "function": {
                "name": "execute_sql",
                "description": "Run a query.",
                "parameters": {"type": "object", "properties": {"query": {"type": "string"}}},
            },
        }
