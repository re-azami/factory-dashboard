# Factory Dashboard — Project Task List

Work through these tasks in order. Each phase builds on the previous one.
Check off tasks as you complete them.

---

## Phase 0 — Setup (do this once)

- [ ] Copy `.env.example` to `.env` and fill in your `ANTHROPIC_API_KEY`
- [ ] Run `docker compose build` to build all images (first time is slow)
- [ ] Run `docker compose up db backend frontend` to start (skip embeddings for now)
- [ ] Open `http://localhost:8501` and confirm Streamlit loads
- [ ] Open `http://localhost:8000/docs` to confirm FastAPI docs load

---

## Phase 1 — Ingest and Query Production Data

- [ ] Copy `Production_1405.xlsx` into `data/raw/factory/`
- [ ] In Streamlit → Upload page: upload the file, source = `factory`
- [ ] Confirm: "X sheets parsed, Y production rows added, Z downtime rows added"
- [ ] If there are parsing errors, investigate `backend/app/ingestion/parser.py`
- [ ] Ask a numeric question in chat: "میانگین عیار آهن در ماه اول 1405 چقدر بود؟"
- [ ] Confirm the agent returns a number (not an error)
- [ ] Ask a count question: "چند بار تولید در شیفت شب متوقف شد؟"
- [ ] Check the History page — confirm question, tool call, and answer were saved
- [ ] Try switching to Ollama: set `LLM_PROVIDER=ollama`, `LLM_MODEL=qwen3:6b` in `.env`, restart backend, ask the same question
- [ ] Upload the remaining years of production Excel files one by one

---

## Phase 1 fixes (likely needed after first tests)

- [ ] Tune `parser.py` if some sheets fail (anchor cell text may vary slightly)
- [ ] Update `schema_docs/production.md` with real column value ranges from your data
- [ ] Update `schema_docs/downtime.md` with real equipment codes from your file
- [ ] Add Jalali-to-Gregorian date conversion reminder to the agent system prompt if the agent makes date errors

---

## Phase 2 — Downtime Text Understanding (semantic search)

- [ ] Start the embeddings service: `docker compose up embeddings` (downloads BGE-M3 model ~2GB, one time only)
- [ ] Wait for the embeddings container to be healthy (check with `docker compose ps`)
- [ ] Run Alembic migration 002 to add the `embedding` column to `downtime` table
  - First create `backend/migrations/versions/002_add_embedding.py`
  - Run: `docker compose exec backend alembic upgrade head`
- [ ] In `backend/app/ingestion/enrichment.py` add embedding generation after extraction
- [ ] In `backend/app/agent.py` uncomment the `semantic_search` tool
- [ ] Run enrichment: Streamlit → Upload page → "Run enrichment now"
- [ ] Test: "چند توقف مربوط به ضخیم‌کننده (thickener) بوده؟"
- [ ] Test: "چند خرابی برقی داشتیم؟"

---

## Phase 3 — Analysis and Generalization

- [ ] Add `run_python` tool in `backend/app/tools/run_python.py`
  - Uncomment it in `backend/app/agent.py`
- [ ] Test: "آیا عیار آهن با میزان خوراک ورودی همبستگی دارد؟"
- [ ] Add "query history" table view in Streamlit with filter by date
- [ ] Write a parser for the next Excel type (kitchen, store, etc.)
  - Create `backend/app/ingestion/parsers/kitchen.py`
  - Add `"kitchen": kitchen_parser` to `backend/app/ingestion/registry.py`
  - Test by uploading a kitchen Excel file

---

## Phase 4 — Hardening

- [ ] Add proper authentication (Streamlit password or FastAPI bearer token)
- [ ] Tighten CORS in `main.py` to only allow the frontend origin
- [ ] Add rate limiting on `/chat` endpoint
- [ ] Set up Docker volume backup for PostgreSQL data
- [ ] Add a cron job or script to auto-ingest new files dropped in `data/raw/`
- [ ] Move from `--reload` to production uvicorn settings in `backend/Dockerfile`

---

## Debugging tips

- Agent gives wrong SQL → check `schema_docs/*.md` and add better column descriptions
- Parsing fails on a sheet → add a `print()` in `parser.py` to see what anchor cells are found
- Docker container won't start → run `docker compose logs <service>` to see errors
- Database table missing → run `docker compose exec backend alembic upgrade head`
- Switch LLMs → change `LLM_PROVIDER` and `LLM_MODEL` in `.env`, then `docker compose restart backend`
