"""
FastAPI application entry point.

Routes:
  POST /chat          — send a question, get a streaming answer from the agent
  POST /ingest        — upload an Excel file for ingestion
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

from app.database import get_db
import app.agent as agent
from app.ingestion.registry import get_parser
from app.ingestion.enrichment import enrich_all
from app.models import DailyReport, ProductionShift, Downtime, RawSheetCells, QueryLog


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

@app.post("/ingest")
def ingest(
    source: str = Query(description="Data source folder: factory | kitchen | store | weighing | sales"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an Excel file and ingest it into the database.
    The 'source' query parameter tells the system which parser to use.
    Example: POST /ingest?source=factory
    """
    parser = get_parser(source)
    if parser is None:
        raise HTTPException(status_code=400, detail=f"Unknown source '{source}'. Known sources: factory")

    # Save the uploaded file to a temp location so the parser can open it
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = parser(tmp_path)
    finally:
        os.unlink(tmp_path)

    if result.sheets_parsed == 0:
        raise HTTPException(status_code=422, detail={"errors": result.errors})

    # 1. Insert daily_report rows (skip if date already exists)
    for header in result.daily_reports:
        exists = db.query(DailyReport).filter_by(report_date=header["report_date"]).first()
        if not exists:
            db.add(DailyReport(**header))

    # 2. Insert production_shift rows (unique on date + shift + line)
    for row in result.production_rows:
        exists = db.query(ProductionShift).filter_by(
            report_date=row["report_date"],
            shift=row["shift"],
            line=row["line"],
        ).first()
        if not exists:
            db.add(ProductionShift(**row))

    # 3. Insert downtime rows (always append — events have no natural unique key)
    for row in result.downtime_rows:
        db.add(Downtime(**row))

    # 4. Insert raw_sheet_cells (one per sheet, skip if date already dumped)
    for raw in result.raw_cells:
        exists = db.query(RawSheetCells).filter_by(
            report_date=raw["report_date"],
            sheet_name=raw["sheet_name"],
        ).first()
        if not exists:
            db.add(RawSheetCells(**raw))

    db.commit()

    return {
        "sheets_parsed": result.sheets_parsed,
        "sheets_failed": result.sheets_failed,
        "daily_reports_added": len(result.daily_reports),
        "production_rows_added": len(result.production_rows),
        "downtime_rows_added": len(result.downtime_rows),
        "raw_cell_dumps_added": len(result.raw_cells),
        "errors": result.errors,
    }


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
