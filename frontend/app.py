"""
Streamlit chat UI for the factory dashboard.

Pages:
  Chat        — ask questions, watch the agent think step-by-step, get answers
  History     — view past questions and answers (debug log)

The chat renders structured event streams from /chat:
  - text events  → markdown body of the assistant message
  - tool events  → collapsible cards with the SQL/code input and the result
                   (rendered as a dataframe when the tool returned tabular rows)
  - error events → red error banner

Each assistant message in session_state is stored as an ordered list of blocks
so reruns replay the same rich UI without falling back to plain-text markers.
"""
import json
import os

import httpx
import pandas as pd
import streamlit as st

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Factory Dashboard", layout="wide", page_icon="🏭")

# ── Sidebar navigation ────────────────────────────────────────────────────────
page = st.sidebar.radio("Navigation", ["💬 Chat", "📋 Query History"])


# ── Tool-card rendering helpers ───────────────────────────────────────────────

def _render_tool_input(name: str, args: dict) -> None:
    """Render the tool's input. SQL and Python get syntax highlighting."""
    if name == "execute_sql" and isinstance(args, dict) and "query" in args:
        st.markdown("**Query**")
        st.code(args["query"], language="sql")
        return
    if name == "python_exec" and isinstance(args, dict) and "code" in args:
        st.markdown("**Code**")
        st.code(args["code"], language="python")
        return
    if name == "semantic_search" and isinstance(args, dict) and "query" in args:
        st.markdown(f"**Search:** {args['query']}")
        if "limit" in args:
            st.caption(f"limit = {args['limit']}")
        return
    if name == "save_memory" and isinstance(args, dict):
        kind = args.get("kind", "?")
        content = args.get("content", "")
        st.markdown(f"**kind:** `{kind}`")
        st.markdown("**content**")
        st.code(content, language="markdown")
        if args.get("source_question"):
            st.caption(f"source_question: {args['source_question']}")
        return
    # Fallback for unknown tools
    if args:
        st.markdown("**Input**")
        st.json(args)


def _render_tool_output(output: str | None) -> None:
    """Render a tool result. Tabular outputs become a dataframe."""
    if output is None or output == "":
        st.caption("_(no output)_")
        return

    # Best-effort: outputs from our tools are JSON strings.
    parsed: object | None = None
    if isinstance(output, str):
        try:
            parsed = json.loads(output)
        except (ValueError, TypeError):
            parsed = None
    else:
        parsed = output

    st.markdown("**Result**")

    if isinstance(parsed, dict) and isinstance(parsed.get("rows"), list) and parsed["rows"]:
        # execute_sql / semantic_search shape: {"columns": [...], "rows": [...], "row_count": N}
        df = pd.DataFrame(parsed["rows"])
        st.dataframe(df, use_container_width=True, hide_index=True)
        meta_bits = []
        if "row_count" in parsed:
            meta_bits.append(f"{parsed['row_count']} rows")
        if parsed.get("warning"):
            meta_bits.append(f"⚠️ {parsed['warning']}")
        if meta_bits:
            st.caption(" · ".join(meta_bits))
        return

    if isinstance(parsed, dict) and "stdout" in parsed:
        # python_exec shape
        if parsed.get("error"):
            st.error(parsed["error"])
        stdout = parsed.get("stdout", "")
        if stdout:
            st.code(stdout, language="text")
        if parsed.get("note"):
            st.caption(parsed["note"])
        return

    if isinstance(parsed, dict) and "error" in parsed:
        st.error(parsed["error"])
        return

    if isinstance(parsed, (dict, list)):
        st.json(parsed)
        return

    st.code(str(output), language="text")


def render_blocks(blocks: list[dict]) -> None:
    """Render a static (persisted) assistant message — used on rerun."""
    for block in blocks:
        if block["type"] == "text":
            if block.get("content"):
                st.markdown(block["content"])
        elif block["type"] == "tool":
            label = f"✓ `{block['name']}`"
            with st.expander(label, expanded=False):
                _render_tool_input(block["name"], block.get("args") or {})
                _render_tool_output(block.get("output"))
        elif block["type"] == "error":
            st.error(block.get("message", "Unknown error"))


# Per-request HTTP timeout by mode. Deep mode runs up to 128 tool turns and
# can legitimately take a long time; simple mode is for quick lookups and a
# long hang there usually means something is wrong, so fail faster.
MODE_TIMEOUTS = {"simple": 300, "deep": 3600}


def _stream_assistant_response(question: str, mode: str) -> list[dict]:
    """Hit /chat, parse the NDJSON event stream, render the assistant message
    live, and return the structured `blocks` list to persist."""
    blocks: list[dict] = []
    pending_text = ""
    text_placeholder = None
    # Map tool_call_id → {"status": st.status, "block": dict, "result_slot": placeholder}
    open_tools: dict[str, dict] = {}

    try:
        with httpx.stream(
            "POST",
            f"{BACKEND_URL}/chat",
            json={"question": question, "mode": mode},
            timeout=MODE_TIMEOUTS.get(mode, 300),
        ) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                try:
                    event = json.loads(line)
                except (ValueError, TypeError):
                    continue

                kind = event.get("type")

                if kind == "text":
                    if text_placeholder is None:
                        text_placeholder = st.empty()
                    pending_text += event.get("content", "")
                    text_placeholder.markdown(pending_text)

                elif kind == "tool_start":
                    # Freeze the text block so far so the next text event starts fresh.
                    if pending_text:
                        blocks.append({"type": "text", "content": pending_text})
                        pending_text = ""
                        text_placeholder = None

                    name = event.get("name", "tool")
                    args = event.get("args") or {}
                    tid = event.get("id") or f"_anon_{len(blocks)}"

                    status = st.status(f"🔧 Running `{name}`…", expanded=False)
                    with status:
                        _render_tool_input(name, args)
                        result_slot = st.container()

                    block = {"type": "tool", "name": name, "args": args, "output": None}
                    blocks.append(block)
                    open_tools[tid] = {"status": status, "block": block, "result_slot": result_slot}

                elif kind == "tool_end":
                    tid = event.get("id")
                    output = event.get("output")
                    entry = open_tools.pop(tid, None) if tid else None
                    if entry is None and open_tools:
                        # Fallback: fill the most-recently-opened tool of the same name
                        for k in reversed(list(open_tools.keys())):
                            if open_tools[k]["block"]["name"] == event.get("name"):
                                entry = open_tools.pop(k)
                                break
                    if entry is not None:
                        entry["block"]["output"] = output
                        entry["status"].update(
                            label=f"✓ `{entry['block']['name']}`",
                            state="complete",
                        )
                        with entry["result_slot"]:
                            _render_tool_output(output)

                elif kind == "error":
                    if pending_text:
                        blocks.append({"type": "text", "content": pending_text})
                        pending_text = ""
                        text_placeholder = None
                    msg = event.get("message", "Unknown error")
                    st.error(msg)
                    blocks.append({"type": "error", "message": msg})

    except Exception as exc:
        if pending_text:
            blocks.append({"type": "text", "content": pending_text})
        msg = f"Error: {exc}"
        st.error(msg)
        blocks.append({"type": "error", "message": msg})
        return blocks

    if pending_text:
        blocks.append({"type": "text", "content": pending_text})

    return blocks


# ── Chat page ─────────────────────────────────────────────────────────────────
if page == "💬 Chat":
    st.title("🏭 Factory Dashboard — Ask a Question")
    st.caption("Ask anything about production data, downtime events, or trends.")

    # Keep conversation history in session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "agent_mode" not in st.session_state:
        st.session_state.agent_mode = "Simple"

    # Display past messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            if msg["role"] == "user":
                st.markdown(msg["content"])
            else:
                render_blocks(msg.get("blocks", []))

    # Agent-mode selector sits directly above the chat input so the user
    # can flip modes without leaving the chat surface.
    MODE_LABELS = {
        "Simple": ("simple", "Quick lookups — up to 8 tool turns."),
        "Deep / Data Science": ("deep", "Iterative research — up to 128 turns, with Python + persistent memory."),
    }
    selected_label = st.selectbox(
        "Agent mode",
        list(MODE_LABELS.keys()),
        index=list(MODE_LABELS.keys()).index(st.session_state.agent_mode),
        key="agent_mode",
        help="Simple = fast Q&A. Deep = research agent that remembers durable lessons across chats.",
    )
    mode_value, mode_caption = MODE_LABELS[selected_label]
    st.caption(mode_caption)

    # Chat input
    if question := st.chat_input("Type your question (Persian or English)..."):
        # Show user message
        st.session_state.messages.append({"role": "user", "content": question})
        with st.chat_message("user"):
            st.markdown(question)

        # Stream the agent's answer
        with st.chat_message("assistant"):
            blocks = _stream_assistant_response(question, mode_value)

        st.session_state.messages.append({"role": "assistant", "blocks": blocks})

# ── History page ──────────────────────────────────────────────────────────────
elif page == "📋 Query History":
    st.title("📋 Query History")
    st.write("All past questions and the agent's answers — useful for debugging.")

    limit = st.slider("Show last N queries", 5, 100, 20)

    try:
        resp = httpx.get(f"{BACKEND_URL}/history?limit={limit}", timeout=30)
        resp.raise_for_status()
        entries = resp.json()

        for entry in entries:
            with st.expander(f"[{entry['asked_at']}] {entry['question'][:80]}"):
                st.markdown(f"**Provider:** {entry['llm_provider']}")
                if entry.get("agent_mode"):
                    st.markdown(f"**Mode:** {entry['agent_mode']}")
                st.markdown(f"**Answer:** {entry['answer']}")

                if entry.get("tool_calls"):
                    st.markdown("**Tool calls:**")
                    for tc in entry["tool_calls"]:
                        st.code(f"Tool: {tc['tool']}\nInput: {tc['input']}\nOutput: {tc['output']}", language="json")

    except Exception as exc:
        st.error(f"Could not load history: {exc}")
