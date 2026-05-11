"""Tests for the FastAPI HTTP endpoints in app.main."""
import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.main import app as fastapi_app
from app.database import Base, get_db
import app.models  # noqa: F401  side-effect: registers tables on Base.metadata


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()
    engine.dispose()


class TestHealth:
    def test_health_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestChat:
    def test_chat_streams_ndjson_events(self, client):
        def fake_run(question, db, mode="simple"):
            yield {"type": "text", "content": "Hello "}
            yield {"type": "text", "content": "world."}

        with patch("app.main.agent.run", side_effect=fake_run):
            resp = client.post("/chat", json={"question": "Hi?"})

        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("application/x-ndjson")

        lines = [ln for ln in resp.text.split("\n") if ln]
        events = [json.loads(ln) for ln in lines]
        assert events == [
            {"type": "text", "content": "Hello "},
            {"type": "text", "content": "world."},
        ]

    def test_chat_preserves_persian_in_events(self, client):
        """ensure_ascii=False must be set so Persian characters survive."""
        def fake_run(question, db, mode="simple"):
            yield {"type": "text", "content": "میانگین ۶۶.۹۹٪"}

        with patch("app.main.agent.run", side_effect=fake_run):
            resp = client.post("/chat", json={"question": "Hi?"})

        event = json.loads(resp.text.strip())
        assert event["content"] == "میانگین ۶۶.۹۹٪"

    def test_chat_requires_question(self, client):
        resp = client.post("/chat", json={})
        assert resp.status_code == 422

    def test_chat_defaults_to_simple_mode(self, client):
        captured = {}

        def fake_run(question, db, mode="simple"):
            captured["mode"] = mode
            yield {"type": "text", "content": "ok"}

        with patch("app.main.agent.run", side_effect=fake_run):
            client.post("/chat", json={"question": "Hi?"})

        assert captured["mode"] == "simple"

    def test_chat_forwards_deep_mode(self, client):
        captured = {}

        def fake_run(question, db, mode="simple"):
            captured["mode"] = mode
            yield {"type": "text", "content": "ok"}

        with patch("app.main.agent.run", side_effect=fake_run):
            client.post("/chat", json={"question": "Hi?", "mode": "deep"})

        assert captured["mode"] == "deep"


class TestHistory:
    def test_empty_history(self, client):
        resp = client.get("/history")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_recent_queries(self, client):
        from app.query_log.log import save

        get_db_gen = fastapi_app.dependency_overrides[get_db]()
        db = next(get_db_gen)
        try:
            save(db=db, question="q1", tool_calls=[], answer="a1", llm_provider="anthropic", agent_mode="simple")
            save(db=db, question="q2", tool_calls=[{"tool": "execute_sql"}], answer="a2", llm_provider="openai", agent_mode="deep")
        finally:
            db.close()

        resp = client.get("/history?limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        questions = {d["question"] for d in data}
        providers = {d["llm_provider"] for d in data}
        modes = {d["agent_mode"] for d in data}
        assert questions == {"q1", "q2"}
        assert providers == {"anthropic", "openai"}
        assert modes == {"simple", "deep"}

    def test_limit_capped_at_200(self, client):
        resp = client.get("/history?limit=999")
        assert resp.status_code == 422
