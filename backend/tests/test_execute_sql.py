"""Tests for the read-only SQL tool used by the agent."""
import json
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest

from app.tools import execute_sql


class TestQueryGuardrails:
    def test_rejects_insert(self):
        out = json.loads(execute_sql.run("INSERT INTO line_shift_reports (line_number) VALUES (1)"))
        assert out["error"] == "Only SELECT queries are allowed."

    def test_rejects_update(self):
        out = json.loads(execute_sql.run("UPDATE factory_downtimes SET duration = 0"))
        assert "Only SELECT" in out["error"]

    def test_rejects_delete(self):
        out = json.loads(execute_sql.run("DELETE FROM factory_downtimes"))
        assert "Only SELECT" in out["error"]

    def test_rejects_drop(self):
        out = json.loads(execute_sql.run("DROP TABLE factory_downtimes"))
        assert "Only SELECT" in out["error"]

    def test_rejects_truncate(self):
        out = json.loads(execute_sql.run("TRUNCATE factory_downtimes"))
        assert "Only SELECT" in out["error"]

    def test_accepts_select_lowercase(self, monkeypatch):
        # `select` (lowercase) should still be allowed because we uppercase the prefix
        self._stub_engine(monkeypatch, columns=["x"], rows=[(1,)])
        out = json.loads(execute_sql.run("select 1 as x"))
        assert "error" not in out

    def test_leading_whitespace_is_tolerated(self, monkeypatch):
        self._stub_engine(monkeypatch, columns=["x"], rows=[(1,)])
        out = json.loads(execute_sql.run("   \n SELECT 1 as x"))
        assert out["row_count"] == 1

    def _stub_engine(self, monkeypatch, columns, rows):
        """Wire engine_ro.connect() to return a mock connection that yields the given rows."""
        result = MagicMock()
        result.keys.return_value = columns
        result.fetchall.return_value = rows

        conn = MagicMock()
        conn.execute.return_value = result

        @contextmanager
        def fake_connect():
            yield conn

        monkeypatch.setattr(execute_sql.engine_ro, "connect", fake_connect)


class TestQueryExecution:
    def _stub_engine(self, monkeypatch, columns, rows):
        result = MagicMock()
        result.keys.return_value = columns
        result.fetchall.return_value = rows

        conn = MagicMock()
        conn.execute.return_value = result

        @contextmanager
        def fake_connect():
            yield conn

        monkeypatch.setattr(execute_sql.engine_ro, "connect", fake_connect)

    def test_simple_select_returns_columns_and_rows(self, monkeypatch):
        self._stub_engine(
            monkeypatch,
            columns=["id", "name"],
            rows=[(1, "alpha"), (2, "beta")],
        )
        out = json.loads(execute_sql.run("SELECT id, name FROM things"))

        assert out["columns"] == ["id", "name"]
        assert out["row_count"] == 2
        assert out["rows"] == [
            {"id": 1, "name": "alpha"},
            {"id": 2, "name": "beta"},
        ]
        assert "warning" not in out

    def test_truncates_to_500_rows(self, monkeypatch):
        many_rows = [(i,) for i in range(750)]
        self._stub_engine(monkeypatch, columns=["n"], rows=many_rows)

        out = json.loads(execute_sql.run("SELECT n FROM big"))
        assert out["row_count"] == 500
        assert out["warning"] == "Result was truncated to 500 rows."

    def test_db_error_is_caught(self, monkeypatch):
        @contextmanager
        def boom():
            raise RuntimeError("connection refused")
            yield  # pragma: no cover

        monkeypatch.setattr(execute_sql.engine_ro, "connect", boom)
        out = json.loads(execute_sql.run("SELECT 1"))
        assert "error" in out
        assert "connection refused" in out["error"]

    def test_persian_text_is_preserved(self, monkeypatch):
        self._stub_engine(
            monkeypatch,
            columns=["description"],
            rows=[("خرابی برق پمپ",)],
        )
        out_str = execute_sql.run("SELECT description FROM factory_downtimes")
        # ensure_ascii=False — Persian must round-trip
        assert "خرابی برق پمپ" in out_str
        out = json.loads(out_str)
        assert out["rows"][0]["description"] == "خرابی برق پمپ"


class TestToolDefinition:
    def test_langchain_tool_shape(self):
        t = execute_sql.execute_sql
        assert t.name == "execute_sql"
        schema = t.args_schema.model_json_schema()
        assert "query" in schema["properties"]
        assert "query" in schema.get("required", [])
