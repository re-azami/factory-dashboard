"""Frontend-agnostic NDJSON contract check for the backend /chat endpoint.

This test lives under tests/e2e (rather than backend/tests) because it needs
the real FastAPI service on :8000 running against a real database with the
configured LLM provider — i.e. the live stack the rest of the e2e suite
already requires. It does NOT exercise any frontend; it asserts only that
the streaming NDJSON contract emitted by POST /chat still produces a
``tool_start`` event for ``execute_sql`` and at least one ``text`` event.
"""
import json

import httpx


CHAT_QUESTION = "How many downtime events are there?"


def test_backend_chat_endpoint_streams_ndjson(backend_url):
    """Backend /chat streams NDJSON events; verify we get at least one tool_start for execute_sql."""
    saw_tool_start = False
    saw_text = False
    with httpx.stream(
        "POST",
        f"{backend_url}/chat",
        json={"question": CHAT_QUESTION},
        timeout=120.0,
    ) as r:
        assert r.status_code == 200, r.read()
        for line in r.iter_lines():
            if not line.strip():
                continue
            event = json.loads(line)
            if event.get("type") == "tool_start" and event.get("name") == "execute_sql":
                saw_tool_start = True
            if event.get("type") == "text":
                saw_text = True
    assert saw_tool_start, "Agent never invoked execute_sql"
    assert saw_text, "Agent never emitted any text"
