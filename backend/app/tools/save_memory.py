"""save_memory tool — persists a durable lesson the deep agent has learned.

Only exposed in 'deep' mode. The agent calls this when it discovers something
worth remembering across sessions: a useful SQL recipe, a user preference, an
insight about the data, or a domain glossary entry.

The agent should NOT store raw daily data — the underlying production tables
are refreshed every day, so anything tied to a specific date is stale within
24 hours. Encode only patterns and rules of thumb.
"""
import json

from langchain_core.tools import tool

from app.database import SessionLocal
from app.models import AgentMemory


ALLOWED_KINDS = ("insight", "preference", "recipe", "glossary")


def run(kind: str, content: str, source_question: str | None = None) -> str:
    if kind not in ALLOWED_KINDS:
        return json.dumps({
            "error": f"kind must be one of {ALLOWED_KINDS}, got {kind!r}",
        })
    content = (content or "").strip()
    if not content:
        return json.dumps({"error": "content is empty"})

    session = SessionLocal()
    try:
        entry = AgentMemory(kind=kind, content=content, source_question=source_question)
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return json.dumps({"saved_id": entry.id, "kind": entry.kind})
    except Exception as exc:
        session.rollback()
        return json.dumps({"error": str(exc)})
    finally:
        session.close()


@tool("save_memory")
def save_memory(kind: str, content: str, source_question: str | None = None) -> str:
    """Persist a durable lesson so the deep agent can use it in future chats.

    Call this only when you discover something that will still be true tomorrow:
    a useful SQL pattern, a user preference, a domain glossary entry, or a
    structural insight about the data. Do NOT save specific numbers, daily
    totals, or anything tied to a single date — the database is refreshed every
    day and those facts will be stale.

    Args:
        kind: One of 'insight', 'preference', 'recipe', 'glossary'.
        content: A short, self-contained note (1–3 sentences).
        source_question: The user question that prompted this lesson, for traceability.
    """
    return run(kind, content, source_question)
