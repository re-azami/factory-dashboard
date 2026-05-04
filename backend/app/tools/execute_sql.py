import json
from sqlalchemy import text

from app.database import engine_ro

# Tool definition in Anthropic format (also converted to OpenAI format in openai_compat.py)
TOOL_DEFINITION = {
    "name": "execute_sql",
    "description": (
        "Run a read-only SQL SELECT query against the factory database. "
        "Use this to answer questions about production data, downtime events, and trends. "
        "Always use SELECT — INSERT, UPDATE, DELETE, and DROP are blocked. "
        "Return column names and all rows."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "A valid PostgreSQL SELECT query.",
            }
        },
        "required": ["query"],
    },
}


def run(query: str) -> str:
    """
    Execute a SELECT query using the read-only database connection.
    Returns results as a JSON string so the LLM can read them easily.
    Blocks any query that is not a SELECT.
    """
    stripped = query.strip().upper()
    if not stripped.startswith("SELECT"):
        return json.dumps({"error": "Only SELECT queries are allowed."})

    try:
        with engine_ro.connect() as conn:
            result = conn.execute(text(query))
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

        # Limit to 500 rows to avoid flooding the LLM context
        truncated = len(rows) > 500
        if truncated:
            rows = rows[:500]

        output = {"columns": columns, "rows": rows, "row_count": len(rows)}
        if truncated:
            output["warning"] = "Result was truncated to 500 rows."

        return json.dumps(output, ensure_ascii=False, default=str)

    except Exception as exc:
        return json.dumps({"error": str(exc)})
