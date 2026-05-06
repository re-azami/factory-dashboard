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
os.environ.setdefault("EMBEDDINGS_URL", "http://embeddings:8001")

# Make `app` importable from backend/ when pytest is run from anywhere.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import pytest  # noqa: E402


@pytest.fixture
def in_memory_db():
    """Create an in-memory SQLite database with all tables for unit tests."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.database import Base
    import app.models  # noqa: F401  registers the tables on Base.metadata

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()
