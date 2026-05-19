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
    # Redirect agent.run's save-session opener to the test engine so production
    # code paths land in the in-memory SQLite instead of the real DB.
    patcher = patch("app.agent._open_save_session", lambda: TestSession())
    patcher.start()
    # The FastAPI lifespan calls SessionLocal() to run the admin seed; point
    # it at the test engine so seeding sees the tables this fixture created.
    lifespan_patcher = patch("app.main.SessionLocal", TestSession)
    lifespan_patcher.start()
    try:
        with TestClient(fastapi_app) as c:
            yield c
    finally:
        lifespan_patcher.stop()
        patcher.stop()
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


class TestChatPersistsAcrossCalls:
    def test_two_sequential_chats_both_logged(self, client):
        """Regression: the FastAPI-injected db session is closed before the
        StreamingResponse generator finishes, so the original implementation
        only persisted the first chat. agent.run must use its own session."""
        def fake_run(question, db, mode="simple"):
            from app.query_log.log import save
            from app.agent import _open_save_session
            yield {"type": "text", "content": f"answer to {question}"}
            s = _open_save_session()
            try:
                save(
                    db=s,
                    question=question,
                    tool_calls=[],
                    answer=f"answer to {question}",
                    llm_provider="anthropic",
                    agent_mode=mode,
                )
            finally:
                s.close()

        with patch("app.main.agent.run", side_effect=fake_run):
            assert client.post("/chat", json={"question": "q1"}).status_code == 200
            assert client.post("/chat", json={"question": "q2"}).status_code == 200

        hist = client.get("/history").json()
        assert {h["question"] for h in hist} == {"q1", "q2"}


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


class TestCORS:
    """Edge case 20: CORS preflight must allow the configured frontend origin
    and refuse anything else. Edge case 21: health still works after the
    tightened middleware."""

    def test_preflight_from_allowed_origin_is_echoed(self, client):
        resp = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:4200",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        # FastAPI CORS middleware returns 200 on preflight when origin is allowed.
        assert resp.status_code == 200
        assert resp.headers.get("access-control-allow-origin") == "http://localhost:4200"

    def test_preflight_from_disallowed_origin_is_not_echoed(self, client):
        resp = client.options(
            "/health",
            headers={
                "Origin": "http://evil.example",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        # The CORS middleware must NOT echo the evil origin back. (Status may
        # be 400 from Starlette's CORS or 200 with the header absent; either
        # way, the disallowed origin must not appear in Allow-Origin.)
        assert resp.headers.get("access-control-allow-origin") != "http://evil.example"

    def test_health_still_works_after_cors_tightening(self, client):
        """Edge case 21: a plain GET /health (no Origin header) still returns 200."""
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestAuthRoutesRegistered:
    """Sanity: /auth/login, /auth/logout, /auth/me must be reachable (not 404)."""

    def test_auth_routes_present_in_app(self, client):
        paths = {r.path for r in client.app.routes}
        assert "/auth/login" in paths
        assert "/auth/logout" in paths
        assert "/auth/me" in paths

    def test_auth_login_is_not_404(self, client):
        # Empty body → 422 (Pydantic validation), not 404 — proves route exists.
        resp = client.post("/auth/login", json={})
        assert resp.status_code != 404
        assert resp.status_code == 422

    def test_auth_logout_is_not_404(self, client):
        resp = client.post("/auth/logout")
        assert resp.status_code != 404
        assert resp.status_code == 200

    def test_auth_me_is_not_404(self, client):
        # No token → 401, not 404 — proves the route is wired up.
        resp = client.get("/auth/me")
        assert resp.status_code != 404
        assert resp.status_code == 401
