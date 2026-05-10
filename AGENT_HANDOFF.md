# Agent Handoff — Factory Dashboard Project

## What this project is

An AI-powered analytics platform for an **Iranian iron concentrate factory** (Asmiran Group). Factory workers record daily production reports in Excel files. The system ingests those files into PostgreSQL and lets any user ask natural-language questions in Persian or English. An LLM agent answers by writing SQL queries against the structured data.

---

## Current state (as of 2026-05-04)

### Phase 1 — COMPLETE and running

Three Docker services are up and working:

| Service | Port | Status |
|---------|------|--------|
| PostgreSQL 16 + pgvector | 5432 | Healthy |
| FastAPI backend + Claude agent | 8000 | Running |
| Streamlit chat UI | 8501 | Running |

**Data ingested:** `Production_1405.xlsx` — 33 daily sheets (1 month, Farvardin 1405)
- 33 `daily_report` rows
- 132 `production_shift` rows (wide table with ~50 columns per shift)
- 214 `downtime` events across 3 sections (factory/feed_input/filter_press)
- 33 `raw_sheet_cells` JSONB dumps (every non-empty cell saved as insurance)

**Agent is working** — tested with:
- "What is the average concentrate Fe%?" → 66.99% (correct)
- "How many downtime events per section and total hours?" → factory 946h, filter_press 510h, feed_input 5h (correct)

### Phase 2 — NOT started

Semantic search over Persian downtime text using BGE-M3 embeddings.
- Embeddings container is built but fails to start: `hf.devneeds.ir` has manually blocked `BAAI/bge-m3`
- HuggingFace.co works directly from this machine (confirmed)
- BGE-M3 is ~2 GB download

### LLM model downloads — IN PROGRESS

The user is downloading `google/gemma-4-31B-it` (BF16, ~62 GB) to use as a local LLM via Ollama instead of Claude. Download is complete.

Quantization to Q4_K_M is the next step (script ready, not yet run).

---

## Project location

`C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard\`

---

## Key files

```
factory-dashboard/
├── docker-compose.yml              4 services: db, embeddings, backend, frontend
├── .env                            ANTHROPIC_API_KEY is set here
├── .env.example                    template (LLM_PROVIDER, model keys)
├── TASKS.md                        step-by-step project checklist
│
├── data/
│   ├── raw/factory/                drop Excel files here before ingesting
│   └── models/
│       └── llms/
│           ├── google--gemma-4-31B-it/        BF16 model (62 GB, downloaded)
│           └── google--gemma-4-31B-it-Q4_K_M/ Q4 output (not yet created)
│
├── backend/app/
│   ├── main.py                     FastAPI: /chat, /ingest, /ingest/enrich, /history
│   ├── config.py                   env vars (LLM_PROVIDER switches between providers)
│   ├── database.py                 SQLAlchemy engine + read-only role
│   ├── models.py                   5 tables: daily_report, production_shift, downtime, raw_sheet_cells, query_log
│   ├── agent.py                    agent loop (Phase 1: execute_sql only; Phase 2: add semantic_search)
│   ├── llm/
│   │   ├── base.py                 abstract LLM interface
│   │   ├── claude.py               Anthropic SDK
│   │   └── openai_compat.py        OpenAI SDK (also handles Ollama local models)
│   ├── tools/
│   │   ├── execute_sql.py          read-only SQL tool (agent's main tool)
│   │   └── semantic_search.py      Phase 2 vector search (not yet wired in)
│   ├── ingestion/
│   │   ├── parser.py               anchor-based Excel parser (finds Persian label cells)
│   │   ├── jalali.py               Jalali/Shamsi → Gregorian date conversion
│   │   ├── enrichment.py           LLM extracts equipment_code, fault_category from raw Persian text
│   │   └── registry.py             maps source folder name → parser function
│   └── schema_docs/
│       ├── production.md           column descriptions loaded into agent system prompt
│       └── downtime.md             column descriptions for downtime + raw_sheet_cells
│
├── scripts/
│   ├── convert_hf_to_gguf.py       llama.cpp conversion script (downloaded from GitHub)
│   ├── download_gemma_4_31b.ps1    resume download of google/gemma-4-31B-it
│   └── quantize_gemma.ps1          quantize BF16 → Q4_K_M GGUF via Docker
│
├── frontend/app.py                 Streamlit: Chat / Upload Data / Query History pages
└── migrations/versions/
    └── 001_initial.py              Alembic migration (all 5 tables + pgvector + read-only role)
```

---

## Database schema

### `production_shift` (wide table — ~50 columns)
One row per (date, shift, line). Key columns:
- `report_date` DATE, `jalali_date` TEXT, `shift` ('day'/'night'/'total'), `line` (1 or 2)
- Production: `daily_feed_tonnage`, `daily_concentrate_tonnage`, `daily_recovery_percent` (decimal 0-1)
- Monthly/yearly running totals: `monthly_*`, `yearly_*`
- Equipment hours: `factory_operation_hours`, `factory_downtime_hours`, `drum_filter_1_hours`, etc.
- Consumption: `flocculant_grams`, `flocculant_type`, `water_consumption_m3`, `ball_mill_primary_kg`
- Quality: `feed_fe_percent`, `concentrate_fe_percent` (target 60-72%), `tailings_fe_percent`
- Lab: `feed_k80_microns`, `concentrate_k80_microns`, `dry_weight_recovery_percent`, `assay_recovery_percent`

### `downtime`
One row per stop event. Key columns:
- `section`: 'factory' / 'feed_input' / 'filter_press'
- `raw_text`: original Persian description (never modified)
- `duration_minutes`, `shift`, `line`
- `equipment_code`, `fault_category`: NULL until `enrichment.py` is run (Phase 2)
- `start_time`, `end_time`: extracted from text like "07:00 to 19:00"

### `raw_sheet_cells`
One row per Excel sheet. `cells` column is JSONB: `{"A1": value, "C5": 1092, ...}`. Every non-empty cell is preserved for future analysis.

### `query_log`
Every user question + tool calls + answer + which LLM provider answered it.

### `daily_report`
One row per Excel sheet. Date, supervisors, batch code (ore blend used that day).

---

## LLM switching

Set `LLM_PROVIDER` in `.env` and restart the backend:

```
LLM_PROVIDER=anthropic   → Claude (default, uses ANTHROPIC_API_KEY)
LLM_PROVIDER=openai      → OpenAI (uses OPENAI_API_KEY)
LLM_PROVIDER=ollama      → Local Ollama (uses OLLAMA_BASE_URL, default http://host.docker.internal:11434/v1)
```

The `llm/` abstraction layer handles format differences between providers (Anthropic tool_use vs OpenAI function_calls).

---

## Mirror configuration (network is Iran-restricted)

All Dockerfiles install pip packages from the global pypi.org index (default). The
former `pypi.devneeds.ir` mirror was abandoned after it served corrupted wheels
(hash mismatches mid-download). For HuggingFace, `huggingface.co` is reached directly
— the `hf.devneeds.ir` mirror blocks several needed models.

Docker registry mirror in Docker Desktop daemon.json:
- `https://docker.arvancloud.ir` — works for Docker Hub images

Direct access confirmed working from this machine:
- `pypi.org` / `files.pythonhosted.org` — primary pip index, working
- `huggingface.co` — accessible directly (tested, config.json returns 200)
- `raw.githubusercontent.com` — accessible (convert_hf_to_gguf.py downloaded successfully)

Known blocked on `hf.devneeds.ir`:
- `BAAI/bge-m3` — "Remote Manually Blocked"
- All GGUF quantized repos (bartowski, unsloth, etc.) — blocked
- `google/gemma-4-31B-it` full BF16 — works (62 GB downloaded successfully)

---

## Immediate next tasks

### 1. Run quantization (ready to execute)

```powershell
cd "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard"
.\scripts\quantize_gemma.ps1
```

This converts `google--gemma-4-31B-it` (BF16 safetensors) → `gemma-4-31b-Q4_K_M.gguf` (~16 GB).
Uses Docker + Python + llama.cpp tools. Takes 30-60 minutes. Needs ~80 GB free disk.

After quantization, load into Ollama:
```powershell
New-Item -Path .\Modelfile -Value "FROM $env:USERPROFILE\...\data\models\llms\google--gemma-4-31B-it-Q4_K_M\gemma-4-31b-Q4_K_M.gguf"
ollama create gemma4-31b-q4 -f .\Modelfile
```

Then in `.env`: `LLM_PROVIDER=ollama`, `LLM_MODEL=gemma4-31b-q4`

### 2. Phase 2 — Enable semantic search over downtime text

Steps:
1. Get BGE-M3 model (2 GB) — either download from `huggingface.co` directly or ask devneeds admin to whitelist it
2. Start embeddings container: `docker compose up embeddings`
3. Create Alembic migration `002_add_embedding.py` adding `embedding vector(1024)` column to `downtime` table
4. Run: `docker compose exec backend alembic -c migrations/alembic.ini upgrade head`
5. In `backend/app/agent.py` uncomment the `semantic_search` tool lines
6. Run `POST /ingest/enrich` to embed all 214 existing downtime rows

### 3. Ingest more Excel files

Drop additional yearly Excel files into `data/raw/factory/` and upload via Streamlit Upload page. The parser handles 3 template variants (58/59/63 rows) and uses anchor-based cell finding.

### 4. Add new Excel types (kitchen, store, weighing, sales)

1. Write a new parser in `backend/app/ingestion/` (follow `parser.py` as template)
2. Add one line to `backend/app/ingestion/registry.py`
3. Add schema docs in `backend/app/schema_docs/`
4. Create matching data/raw/<source>/ folder

---

## How to restart everything

```powershell
cd "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard"
docker compose up -d db backend frontend      # Phase 1 (no embeddings)
docker compose up -d                          # Phase 2 (with embeddings, needs BGE-M3 model)
```

After restart, run Alembic migration to ensure DB is up to date:
```powershell
docker compose exec backend alembic -c migrations/alembic.ini upgrade head
```

Test the agent is working:
```powershell
curl -s -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"question":"How many downtime events are there per section?"}'
```

---

## Known issues / decisions made

1. **Parser is anchor-based** — searches for Persian label cells (`تاریخ`, `شیفت روز`, `علت توقف کارخانه`) instead of hardcoded row numbers. Handles 3 template variants in the production Excel files.

2. **`init_db()` removed from startup** — Alembic is the single source of truth for schema. Run `alembic upgrade head` manually after first launch or after adding new tables.

3. **Downtime parser requires duration** — only rows with a positive numeric duration are captured as downtime events (filters out headers and quality labels). Some events without explicit duration in the Excel are missed. The `raw_sheet_cells` JSONB backup preserves everything.

4. **Recovery columns are decimal (0-1) not %** — `daily_recovery_percent = 0.7518` means 75.18%. The schema_docs explain this to the agent.

5. **Jalali ↔ Gregorian**: `1405/01/01` ≈ `2026-03-21`. Both stored: `report_date` (Gregorian DATE for SQL) and `jalali_date` (TEXT for display).

6. **Read-only DB role**: the SQL agent tool uses `factory_ro` user (SELECT only). Prevents LLM-generated SQL from modifying data.

7. **BGE-M3 model blocked on mirror**: `hf.devneeds.ir` returns "Remote Manually Blocked" for BAAI/bge-m3. The devneeds.ir admin needs to whitelist it, OR download directly from huggingface.co (which works from this machine).
