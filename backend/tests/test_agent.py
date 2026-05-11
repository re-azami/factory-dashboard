"""Tests for the LangGraph-based agent loop with a fully mocked chat model."""
import json
from typing import Any, List, Optional
from unittest.mock import patch

import pytest
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import PrivateAttr

import app.agent as agent


class FakeToolModel(BaseChatModel):
    """A scripted chat model that supports `.bind_tools()` and `.invoke()`.

    Returns each AIMessage from `responses` on successive calls; once the
    list is exhausted, repeats the last entry forever (so loops that should
    hit the recursion limit do so).
    """

    responses: List[AIMessage]
    _idx: int = PrivateAttr(default=0)

    @property
    def _llm_type(self) -> str:
        return "fake-tool-model"

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        i = min(self._idx, len(self.responses) - 1)
        self._idx += 1
        template = self.responses[i]
        # Real chat models return a fresh AIMessage each call; mimic that so
        # the agent's message-dedup logic doesn't skip repeated scripted
        # responses (matters for the max-iterations test).
        fresh = AIMessage(
            content=template.content,
            tool_calls=[
                {**tc, "id": f"{tc.get('id', 'tc')}__{self._idx}"}
                for tc in (template.tool_calls or [])
            ],
        )
        return ChatResult(generations=[ChatGeneration(message=fresh)])

    def bind_tools(self, tools, **kwargs):
        return self


def _fake_model(responses):
    return FakeToolModel(responses=responses)


def _tool_call(name: str, args: dict, call_id: str = "tu_1") -> AIMessage:
    return AIMessage(
        content="",
        tool_calls=[{"name": name, "args": args, "id": call_id, "type": "tool_call"}],
    )


class TestAgentRun:
    def test_simple_text_only_response(self, in_memory_db):
        """Model answers without using a tool — single iteration."""
        final = AIMessage(content="The Fe% is 66.99%.")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])):
            chunks = list(agent.run(question="What is Fe%?", db=in_memory_db))

        assert "The Fe% is 66.99%." in "".join(chunks)

    def test_tool_call_then_final_answer(self, in_memory_db):
        """Model calls execute_sql, then produces a final answer."""
        tool_resp = _tool_call("execute_sql", {"query": "SELECT 1"}, call_id="tu_a")
        final = AIMessage(content="Done — answer is 42.")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([tool_resp, final])), \
             patch.object(agent.sql_tool, "run", return_value=json.dumps({"row_count": 1, "rows": [{"x": 42}]})):
            chunks = list(agent.run(question="Q?", db=in_memory_db))

        joined = "".join(chunks)
        assert "[tool: execute_sql]" in joined
        assert "Done — answer is 42." in joined

    def test_query_log_is_written(self, in_memory_db):
        from app.models import QueryLog

        final = AIMessage(content="answer")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])):
            list(agent.run(question="hello", db=in_memory_db))

        rows = in_memory_db.query(QueryLog).all()
        assert len(rows) == 1
        assert rows[0].question == "hello"
        assert rows[0].answer == "answer"

    def test_query_log_records_tool_calls(self, in_memory_db):
        from app.models import QueryLog

        tool_resp = _tool_call("execute_sql", {"query": "SELECT 1"}, call_id="tu_b")
        final = AIMessage(content="ok")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([tool_resp, final])), \
             patch.object(agent.sql_tool, "run", return_value='{"row_count":1}'):
            list(agent.run(question="hi", db=in_memory_db))

        rows = in_memory_db.query(QueryLog).all()
        assert len(rows) == 1
        assert rows[0].tool_calls
        assert rows[0].tool_calls[0]["tool"] == "execute_sql"
        assert rows[0].tool_calls[0]["input"] == {"query": "SELECT 1"}
        assert rows[0].tool_calls[0]["output"] == '{"row_count":1}'

    def test_max_iterations_safety(self, in_memory_db):
        """If the model never stops calling tools, the loop bails out cleanly."""
        infinite = _tool_call("execute_sql", {"query": "SELECT 1"}, call_id="tu_loop")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([infinite])), \
             patch.object(agent.sql_tool, "run", return_value="{}"):
            chunks = list(agent.run(question="loop forever", db=in_memory_db))

        assert "maximum tool iterations" in "".join(chunks).lower()


class TestSystemPrompt:
    def test_includes_schema_docs(self):
        prompt = agent._build_system_prompt()
        assert "iron concentrate factory" in prompt.lower()
        assert len(prompt) > 200


class TestToolRegistry:
    def test_execute_sql_is_registered(self):
        names = [t.name for t in agent.TOOLS]
        assert "execute_sql" in names

    def test_semantic_search_is_registered(self):
        names = [t.name for t in agent.TOOLS]
        assert "semantic_search" in names
