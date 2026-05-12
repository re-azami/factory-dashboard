import json
from sqlalchemy import text
from langchain_core.tools import tool

from app.database import engine_ro


READ_ONLY_ERROR_MESSAGE = "Only read-only queries are allowed."


def run(query: str) -> str:
    """
    Execute a query using the read-only database connection.

    Safety is enforced by Postgres itself: we issue `SET TRANSACTION READ ONLY`
    before the query, so any data-modifying statement (including ones hidden
    inside a CTE with RETURNING) raises SQLSTATE 25006 and is reported back
    as a friendly error. No string-based prefix matching is involved.
    """
    try:
        with engine_ro.connect() as conn:
            conn.execute(text("SET TRANSACTION READ ONLY"))
            result = conn.execute(text(query))
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

        truncated = len(rows) > 500
        if truncated:
            rows = rows[:500]

        output = {"columns": columns, "rows": rows, "row_count": len(rows)}
        if truncated:
            output["warning"] = "Result was truncated to 500 rows."

        return json.dumps(output, ensure_ascii=False, default=str)

    except Exception as exc:
        msg = str(exc)
        if "read-only transaction" in msg.lower():
            return json.dumps({"error": READ_ONLY_ERROR_MESSAGE})
        return json.dumps({"error": msg})


@tool("execute_sql")
def execute_sql(query: str) -> str:
    """Run a read-only SQL query against the factory database.

    The transaction is set to READ ONLY at the database level, so SELECT, CTE
    (WITH ... SELECT), VALUES, and other read-only constructs are all allowed.
    INSERT / UPDATE / DELETE / DDL — including writes hidden inside CTEs — are
    rejected by Postgres.

    Returns a JSON string with column names and rows (truncated to 500).

    Args:
        query: A read-only PostgreSQL query.
    """
    return run(query)
