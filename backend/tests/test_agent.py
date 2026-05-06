"""Tests for the agent loop with a fully mocked LLM client."""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.llm.base import LLMResponse
import app.agent as agent


def _scripted_client(responses):
    """Build a mock LLM client whose chat() returns each response in order."""
    client = MagicMock()
    iterator = iter(responses)
    client.chat.side_effect = lambda **kwargs: next(iterator)
    return client


class TestAgentRun:
    def test_simple_text_only_response(self, in_memory_db):
        """Model answers without using a tool — single iteration."""
        final = LLMResponse(content="The Fe% is 66.99%.", tool_calls=[], stop_reason="end_turn")

        with patch.object(agent, "get_llm_client", return_value=_scripted_client([final])):
            chunks = list(agent.run(question="What is Fe%?", db=in_memory_db))

        assert "".join(chunks) == "The Fe% is 66.99%."

    def test_tool_call_then_final_answer(self, in_memory_db):
        """Model calls execute_sql, then produces a final answer."""
        tool_resp = LLMResponse(
            content="Let me query the database.",
            tool_calls=[{"name": "execute_sql", "input": {"query": "SELECT 1"}, "id": "tu_1"}],
            stop_reason="tool_use",
            raw=MagicMock(content=[]),
        )
        final = LLMResponse(content="Done — answer is 42.", tool_calls=[], stop_reason="end_turn")

        fake_client = _scripted_client([tool_resp, final])

        with patch.object(agent, "get_llm_client", return_value=fake_client), \
             patch.object(agent.sql_tool, "run", return_value=json.dumps({"row_count": 1, "rows": [{"x": 42}]})):
            chunks = list(agent.run(question="Q?", db=in_memory_db))

        joined = "".join(chunks)
        assert "Let me query the database." in joined
        assert "[tool: execute_sql]" in joined
        assert "Done — answer is 42." in joined

        # Two chat() calls total
        assert fake_client.chat.call_count == 2

    def test_unknown_tool_returns_error_to_model(self, in_memory_db):
        bogus_call = LLMResponse(
            content="",
            tool_calls=[{"name": "fly_to_mars", "input": {}, "id": "tu_1"}],
            stop_reason="tool_use",
            raw=MagicMock(content=[]),
        )
        final = LLMResponse(content="Sorry, I can't do that.", tool_calls=[], stop_reason="end_turn")

        with patch.object(agent, "get_llm_client", return_value=_scripted_client([bogus_call, final])):
            list(agent.run(question="x", db=in_memory_db))

        # If we got here, the agent didn't crash. The unknown-tool branch sends back a JSON error.

    def test_query_log_is_written(self, in_memory_db):
        from app.models import QueryLog

        final = LLMResponse(content="answer", tool_calls=[], stop_reason="end_turn")
        with patch.object(agent, "get_llm_client", return_value=_scripted_client([final])):
            list(agent.run(question="hello", db=in_memory_db))

        rows = in_memory_db.query(QueryLog).all()
        assert len(rows) == 1
        assert rows[0].question == "hello"
        assert rows[0].answer == "answer"

    def test_max_iterations_safety(self, in_memory_db):
        """If the model never stops calling tools, the loop bails out cleanly."""
        infinite_tool_call = LLMResponse(
            content="",
            tool_calls=[{"name": "execute_sql", "input": {"query": "SELECT 1"}, "id": "tu_x"}],
            stop_reason="tool_use",
            raw=MagicMock(content=[]),
        )
        # Same response forever — agent should stop after MAX_ITERATIONS
        client = MagicMock()
        client.chat.return_value = infinite_tool_call

        with patch.object(agent, "get_llm_client", return_value=client), \
             patch.object(agent.sql_tool, "run", return_value="{}"):
            chunks = list(agent.run(question="loop forever", db=in_memory_db))

        assert client.chat.call_count == agent.MAX_ITERATIONS
        assert "maximum tool iterations" in "".join(chunks).lower()


class TestSystemPrompt:
    def test_includes_schema_docs(self):
        prompt = agent._build_system_prompt()
        assert "iron concentrate factory" in prompt.lower()
        # The prompt should include something from the schema docs (loaded from .md files)
        assert len(prompt) > 200


class TestToolRegistry:
    def test_execute_sql_is_registered(self):
        assert any(t["name"] == "execute_sql" for t in agent.TOOLS)
        assert "execute_sql" in agent.TOOL_RUNNERS
