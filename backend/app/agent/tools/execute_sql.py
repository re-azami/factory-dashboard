from sqlalchemy import text

from app.db.session import readonly_engine

execute_sql_schema = {
    "name": "execute_sql",
    "description": (
        "Execute a read-only SQL query against the factory Postgres database. "
        "Use for numeric aggregations, counts, group-bys, joins. The role is "
        "SELECT-only, so DML/DDL will fail."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "A single SELECT statement."},
        },
        "required": ["query"],
    },
}


def execute_sql(query: str) -> dict:
    with readonly_engine().connect() as conn:
        result = conn.execute(text(query))
        rows = [dict(r._mapping) for r in result.fetchmany(500)]
    return {"row_count": len(rows), "rows": rows}
