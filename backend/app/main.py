"""
FastAPI application entry point.

Routes:
  POST /chat          — send a question, get a streaming answer from the agent
  POST /ingest        — upload one xlsx or pdf file for ingestion
  POST /ingest/scan   — walk the factory data folder and ingest everything new
  POST /ingest/enrich — run LLM enrichment on unprocessed downtime rows
  GET  /history       — last N query log entries (for debugging)
  GET  /health        — liveness check
"""
import os
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
import app.agent as agent
from app.ingestion.orchestrator import ingest_file, scan_folder
from app.ingestion.registry import is_known_source, KNOWN_SOURCES
from app.ingestion.enrichment import enrich_all
from app.models import QueryLog


app = FastAPI(title="Factory Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this for production
    allow_methods=["*"],
    allow_headers=["*"],
)


# Tables are managed by Alembic — run `alembic upgrade head` to create/update them.
# See migrations/versions/.


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Stream the agent's answer back as plain text chunks."""
    def generate():
        for chunk in agent.run(question=req.question, db=db):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")


# ── Ingest ────────────────────────────────────────────────────────────────────

def _result_to_dict(result):
    return {
        "path": result.path,
        "status": result.status,
        "kind": result.kind,
        "file_id": result.file_id,
        "xlsx_cells": result.xlsx_cells,
        "pdf_pages": result.pdf_pages,
        "pdf_table_cells": result.pdf_table_cells,
        "production_rows": result.production_rows,
        "downtime_rows": result.downtime_rows,
        "daily_reports": result.daily_reports,
        "error": result.error,
    }


@app.post("/ingest")
def ingest(
    source: str = Query(default="factory", description=f"Data source: {' | '.join(KNOWN_SOURCES)}"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload one xlsx or pdf file and ingest it into the database.

    Every cell of every xlsx file goes into raw_xlsx_cells; every page of every
    pdf goes into raw_pdf_pages. Files matching the production template ALSO
    populate production_shift / downtime / daily_report.

    Idempotent: re-uploading the same file (same SHA-256) returns status='skipped'.
    """
    if not is_known_source(source):
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source '{source}'. Known sources: {list(KNOWN_SOURCES)}",
        )

    suffix = Path(file.filename).suffix.lower()
    if suffix not in {".xlsx", ".xlsm", ".xls", ".pdf"}:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {suffix!r}")

    # Save the uploaded file to a temp location so the orchestrator can open it.
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = ingest_file(db, tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    # Replace the temp path with the original filename for the response.
    result.path = file.filename or result.path

    if result.status == "error":
        raise HTTPException(status_code=422, detail=_result_to_dict(result))

    return _result_to_dict(result)


@app.post("/ingest/scan")
def ingest_scan(db: Session = Depends(get_db)):
    """
    Walk the configured factory data folder and ingest every xlsx/pdf found.

    Files already ingested (matched by SHA-256 in raw_files) are skipped — so
    this endpoint is safe to call repeatedly as new files are dropped into the
    folder. Returns per-file status plus aggregate counts.
    """
    root = settings.factory_data_dir
    if not os.path.isdir(root):
        raise HTTPException(
            status_code=404,
            detail=f"Factory data folder not found: {root}. "
                   f"Mount your data into the backend container at this path.",
        )

    results = scan_folder(db, root)

    summary = {
        "root": root,
        "files_seen": len(results),
        "files_new": sum(1 for r in results if r.status == "ok"),
        "files_skipped": sum(1 for r in results if r.status == "skipped"),
        "files_failed": sum(1 for r in results if r.status == "error"),
        "xlsx_cells_inserted": sum(r.xlsx_cells for r in results),
        "pdf_pages_inserted": sum(r.pdf_pages for r in results),
        "pdf_table_cells_inserted": sum(r.pdf_table_cells for r in results),
        "production_rows_added": sum(r.production_rows for r in results),
        "downtime_rows_added": sum(r.downtime_rows for r in results),
        "daily_reports_added": sum(r.daily_reports for r in results),
        "files": [_result_to_dict(r) for r in results],
    }
    return summary


@app.post("/ingest/enrich")
def enrich(db: Session = Depends(get_db)):
    """Run LLM enrichment on downtime rows that haven't been processed yet."""
    updated = enrich_all(db)
    return {"rows_enriched": updated}


# ── Query history ─────────────────────────────────────────────────────────────

@app.get("/history")
def history(limit: int = Query(default=20, le=200), db: Session = Depends(get_db)):
    """Return the last N entries from query_log, newest first."""
    rows = db.query(QueryLog).order_by(QueryLog.asked_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "asked_at": r.asked_at,
            "question": r.question,
            "answer": r.answer,
            "llm_provider": r.llm_provider,
            "tool_calls": r.tool_calls,
        }
        for r in rows
    ]
