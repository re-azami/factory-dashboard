"""Tests for the save_memory tool used by the deep agent."""
import json
from contextlib import contextmanager

import pytest

from app.tools import save_memory
from app.models import AgentMemory


@pytest.fixture
def stub_session(monkeypatch, in_memory_db):
    """Make save_memory.SessionLocal() return the in-memory test session.

    The real save_memory module creates its own SessionLocal because it runs
    outside the FastAPI request lifecycle. Tests need it to share the same
    SQLite session so we can assert on the rows.
    """
    class _Factory:
        def __call__(self):
            # Wrap the session so close() is a no-op — pytest owns the lifecycle.
            session = in_memory_db
            class _Wrap:
                def add(self, obj): session.add(obj)
                def commit(self): session.commit()
                def refresh(self, obj): session.refresh(obj)
                def rollback(self): session.rollback()
                def close(self): pass
            return _Wrap()

    monkeypatch.setattr(save_memory, "SessionLocal", _Factory())
    return in_memory_db


class TestKindValidation:
    def test_accepts_insight(self, stub_session):
        out = json.loads(save_memory.run("insight", "Line 2 recovery is lower in winter."))
        assert "saved_id" in out
        assert out["kind"] == "insight"

    def test_accepts_preference(self, stub_session):
        out = json.loads(save_memory.run("preference", "User prefers Persian answers."))
        assert "saved_id" in out

    def test_accepts_recipe(self, stub_session):
        out = json.loads(save_memory.run("recipe", "Join shifts→LSR for per-day totals."))
        assert "saved_id" in out

    def test_accepts_glossary(self, stub_session):
        out = json.loads(save_memory.run("glossary", "بار = input feed batch."))
        assert "saved_id" in out

    def test_rejects_unknown_kind(self, stub_session):
        out = json.loads(save_memory.run("musing", "Whatever."))
        assert "error" in out
        assert "kind" in out["error"]

    def test_rejects_empty_content(self, stub_session):
        out = json.loads(save_memory.run("insight", "   "))
        assert "error" in out


class TestPersistence:
    def test_row_is_written(self, stub_session):
        save_memory.run("insight", "Persian text روی ", source_question="چرا کاهش بازیابی؟")

        rows = stub_session.query(AgentMemory).all()
        assert len(rows) == 1
        assert rows[0].content == "Persian text روی"   # stripped
        assert rows[0].kind == "insight"
        assert rows[0].source_question == "چرا کاهش بازیابی؟"

    def test_returns_id_of_saved_row(self, stub_session):
        out1 = json.loads(save_memory.run("insight", "first"))
        out2 = json.loads(save_memory.run("recipe", "second"))
        assert out1["saved_id"] != out2["saved_id"]


class TestToolDefinition:
    def test_langchain_tool_shape(self):
        t = save_memory.save_memory
        assert t.name == "save_memory"
        schema = t.args_schema.model_json_schema()
        assert "kind" in schema["properties"]
        assert "content" in schema["properties"]
