"""SQLAlchemy models. Mirrors the parsed Excel schema; alembic owns migrations."""

from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

EMBED_DIM = 1024  # BGE-M3 dense vector size


class Base(DeclarativeBase):
    pass


class ProductionShift(Base):
    __tablename__ = "production_shift"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_date: Mapped[date] = mapped_column(Date, index=True)
    jalali_date: Mapped[str] = mapped_column(String(10))
    shift: Mapped[str] = mapped_column(String(16))   # day / night
    line: Mapped[int] = mapped_column(Integer)
    feed_tonnage: Mapped[float | None] = mapped_column(Float)
    concentrate_tonnage: Mapped[float | None] = mapped_column(Float)
    fe_percent: Mapped[float | None] = mapped_column(Float)
    recovery_percent: Mapped[float | None] = mapped_column(Float)


class Downtime(Base):
    __tablename__ = "downtime"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_date: Mapped[date] = mapped_column(Date, index=True)
    raw_text: Mapped[str] = mapped_column(Text)
    raw_text_embedding: Mapped[list[float] | None] = mapped_column(Vector(EMBED_DIM))
    equipment_code: Mapped[str | None] = mapped_column(String(32), index=True)
    fault_category: Mapped[str | None] = mapped_column(String(32), index=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    start_time: Mapped[datetime | None] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime)


class QueryLog(Base):
    __tablename__ = "query_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[str | None] = mapped_column(String(64), index=True)
    asked_at: Mapped[datetime] = mapped_column(DateTime)
    question: Mapped[str] = mapped_column(Text)
    tool_calls_json: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
