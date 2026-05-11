"""
SQLAlchemy ORM models for the factory dashboard.

Conventions (apply to every domain table):
  - Plural snake_case table names.
  - All percentages stored as whole numbers (49.95 — NOT 0.4995).
  - Audit columns: created_at, updated_at (TIMESTAMPTZ, default now()).
    The updated_at trigger is defined in the initial Alembic migration.
  - VARCHAR + CHECK constraint preferred over Postgres ENUM types.
  - Every FK column gets an explicit index (Postgres does not auto-index FKs).
"""
from datetime import date, datetime, time
from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    SmallInteger,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from app.database import Base


# Vector(1024) on Postgres; JSON on SQLite so unit-test fixtures can compile.
# Behavior in production is governed by the Postgres path.
_VectorOrJson = Vector(1024).with_variant(JSON, "sqlite")
# Postgres-native text[]; falls back to JSON on SQLite for the same reason.
_TextArrayOrJson = PG_ARRAY(Text).with_variant(JSON, "sqlite")


# ── 1. supervisors ────────────────────────────────────────────────────────────
class Supervisor(Base):
    __tablename__ = "supervisors"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 2. shifts ─────────────────────────────────────────────────────────────────
class Shift(Base):
    __tablename__ = "shifts"
    __table_args__ = (
        CheckConstraint("shift IN ('day','night')", name="ck_shifts_shift"),
        UniqueConstraint("date", "shift", name="uq_shifts_date_shift"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    shift: Mapped[str] = mapped_column(String(8), nullable=False)              # 'day' | 'night'
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)        # Gregorian date
    jalali_date: Mapped[str] = mapped_column(Text, nullable=False)              # e.g. "1405/02/19"
    supervisor_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("supervisors.id", ondelete="RESTRICT"), index=True
    )
    water_consumption: Mapped[float | None] = mapped_column(Float)              # cubic meters; one meter for the whole shift (both lines)
    downtime_description: Mapped[str | None] = mapped_column(Text)              # free-text shift-level note; in source workbook appears in red font in input-feed-cause column with no associated duration
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 3. loads ──────────────────────────────────────────────────────────────────
class Load(Base):
    __tablename__ = "loads"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(Text, nullable=False, unique=True)        # input-feed batch code, e.g. "MAH 040701225"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 4. line_shift_reports ─────────────────────────────────────────────────────
class LineShiftReport(Base):
    __tablename__ = "line_shift_reports"
    __table_args__ = (
        CheckConstraint("line_number IN (1,2)", name="ck_lsr_line_number"),
        CheckConstraint("load_segment IN (1,2)", name="ck_lsr_load_segment"),
        UniqueConstraint("shift_id", "line_number", "load_segment", name="uq_lsr_shift_line_segment"),
        Index("ix_lsr_shift_id", "shift_id"),
        Index("ix_lsr_load_id", "load_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    # Foreign keys
    shift_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("shifts.id", ondelete="RESTRICT"), nullable=False)
    load_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("loads.id", ondelete="RESTRICT"))

    line_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)      # 1 | 2
    # Most shifts have one production segment (load_segment=1). When operator changes
    # feed mid-shift (downtime row contains 'تعویض بار'), a second LSR is created with
    # load_segment=2 holding the post-change production. Mill/quality stay on segment=1.
    load_segment: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default="1")

    # ── Production ────────────────────────────────────────────────────────────
    input_feed_tonnage: Mapped[int | None] = mapped_column(Integer)             # tons fed into this line
    production_tonnage: Mapped[int | None] = mapped_column(Integer)             # tons of concentrate produced
    recovery: Mapped[float | None] = mapped_column(Float)                       # whole-number percent (production/feed). 0 when feed=0. Stored as Excel reports it.

    # ── Equipment hours ───────────────────────────────────────────────────────
    operation_hour: Mapped[float | None] = mapped_column(Float)                 # hours line was operating
    downtime_hour: Mapped[float | None] = mapped_column(Float)                  # hours line was stopped
    ton_per_hour: Mapped[float | None] = mapped_column(Float)                   # input_feed_tonnage / operation_hour, as Excel reports
    drum_filter_1_hour: Mapped[float | None] = mapped_column(Float)
    drum_filter_2_hour: Mapped[float | None] = mapped_column(Float)
    filter_press_operation_hour: Mapped[float | None] = mapped_column(Float)
    filter_press_downtime_hour: Mapped[float | None] = mapped_column(Float)

    # ── Consumption ───────────────────────────────────────────────────────────
    flocculant_consumption_grams: Mapped[int | None] = mapped_column(Integer)
    flocculant_type: Mapped[str | None] = mapped_column(Text)                   # e.g. "A28"

    # Primary mill ball additions (count of balls of each diameter)
    primary_mill_30: Mapped[int | None] = mapped_column(Integer)
    primary_mill_40: Mapped[int | None] = mapped_column(Integer)
    primary_mill_50: Mapped[int | None] = mapped_column(Integer)
    primary_mill_60: Mapped[int | None] = mapped_column(Integer)

    # Secondary mill ball additions
    secondary_mill_25: Mapped[int | None] = mapped_column(Integer)
    secondary_mill_30: Mapped[int | None] = mapped_column(Integer)
    secondary_mill_40: Mapped[int | None] = mapped_column(Integer)
    secondary_mill_50: Mapped[int | None] = mapped_column(Integer)

    # ── Quality: Fe / FeO percentages (whole-number percent) ──────────────────
    fe_input_feed: Mapped[float | None] = mapped_column(Float)
    feo_input_feed: Mapped[float | None] = mapped_column(Float)
    fe_concentrate: Mapped[float | None] = mapped_column(Float)
    feo_concentrate: Mapped[float | None] = mapped_column(Float)
    fe_thickener_tailing: Mapped[float | None] = mapped_column(Float)
    feo_thickener_tailing: Mapped[float | None] = mapped_column(Float)
    fe_first_ballmill_output: Mapped[float | None] = mapped_column(Float)
    feo_first_ballmill_output: Mapped[float | None] = mapped_column(Float)

    # ── K80 particle sizes (microns) ──────────────────────────────────────────
    k80_size_input_feed: Mapped[int | None] = mapped_column(Integer)
    k80_size_primary_ballmill: Mapped[int | None] = mapped_column(Integer)
    k80_size_secondary_ballmill: Mapped[int | None] = mapped_column(Integer)
    k80_size_hydrocyclone_overflow_1: Mapped[int | None] = mapped_column(Integer)
    k80_size_hydrocyclone_overflow_2: Mapped[int | None] = mapped_column(Integer)
    k80_size_tailing: Mapped[int | None] = mapped_column(Integer)
    k80_size_concentrate: Mapped[int | None] = mapped_column(Integer)

    # ── Recoveries / efficiency (whole-number percent) ────────────────────────
    dry_weight_recovery: Mapped[float | None] = mapped_column(Float)
    metallurgical_recovery: Mapped[float | None] = mapped_column(Float)
    separation_efficiency: Mapped[float | None] = mapped_column(Float)

    # ── Moisture (whole-number percent) ───────────────────────────────────────
    input_feed_moisture: Mapped[float | None] = mapped_column(Float)
    concentrate_moisture: Mapped[float | None] = mapped_column(Float)
    filter_press_cake_moisture: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 5. factory_downtimes ──────────────────────────────────────────────────────
class FactoryDowntime(Base):
    __tablename__ = "factory_downtimes"
    __table_args__ = (
        Index("ix_factory_downtimes_lsr", "line_shift_report_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    line_shift_report_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text)
    duration: Mapped[int | None] = mapped_column(Integer)                       # minutes

    # ── Enrichment (populated by app.enrichment.downtimes.enrich) ─────────────
    embedding: Mapped[list[float] | None] = mapped_column(_VectorOrJson)         # BGE-M3 of description; NOT NULL after migration 003
    category: Mapped[str | None] = mapped_column(Text)                          # one of taxonomy values; NOT NULL after migration 003
    department_tag: Mapped[str | None] = mapped_column(Text)                    # raw Persian tag from trailing (...)
    equipment_codes: Mapped[list[str] | None] = mapped_column(_TextArrayOrJson)      # ISA-style codes mentioned in description
    start_time: Mapped[time | None] = mapped_column(Time)                       # from "از ساعت X الی Y"
    end_time: Mapped[time | None] = mapped_column(Time)
    is_planned: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 6. input_feed_downtimes ───────────────────────────────────────────────────
class InputFeedDowntime(Base):
    __tablename__ = "input_feed_downtimes"
    __table_args__ = (
        Index("ix_input_feed_downtimes_lsr", "line_shift_report_id"),
        Index("ix_input_feed_downtimes_factory", "factory_downtime_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    line_shift_report_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False
    )
    factory_downtime_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("factory_downtimes.id", ondelete="SET NULL")
    )
    description: Mapped[str | None] = mapped_column(Text)
    duration: Mapped[int | None] = mapped_column(Integer)                       # minutes

    embedding: Mapped[list[float] | None] = mapped_column(_VectorOrJson)
    category: Mapped[str | None] = mapped_column(Text)
    department_tag: Mapped[str | None] = mapped_column(Text)
    equipment_codes: Mapped[list[str] | None] = mapped_column(_TextArrayOrJson)
    start_time: Mapped[time | None] = mapped_column(Time)
    end_time: Mapped[time | None] = mapped_column(Time)
    is_planned: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 7. filter_press_downtimes ─────────────────────────────────────────────────
class FilterPressDowntime(Base):
    __tablename__ = "filter_press_downtimes"
    __table_args__ = (
        Index("ix_filter_press_downtimes_lsr", "line_shift_report_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    line_shift_report_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text)
    duration: Mapped[int | None] = mapped_column(Integer)                       # minutes

    embedding: Mapped[list[float] | None] = mapped_column(_VectorOrJson)
    category: Mapped[str | None] = mapped_column(Text)
    department_tag: Mapped[str | None] = mapped_column(Text)
    equipment_codes: Mapped[list[str] | None] = mapped_column(_TextArrayOrJson)
    start_time: Mapped[time | None] = mapped_column(Time)
    end_time: Mapped[time | None] = mapped_column(Time)
    is_planned: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# ── 8. query_log (kept from Phase 1) ──────────────────────────────────────────
class QueryLog(Base):
    __tablename__ = "query_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    question: Mapped[str] = mapped_column(Text, nullable=False)
    tool_calls: Mapped[dict | None] = mapped_column(JSON)
    answer: Mapped[str | None] = mapped_column(Text)
    llm_provider: Mapped[str | None] = mapped_column(String(30))
    agent_mode: Mapped[str | None] = mapped_column(String(16))                  # 'simple' | 'deep'


# ── 9. agent_memory ───────────────────────────────────────────────────────────
class AgentMemory(Base):
    """Persistent notes the deep-research agent has written about prior chats.

    Stores only durable lessons — patterns, user preferences, useful SQL recipes,
    domain glossary entries. Never raw daily data: the underlying tables are
    refreshed every day, so anything tied to a specific date goes stale fast.
    """
    __tablename__ = "agent_memory"
    __table_args__ = (
        CheckConstraint("kind IN ('insight','preference','recipe','glossary')", name="ck_agent_memory_kind"),
        Index("ix_agent_memory_kind", "kind"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_question: Mapped[str | None] = mapped_column(Text)                   # the user question that taught this lesson
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
