"""Tests for the LLM enrichment of downtime rows."""
from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from app.ingestion import enrichment
from app.llm.base import LLMResponse
from app.models import Downtime


def _add_downtime(db, raw_text, equipment_code=None):
    row = Downtime(
        report_date=date(2026, 3, 25),
        jalali_date="1405/01/05",
        section="factory",
        shift="day",
        line=1,
        raw_text=raw_text,
        duration_minutes=60,
        equipment_code=equipment_code,
        source_file="test.xlsx",
    )
    db.add(row)
    db.commit()
    return row


class TestExtractOne:
    def test_parses_clean_json(self):
        client = MagicMock()
        client.chat.return_value = LLMResponse(
            content='{"equipment_code":"110MI02","fault_category":"electrical"}',
            tool_calls=[],
            stop_reason="end_turn",
        )
        with patch.object(enrichment, "get_llm_client", return_value=client):
            result = enrichment._extract_one("خرابی برق پمپ 110MI02")

        assert result == {"equipment_code": "110MI02", "fault_category": "electrical"}

    def test_strips_code_fences(self):
        client = MagicMock()
        client.chat.return_value = LLMResponse(
            content='```json\n{"equipment_code":"X1","fault_category":"mechanical"}\n```',
            tool_calls=[],
            stop_reason="end_turn",
        )
        with patch.object(enrichment, "get_llm_client", return_value=client):
            result = enrichment._extract_one("...")

        assert result["equipment_code"] == "X1"
        assert result["fault_category"] == "mechanical"

    def test_returns_nulls_on_invalid_json(self):
        client = MagicMock()
        client.chat.return_value = LLMResponse(
            content="this is not JSON at all",
            tool_calls=[],
            stop_reason="end_turn",
        )
        with patch.object(enrichment, "get_llm_client", return_value=client):
            result = enrichment._extract_one("...")

        assert result == {"equipment_code": None, "fault_category": None}


class TestEnrichAll:
    def test_only_processes_unenriched_rows(self, in_memory_db):
        _add_downtime(in_memory_db, "row needing enrichment", equipment_code=None)
        _add_downtime(in_memory_db, "already enriched", equipment_code="ALREADY")

        client = MagicMock()
        client.chat.return_value = LLMResponse(
            content='{"equipment_code":"NEW","fault_category":"electrical"}',
            tool_calls=[],
            stop_reason="end_turn",
        )
        with patch.object(enrichment, "get_llm_client", return_value=client):
            count = enrichment.enrich_all(in_memory_db)

        assert count == 1
        assert client.chat.call_count == 1

        rows = in_memory_db.query(Downtime).order_by(Downtime.id).all()
        # First row got enriched
        assert rows[0].equipment_code == "NEW"
        assert rows[0].fault_category == "electrical"
        # Second row was already enriched and untouched
        assert rows[1].equipment_code == "ALREADY"

    def test_zero_rows_when_all_enriched(self, in_memory_db):
        _add_downtime(in_memory_db, "x", equipment_code="A")
        _add_downtime(in_memory_db, "y", equipment_code="B")

        client = MagicMock()
        with patch.object(enrichment, "get_llm_client", return_value=client):
            count = enrichment.enrich_all(in_memory_db)

        assert count == 0
        client.chat.assert_not_called()
