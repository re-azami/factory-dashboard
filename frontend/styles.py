"""Custom CSS injected into the Streamlit app for a Claude-style warm dark UI.

Loaded once from app.py via st.markdown(CUSTOM_CSS, unsafe_allow_html=True).

Selector source: Streamlit 1.57's data-testids
(grep'd from streamlit/static/static/js/ — these are stable across patch releases
within 1.x but the class-name hashes are NOT, so always prefer data-testid).
"""

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap');

:root {
  /* Claude.ai dark-mode palette — warm charcoal, NOT cool slate */
  --bg:           #1F1E1C;   /* page background, warm near-black */
  --bg-elev:      #262522;   /* sidebar / code blocks */
  --bg-bubble:    #2D2C28;   /* user message pill */
  --bg-card:      #292827;   /* tool cards */
  --border:       #3A3936;   /* subtle warm border */
  --border-soft:  #2E2D2A;
  --text:         #ECEAE3;   /* warm off-white */
  --text-dim:     #9B958B;   /* warm muted */
  --accent:       #D97757;   /* Claude coral */
  --accent-soft:  rgba(217, 119, 87, 0.12);
  --font-latin:   'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-persian: 'Vazirmatn', var(--font-latin);
}

/* ── App-wide background + typography ──────────────────────────────────── */
html, body, .stApp, [data-testid="stAppViewContainer"] {
  background: var(--bg) !important;
  color: var(--text);
  font-family: var(--font-latin) !important;
  font-feature-settings: "ss01", "cv01";
  -webkit-font-smoothing: antialiased;
}
/* Vazirmatn auto-applies to Persian via its unicode-range; but force it
   on markdown bodies so mixed-content lines also look right. */
[data-testid="stMarkdownContainer"],
[data-testid="stMarkdownContainer"] * {
  font-family: var(--font-latin), var(--font-persian) !important;
}

/* Hide Streamlit chrome we don't need */
[data-testid="stHeader"],
[data-testid="stToolbar"],
#MainMenu,
footer { display: none !important; }
[data-testid="stDecoration"] { display: none !important; }

/* ── Center & narrow the conversation column (the big win) ─────────────── */
[data-testid="stMainBlockContainer"] {
  max-width: 740px !important;
  padding-top: 3.5rem !important;
  padding-bottom: 8rem !important;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

/* ── Typography hierarchy ──────────────────────────────────────────────── */
h1 {
  font-weight: 600 !important;
  font-size: 1.6rem !important;
  letter-spacing: -0.015em;
  color: var(--text);
  margin: 0 0 0.25rem 0 !important;
}
h2, h3 { font-weight: 600; letter-spacing: -0.01em; color: var(--text); }
p, li { line-height: 1.65; }

/* ── Hide default chat avatars (cleaner Claude-like look) ──────────────── */
[data-testid="stChatMessageAvatarUser"],
[data-testid="stChatMessageAvatarAssistant"] { display: none !important; }

/* ── Chat messages ─────────────────────────────────────────────────────── */
[data-testid="stChatMessage"] {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0.5rem 0 1.25rem 0 !important;
  gap: 0 !important;
}
[data-testid="stChatMessageContent"] {
  padding: 0 !important;
  background: transparent !important;
}

/* User message: right-aligned warm pill */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarUser"]) {
  display: flex !important;
  justify-content: flex-end !important;
}
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarUser"])
  [data-testid="stChatMessageContent"] {
  background: var(--bg-bubble) !important;
  border: 1px solid var(--border-soft) !important;
  border-radius: 16px 16px 4px 16px !important;
  padding: 0.65rem 0.95rem !important;
  max-width: 80%;
}

/* Assistant message: flush text, no bubble, generous line-height */
[data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatarAssistant"])
  [data-testid="stChatMessageContent"] {
  background: transparent !important;
  padding: 0 !important;
  color: var(--text);
}
[data-testid="stChatMessage"] p { margin: 0 0 0.5rem 0; }

/* ── Tool cards (status widget + expander) ─────────────────────────────── */
[data-testid="stStatusWidget"],
.stExpander, details[data-testid="stExpander"] {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 10px !important;
  margin: 0.5rem 0 0.75rem 0 !important;
  box-shadow: none !important;
  overflow: hidden;
}
[data-testid="stStatusWidget"] summary,
.stExpander summary,
details[data-testid="stExpander"] summary {
  padding: 0.55rem 0.9rem !important;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dim);
}
[data-testid="stStatusWidget"] summary:hover,
.stExpander summary:hover { color: var(--text); }
[data-testid="stStatusWidget"] code,
.stExpander code {
  background: var(--accent-soft);
  color: var(--accent);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
[data-testid="stExpanderDetails"] { padding: 0.5rem 0.9rem 0.9rem 0.9rem !important; }

/* ── Code blocks (syntax-highlighted SQL/Python in tool inputs) ────────── */
[data-testid="stCode"], pre, code {
  font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
}
[data-testid="stCode"] {
  background: var(--bg-elev) !important;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

/* ── Dataframe ─────────────────────────────────────────────────────────── */
[data-testid="stDataFrame"] {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

/* ── Chat input ────────────────────────────────────────────────────────── */
[data-testid="stChatInput"] {
  background: var(--bg-elev) !important;
  border: 1px solid var(--border) !important;
  border-radius: 18px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}
[data-testid="stChatInput"]:focus-within {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px var(--accent-soft), 0 4px 24px rgba(0, 0, 0, 0.25);
}
[data-testid="stChatInputTextArea"] {
  color: var(--text) !important;
  font-family: var(--font-latin), var(--font-persian) !important;
  font-size: 0.95rem;
}
[data-testid="stChatInputSubmitButton"] {
  background: var(--accent) !important;
  border-radius: 10px !important;
}
[data-testid="stChatInputSubmitButton"]:hover { filter: brightness(1.1); }

/* ── Sidebar ───────────────────────────────────────────────────────────── */
[data-testid="stSidebar"], [data-testid="stSidebarContent"] {
  background: var(--bg-elev) !important;
  border-right: 1px solid var(--border-soft);
}
[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] h3 {
  font-size: 0.95rem !important;
  font-weight: 600;
  color: var(--text);
  margin-top: 0.25rem !important;
}

/* Sidebar page-nav radio: render as a vertical nav list */
[data-testid="stSidebar"] [role="radiogroup"] {
  gap: 2px;
}
[data-testid="stSidebar"] [role="radiogroup"] > label {
  padding: 0.45rem 0.7rem !important;
  border-radius: 7px !important;
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 500;
}
[data-testid="stSidebar"] [role="radiogroup"] > label:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
}
[data-testid="stSidebar"] [role="radiogroup"] > label[data-checked="true"],
[data-testid="stSidebar"] [role="radiogroup"] > label:has(input:checked) {
  background: var(--accent-soft);
  color: var(--text);
}
/* Hide the radio dot — the row hover/selection is enough */
[data-testid="stSidebar"] [role="radiogroup"] input + div:first-of-type {
  display: none !important;
}

/* Sidebar selectbox + button styling */
[data-testid="stSidebar"] .stSelectbox label,
[data-testid="stSidebar"] label {
  color: var(--text-dim) !important;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
[data-testid="stSidebar"] [data-baseweb="select"] > div {
  background: var(--bg) !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px;
}
[data-testid="stSidebar"] .stButton button {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-weight: 500;
  padding: 0.4rem 0.7rem;
}
[data-testid="stSidebar"] .stButton button:hover {
  border-color: var(--accent);
  color: var(--text);
  background: var(--accent-soft);
}

[data-testid="stSidebar"] hr {
  border-color: var(--border-soft) !important;
  margin: 0.75rem 0 !important;
}

/* ── Captions ──────────────────────────────────────────────────────────── */
[data-testid="stCaptionContainer"], small {
  color: var(--text-dim) !important;
  font-size: 0.82rem;
}

/* ── Slider (history page) ─────────────────────────────────────────────── */
[data-testid="stSlider"] [role="slider"] {
  background: var(--accent) !important;
}

/* ── Persian (RTL) auto-handling for chat input + messages ─────────────── */
/* When a chat message starts with Persian/Arabic characters, browsers will
   not auto-RTL the block. Hint with unicode-bidi so paragraphs containing
   Persian render correctly without breaking pure-English messages. */
[data-testid="stChatMessageContent"] p { unicode-bidi: plaintext; }
</style>
"""
