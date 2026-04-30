from sqlalchemy import text

from app.db.embeddings import embed_text
from app.db.session import readonly_engine

semantic_search_schema = {
    "name": "semantic_search",
    "description": (
        "Vector search over free-text columns (e.g. downtime descriptions). "
        "Returns the top-k rows whose text is semantically closest to the query. "
        "Use for fuzzy matches like 'thickener mudding' or 'electrical fault'."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "table": {"type": "string", "description": "e.g. 'downtime'"},
            "column": {"type": "string", "description": "embedded text column"},
            "k": {"type": "integer", "default": 20},
        },
        "required": ["query", "table", "column"],
    },
}


def semantic_search(query: str, table: str, column: str, k: int = 20) -> dict:
    vec = embed_text(query)
    sql = text(
        f"""
        SELECT *, 1 - ({column}_embedding <=> :vec) AS similarity
        FROM {table}
        ORDER BY {column}_embedding <=> :vec
        LIMIT :k
        """
    )
    with readonly_engine().connect() as conn:
        rows = [dict(r._mapping) for r in conn.execute(sql, {"vec": vec, "k": k})]
    return {"row_count": len(rows), "rows": rows}
