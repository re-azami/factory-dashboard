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
    st.title("📂 Ingest Data")
    st.write(
        "Bulk-scan the factory data folder, or upload a single .xlsx / .pdf file. "
        "Every cell of every file is preserved as queryable SQL rows."
    )

    # ── Bulk scan ─────────────────────────────────────────────────────────────
    st.subheader("Scan factory folder")
    st.caption(
        "Walks the folder mounted into the backend (default `/data/raw/factory`) "
        "and ingests every new .xlsx and .pdf. Files already in the database "
        "(matched by SHA-256) are skipped, so this is safe to re-run any time."
    )
    if st.button("Scan factory folder now", type="primary"):
        with st.spinner("Scanning and ingesting… this may take several minutes for large workbooks."):
            try:
                resp = httpx.post(f"{BACKEND_URL}/ingest/scan", timeout=3600)
                resp.raise_for_status()
                summary = resp.json()
                cols = st.columns(4)
                cols[0].metric("Files seen", summary["files_seen"])
                cols[1].metric("Newly ingested", summary["files_new"])
                cols[2].metric("Skipped (already in DB)", summary["files_skipped"])
                cols[3].metric("Failed", summary["files_failed"])
                st.write(
                    f"**Cells written:** xlsx={summary['xlsx_cells_inserted']:,}, "
                    f"pdf pages={summary['pdf_pages_inserted']:,}, "
                    f"pdf table cells={summary['pdf_table_cells_inserted']:,}, "
                    f"production rows={summary['production_rows_added']:,}, "
                    f"downtime rows={summary['downtime_rows_added']:,}."
                )
                with st.expander("Per-file results"):
                    st.dataframe(summary["files"], use_container_width=True)
            except httpx.HTTPStatusError as exc:
                st.error(f"Server error {exc.response.status_code}: {exc.response.text}")
            except Exception as exc:
                st.error(f"Error: {exc}")

    st.divider()

    # ── Single-file upload ────────────────────────────────────────────────────
    st.subheader("Upload a single file")
    source = st.selectbox(
        "Data source",
        options=["factory", "kitchen", "store", "weighing", "sales"],
        help="Recorded as a label on the file. Doesn't change how parsing works.",
    )
    uploaded_file = st.file_uploader(
        "Choose an .xlsx or .pdf file",
        type=["xlsx", "xlsm", "xls", "pdf"],
    )
    if uploaded_file and st.button("Ingest file"):
        with st.spinner("Ingesting..."):
            try:
                response = httpx.post(
                    f"{BACKEND_URL}/ingest?source={source}",
                    files={"file": (uploaded_file.name, uploaded_file.getvalue())},
                    timeout=600,
                )
                response.raise_for_status()
                result = response.json()
                if result["status"] == "skipped":
                    st.info(f"Already ingested — skipped (file_id={result['file_id']}).")
                else:
                    msg_parts = []
                    if result["xlsx_cells"]:
                        msg_parts.append(f"{result['xlsx_cells']:,} xlsx cells")
                    if result["pdf_pages"]:
                        msg_parts.append(f"{result['pdf_pages']:,} pdf pages")
                    if result["pdf_table_cells"]:
                        msg_parts.append(f"{result['pdf_table_cells']:,} pdf table cells")
                    if result["production_rows"]:
                        msg_parts.append(f"{result['production_rows']} production rows")
                    if result["downtime_rows"]:
                        msg_parts.append(f"{result['downtime_rows']} downtime rows")
                    st.success("Done! Added " + ", ".join(msg_parts) + ".")
            except httpx.HTTPStatusError as exc:
                st.error(f"Server error {exc.response.status_code}: {exc.response.text}")
            except Exception as exc:
                st.error(f"Error: {exc}")

    st.divider()
    st.subheader("Run Enrichment")
    st.write("After ingestion, run enrichment to extract equipment codes and fault categories from downtime text.")
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
