"""
Agent loop — built on LangChain's `create_agent` (LangGraph runtime).

The graph alternates between the chat model and the tool nodes until the
model produces a final answer (or `MAX_ITERATIONS` is reached). We stream the
intermediate AIMessage / ToolMessage events so the FastAPI endpoint can yield
chunks to the client.

Two modes are exposed:

  simple — 8 turns, tools = execute_sql + semantic_search. Quick lookups.
  deep   — 128 turns, tools = execute_sql + semantic_search + python_exec +
           save_memory. Loads prior agent_memory rows into the system prompt so
           the agent can build on previously-learned insights across sessions.

To add a new tool: import it, append it to the relevant tool list in MODES.
"""
import json
from typing import Any, Generator

from sqlalchemy.orm import Session
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain.agents import create_agent
from langgraph.errors import GraphRecursionError

from app.config import settings
from app.database import SessionLocal
from app.llm import get_chat_model
import app.tools.execute_sql as sql_tool
import app.tools.semantic_search as search_tool
import app.tools.save_memory as memory_tool
import app.tools.python_exec as python_tool
from app.models import AgentMemory

from app.query_log.log import save as save_log


def _open_save_session():
    """Open a fresh session for the final query_log write.

    The session FastAPI injects into /chat is closed when the route returns its
    StreamingResponse — before this generator finishes — so committing through
    it loses rows after the first request. Tests patch this helper to redirect
    saves into the in-memory test engine.
    """
    return SessionLocal()


# ── Mode registry ─────────────────────────────────────────────────────────────

SIMPLE_TOOLS = [sql_tool.execute_sql, search_tool.semantic_search]
DEEP_TOOLS = SIMPLE_TOOLS + [python_tool.python_exec, memory_tool.save_memory]

MODES: dict[str, dict] = {
    "simple": {"tools": SIMPLE_TOOLS, "max_iterations": 8},
    "deep":   {"tools": DEEP_TOOLS,   "max_iterations": 128},
}

# Back-compat alias for older tests / call sites.
TOOLS = SIMPLE_TOOLS
MAX_ITERATIONS = 8


# ── System prompt ─────────────────────────────────────────────────────────────

_BASE_PROMPT = """You are a data assistant for an iron concentrate factory.
You have access to a PostgreSQL database that contains daily production reports.
Answer the user's question by querying the database with the tools provided.

Always:
- Show the key numbers in your answer, not just "I ran a query"
- If the question is in Persian, answer in Persian
- If a query returns no rows, say so clearly
- Round percentages to 2 decimal places
"""

_DEEP_PROMPT_EXTRA = """
You are running in DEEP RESEARCH mode. You have up to 128 turns. Use them.

Approach:
- Break the question into sub-questions. Run a SQL query, read the result,
  refine, run another. Don't stop at the first answer if a follow-up would
  strengthen it.
- Use the python_exec tool for analysis SQL can't easily express (percentiles,
  rolling stats, multi-step pandas pipelines on small result sets).
- When you discover something durable — a useful SQL recipe, a user preference,
  a domain glossary entry, or a structural insight about the data — call
  save_memory so future chats benefit. NEVER save raw daily numbers; the
  database is refreshed every day and those facts go stale within 24 hours.
"""


def _load_memories(db: Session, limit: int = 50) -> str:
    """Pull recent durable lessons from agent_memory and format them for the prompt."""
    rows = (
        db.query(AgentMemory)
        .order_by(AgentMemory.created_at.desc())
        .limit(limit)
        .all()
    )
    if not rows:
        return ""

    grouped: dict[str, list[str]] = {}
    for r in rows:
        grouped.setdefault(r.kind, []).append(r.content)

    lines = ["", "=== Prior lessons (from agent_memory) ==="]
    for kind in ("insight", "preference", "glossary", "recipe"):
        items = grouped.get(kind)
        if not items:
            continue
        lines.append(f"\n[{kind}]")
        for item in items:
            lines.append(f"- {item}")
    lines.append("=== End prior lessons ===\n")
    return "\n".join(lines)


def _build_system_prompt(mode: str = "simple", db: Session | None = None) -> str:
    """Load schema docs from markdown files and include them in the system prompt.

    Deep mode additionally appends durable lessons saved by past runs.
    """
    import os

    docs_dir = os.path.join(os.path.dirname(__file__), "schema_docs")
    schema_text = ""
    for fname in sorted(os.listdir(docs_dir)):
        if fname.endswith(".md"):
            with open(os.path.join(docs_dir, fname), encoding="utf-8") as f:
                schema_text += f.read() + "\n\n"

    prompt = _BASE_PROMPT
    if mode == "deep":
        prompt += _DEEP_PROMPT_EXTRA
        if db is not None:
            prompt += _load_memories(db)

    return prompt + "\n" + schema_text


# ── Agent loop ────────────────────────────────────────────────────────────────

def run(question: str, db: Session, mode: str = "simple") -> Generator[dict[str, Any], None, None]:
    """Run the agent loop and yield structured events for streaming.

    Yields dicts of these shapes:
      {"type": "text", "content": str}
      {"type": "tool_start", "id": str, "name": str, "args": dict}
      {"type": "tool_end", "id": str | None, "name": str, "output": str}
      {"type": "error", "message": str}

    The /chat endpoint serializes each event as one NDJSON line; the frontend
    parses them into chat-message blocks (text + collapsible tool cards).

    Args:
        question: The user's question.
        db: SQLAlchemy session used for query_log and (in deep mode) memory recall.
        mode: 'simple' (8 turns, SQL + search) or 'deep' (128 turns, + python + memory).

    Saves the full Q&A to query_log when done.
    """
    if mode not in MODES:
        mode = "simple"
    spec = MODES[mode]
    tools = spec["tools"]
    max_iterations = spec["max_iterations"]

    model = get_chat_model(mode=mode)
    system = _build_system_prompt(mode=mode, db=db)

    graph = create_agent(model, tools=tools, system_prompt=system)

    # LangGraph counts every node visit toward `recursion_limit`. One LLM turn
    # is roughly two nodes (agent + tools), plus a final agent step, so allow
    # 2*N + 1 to give the model N tool-calling iterations.
    config = {"recursion_limit": max_iterations * 2 + 1}

    tool_calls_log: list[dict] = []
    final_answer = ""
    seen_msg_ids: set[str] = set()
    # Tool outputs emitted by _fill_tool_output need to be turned into tool_end
    # events. We track which entries have already been emitted by their _id.
    emitted_tool_end: set[str] = set()

    def _drain_tool_ends():
        """Emit a tool_end event for every tool entry whose output landed since
        the last drain. Called after each graph step."""
        for entry in tool_calls_log:
            tid = entry.get("_id")
            if entry.get("output") is not None and tid and tid not in emitted_tool_end:
                emitted_tool_end.add(tid)
                yield {
                    "type": "tool_end",
                    "id": tid,
                    "name": entry["tool"],
                    "output": entry["output"],
                }

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
                        yield {"type": "text", "content": text}
                        if not msg.tool_calls:
                            final_answer = text
                    for tc in msg.tool_calls or []:
                        tool_calls_log.append({
                            "tool": tc["name"],
                            "input": tc.get("args", {}),
                            "output": None,
                            "_id": tc.get("id"),
                        })
                        yield {
                            "type": "tool_start",
                            "id": tc.get("id"),
                            "name": tc["name"],
                            "args": tc.get("args", {}),
                        }

                elif isinstance(msg, ToolMessage):
                    _fill_tool_output(tool_calls_log, msg)
                    yield from _drain_tool_ends()

            # In case a tool result was attached without a matching ToolMessage
            # event in this iteration, flush anything pending.
            yield from _drain_tool_ends()

    except GraphRecursionError:
        final_answer = "[max iterations reached]"
        yield {
            "type": "error",
            "message": "Reached maximum tool iterations. Please rephrase your question.",
        }
    except Exception as exc:
        final_answer = f"[error: {exc}]"
        yield {"type": "error", "message": str(exc)}
    finally:
        for entry in tool_calls_log:
            entry.pop("_id", None)
        save_db = _open_save_session()
        try:
            save_log(
                db=save_db,
                question=question,
                tool_calls=tool_calls_log,
                answer=final_answer,
                llm_provider=settings.llm_provider,
                agent_mode=mode,
            )
        finally:
            save_db.close()


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
