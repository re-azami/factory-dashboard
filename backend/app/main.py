"""
FastAPI application entry point.

Routes:
  POST /chat     — send a question, get a streaming answer from the agent
  GET  /history  — last N query log entries (for debugging)
  GET  /health   — liveness check
"""
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
import app.agent as agent
from app.models import QueryLog


app = FastAPI(title="Factory Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this for production
    allow_methods=["*"],
    allow_headers=["*"],
)


# Tables are managed by Alembic — run `alembic upgrade head` to create/update them.
# See migrations/versions/.


@app.get("/health")
def health():
    return {"status": "ok"}


class ChatRequest(BaseModel):
    question: str
    mode: str = "simple"   # 'simple' | 'deep'


@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Stream the agent's answer back as plain text chunks."""
    def generate():
        for chunk in agent.run(question=req.question, db=db, mode=req.mode):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")


@app.get("/history")
def history(limit: int = Query(default=20, le=200), db: Session = Depends(get_db)):
    """Return the last N entries from query_log, newest first."""
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
