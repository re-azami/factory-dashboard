"""
Semantic search over downtime descriptions using BGE-M3 + pgvector cosine
similarity. Queries all three downtime tables (factory / input_feed /
filter_press) and joins to line_shift_reports + shifts so each hit comes
with date/shift/line context.

Enabled in agent.py once the enrichment migration (002) has run and the
backfill script has populated embeddings.
"""
import json

import httpx
from sqlalchemy import text
from langchain_core.tools import tool

from app.config import settings
from app.database import engine_ro


_SEARCH_SQL = """
WITH hits AS (
    SELECT 'factory_downtimes' AS source, id, line_shift_report_id, description, duration,
           category, department_tag, equipment_codes, is_planned,
           1 - (embedding <=> CAST(:vec AS vector)) AS similarity
    FROM factory_downtimes
    UNION ALL
    SELECT 'input_feed_downtimes', id, line_shift_report_id, description, duration,
           category, department_tag, equipment_codes, is_planned,
           1 - (embedding <=> CAST(:vec AS vector))
    FROM input_feed_downtimes
    UNION ALL
    SELECT 'filter_press_downtimes', id, line_shift_report_id, description, duration,
           category, department_tag, equipment_codes, is_planned,
           1 - (embedding <=> CAST(:vec AS vector))
    FROM filter_press_downtimes
)
SELECT h.source, h.id, h.description, h.duration, h.category, h.department_tag,
       h.equipment_codes, h.is_planned,
       lsr.line_number, s.shift, s.date AS gregorian_date, s.jalali_date,
       ROUND(h.similarity::numeric, 4) AS similarity
FROM hits h
JOIN line_shift_reports lsr ON lsr.id = h.line_shift_report_id
JOIN shifts s ON s.id = lsr.shift_id
ORDER BY h.similarity DESC
LIMIT :limit
"""


def run(query: str, limit: int = 10) -> str:
    """Embed the query and return the closest downtime rows from all three tables."""
    try:
        resp = httpx.post(
            f"{settings.embeddings_url}/embed",
            json={"text": query},
            timeout=30,
        )
        resp.raise_for_status()
        embedding = resp.json()["embedding"]
        vec_str = "[" + ",".join(repr(float(x)) for x in embedding) + "]"

        with engine_ro.connect() as conn:
            result = conn.execute(
                text(_SEARCH_SQL).bindparams(vec=vec_str, limit=int(limit))
            )
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

        return json.dumps({"columns": columns, "rows": rows}, ensure_ascii=False, default=str)

    except Exception as exc:
        return json.dumps({"error": str(exc)})


@tool("semantic_search")
def semantic_search(query: str, limit: int = 10) -> str:
    """Search for downtime events that match a natural-language description.

    Use this when the question is about the *kind* or *cause* of a stop
    (e.g. 'thickener clogging', 'gearbox lubrication faults'), not a
    simple count or date filter. Searches across all three downtime
    tables (factory_downtimes, input_feed_downtimes, filter_press_downtimes)
    and returns the closest matches with their date/shift/line.

    Args:
        query: A short Persian or English description of the kind of failure to search for.
        limit: Max number of results to return (default 10).
    """
    return run(query, limit)
