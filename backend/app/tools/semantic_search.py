"""
Semantic search over downtime.raw_text using pgvector cosine similarity.
This tool is activated in Phase 2 after embeddings are added to the DB.
In Phase 1 this file exists but the tool is not registered in agent.py.
"""
import json
import httpx
from sqlalchemy import text

from app.database import engine_ro
from app.config import settings

TOOL_DEFINITION = {
    "name": "semantic_search",
    "description": (
        "Search for downtime events that match a natural-language description. "
        "Use this when the question is about the *type* or *reason* for a stop, "
        "not a simple count or date filter. "
        "Returns the most similar downtime records from the database."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "A short description of the kind of failure to search for.",
            },
            "limit": {
                "type": "integer",
                "description": "Max number of results to return (default 10).",
                "default": 10,
            },
        },
        "required": ["query"],
    },
}


def run(query: str, limit: int = 10) -> str:
    """Embed the query, then find the closest downtime rows using pgvector."""
    try:
        # Get embedding from the self-hosted BGE-M3 server
        resp = httpx.post(f"{settings.embeddings_url}/embed", json={"text": query}, timeout=30)
        resp.raise_for_status()
        embedding = resp.json()["embedding"]

        vector_str = "[" + ",".join(str(x) for x in embedding) + "]"

        sql = f"""
            SELECT id, report_date, jalali_date, shift, line, raw_text,
                   equipment_code, fault_category, duration_minutes,
                   1 - (embedding <=> '{vector_str}'::vector) AS similarity
            FROM downtime
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> '{vector_str}'::vector
            LIMIT {int(limit)}
        """

        with engine_ro.connect() as conn:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

        return json.dumps({"columns": columns, "rows": rows}, ensure_ascii=False, default=str)

    except Exception as exc:
        return json.dumps({"error": str(exc)})
