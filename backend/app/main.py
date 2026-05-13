"""
FastAPI application entry point.

Routes:
  POST /chat     — send a question, get a streaming answer from the agent
  GET  /history  — last N query log entries (for debugging)
  GET  /health   — liveness check

Interactive API docs:
  - Swagger UI: http://localhost:8000/docs
  - ReDoc:      http://localhost:8000/redoc
  - OpenAPI:    http://localhost:8000/openapi.json
"""
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Literal

from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.seed import seed_admin
from app.config import settings
from app.database import SessionLocal, get_db
import app.agent as agent
from app.models import QueryLog


log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Run on app startup: seed admin user if `users` table is empty."""
    db = SessionLocal()
    try:
        seed_admin(db, username=settings.admin_username, password=settings.admin_password)
    except Exception:  # noqa: BLE001 — seed must never crash the app
        log.exception("admin seed failed")
    finally:
        db.close()
    yield


API_DESCRIPTION = """
AI-powered analytics platform for an Iranian iron concentrate factory.

The backend exposes a small HTTP surface:

* **POST `/chat`** — ask a natural-language question; the LLM agent writes SQL
  against the factory database and streams back NDJSON events (text chunks,
  tool calls, errors).
* **GET `/history`** — recent `query_log` entries, newest first.
* **GET `/health`** — liveness probe.

The agent loop, available tools, and database schema docs live in
`backend/app/agent.py` and `backend/app/schema_docs/`.
"""


tags_metadata = [
    {"name": "chat", "description": "Streaming LLM agent endpoints."},
    {"name": "history", "description": "Audit trail of past agent questions and answers."},
    {"name": "system", "description": "Health and liveness checks."},
]


app = FastAPI(
    title="Factory Dashboard API",
    description=API_DESCRIPTION,
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this for production
    allow_methods=["*"],
    allow_headers=["*"],
)


# Tables are managed by Alembic — run `alembic upgrade head` to create/update them.
# See migrations/versions/.


# ── Schemas ──────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: Literal["ok"] = Field(..., description="Always 'ok' when the service is up.")

    model_config = {"json_schema_extra": {"example": {"status": "ok"}}}


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        description="Natural-language question, in English or Persian.",
        examples=["How many downtime events are there in 1405?"],
    )
    mode: Literal["simple", "deep"] = Field(
        default="simple",
        description=(
            "`simple` — SQL-only agent (fast). "
            "`deep` — research agent with python_exec + persistent memory."
        ),
    )


class HistoryEntry(BaseModel):
    id: int
    asked_at: datetime | None = Field(None, description="UTC timestamp when the question was asked.")
    question: str
    answer: str | None = None
    llm_provider: str | None = Field(None, description="e.g. 'anthropic', 'openai', 'ollama', 'deepseek'.")
    tool_calls: Any | None = Field(None, description="Recorded tool-call trace for the request.")
    agent_mode: Literal["simple", "deep"] | None = None


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get(
    "/health",
    tags=["system"],
    summary="Liveness check",
    response_model=HealthResponse,
)
def health():
    """Return `{"status": "ok"}` if the API process is running."""
    return {"status": "ok"}


@app.post(
    "/chat",
    tags=["chat"],
    summary="Ask the agent a question (streams NDJSON)",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Streaming NDJSON events — one JSON object per line.",
            "content": {
                "application/x-ndjson": {
                    "example": (
                        '{"type": "text", "content": "Looking up..."}\n'
                        '{"type": "tool_call", "name": "execute_sql", "input": {"sql": "SELECT count(*) FROM factory_downtimes"}}\n'
                        '{"type": "tool_result", "name": "execute_sql", "output": [[214]]}\n'
                        '{"type": "text", "content": "There are 214 downtime events."}\n'
                    )
                }
            },
        }
    },
)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Stream the agent's events back as NDJSON (one JSON object per line).

    Event shapes — see `app.agent.run` for details. The frontend parses each
    line and renders text / tool-call cards / errors accordingly.
    """
    def generate():
        for event in agent.run(question=req.question, db=db, mode=req.mode):
            yield json.dumps(event, ensure_ascii=False, default=str) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@app.get(
    "/history",
    tags=["history"],
    summary="Recent agent questions and answers",
    response_model=list[HistoryEntry],
)
def history(
    limit: int = Query(
        default=20,
        le=200,
        ge=1,
        description="How many entries to return (max 200). Newest first.",
    ),
    db: Session = Depends(get_db),
):
    """Return the last N entries from `query_log`, newest first."""
    rows = db.query(QueryLog).order_by(QueryLog.asked_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "asked_at": r.asked_at,
            "question": r.question,
            "answer": r.answer,
            "llm_provider": r.llm_provider,
            "tool_calls": r.tool_calls,
            "agent_mode": r.agent_mode,
        }
        for r in rows
    ]
