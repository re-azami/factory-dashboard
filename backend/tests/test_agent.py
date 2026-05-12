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
            events = list(agent.run(question="What is Fe%?", db=in_memory_db))

        text_events = [e for e in events if e["type"] == "text"]
        assert any("The Fe% is 66.99%." in e["content"] for e in text_events)
        # No tool events should appear when the model never called a tool.
        assert not any(e["type"] in ("tool_start", "tool_end") for e in events)

    def test_tool_call_then_final_answer(self, in_memory_db):
        """Model calls execute_sql, then produces a final answer."""
        tool_resp = _tool_call("execute_sql", {"query": "SELECT 1"}, call_id="tu_a")
        final = AIMessage(content="Done — answer is 42.")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([tool_resp, final])), \
             patch.object(agent.sql_tool, "run", return_value=json.dumps({"row_count": 1, "rows": [{"x": 42}]})):
            events = list(agent.run(question="Q?", db=in_memory_db))

        # Stream should have a tool_start, a matching tool_end with output, and a final text.
        starts = [e for e in events if e["type"] == "tool_start"]
        ends = [e for e in events if e["type"] == "tool_end"]
        texts = [e for e in events if e["type"] == "text"]

        assert len(starts) == 1
        assert starts[0]["name"] == "execute_sql"
        assert starts[0]["args"] == {"query": "SELECT 1"}

        assert len(ends) == 1
        assert ends[0]["name"] == "execute_sql"
        assert "42" in ends[0]["output"]

        assert any("Done — answer is 42." in e["content"] for e in texts)

    def test_tool_end_matches_tool_start_by_id(self, in_memory_db):
        """The tool_end event must carry the same id as its tool_start so the
        frontend can wire them together when calls overlap."""
        tool_resp = _tool_call("execute_sql", {"query": "SELECT 1"}, call_id="tu_match")
        final = AIMessage(content="done")

        with patch.object(agent, "get_chat_model", return_value=_fake_model([tool_resp, final])), \
             patch.object(agent.sql_tool, "run", return_value="{}"):
            events = list(agent.run(question="Q?", db=in_memory_db))

        start = next(e for e in events if e["type"] == "tool_start")
        end = next(e for e in events if e["type"] == "tool_end")
        assert start["id"] == end["id"]

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
            events = list(agent.run(question="loop forever", db=in_memory_db))

        errors = [e for e in events if e["type"] == "error"]
        assert errors, "expected an error event when max iterations is hit"
        assert "maximum tool iterations" in errors[-1]["message"].lower()


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


class TestAgentModes:
    def test_simple_mode_uses_basic_tools_only(self):
        names = [t.name for t in agent.MODES["simple"]["tools"]]
        assert "execute_sql" in names
        assert "semantic_search" in names
        assert "python_exec" not in names
        assert "save_memory" not in names

    def test_deep_mode_includes_research_tools(self):
        names = [t.name for t in agent.MODES["deep"]["tools"]]
        assert {"execute_sql", "semantic_search", "python_exec", "save_memory"} <= set(names)

    def test_deep_mode_has_128_iterations(self):
        assert agent.MODES["deep"]["max_iterations"] == 128

    def test_simple_mode_has_8_iterations(self):
        assert agent.MODES["simple"]["max_iterations"] == 8

    def test_unknown_mode_falls_back_to_simple(self, in_memory_db):
        """A bogus mode string must not crash the loop — it falls back to simple."""
        final = AIMessage(content="hi")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])):
            list(agent.run(question="q", db=in_memory_db, mode="not-a-mode"))

        from app.models import QueryLog
        rows = in_memory_db.query(QueryLog).all()
        assert rows[0].agent_mode == "simple"

    def test_deep_mode_is_persisted_to_query_log(self, in_memory_db):
        final = AIMessage(content="deep answer")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])):
            list(agent.run(question="q", db=in_memory_db, mode="deep"))

        from app.models import QueryLog
        rows = in_memory_db.query(QueryLog).all()
        assert rows[0].agent_mode == "deep"

    def test_run_passes_simple_mode_to_get_chat_model(self, in_memory_db):
        final = AIMessage(content="ok")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])) as factory:
            list(agent.run(question="q", db=in_memory_db, mode="simple"))
        assert factory.call_args.kwargs.get("mode") == "simple"

    def test_run_passes_deep_mode_to_get_chat_model(self, in_memory_db):
        final = AIMessage(content="ok")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])) as factory:
            list(agent.run(question="q", db=in_memory_db, mode="deep"))
        assert factory.call_args.kwargs.get("mode") == "deep"

    def test_run_with_unknown_mode_passes_simple_to_factory(self, in_memory_db):
        final = AIMessage(content="ok")
        with patch.object(agent, "get_chat_model", return_value=_fake_model([final])) as factory:
            list(agent.run(question="q", db=in_memory_db, mode="not-a-mode"))
        assert factory.call_args.kwargs.get("mode") == "simple"


class TestDeepModePrompt:
    def test_deep_prompt_adds_research_instructions(self):
        prompt = agent._build_system_prompt(mode="deep")
        assert "DEEP RESEARCH mode" in prompt
        assert "128 turns" in prompt

    def test_simple_prompt_omits_research_instructions(self):
        prompt = agent._build_system_prompt(mode="simple")
        assert "DEEP RESEARCH" not in prompt

    def test_deep_prompt_loads_existing_memories(self, in_memory_db):
        from app.models import AgentMemory
        in_memory_db.add(AgentMemory(kind="insight", content="Line 2 dips in winter."))
        in_memory_db.add(AgentMemory(kind="preference", content="Prefer Persian answers."))
        in_memory_db.commit()

        prompt = agent._build_system_prompt(mode="deep", db=in_memory_db)
        assert "Line 2 dips in winter." in prompt
        assert "Prefer Persian answers." in prompt
        assert "Prior lessons" in prompt

    def test_deep_prompt_handles_empty_memory_table(self, in_memory_db):
        """No memories yet — prompt should still build, just without the memory section."""
        prompt = agent._build_system_prompt(mode="deep", db=in_memory_db)
        assert "DEEP RESEARCH" in prompt
        assert "Prior lessons" not in prompt
