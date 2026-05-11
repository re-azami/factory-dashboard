"""Tests for query_log.save."""
from app.query_log.log import save
from app.models import QueryLog


def test_save_inserts_row(in_memory_db):
    save(
        db=in_memory_db,
        question="What is the average concentrate Fe%?",
        tool_calls=[{"tool": "execute_sql", "input": {"query": "SELECT 1"}, "output": "{}"}],
        answer="66.99%",
        llm_provider="anthropic",
    )

    rows = in_memory_db.query(QueryLog).all()
    assert len(rows) == 1
    row = rows[0]
    assert row.question == "What is the average concentrate Fe%?"
    assert row.answer == "66.99%"
    assert row.llm_provider == "anthropic"
    assert row.tool_calls[0]["tool"] == "execute_sql"


def test_save_multiple(in_memory_db):
    save(db=in_memory_db, question="q1", tool_calls=[], answer="a1", llm_provider="openai")
    save(db=in_memory_db, question="q2", tool_calls=[], answer="a2", llm_provider="ollama")

    rows = in_memory_db.query(QueryLog).order_by(QueryLog.id).all()
    assert [r.question for r in rows] == ["q1", "q2"]
    assert [r.llm_provider for r in rows] == ["openai", "ollama"]


def test_save_handles_persian(in_memory_db):
    save(
        db=in_memory_db,
        question="میانگین درصد آهن کنسانتره چقدر است؟",
        tool_calls=[],
        answer="۶۶.۹۹٪",
        llm_provider="anthropic",
    )
    row = in_memory_db.query(QueryLog).one()
    assert "میانگین" in row.question
    assert "۶۶.۹۹" in row.answer


def test_save_records_agent_mode(in_memory_db):
    save(db=in_memory_db, question="q1", tool_calls=[], answer="a1", llm_provider="anthropic", agent_mode="deep")
    save(db=in_memory_db, question="q2", tool_calls=[], answer="a2", llm_provider="anthropic", agent_mode="simple")

    rows = in_memory_db.query(QueryLog).order_by(QueryLog.id).all()
    assert [r.agent_mode for r in rows] == ["deep", "simple"]
