"""
Streamlit chat UI for the factory dashboard.

Pages:
  Chat        — ask questions, get streaming answers
  History     — view past questions and answers (debug log)
"""
import os
import httpx
import streamlit as st

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Factory Dashboard", layout="wide", page_icon="🏭")

# ── Sidebar navigation ────────────────────────────────────────────────────────
page = st.sidebar.radio("Navigation", ["💬 Chat", "📋 Query History"])

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
            st.markdown(msg["content"])

    # Agent-mode selector sits directly above the chat input so the user
    # can flip modes without leaving the chat surface.
    MODE_LABELS = {
        "Simple": ("simple", "Quick lookups — up to 8 tool turns."),
        "Deep / Data Science": ("deep", "Iterative research — up to 64 turns, with Python + persistent memory."),
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
            answer_placeholder = st.empty()
            full_answer = ""

            try:
                with httpx.stream(
                    "POST",
                    f"{BACKEND_URL}/chat",
                    json={"question": question, "mode": mode_value},
                    timeout=120,
                ) as response:
                    response.raise_for_status()
                    for chunk in response.iter_text():
                        full_answer += chunk
                        # Show tool call lines in a dimmed style
                        display = full_answer.replace("[tool:", "\n\n> [tool:")
                        answer_placeholder.markdown(display)

            except Exception as exc:
                full_answer = f"Error: {exc}"
                answer_placeholder.error(full_answer)

        st.session_state.messages.append({"role": "assistant", "content": full_answer})

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
