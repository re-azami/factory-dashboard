from sqlalchemy.orm import Session

from app.models import QueryLog


def save(
    db: Session,
    question: str,
    tool_calls: list[dict],
    answer: str,
    llm_provider: str,
) -> None:
    """Save a completed Q&A turn to the query_log table."""
    entry = QueryLog(
        question=question,
        tool_calls=tool_calls,
        answer=answer,
        llm_provider=llm_provider,
    )
    db.add(entry)
    db.commit()
