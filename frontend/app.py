"""
Streamlit chat UI for the factory dashboard.

Pages:
  Chat        — ask questions, get streaming answers
  Upload      — upload a new Excel file for ingestion
  History     — view past questions and answers (debug log)
"""
import os
import httpx
import streamlit as st

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Factory Dashboard", layout="wide", page_icon="🏭")

# ── Sidebar navigation ────────────────────────────────────────────────────────
page = st.sidebar.radio("Navigation", ["💬 Chat", "📂 Upload Data", "📋 Query History"])

# ── Chat page ─────────────────────────────────────────────────────────────────
if page == "💬 Chat":
    st.title("🏭 Factory Dashboard — Ask a Question")
    st.caption("Ask anything about production data, downtime events, or trends.")

    # Keep conversation history in session state
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display past messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

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
                    json={"question": question},
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

# ── Upload page ───────────────────────────────────────────────────────────────
elif page == "📂 Upload Data":
    st.title("📂 Upload Excel Data")
    st.write("Upload a daily report Excel file to add it to the database.")

    source = st.selectbox(
        "Data source",
        options=["factory", "kitchen", "store", "weighing", "sales"],
        help="Choose which type of report this file contains.",
    )

    uploaded_file = st.file_uploader("Choose an Excel file (.xlsx)", type=["xlsx", "xls"])

    if uploaded_file and st.button("Ingest file"):
        with st.spinner("Ingesting..."):
            try:
                response = httpx.post(
                    f"{BACKEND_URL}/ingest?source={source}",
                    files={"file": (uploaded_file.name, uploaded_file.getvalue())},
                    timeout=120,
                )
                response.raise_for_status()
                result = response.json()

                st.success(
                    f"Done! Parsed {result['sheets_parsed']} sheets. "
                    f"Added {result['production_rows_added']} production rows "
                    f"and {result['downtime_rows_added']} downtime rows."
                )

                if result.get("errors"):
                    with st.expander("Warnings / parsing errors"):
                        for err in result["errors"]:
                            st.warning(err)

            except httpx.HTTPStatusError as exc:
                st.error(f"Server error {exc.response.status_code}: {exc.response.text}")
            except Exception as exc:
                st.error(f"Error: {exc}")

    st.divider()
    st.subheader("Run Enrichment")
    st.write("After uploading, run enrichment to extract equipment codes and fault categories from downtime text.")
    if st.button("Run enrichment now"):
        with st.spinner("Enriching downtime text..."):
            try:
                resp = httpx.post(f"{BACKEND_URL}/ingest/enrich", timeout=300)
                resp.raise_for_status()
                st.success(f"Enriched {resp.json()['rows_enriched']} rows.")
            except Exception as exc:
                st.error(f"Error: {exc}")

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
                st.markdown(f"**Answer:** {entry['answer']}")

                if entry.get("tool_calls"):
                    st.markdown("**Tool calls:**")
                    for tc in entry["tool_calls"]:
                        st.code(f"Tool: {tc['tool']}\nInput: {tc['input']}\nOutput: {tc['output']}", language="json")

    except Exception as exc:
        st.error(f"Could not load history: {exc}")
