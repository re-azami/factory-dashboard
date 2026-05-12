"""Tests for the read-only SQL tool used by the agent."""
import json
from contextlib import contextmanager
from unittest.mock import MagicMock

import pytest

from app.tools import execute_sql


def _stub_engine(monkeypatch, columns, rows, capture=None):
    """Wire engine_ro.connect() to return a mock connection that yields the given rows.

    If `capture` is a list, every executed statement's text is appended to it
    (uppercased) so tests can assert order.
    """
    result = MagicMock()
    result.keys.return_value = columns
    result.fetchall.return_value = rows

    conn = MagicMock()

    def execute_side(stmt, *args, **kwargs):
        if capture is not None:
            capture.append(str(stmt).upper())
        return result

    conn.execute.side_effect = execute_side

    @contextmanager
    def fake_connect():
        yield conn

    monkeypatch.setattr(execute_sql.engine_ro, "connect", fake_connect)
    return conn


class TestReadOnlyEnforcement:
    def test_sets_transaction_read_only_before_query(self, monkeypatch):
        # SET TRANSACTION READ ONLY must be the first statement on the connection,
        # otherwise Postgres won't enforce read-only mode on the user query.
        statements = []
        _stub_engine(monkeypatch, columns=["x"], rows=[(1,)], capture=statements)

        execute_sql.run("SELECT 1 as x")

        assert len(statements) == 2
        assert "SET TRANSACTION READ ONLY" in statements[0]
        assert "SELECT 1" in statements[1]

    def test_translates_read_only_violation_to_friendly_error(self, monkeypatch):
        # When the DB raises the ReadOnlySqlTransaction error (SQLSTATE 25006),
        # we surface a friendly message instead of the raw psycopg traceback.
        conn = MagicMock()

        def execute_side(stmt, *args, **kwargs):
            if "READ ONLY" in str(stmt).upper():
                return MagicMock()
            raise RuntimeError(
                "(psycopg2.errors.ReadOnlySqlTransaction) "
                "cannot execute INSERT in a read-only transaction"
            )

        conn.execute.side_effect = execute_side

        @contextmanager
        def fake_connect():
            yield conn

        monkeypatch.setattr(execute_sql.engine_ro, "connect", fake_connect)
        out = json.loads(execute_sql.run("INSERT INTO foo VALUES (1)"))
        assert out["error"] == execute_sql.READ_ONLY_ERROR_MESSAGE

    def test_unrelated_db_error_passes_through(self, monkeypatch):
        # A non-read-only error (e.g. syntax, missing table) is reported verbatim
        # so the agent can self-correct.
        conn = MagicMock()

        def execute_side(stmt, *args, **kwargs):
            if "READ ONLY" in str(stmt).upper():
                return MagicMock()
            raise RuntimeError('relation "missing_table" does not exist')

        conn.execute.side_effect = execute_side

        @contextmanager
        def fake_connect():
            yield conn

        monkeypatch.setattr(execute_sql.engine_ro, "connect", fake_connect)
        out = json.loads(execute_sql.run("SELECT * FROM missing_table"))
        assert "missing_table" in out["error"]
        assert out["error"] != execute_sql.READ_ONLY_ERROR_MESSAGE


class TestAcceptedQueryShapes:
    def test_accepts_plain_select(self, monkeypatch):
        _stub_engine(monkeypatch, columns=["x"], rows=[(1,)])
        out = json.loads(execute_sql.run("SELECT 1 as x"))
        assert "error" not in out
        assert out["row_count"] == 1

    def test_accepts_cte_query(self, monkeypatch):
        # CTEs (WITH ... SELECT ...) are valid read-only queries — the very
        # case that triggered this change: a top-N + grand-total report query.
        _stub_engine(monkeypatch, columns=["equip_code", "total"], rows=[("P1", 42)])
        query = """
            WITH totals AS (
                SELECT equipment_codes, SUM(duration) AS total
                FROM factory_downtimes
                GROUP BY equipment_codes
            )
            SELECT * FROM totals ORDER BY total DESC LIMIT 10
        """
        out = json.loads(execute_sql.run(query))
        assert "error" not in out
        assert out["row_count"] == 1

    def test_accepts_lowercase_select(self, monkeypatch):
        _stub_engine(monkeypatch, columns=["x"], rows=[(1,)])
        out = json.loads(execute_sql.run("select 1 as x"))
        assert "error" not in out

    def test_accepts_leading_persian_comment(self, monkeypatch):
        _stub_engine(monkeypatch, columns=["x"], rows=[(1,)])
        query = "-- بررسی ردیفها\nSELECT 1 as x"
        out = json.loads(execute_sql.run(query))
        assert "error" not in out
        assert out["row_count"] == 1


class TestQueryExecution:
    def test_simple_select_returns_columns_and_rows(self, monkeypatch):
        _stub_engine(
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
        _stub_engine(monkeypatch, columns=["n"], rows=many_rows)

        out = json.loads(execute_sql.run("SELECT n FROM big"))
        assert out["row_count"] == 500
        assert out["warning"] == "Result was truncated to 500 rows."

    def test_connection_error_is_caught(self, monkeypatch):
        @contextmanager
        def boom():
            raise RuntimeError("connection refused")
            yield  # pragma: no cover

        monkeypatch.setattr(execute_sql.engine_ro, "connect", boom)
        out = json.loads(execute_sql.run("SELECT 1"))
        assert "error" in out
        assert "connection refused" in out["error"]

    def test_persian_text_is_preserved(self, monkeypatch):
        _stub_engine(
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
