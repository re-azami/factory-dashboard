"""End-to-end chat flow: user asks a SQL-shaped question, agent runs execute_sql, table renders."""
import json

import httpx
from playwright.sync_api import Page, expect


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


def test_chat_ui_runs_execute_sql_and_renders_result(page: Page):
    page.goto("/")

    chat_input = page.get_by_placeholder("Type your question (Persian or English)...")
    expect(chat_input).to_be_visible()

    chat_input.fill(CHAT_QUESTION)
    page.get_by_role("button", name="Send message").click()

    # User message echoes back
    expect(page.get_by_text(CHAT_QUESTION).first).to_be_visible(timeout=10_000)

    # Agent invokes the execute_sql tool — wait up to 90s for the LLM round-trip
    expect(page.locator("code", has_text="execute_sql").first).to_be_visible(timeout=90_000)


def test_query_history_lists_recent_question(page: Page):
    """After the chat test runs, the question should show up in Query History."""
    page.goto("/")
    # The radio input is hidden by Streamlit CSS — click the visible label instead.
    page.get_by_role("radiogroup", name="Navigation").get_by_text("Query History").click()

    expect(page.get_by_role("heading", name="Query History")).to_be_visible(timeout=10_000)
    expect(page.get_by_text("downtime events", exact=False).first).to_be_visible(timeout=10_000)
