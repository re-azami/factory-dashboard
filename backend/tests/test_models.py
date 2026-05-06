"""Tests for SQLAlchemy ORM models — schema, defaults, constraints."""
from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import DailyReport, ProductionShift, Downtime, RawSheetCells, QueryLog


class TestDailyReport:
    def test_insert_and_round_trip(self, in_memory_db):
        in_memory_db.add(DailyReport(
            report_date=date(2026, 3, 25),
            jalali_date="1405/01/05",
            sheet_name="01_05",
            source_file="Production_1405.xlsx",
            batch_code="MIX-A",
            supervisors="Ali, Reza",
        ))
        in_memory_db.commit()

        row = in_memory_db.query(DailyReport).one()
        assert row.report_date == date(2026, 3, 25)
        assert row.jalali_date == "1405/01/05"
        assert row.id is not None
        assert row.ingested_at is not None  # server_default fills this in

    def test_report_date_is_unique(self, in_memory_db):
        in_memory_db.add(DailyReport(
            report_date=date(2026, 3, 25), jalali_date="1405/01/05",
            sheet_name="01_05", source_file="f.xlsx",
        ))
        in_memory_db.commit()

        in_memory_db.add(DailyReport(
            report_date=date(2026, 3, 25), jalali_date="dup",
            sheet_name="dup", source_file="f.xlsx",
        ))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()


class TestProductionShift:
    def test_unique_constraint_on_date_shift_line(self, in_memory_db):
        common = dict(
            report_date=date(2026, 3, 25),
            jalali_date="1405/01/05",
            shift="day",
            line=1,
            source_file="f.xlsx",
        )
        in_memory_db.add(ProductionShift(**common))
        in_memory_db.commit()

        in_memory_db.add(ProductionShift(**common))
        with pytest.raises(IntegrityError):
            in_memory_db.commit()

    def test_different_shift_or_line_is_allowed(self, in_memory_db):
        in_memory_db.add(ProductionShift(
            report_date=date(2026, 3, 25), jalali_date="1405/01/05",
            shift="day", line=1, source_file="f.xlsx",
        ))
        in_memory_db.add(ProductionShift(
            report_date=date(2026, 3, 25), jalali_date="1405/01/05",
            shift="day", line=2, source_file="f.xlsx",  # different line
        ))
        in_memory_db.add(ProductionShift(
            report_date=date(2026, 3, 25), jalali_date="1405/01/05",
            shift="night", line=1, source_file="f.xlsx",  # different shift
        ))
        in_memory_db.commit()
        assert in_memory_db.query(ProductionShift).count() == 3


class TestDowntime:
    def test_no_uniqueness_required(self, in_memory_db):
        """Downtime events have no natural unique key — duplicates are allowed."""
        common = dict(
            report_date=date(2026, 3, 25),
            jalali_date="1405/01/05",
            section="factory",
            raw_text="خرابی برق",
            duration_minutes=60,
            source_file="f.xlsx",
        )
        for _ in range(3):
            in_memory_db.add(Downtime(**common))
        in_memory_db.commit()
        assert in_memory_db.query(Downtime).count() == 3


class TestRawSheetCells:
    def test_jsonb_dict_round_trip(self, in_memory_db):
        cells = {"A1": "تاریخ", "B1": "1405/01/05", "C5": 1092}
        in_memory_db.add(RawSheetCells(
            report_date=date(2026, 3, 25),
            sheet_name="01_05",
            source_file="f.xlsx",
            cells=cells,
        ))
        in_memory_db.commit()

        row = in_memory_db.query(RawSheetCells).one()
        assert row.cells == cells


class TestQueryLog:
    def test_optional_fields_default_none(self, in_memory_db):
        in_memory_db.add(QueryLog(question="x"))
        in_memory_db.commit()

        row = in_memory_db.query(QueryLog).one()
        assert row.tool_calls is None
        assert row.answer is None
        assert row.llm_provider is None
        assert row.asked_at is not None
