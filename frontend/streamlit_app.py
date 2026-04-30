"""Week-1 MVP chat UI. Replace with Next.js once UX needs more polish."""

import json
import os

import httpx
import streamlit as st

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Factory Dashboard", layout="wide")
st.title("Factory Dashboard")

if "messages" not in st.session_state:
    st.session_state.messages = []

for m in st.session_state.messages:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

prompt = st.chat_input("Ask about production, downtime, Fe%, ...")
if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        text_placeholder = st.empty()
        tool_placeholder = st.empty()
        full_text = ""
        tool_calls = []

        with httpx.stream(
            "POST",
            f"{BACKEND_URL}/chat",
            json={"message": prompt},
            timeout=None,
        ) as response:
            event = None
            for line in response.iter_lines():
                if not line:
                    continue
                if line.startswith("event:"):
                    event = line.split(":", 1)[1].strip()
                elif line.startswith("data:"):
                    payload = json.loads(line.split(":", 1)[1])
                    if event == "text":
                        full_text += payload.get("text", "")
                        text_placeholder.markdown(full_text)
                    elif event == "tool":
                        tool_calls.append(payload)
                        with tool_placeholder.container():
                            for tc in tool_calls:
                                with st.expander(f"tool: {tc['name']}"):
                                    st.json(tc)

        st.session_state.messages.append({"role": "assistant", "content": full_text})
