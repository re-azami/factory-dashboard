"""
Enrichment: reads raw Persian downtime text and uses the LLM to extract
structured fields (equipment_code, fault_category).

Run this as a batch job after ingestion:
    POST /ingest/enrich
or call enrich_all() directly from a script.

Phase 2 also adds embedding generation here.
"""
import json
import re

from sqlalchemy.orm import Session

from app.models import Downtime
from app.llm import get_llm_client

EXTRACTION_PROMPT = """You are a data extraction assistant for a Persian-language factory report.

Extract the following fields from this downtime description text.
Return ONLY a valid JSON object with these exact keys:
- equipment_code: the equipment identifier code (e.g. "110MI02", "930FP01") — null if not mentioned
- fault_category: one of "electrical", "mechanical", "operational" — based on clues like برق=electrical, مکانیک=mechanical — null if unclear

Text: {text}

Return only JSON, nothing else."""


def _extract_one(text: str) -> dict:
    """Ask the LLM to extract structured fields from one downtime description."""
    client = get_llm_client()
    response = client.chat(
        system="You are a structured data extraction assistant. Return only valid JSON.",
        messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(text=text)}],
        tools=[],  # no tools needed for this task
        max_tokens=200,
    )
    try:
        # Strip any markdown code fences the model may add
        raw = re.sub(r"```[a-z]*", "", response.content).strip().strip("`")
        return json.loads(raw)
    except Exception:
        return {"equipment_code": None, "fault_category": None}


def enrich_all(db: Session) -> int:
    """
    Find all Downtime rows without equipment_code and enrich them.
    Returns the number of rows updated.
    """
    rows = db.query(Downtime).filter(Downtime.equipment_code.is_(None)).all()
    updated = 0

    for row in rows:
        if not row.raw_text:
            continue
        extracted = _extract_one(row.raw_text)
        row.equipment_code = extracted.get("equipment_code")
        row.fault_category = extracted.get("fault_category")
        updated += 1

    db.commit()
    return updated
