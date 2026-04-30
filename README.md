# Factory Dashboard

Conversational analytics over factory Excel reports. A Claude agent answers
natural-language questions about production data — including free-text Persian
downtime descriptions — by combining SQL aggregation, vector search, and Python
analysis tools over a Postgres + pgvector database.

## Stack

- **Backend:** FastAPI + Anthropic SDK (raw tool use), SQLAlchemy, pandas, openpyxl
- **DB:** Postgres 16 + pgvector
- **Embeddings:** BGE-M3 self-hosted (multilingual, strong on Persian)
- **Frontend:** Streamlit (MVP) — to be replaced with Next.js once UX matures
- **Package manager:** uv
- **Orchestration:** docker compose

## Layout

```
backend/          FastAPI app: agent, ingestion parsers, db
embeddings/       BGE-M3 embedding server (separate container)
frontend/         Streamlit chat UI
data/             Raw + processed Excel files (gitignored)
scripts/          One-off CLI tools (batch ingest, re-embed)
```

## Quick start

```bash
cp backend/.env.example backend/.env   # add ANTHROPIC_API_KEY
docker compose up --build
```

- Streamlit chat UI: http://localhost:8501
- FastAPI docs:      http://localhost:8000/docs
- Embeddings health: http://localhost:8001/health

## Phased rollout

- **Week 1 — MVP.** Production parser + `execute_sql` tool + Streamlit chat.
- **Week 2 — Text understanding.** pgvector embeddings + `semantic_search` +
  one-time LLM extraction of structured downtime tags.
- **Week 3 — Polish.** `run_python` tool for correlations, auth, query log UI.
- **Week 4+ — Generalize.** Add kitchen / sales / weighing parsers; admin UI
  for editing column descriptions.
