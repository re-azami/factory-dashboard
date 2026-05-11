"""
Agent loop — built on LangChain's `create_agent` (LangGraph runtime).

The graph alternates between the chat model and the tool nodes until the
model produces a final answer (or `MAX_ITERATIONS` is reached). We stream the
intermediate AIMessage / ToolMessage events so the FastAPI endpoint can yield
chunks to the client.

To add a new tool: import it, append it to `TOOLS`.
"""
import json
from typing import Generator

from sqlalchemy.orm import Session
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain.agents import create_agent
from langgraph.errors import GraphRecursionError

from app.config import settings
from app.llm import get_chat_model
import app.tools.execute_sql as sql_tool
import app.tools.semantic_search as search_tool

from app.query_log.log import save as save_log

MAX_ITERATIONS = 8  # max number of LLM turns before we bail out

# ── Tool registry ─────────────────────────────────────────────────────────────

TOOLS = [
    sql_tool.execute_sql,
    search_tool.semantic_search,
]

# ── System prompt ─────────────────────────────────────────────────────────────

def _build_system_prompt() -> str:
    """Load schema docs from markdown files and include them in the system prompt."""
    import os

    docs_dir = os.path.join(os.path.dirname(__file__), "schema_docs")
    schema_text = ""
    for fname in sorted(os.listdir(docs_dir)):
        if fname.endswith(".md"):
            with open(os.path.join(docs_dir, fname), encoding="utf-8") as f:
                schema_text += f.read() + "\n\n"

    return f"""You are a data assistant for an iron concentrate factory.
You have access to a PostgreSQL database that contains daily production reports.
Answer the user's question by querying the database with the tools provided.

Always:
- Show the key numbers in your answer, not just "I ran a query"
- If the question is in Persian, answer in Persian
- If a query returns no rows, say so clearly
- Round percentages to 2 decimal places

{schema_text}
"""

# ── Agent loop ────────────────────────────────────────────────────────────────

def run(question: str, db: Session) -> Generator[str, None, None]:
    """Run the agent loop and yield text chunks for streaming.

    Saves the full Q&A to query_log when done.
    """
    model = get_chat_model()
    system = _build_system_prompt()

    graph = create_agent(model, tools=TOOLS, system_prompt=system)

    # LangGraph counts every node visit toward `recursion_limit`. One LLM turn
    # is roughly two nodes (agent + tools), plus a final agent step, so allow
    # 2*N + 1 to give the model N tool-calling iterations.
    config = {"recursion_limit": MAX_ITERATIONS * 2 + 1}

    tool_calls_log: list[dict] = []
    final_answer = ""
    seen_msg_ids: set[str] = set()

    try:
        for event in graph.stream(
            {"messages": [HumanMessage(content=question)]},
            config=config,
            stream_mode="values",
        ):
            for msg in event.get("messages", []):
                key = getattr(msg, "id", None) or id(msg)
                if key in seen_msg_ids:
                    continue
                seen_msg_ids.add(key)

                if isinstance(msg, AIMessage):
                    text = _extract_text(msg.content)
                    if text:
                        yield text
                        if not msg.tool_calls:
                            final_answer = text
                    for tc in msg.tool_calls or []:
                        yield f"\n\n[tool: {tc['name']}]\n"
                        tool_calls_log.append({
                            "tool": tc["name"],
                            "input": tc.get("args", {}),
                            "output": None,
                            "_id": tc.get("id"),
                        })

                elif isinstance(msg, ToolMessage):
                    _fill_tool_output(tool_calls_log, msg)

    except GraphRecursionError:
        for entry in tool_calls_log:
            entry.pop("_id", None)
        save_log(
            db=db,
            question=question,
            tool_calls=tool_calls_log,
            answer="[max iterations reached]",
            llm_provider=settings.llm_provider,
        )
        yield "\n\n[Reached maximum tool iterations. Please rephrase your question.]"
        return

    for entry in tool_calls_log:
        entry.pop("_id", None)

    save_log(
        db=db,
        question=question,
        tool_calls=tool_calls_log,
        answer=final_answer,
        llm_provider=settings.llm_provider,
    )


def _extract_text(content) -> str:
    """AIMessage.content can be a plain string or a list of content blocks
    (Anthropic returns the latter when text and tool_use are interleaved)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return ""


def _fill_tool_output(log: list[dict], msg: ToolMessage) -> None:
    """Attach the tool result to its matching entry in the log."""
    tool_call_id = getattr(msg, "tool_call_id", None)
    result = msg.content if isinstance(msg.content, str) else json.dumps(msg.content, default=str)

    if tool_call_id:
        for entry in log:
            if entry.get("_id") == tool_call_id and entry["output"] is None:
                entry["output"] = result
                return

    for entry in reversed(log):
        if entry["output"] is None and entry["tool"] == getattr(msg, "name", entry["tool"]):
            entry["output"] = result
            return
