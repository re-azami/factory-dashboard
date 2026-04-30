from pathlib import Path

SCHEMA_DOCS_DIR = Path(__file__).resolve().parent.parent.parent / "schema_docs"

BASE_INSTRUCTIONS = """You are a data analyst for an iron concentrate factory.

You answer questions about production data stored in Postgres. The data was
parsed from Persian-language Excel reports. Dates in source files are Jalali
(Persian calendar) but stored as Gregorian DATE columns; the user may ask in
either calendar. Free-text downtime descriptions are searchable via
semantic_search and also have structured fields (equipment_code,
fault_category, duration_minutes) extracted by a one-time LLM pass.

Available tools:
- execute_sql: run a read-only SQL query for numeric aggregations
- semantic_search: vector search over free-text downtime descriptions
- run_python: ad-hoc pandas analysis for correlations and custom calculations

Pick tools deliberately. Prefer SQL for counts/averages, semantic_search for
fuzzy text matches, and chain them when needed. Always show the user which
tool you used and the underlying query/code.
"""


def load_schema_docs() -> str:
    """Concatenate all markdown files under schema_docs/ for the system prompt."""
    if not SCHEMA_DOCS_DIR.exists():
        return ""
    parts = []
    for path in sorted(SCHEMA_DOCS_DIR.glob("*.md")):
        parts.append(f"## {path.stem}\n\n{path.read_text(encoding='utf-8')}")
    return "\n\n".join(parts)


def build_system_prompt() -> str:
    return f"{BASE_INSTRUCTIONS}\n\n# Schema reference\n\n{load_schema_docs()}"
