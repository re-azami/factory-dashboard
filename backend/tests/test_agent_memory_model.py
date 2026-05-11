"""Tests for the AgentMemory ORM model."""
import pytest
from sqlalchemy.exc import IntegrityError

from app.models import AgentMemory


class TestAgentMemoryModel:
    def test_can_create_each_allowed_kind(self, in_memory_db):
        for kind in ("insight", "preference", "recipe", "glossary"):
            in_memory_db.add(AgentMemory(kind=kind, content=f"sample {kind}"))
        in_memory_db.commit()

        rows = in_memory_db.query(AgentMemory).all()
        assert {r.kind for r in rows} == {"insight", "preference", "recipe", "glossary"}

    def test_kind_check_constraint_rejects_unknown(self, in_memory_db):
        in_memory_db.add(AgentMemory(kind="bogus", content="x"))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()
        in_memory_db.rollback()

    def test_created_at_autopopulates(self, in_memory_db):
        in_memory_db.add(AgentMemory(kind="insight", content="x"))
        in_memory_db.commit()
        row = in_memory_db.query(AgentMemory).one()
        assert row.created_at is not None

    def test_source_question_is_optional(self, in_memory_db):
        in_memory_db.add(AgentMemory(kind="insight", content="x"))
        in_memory_db.commit()
        row = in_memory_db.query(AgentMemory).one()
        assert row.source_question is None
