"""Custom CSS injected into the Streamlit app for a Claude-style dark UI.

Loaded once from app.py via st.markdown(CUSTOM_CSS, unsafe_allow_html=True).
"""

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');

:root {
  --app-font: 'Vazirmatn', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --bg: #0F1419;
  --bg-elev: #171D26;
  --bg-bubble-user: #1F2630;
  --border: #232B36;
  --text: #E4E6EB;
  --text-dim: #98A2B3;
  --accent: #C97B5C;
}

html, body, [class*="st-"], [class*="css-"] {
  font-family: var(--app-font) !important;
}

/* Center the conversation column — the single biggest visual win. */
section.main > div.block-container {
  max-width: 820px;
  padding-top: 2.5rem;
  padding-bottom: 6rem;
}

/* Title spacing */
h1, h2, h3 { letter-spacing: -0.01em; }
.stApp h1 { font-weight: 700; margin-bottom: 0.25rem; }

/* ── Chat bubbles ──────────────────────────────────────────────────────── */
[data-testid="stChatMessage"] {
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin: 0.4rem 0;
  background: transparent;
}
/* User message gets a filled slate bubble (claude.ai style). */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarUser"]) {
  background: var(--bg-bubble-user);
  border: 1px solid var(--border);
}
/* Assistant message stays flush with the page. */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarAssistant"]) {
  background: transparent;
  padding-left: 0.25rem;
}

/* ── Tool status cards / expanders ─────────────────────────────────────── */
[data-testid="stStatusWidget"],
[data-testid="stExpander"] {
  border: 1px solid var(--border) !important;
  border-left: 3px solid var(--accent) !important;
  border-radius: 10px !important;
  background: var(--bg-elev) !important;
  margin: 0.5rem 0 !important;
}
[data-testid="stStatusWidget"] summary,
[data-testid="stExpander"] summary {
  padding: 0.6rem 0.9rem !important;
  font-weight: 500;
}
[data-testid="stStatusWidget"] code,
[data-testid="stExpander"] code {
  background: rgba(201, 123, 92, 0.12);
  color: var(--accent);
  padding: 0 0.35rem;
  border-radius: 4px;
}

/* ── Dataframes ────────────────────────────────────────────────────────── */
[data-testid="stDataFrame"] {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

/* ── Code blocks ───────────────────────────────────────────────────────── */
.stCodeBlock, [data-testid="stCodeBlock"] {
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* ── Chat input ────────────────────────────────────────────────────────── */
[data-testid="stChatInput"] {
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
}
[data-testid="stChatInput"]:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(201, 123, 92, 0.15);
}

/* ── Sidebar ───────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
  background: var(--bg-elev);
  border-right: 1px solid var(--border);
}
[data-testid="stSidebar"] > div:first-child {
  padding-top: 1.5rem;
}

/* Style the page-nav radio as a vertical nav list */
[data-testid="stSidebar"] [role="radiogroup"] {
  gap: 0.25rem;
}
[data-testid="stSidebar"] [role="radiogroup"] label {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background 0.15s ease;
  cursor: pointer;
  width: 100%;
}
[data-testid="stSidebar"] [role="radiogroup"] label:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Sidebar buttons (Clear chat) */
[data-testid="stSidebar"] .stButton button {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-weight: 500;
}
[data-testid="stSidebar"] .stButton button:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* ── History page cards ────────────────────────────────────────────────── */
[data-testid="stVerticalBlockBorderWrapper"] {
  border-radius: 10px !important;
  border-color: var(--border) !important;
}

/* Captions a touch dimmer */
[data-testid="stCaptionContainer"], .stCaption {
  color: var(--text-dim);
}
</style>
"""
