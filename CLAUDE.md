# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-powered analytics platform for an Iranian iron concentrate factory. Factory workers upload daily production Excel reports (in Persian). An LLM agent answers natural-language questions about the data by writing and executing SQL.

**Phase 1** (complete): PostgreSQL ingestion + LLM SQL agent + Streamlit UI.  
**Phase 2** (not started): Semantic search over Persian downtime descriptions using BGE-M3 embeddings.

## Common Commands

```powershell
# Start Phase 1 services (db + backend + frontend)
docker compose up -d db backend frontend

# Start with embeddings (Phase 2 — needs BGE-M3 model downloaded first)
docker compose up -d

# Run Alembic migration after first launch or adding new tables
docker compose exec backend alembic -c migrations/alembic.ini upgrade head

# Test the agent
curl -s -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"question":"How many downtime events are there?"}'

# View backend logs
docker compose logs -f backend

# Rebuild backend after dependency changes
docker compose build backend && docker compose up -d backend

# Unit + integration tests (run against in-memory SQLite, no services needed)
python -m pytest backend/tests        # 203 tests
python -m pytest frontend/tests       # 22 tests

# End-to-end tests via Playwright (requires backend + frontend running)
python -m pip install -r tests/e2e/requirements-test.txt
python -m playwright install chromium    # one-time, ~110 MB
python -m pytest tests/e2e               # headless
python -m pytest tests/e2e --headed      # watch the browser
```

**Services:** PostgreSQL 5432, FastAPI 8000, Streamlit 8501, embeddings 8001.

## Environment Configuration

Copy `.env.example` to `.env`. The key switch is `LLM_PROVIDER`:

| Value | Requires |
|-------|----------|
| `anthropic` | `ANTHROPIC_API_KEY` (default, uses claude-sonnet-4-6) |
| `openai` | `OPENAI_API_KEY` |
| `ollama` | `OLLAMA_BASE_URL=http://host.docker.internal:11434/v1` + any dummy key |

All Dockerfiles install from the global pypi.org index (default). `huggingface.co` is directly accessible from this machine; `hf.devneeds.ir` mirror blocks many models including BGE-M3.

## Architecture

### Data Flow

```
Excel upload → POST /ingest?source=factory
    → parser.py (anchor-based) → ParseResult
    → INSERT into: daily_report, production_shift, downtime, raw_sheet_cells

User question → POST /chat
    → agent loop (max 8 iterations)
        → LLM reads schema_docs/*.md + writes SQL
        → execute_sql tool runs query via factory_ro read-only role
        → LLM reads result → yields answer
    → saved to query_log
```

### LLM Abstraction (`backend/app/llm/`)

`get_llm_client()` returns `ClaudeClient` or `OpenAICompatClient` based on `LLM_PROVIDER`. Both implement `LLMClient.chat()` returning `LLMResponse` with normalized `tool_calls`, `content`, and `stop_reason`. **Critical difference in tool result messages:** Anthropic uses `{"role": "user", "content": [{"type": "tool_result", ...}]}`; OpenAI uses `{"role": "tool", "tool_call_id": ..., "content": ...}`. Each client's `build_tool_result_message()` handles this.

### Agent Loop (`backend/app/agent.py`)

System prompt is built dynamically from all `.md` files in `schema_docs/`. Tools are registered in two dicts: `TOOLS` (Anthropic-format definitions) and `TOOL_RUNNERS` (name → callable). To add Phase 2 semantic search, uncomment the two lines referencing `semantic_search`.

### Excel Parser (`backend/app/ingestion/parser.py`)

**Anchor-based**: searches for Persian label cells (`تاریخ`, `شیفت روز`, `علت توقف کارخانه`) using `_find_cell()` instead of hardcoded row numbers. Handles 3 production template variants (58/59/63 rows). Persian text normalized via `_normalize()` before comparison.

Three downtime sections parsed separately: `factory` (anchor `دلایل توقف کارخانه`), `feed_input` (anchor `علت توقف فید`), `filter_press` (anchor `دلایل توقف فیلتر پرس`). Each has different column offsets for text and duration.

### Adding a New Excel Source

1. Write `backend/app/ingestion/<source>_parser.py` with `parse_workbook(path) -> ParseResult`
2. Add one line to `backend/app/ingestion/registry.py`: `"source_name": source_parser`
3. Add schema docs to `backend/app/schema_docs/<source>.md`
4. Create `data/raw/<source>/` folder

## Database Schema Notes

- **`production_shift`**: wide table (~50 cols), one row per `(report_date, shift, line)`. `shift` is `'day'/'night'/'total'`, `line` is 1 or 2.
- **Recovery columns are decimals**: `daily_recovery_percent = 0.7518` means 75.18%. Schema docs explain this to the agent.
- **Both calendars stored**: `report_date` (Gregorian DATE, for SQL) and `jalali_date` (TEXT, for display). `1405/01/01` ≈ `2026-03-21`.
- **`downtime.raw_text`**: original Persian text, never modified. Phase 2 adds `embedding vector(1024)` via migration `002_add_embedding.py`.
- **`factory_ro`** role: SELECT-only. The agent's `execute_sql` tool uses this connection. Migration also sets `ALTER DEFAULT PRIVILEGES` so future tables inherit SELECT.
- **`raw_sheet_cells`**: JSONB backup of every non-empty Excel cell per sheet. Insurance for future analysis.

## Phase 2: Enabling Semantic Search

1. Get BGE-M3 model (2 GB) — download from `huggingface.co` directly (works from this machine) into `data/models/bge-m3/`
2. `docker compose up -d embeddings`
3. Create migration `002_add_embedding.py` adding `embedding vector(1024)` to `downtime`
4. `docker compose exec backend alembic -c migrations/alembic.ini upgrade head`
5. In `agent.py`: uncomment the `semantic_search` lines in `TOOLS` and `TOOL_RUNNERS`
6. `POST /ingest/enrich` to embed all 214 existing downtime rows

## Gemma Quantization

To convert the downloaded `google/gemma-4-31B-it` (BF16, 62 GB) to Q4_K_M GGUF (~16 GB):

```powershell
.\scripts\quantize_gemma.ps1   # takes 30–60 min, needs ~80 GB free disk
```

Uses `python:3.11-slim` Docker container + installs `build-essential cmake` (needed to compile `llama-cpp-python`) before running the two-step conversion. After completion:

```powershell
New-Item -Path .\Modelfile -Value "FROM <path>\data\models\llms\google--gemma-4-31B-it-Q4_K_M\gemma-4-31b-Q4_K_M.gguf"
ollama create gemma4-31b-q4 -f .\Modelfile
# Then in .env: LLM_PROVIDER=ollama, LLM_MODEL=gemma4-31b-q4
```
