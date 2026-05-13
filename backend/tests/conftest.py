"""
Shared pytest fixtures.

Sets safe defaults for env vars BEFORE the `app` package is imported,
so SQLAlchemy doesn't try to reach the real Docker postgres host.
"""
import os
import sys
from pathlib import Path

# Ensure env vars are set before any `app.*` import.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("DATABASE_URL_RO", "sqlite:///:memory:")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("LLM_PROVIDER", "anthropic")
os.environ.setdefault("LLM_MODEL", "claude-sonnet-4-6")
os.environ.setdefault("ANTHROPIC_MODEL_SIMPLE", "claude-sonnet-4-6")
os.environ.setdefault("ANTHROPIC_MODEL_DEEP", "claude-opus-4-7")
os.environ.setdefault("DEEPSEEK_API_KEY", "test-deepseek-key")
os.environ.setdefault("DEEPSEEK_MODEL_SIMPLE", "deepseek-v4-flash")
os.environ.setdefault("DEEPSEEK_MODEL_DEEP", "deepseek-v4-pro")
os.environ.setdefault("OPENAI_MODEL_SIMPLE", "gpt-4o")
os.environ.setdefault("OPENAI_MODEL_DEEP", "gpt-4o")
os.environ.setdefault("DEEP_THINKING_BUDGET_TOKENS", "16000")
os.environ.setdefault("DEEP_REASONING_EFFORT", "high")
os.environ.setdefault("EMBEDDINGS_URL", "http://embeddings:8001")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-do-not-use-in-prod")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:8501")

# Make `app` importable from backend/ when pytest is run from anywhere.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import pytest  # noqa: E402


# SQLite doesn't auto-increment BigInteger primary keys (only INTEGER PRIMARY KEY
# gets ROWID aliasing). The production schema uses BigInteger on Postgres where
# BIGSERIAL handles this. For tests, compile BigInteger as INTEGER on SQLite so
# PKs auto-generate. Safe because no test compares column types across dialects.
from sqlalchemy import BigInteger  # noqa: E402
from sqlalchemy.ext.compiler import compiles  # noqa: E402


@compiles(BigInteger, "sqlite")
def _sqlite_bigint_as_integer(_element, _compiler, **_kw):
    return "INTEGER"


@pytest.fixture
def in_memory_db():
    """Create an in-memory SQLite database with all tables for unit tests.

    Also redirects `agent._open_save_session` to the same engine so query_log
    writes performed inside `agent.run` land in this DB rather than the
    production `SessionLocal`.
    """
    from unittest.mock import patch

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool

    from app.database import Base
    import app.models  # noqa: F401  registers the tables on Base.metadata

    # StaticPool keeps every connection pointing at the same in-memory DB —
    # otherwise the save session opens a fresh :memory: instance and the test
    # query sees an empty table.
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    patcher = patch("app.agent._open_save_session", lambda: SessionLocal())
    patcher.start()
    try:
        yield session
    finally:
        patcher.stop()
        session.close()
        engine.dispose()
