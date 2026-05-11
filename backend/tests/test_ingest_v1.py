"""Tests for the ingest_v1 orchestration layer.

We mock parse_sheet to return a hand-crafted SheetData so these tests
exercise the database side (upserts, idempotency, lookup-or-create,
downtime-replace, _safe_enrich fallback) without depending on the
fragile Excel parser. Parser correctness is covered by the unit tests
in test_parser_v1_helpers.py and the live ingestion of the data/raw
folder during actual runs.

All tests run against an in-memory SQLite engine that mirrors the
Postgres schema via SQLAlchemy variants (Vector→JSON, ARRAY→JSON).
"""
from __future__ import annotations

from datetime import date
from unittest.mock import patch

import pytest

from app.ingestion import ingest_v1
from app.ingestion.parser_v1 import (
    DowntimeEvent,
    LineDowntimes,
    LineRow,
    MissingDataError,
    ParseError,
    SheetData,
    ShiftBlock,
)
from app.models import (
    FactoryDowntime,
    FilterPressDowntime,
    InputFeedDowntime,
    LineShiftReport,
    Load,
    Shift,
    Supervisor,
)


# ── Hand-crafted SheetData fixtures ──────────────────────────────────────────

def _make_line(line_number: int, *,
               input_feed: int = 1000, production: int = 500, recovery: float = 50.0,
               load_code: str | None = "MAH 040701225",
               factory_downs: list[DowntimeEvent] | None = None,
               feed_downs: list[tuple[DowntimeEvent, int | None]] | None = None,
               filter_press_downs: list[DowntimeEvent] | None = None) -> LineRow:
    """Build a populated LineRow with sensible defaults so the validator passes."""
    return LineRow(
        line_number=line_number,
        input_feed_tonnage=input_feed,
        production_tonnage=production,
        recovery=recovery,
        load_code=load_code,
        operation_hour=10.0,
        downtime_hour=2.0,
        ton_per_hour=100.0,
        drum_filter_1_hour=5.0,
        drum_filter_2_hour=5.0,
        filter_press_operation_hour=8.0,
        filter_press_downtime_hour=4.0,
        flocculant_consumption_grams=200,
        flocculant_type="A28",
        primary_mill_30=0, primary_mill_40=0, primary_mill_50=0, primary_mill_60=0,
        secondary_mill_25=0, secondary_mill_30=0, secondary_mill_40=0, secondary_mill_50=0,
        fe_input_feed=45.0, feo_input_feed=12.0,
        fe_concentrate=67.0, feo_concentrate=23.0,
        fe_thickener_tailing=15.0, feo_thickener_tailing=5.0,
        fe_first_ballmill_output=50.0, feo_first_ballmill_output=10.0,
        k80_size_input_feed=80, k80_size_primary_ballmill=100,
        k80_size_secondary_ballmill=70, k80_size_hydrocyclone_overflow_1=60,
        k80_size_hydrocyclone_overflow_2=55, k80_size_tailing=200, k80_size_concentrate=45,
        dry_weight_recovery=50.0, metallurgical_recovery=75.0, separation_efficiency=80.0,
        input_feed_moisture=8.0, concentrate_moisture=10.0, filter_press_cake_moisture=12.0,
        downtimes=LineDowntimes(
            factory=factory_downs or [],
            input_feed=feed_downs or [],
            filter_press=filter_press_downs or [],
        ),
    )


def _make_shift_block(shift: str, *, supervisor: str | None = "Ali",
                      line1_downs: dict | None = None,
                      line2_downs: dict | None = None) -> ShiftBlock:
    line1_downs = line1_downs or {}
    line2_downs = line2_downs or {}
    return ShiftBlock(
        shift=shift,
        supervisor_name=supervisor,
        downtime_description=None,
        water_consumption=42.0,
        line1_segments=[_make_line(1, **line1_downs)],
        line2_segments=[_make_line(2, **line2_downs)],
    )


def _make_sheet(jalali_date: str = "1405/01/01") -> SheetData:
    return SheetData(
        jalali_date=jalali_date,
        day_shift=_make_shift_block("day", supervisor="Ali"),
        night_shift=_make_shift_block("night", supervisor="Reza"),
    )


# ── Lookup-or-create helpers ─────────────────────────────────────────────────

class TestGetOrCreateSupervisor:
    def test_none_name_returns_none(self, in_memory_db):
        assert ingest_v1._get_or_create_supervisor(in_memory_db, None) is None
        assert ingest_v1._get_or_create_supervisor(in_memory_db, "") is None

    def test_creates_when_missing(self, in_memory_db):
        s = ingest_v1._get_or_create_supervisor(in_memory_db, "Ali")
        assert s is not None
        assert s.id is not None
        assert s.name == "Ali"
        assert in_memory_db.query(Supervisor).count() == 1

    def test_returns_existing_on_duplicate(self, in_memory_db):
        s1 = ingest_v1._get_or_create_supervisor(in_memory_db, "Ali")
        s2 = ingest_v1._get_or_create_supervisor(in_memory_db, "Ali")
        assert s1.id == s2.id
        assert in_memory_db.query(Supervisor).count() == 1


class TestGetOrCreateLoad:
    def test_none_returns_none(self, in_memory_db):
        assert ingest_v1._get_or_create_load(in_memory_db, None) is None

    def test_empty_string_returns_none(self, in_memory_db):
        # normalize_load_code('') == '' → treated as missing
        assert ingest_v1._get_or_create_load(in_memory_db, "") is None

    def test_normalizes_before_lookup(self, in_memory_db):
        """Persian-digit and casing variants must collapse to ONE loads row."""
        a = ingest_v1._get_or_create_load(in_memory_db, "mah ۰۴۰۷۰۱۲۲۵")
        b = ingest_v1._get_or_create_load(in_memory_db, "MAH 040701225")
        assert a.id == b.id
        assert in_memory_db.query(Load).count() == 1
        # canonical form is uppercase ASCII
        assert a.code == "MAH 040701225"


class TestGetOrCreateShift:
    def test_creates_when_missing(self, in_memory_db):
        sh = ingest_v1._get_or_create_shift(
            in_memory_db, date(2026, 3, 21), "1405/01/01", "day",
            supervisor=None, water_consumption=10.0, downtime_description=None,
        )
        assert sh.id is not None
        assert sh.shift == "day"
        assert sh.water_consumption == 10.0

    def test_returns_existing_and_updates_late_arriving_fields(self, in_memory_db):
        sup = ingest_v1._get_or_create_supervisor(in_memory_db, "Ali")
        in_memory_db.commit()

        first = ingest_v1._get_or_create_shift(
            in_memory_db, date(2026, 3, 21), "1405/01/01", "day",
            supervisor=None, water_consumption=None, downtime_description=None,
        )
        # Second call with extra info should reuse the row and fill missing fields
        second = ingest_v1._get_or_create_shift(
            in_memory_db, date(2026, 3, 21), "1405/01/01", "day",
            supervisor=sup, water_consumption=15.0, downtime_description="note",
        )
        assert first.id == second.id
        assert second.supervisor_id == sup.id
        assert second.water_consumption == 15.0
        assert second.downtime_description == "note"


# ── _safe_enrich fallback ───────────────────────────────────────────────────

class TestSafeEnrich:
    def test_returns_enrich_result_on_success(self, monkeypatch):
        ok = {
            "embedding": [0.1] * 4, "category": "electrical",
            "department_tag": "برق", "equipment_codes": None,
            "start_time": None, "end_time": None, "is_planned": False,
        }
        monkeypatch.setattr(ingest_v1, "enrich", lambda d: ok)
        assert ingest_v1._safe_enrich("x") == ok

    def test_falls_back_to_other_on_exception(self, monkeypatch):
        """If enrich() raises, we must still return values for NOT NULL columns
        (category) so migration 003 constraints can't be violated."""
        def boom(_d):
            raise RuntimeError("embedding server down")
        monkeypatch.setattr(ingest_v1, "enrich", boom)
        out = ingest_v1._safe_enrich("anything")
        # NOT NULL columns must have valid fallback values
        assert out["category"] == "other"
        assert out["is_planned"] is False
        assert out["embedding"] is None  # nullable until migration 003 NOT NULL fires
        assert out["department_tag"] is None
        assert out["equipment_codes"] is None
        assert out["start_time"] is None
        assert out["end_time"] is None


# ── ingest_sheet end-to-end (parse_sheet mocked) ────────────────────────────

@pytest.fixture
def fake_enrich(monkeypatch):
    """Force a stable, deterministic enrichment result for ingest tests."""
    def stub(desc):
        return {
            "embedding": None,
            "category": "other",
            "department_tag": None,
            "equipment_codes": None,
            "start_time": None,
            "end_time": None,
            "is_planned": False,
        }
    monkeypatch.setattr(ingest_v1, "_safe_enrich", stub)


class TestIngestSheet:
    def test_writes_two_shifts_and_four_lsrs(self, in_memory_db, fake_enrich):
        sheet = _make_sheet()
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet):
            result = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="1405-01-01")
        in_memory_db.commit()

        assert result.status == "ok"
        assert result.phase is None
        assert result.rows_written == 4
        assert result.jalali_date == "1405/01/01"
        assert in_memory_db.query(Shift).count() == 2
        assert in_memory_db.query(LineShiftReport).count() == 4

        # Both supervisors created exactly once
        names = {s.name for s in in_memory_db.query(Supervisor).all()}
        assert names == {"Ali", "Reza"}

        # Returned IDs are populated
        assert result.ids is not None
        assert result.ids.day_shift_id is not None
        assert result.ids.day_line1_lsr_id != result.ids.day_line2_lsr_id

    def test_idempotent_on_reingest(self, in_memory_db, fake_enrich):
        """Re-ingesting the same sheet must NOT duplicate rows."""
        sheet = _make_sheet()
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet):
            r1 = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()
            r2 = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()

        assert r1.status == r2.status == "ok"
        assert in_memory_db.query(Shift).count() == 2
        assert in_memory_db.query(LineShiftReport).count() == 4
        assert in_memory_db.query(Load).count() == 1   # same load_code, one row

    def test_downtimes_are_replaced_not_appended(self, in_memory_db, fake_enrich):
        # First ingest with two factory events on day-line-1
        sheet1 = _make_sheet()
        sheet1.day_shift.line1_segments[0].downtimes.factory = [
            DowntimeEvent("خرابی پمپ", 30),
            DowntimeEvent("توقف برق", 45),
        ]
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet1):
            ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()
        assert in_memory_db.query(FactoryDowntime).count() == 2

        # Second ingest with only ONE factory event for the same (shift, line)
        sheet2 = _make_sheet()
        sheet2.day_shift.line1_segments[0].downtimes.factory = [
            DowntimeEvent("یک رویداد جدید", 60),
        ]
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet2):
            ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()

        rows = in_memory_db.query(FactoryDowntime).all()
        assert len(rows) == 1
        assert rows[0].description == "یک رویداد جدید"
        assert rows[0].duration == 60

    def test_input_feed_downtime_links_to_factory_index(self, in_memory_db, fake_enrich):
        """When the parser sets link_idx, the foreign key must be populated."""
        sheet = _make_sheet()
        # Day-line-1: 1 factory event + 1 feed event linked to factory index 0
        sheet.day_shift.line1_segments[0].downtimes.factory = [
            DowntimeEvent("توقف خط (برق)", 30),
        ]
        sheet.day_shift.line1_segments[0].downtimes.input_feed = [
            (DowntimeEvent("توقف خط", 30), 0),  # link to index 0
        ]
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet):
            ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()

        factory_row = in_memory_db.query(FactoryDowntime).one()
        feed_row = in_memory_db.query(InputFeedDowntime).one()
        assert feed_row.factory_downtime_id == factory_row.id

    def test_filter_press_downtimes_written(self, in_memory_db, fake_enrich):
        sheet = _make_sheet()
        sheet.day_shift.line1_segments[0].downtimes.filter_press = [
            DowntimeEvent("نشتی پرس", 15),
        ]
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet):
            ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
            in_memory_db.commit()

        row = in_memory_db.query(FilterPressDowntime).one()
        assert row.description == "نشتی پرس"
        assert row.duration == 15

    def test_parse_error_returns_error_phase(self, in_memory_db, fake_enrich):
        with patch.object(ingest_v1, "parse_sheet",
                          side_effect=ParseError("bad structure")):
            result = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
        assert result.status == "error"
        assert result.phase == "parse"
        assert "bad structure" in result.error
        assert in_memory_db.query(Shift).count() == 0  # nothing written

    def test_missing_data_error_reports_phase_and_fields(self, in_memory_db, fake_enrich):
        with patch.object(ingest_v1, "parse_sheet",
                          side_effect=MissingDataError(["day/line1: recovery is None"])):
            result = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
        assert result.status == "error"
        assert result.phase == "missing_data"
        # Error string carries the missing field info
        assert "recovery" in result.error

    def test_invalid_jalali_date_returns_date_phase(self, in_memory_db, fake_enrich):
        sheet = _make_sheet(jalali_date="not a date")
        with patch.object(ingest_v1, "parse_sheet", return_value=sheet):
            result = ingest_v1.ingest_sheet(in_memory_db, ws=object(), sheet_name="s")
        assert result.status == "error"
        assert result.phase == "date"
        assert result.jalali_date == "not a date"
        assert in_memory_db.query(Shift).count() == 0


# ── ingest_workbook (file-level driver) ─────────────────────────────────────

class TestIngestWorkbook:
    def test_missing_file_yields_load_error(self, in_memory_db):
        result = ingest_v1.ingest_workbook(in_memory_db, "/nonexistent/path.xlsx")
        assert result.failed == 1
        assert result.ok == 0
        only = result.sheets[0]
        assert only.phase == "load"
        assert only.sheet_name == "<workbook>"
