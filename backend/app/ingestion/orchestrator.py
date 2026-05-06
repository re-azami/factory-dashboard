"""
Single entry point for ingesting any file (xlsx or pdf) into the database.

Pipeline per file:
  1. SHA-256 the bytes. If a raw_files row already exists, return SKIPPED.
  2. Insert raw_files row.
  3. Dispatch by extension:
       .xlsx / .xls  → generic_xlsx.iter_cells(...) → bulk insert raw_xlsx_cells.
                       If is_production_template → also run parse_workbook
                       and populate daily_report / production_shift / downtime.
       .pdf          → pdf_parser.iter_pages → raw_pdf_pages
                     + pdf_parser.iter_table_cells → raw_pdf_table_cells
  4. Commit. On exception: roll back the per-file work, mark raw_files.status='error',
     commit just the error marker, and continue with the next file.

This module is the single place where "how do we get a file into SQL" lives.
The /ingest and /ingest/scan endpoints both go through ingest_file().
"""
from __future__ import annotations

import hashlib
import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from sqlalchemy import insert
from sqlalchemy.orm import Session

from app.models import (
    DailyReport,
    Downtime,
    ProductionShift,
    RawFile,
    RawPdfPage,
    RawPdfTableCell,
    RawXlsxCell,
)
from app.ingestion import generic_xlsx, pdf_parser
from app.ingestion.parser import is_production_template, parse_workbook


log = logging.getLogger(__name__)

XLSX_EXTS = {".xlsx", ".xlsm", ".xls"}
PDF_EXTS = {".pdf"}

CELL_BATCH_SIZE = 5000   # how many rows to flush per executemany INSERT


@dataclass
class IngestResult:
    path: str
    status: str          # 'ok' | 'skipped' | 'error'
    kind: str | None = None
    file_id: int | None = None
    xlsx_cells: int = 0
    pdf_pages: int = 0
    pdf_table_cells: int = 0
    production_rows: int = 0
    downtime_rows: int = 0
    daily_reports: int = 0
    error: str | None = None


# ── Hashing ───────────────────────────────────────────────────────────────────

def _sha256(path: Path) -> tuple[str, int]:
    """Return (hex digest, size in bytes) for a file."""
    h = hashlib.sha256()
    size = 0
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1 << 20)  # 1 MiB
            if not chunk:
                break
            h.update(chunk)
            size += len(chunk)
    return h.hexdigest(), size


# ── Bulk insert helper ────────────────────────────────────────────────────────

def _bulk_insert(db: Session, model, rows: Iterable[dict], file_id: int) -> int:
    """
    Insert `rows` into `model` in CELL_BATCH_SIZE chunks via SQLAlchemy core
    `insert` — much faster than ORM-level db.add().
    """
    count = 0
    batch: list[dict] = []
    for row in rows:
        row["file_id"] = file_id
        batch.append(row)
        if len(batch) >= CELL_BATCH_SIZE:
            db.execute(insert(model), batch)
            count += len(batch)
            batch = []
    if batch:
        db.execute(insert(model), batch)
        count += len(batch)
    return count


# ── Per-extension handlers ────────────────────────────────────────────────────

def _ingest_xlsx(db: Session, path: Path, raw_file: RawFile, result: IngestResult) -> None:
    # 1. Always dump every cell to raw_xlsx_cells.
    result.xlsx_cells = _bulk_insert(
        db, RawXlsxCell, generic_xlsx.iter_cells(path), raw_file.id
    )

    # 2. If the file matches the production template, ALSO run the typed parser.
    if not is_production_template(path):
        return

    parsed = parse_workbook(path)

    # daily_report — unique on report_date, so skip dupes.
    for header in parsed.daily_reports:
        exists = db.query(DailyReport).filter_by(report_date=header["report_date"]).first()
        if not exists:
            db.add(DailyReport(**header))
            result.daily_reports += 1

    # production_shift — unique on (date, shift, line).
    for row in parsed.production_rows:
        exists = db.query(ProductionShift).filter_by(
            report_date=row["report_date"],
            shift=row["shift"],
            line=row["line"],
        ).first()
        if not exists:
            db.add(ProductionShift(**row))
            result.production_rows += 1

    # downtime — events have no natural unique key. To stay idempotent across
    # re-ingestions we look for an exact (date, section, raw_text, duration) match.
    for row in parsed.downtime_rows:
        exists = db.query(Downtime).filter_by(
            report_date=row["report_date"],
            section=row["section"],
            raw_text=row["raw_text"],
            duration_minutes=row["duration_minutes"],
        ).first()
        if not exists:
            db.add(Downtime(**row))
            result.downtime_rows += 1


def _ingest_pdf(db: Session, path: Path, raw_file: RawFile, result: IngestResult) -> None:
    result.pdf_pages = _bulk_insert(db, RawPdfPage, pdf_parser.iter_pages(path), raw_file.id)
    result.pdf_table_cells = _bulk_insert(
        db, RawPdfTableCell, pdf_parser.iter_table_cells(path), raw_file.id
    )


# ── Public API ────────────────────────────────────────────────────────────────

def ingest_file(db: Session, path: str | Path, base_dir: str | Path | None = None) -> IngestResult:
    """
    Ingest a single file. Idempotent via SHA-256: if the file's hash is already
    in raw_files, returns status='skipped' without touching the DB further.

    `base_dir` is used to compute the stored relative `path` field. If None,
    we store the absolute path.
    """
    path = Path(path)
    rel = str(path.relative_to(base_dir)) if base_dir else str(path)
    ext = path.suffix.lower()

    if ext in XLSX_EXTS:
        kind = "xlsx"
    elif ext in PDF_EXTS:
        kind = "pdf"
    else:
        return IngestResult(path=rel, status="error", error=f"unsupported extension {ext!r}")

    result = IngestResult(path=rel, status="ok", kind=kind)

    try:
        digest, size = _sha256(path)
    except OSError as exc:
        result.status = "error"
        result.error = f"could not read file: {exc}"
        return result

    # Idempotency check.
    existing = db.query(RawFile).filter_by(sha256=digest).first()
    if existing:
        result.status = "skipped"
        result.file_id = existing.id
        return result

    raw_file = RawFile(
        path=rel,
        filename=path.name,
        sha256=digest,
        kind=kind,
        size_bytes=size,
        status="ok",
    )
    db.add(raw_file)
    db.flush()  # populate raw_file.id without committing yet
    result.file_id = raw_file.id

    try:
        if kind == "xlsx":
            _ingest_xlsx(db, path, raw_file, result)
        else:
            _ingest_pdf(db, path, raw_file, result)
        db.commit()
    except Exception as exc:
        log.exception("ingest_file failed for %s", path)
        db.rollback()

        # Re-record the file with status='error' so we don't keep retrying it
        # forever on every scan. The user can see the error message and act.
        err_file = RawFile(
            path=rel,
            filename=path.name,
            sha256=digest,
            kind=kind,
            size_bytes=size,
            status="error",
            error_message=str(exc)[:1000],
        )
        db.add(err_file)
        try:
            db.commit()
            result.file_id = err_file.id
        except Exception:
            db.rollback()
        result.status = "error"
        result.error = str(exc)

    return result


def scan_folder(db: Session, root: str | Path) -> list[IngestResult]:
    """
    Walk `root` recursively, ingest every .xlsx / .pdf, return per-file results.
    Files already in raw_files are skipped (idempotent).
    """
    root = Path(root)
    if not root.exists():
        raise FileNotFoundError(f"Folder not found: {root}")

    results: list[IngestResult] = []
    paths: list[Path] = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            ext = os.path.splitext(name)[1].lower()
            if ext in XLSX_EXTS or ext in PDF_EXTS:
                paths.append(Path(dirpath) / name)
    paths.sort()

    for p in paths:
        results.append(ingest_file(db, p, base_dir=root))

    return results
