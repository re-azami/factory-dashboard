"""Persists every Q + tool calls + final answer.

After a few hundred rows this becomes the evaluation set for prompt changes.
"""

import json
from datetime import datetime, timezone

from sqlalchemy import insert

from app.db.models import QueryLog
from app.db.session import rw_engine


def log_turn(
    conversation_id: str | None,
    question: str,
    tool_calls: list[dict],
    answer_blocks: list[str],
) -> None:
    stmt = insert(QueryLog).values(
        conversation_id=conversation_id,
        asked_at=datetime.now(timezone.utc),
        question=question,
        tool_calls_json=json.dumps(tool_calls, default=str),
        answer="\n\n".join(answer_blocks),
    )
    try:
        with rw_engine().begin() as conn:
            conn.execute(stmt)
    except Exception:
        # Logging failures must never break the chat path.
        pass
