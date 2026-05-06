from datetime import date, datetime
from sqlalchemy import BigInteger, Boolean, Date, DateTime, Float, Index, Integer, Text, String, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


# ── 1. daily_report ───────────────────────────────────────────────────────────
# One row per Excel sheet. Stores header info that applies to the whole day.

class DailyReport(Base):
    __tablename__ = "daily_report"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True, index=True)
    jalali_date: Mapped[str] = mapped_column(String(20), nullable=False)
    sheet_name: Mapped[str] = mapped_column(String(50), nullable=False)
    source_file: Mapped[str] = mapped_column(Text, nullable=False)
    batch_code: Mapped[str | None] = mapped_column(Text)               # e.g. "MIX (MAHCOARSE030711_MAH040701225"
    supervisors: Mapped[str | None] = mapped_column(Text)              # supervisor names from row 3
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ── 2. production_shift ───────────────────────────────────────────────────────
# Wide table — every per-(date, shift, line) metric in one row.
# 50+ columns covering production, equipment hours, consumption, and quality.

class ProductionShift(Base):
    __tablename__ = "production_shift"
    __table_args__ = (
        UniqueConstraint("report_date", "shift", "line", name="uq_shift_date_shift_line"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    jalali_date: Mapped[str] = mapped_column(String(20), nullable=False)
    shift: Mapped[str] = mapped_column(String(10), nullable=False)         # 'day' | 'night' | 'total'
    line: Mapped[int | None] = mapped_column(Integer)                      # 1, 2, or NULL for totals
    source_file: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Production: daily ─────────────────────────────────────────────────────
    daily_feed_tonnage: Mapped[float | None] = mapped_column(Float)
    daily_concentrate_tonnage: Mapped[float | None] = mapped_column(Float)
    daily_recovery_percent: Mapped[float | None] = mapped_column(Float)
    ore_grade_code: Mapped[str | None] = mapped_column(String(50))         # نوع بار, e.g. "MAH 040909225"

    # ── Production: monthly running totals ────────────────────────────────────
    monthly_feed_tonnage: Mapped[float | None] = mapped_column(Float)
    monthly_concentrate_tonnage: Mapped[float | None] = mapped_column(Float)
    monthly_recovery_percent: Mapped[float | None] = mapped_column(Float)

    # ── Production: yearly running totals ─────────────────────────────────────
    yearly_feed_tonnage: Mapped[float | None] = mapped_column(Float)
    yearly_concentrate_tonnage: Mapped[float | None] = mapped_column(Float)
    yearly_recovery_percent: Mapped[float | None] = mapped_column(Float)

    # ── Throughput ────────────────────────────────────────────────────────────
    throughput_ton_per_hour: Mapped[float | None] = mapped_column(Float)

    # ── Equipment operation hours ─────────────────────────────────────────────
    factory_operation_hours: Mapped[float | None] = mapped_column(Float)
    factory_downtime_hours: Mapped[float | None] = mapped_column(Float)
    feed_input_operation_hours: Mapped[float | None] = mapped_column(Float)
    feed_input_downtime_hours: Mapped[float | None] = mapped_column(Float)
    drum_filter_1_hours: Mapped[float | None] = mapped_column(Float)
    drum_filter_2_hours: Mapped[float | None] = mapped_column(Float)
    filter_press_operation_hours: Mapped[float | None] = mapped_column(Float)
    filter_press_downtime_hours: Mapped[float | None] = mapped_column(Float)

    # ── Material consumption ──────────────────────────────────────────────────
    flocculant_grams: Mapped[float | None] = mapped_column(Float)
    flocculant_type: Mapped[str | None] = mapped_column(String(50))        # e.g. "A28"
    water_consumption_m3: Mapped[float | None] = mapped_column(Float)
    ball_mill_primary_kg: Mapped[float | None] = mapped_column(Float)
    ball_mill_secondary_kg: Mapped[float | None] = mapped_column(Float)

    # ── Quality: feed ─────────────────────────────────────────────────────────
    feed_fe_percent: Mapped[float | None] = mapped_column(Float)
    feed_feo_percent: Mapped[float | None] = mapped_column(Float)
    feed_moisture_percent: Mapped[float | None] = mapped_column(Float)
    feed_k80_microns: Mapped[float | None] = mapped_column(Float)

    # ── Quality: concentrate ──────────────────────────────────────────────────
    concentrate_fe_percent: Mapped[float | None] = mapped_column(Float)
    concentrate_feo_percent: Mapped[float | None] = mapped_column(Float)
    concentrate_moisture_percent: Mapped[float | None] = mapped_column(Float)
    concentrate_k80_microns: Mapped[float | None] = mapped_column(Float)

    # ── Quality: tailings ─────────────────────────────────────────────────────
    tailings_fe_percent: Mapped[float | None] = mapped_column(Float)
    tailings_feo_percent: Mapped[float | None] = mapped_column(Float)
    tailings_k80_microns: Mapped[float | None] = mapped_column(Float)

    # ── Quality: intermediate streams ─────────────────────────────────────────
    primary_mill_output: Mapped[float | None] = mapped_column(Float)
    secondary_mill_output: Mapped[float | None] = mapped_column(Float)
    hydrocyclone_1_overflow: Mapped[float | None] = mapped_column(Float)
    hydrocyclone_2_overflow: Mapped[float | None] = mapped_column(Float)
    primary_mill_output_fe_percent: Mapped[float | None] = mapped_column(Float)
    primary_mill_output_feo_percent: Mapped[float | None] = mapped_column(Float)

    # ── Quality: derived ──────────────────────────────────────────────────────
    dry_weight_recovery_percent: Mapped[float | None] = mapped_column(Float)
    assay_recovery_percent: Mapped[float | None] = mapped_column(Float)
    separation_efficiency_percent: Mapped[float | None] = mapped_column(Float)
    filter_cake_moisture_percent: Mapped[float | None] = mapped_column(Float)


# ── 3. downtime ───────────────────────────────────────────────────────────────
# All downtime events from all 3 sections of the daily report.

class Downtime(Base):
    __tablename__ = "downtime"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    jalali_date: Mapped[str] = mapped_column(String(20), nullable=False)

    section: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    # ↑ 'factory' | 'feed_input' | 'filter_press'

    shift: Mapped[str | None] = mapped_column(String(10))                  # 'day' | 'night' | NULL
    line: Mapped[int | None] = mapped_column(Integer)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)

    # Filled by enrichment.py (Phase 2)
    equipment_code: Mapped[str | None] = mapped_column(String(50))
    fault_category: Mapped[str | None] = mapped_column(String(50))
    start_time: Mapped[str | None] = mapped_column(String(10))             # e.g. "07:00"
    end_time: Mapped[str | None] = mapped_column(String(10))               # e.g. "19:00"

    source_file: Mapped[str] = mapped_column(Text, nullable=False)


# ── 4. raw_files ──────────────────────────────────────────────────────────────
# Registry of every file ever ingested. Idempotency lives here: we hash each
# file with SHA-256 and skip ingestion if the hash is already present.

class RawFile(Base):
    __tablename__ = "raw_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    path: Mapped[str] = mapped_column(Text, nullable=False)              # path relative to the factory data dir
    filename: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    kind: Mapped[str] = mapped_column(String(10), nullable=False, index=True)   # 'xlsx' | 'pdf'
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="ok")   # 'ok' | 'error'
    error_message: Mapped[str | None] = mapped_column(Text)


# ── 5. raw_xlsx_cells ─────────────────────────────────────────────────────────
# One row per non-empty cell across every xlsx file ever ingested.
# This is the table the agent should query when the user asks about
# data from a file whose structure isn't covered by production_shift / downtime.

class RawXlsxCell(Base):
    __tablename__ = "raw_xlsx_cells"
    __table_args__ = (
        Index("ix_raw_xlsx_cells_file_sheet", "file_id", "sheet_name"),
        Index("ix_raw_xlsx_cells_sheet", "sheet_name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    file_id: Mapped[int] = mapped_column(Integer, ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False)
    sheet_name: Mapped[str] = mapped_column(String(120), nullable=False)
    sheet_index: Mapped[int] = mapped_column(Integer, nullable=False)
    row_idx: Mapped[int] = mapped_column(Integer, nullable=False)            # 1-based
    col_idx: Mapped[int] = mapped_column(Integer, nullable=False)            # 1-based
    cell_address: Mapped[str] = mapped_column(String(16), nullable=False)    # e.g. "C5", "AB42"
    value_text: Mapped[str | None] = mapped_column(Text)
    value_num: Mapped[float | None] = mapped_column(Float)
    value_date: Mapped[date | None] = mapped_column(Date)
    is_formula: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


# ── 6. raw_pdf_pages ──────────────────────────────────────────────────────────
# One row per page of every PDF ingested. Holds the full extracted text.

class RawPdfPage(Base):
    __tablename__ = "raw_pdf_pages"
    __table_args__ = (
        Index("ix_raw_pdf_pages_file", "file_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    file_id: Mapped[int] = mapped_column(Integer, ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False)
    page_num: Mapped[int] = mapped_column(Integer, nullable=False)           # 1-based
    text: Mapped[str | None] = mapped_column(Text)
    char_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


# ── 7. raw_pdf_table_cells ────────────────────────────────────────────────────
# One row per cell of every table detected on every PDF page (via pdfplumber).

class RawPdfTableCell(Base):
    __tablename__ = "raw_pdf_table_cells"
    __table_args__ = (
        Index("ix_raw_pdf_table_cells_file_page", "file_id", "page_num"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    file_id: Mapped[int] = mapped_column(Integer, ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False)
    page_num: Mapped[int] = mapped_column(Integer, nullable=False)
    table_idx: Mapped[int] = mapped_column(Integer, nullable=False)          # 0-based per page
    row_idx: Mapped[int] = mapped_column(Integer, nullable=False)            # 0-based within table
    col_idx: Mapped[int] = mapped_column(Integer, nullable=False)            # 0-based within table
    value_text: Mapped[str | None] = mapped_column(Text)
    value_num: Mapped[float | None] = mapped_column(Float)


# ── 8. query_log ──────────────────────────────────────────────────────────────
# Every user question + tool calls + final answer, for debugging.

class QueryLog(Base):
    __tablename__ = "query_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    question: Mapped[str] = mapped_column(Text, nullable=False)
    tool_calls: Mapped[dict | None] = mapped_column(JSON)
    answer: Mapped[str | None] = mapped_column(Text)
    llm_provider: Mapped[str | None] = mapped_column(String(30))
