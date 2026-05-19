# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-powered analytics platform for an Iranian iron concentrate factory. Factory workers upload daily production Excel reports (in Persian). An LLM agent answers natural-language questions about the data by writing and executing SQL.

**Phase 1** (complete): PostgreSQL ingestion + LLM SQL agent + Angular SPA.  
**Phase 2** (not started): Semantic search over Persian downtime descriptions using BGE-M3 embeddings.

## Common Commands

```powershell
# Start Phase 1 services (db + backend + Angular SPA)
docker compose up -d db backend frontend-spa

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
python -m pytest backend/tests        # 279 tests

# Angular SPA unit tests (Karma + Jasmine, ChromeHeadless)
cd frontend-spa
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage=false   # 47 tests
cd ..

# Angular SPA dev server (faster than rebuilding the Docker image)
cd frontend-spa
npm start    # serves on http://localhost:4200 (HMR)
cd ..

# End-to-end tests via Playwright (requires backend + SPA running)
python -m pip install -r tests/e2e/requirements-test.txt
python -m playwright install chromium    # one-time, ~110 MB
python -m pytest tests/e2e               # headless — exercises the SPA on 4200
python -m pytest tests/e2e --headed      # watch the browser
```

**Services:** PostgreSQL 5432, FastAPI 8000, Angular SPA 4200, embeddings 8001.

### GPU vs CPU hosts (`docker-compose.gpu.yml`)

The base `docker-compose.yml` is CPU-friendly by default so the same stack runs on the production DigitalOcean droplet (no GPU). On hosts with an NVIDIA GPU + nvidia-container-toolkit, layer the override by setting in `.env`:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.gpu.yml
```

`docker compose up` then requests the GPU for the `embeddings` service. On CPU-only hosts, leave `COMPOSE_FILE` unset and BGE-M3 falls back to CPU (~0.3–1.5 s per Persian query — acceptable for live query embedding; do NOT do bulk `POST /ingest/enrich` on the CPU server, pre-embed on the GPU laptop and restore the DB dump instead — see `TODO.md` → OPS-003).

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

## Frontend (Angular SPA at `frontend-spa/`)

The Angular 21 SPA at `frontend-spa/` is now the sole frontend, serving on port 4200. The legacy Streamlit UI was retired in UI-001d (2026-05-19) after the SPA reached parity through UI-001a (scaffold), UI-001b (chat), and UI-001c (history).

### Reference

The SPA mirrors `temp/frontend-true/apps/admin/` from a reference monorepo the user provided. **`temp/frontend-true/` is tracked in git** (everything else under `temp/` is ignored) so it's available on every dev host including the production server. The reference is for learning only — it is a different domain (logistics/admin), not our codebase. When in doubt about a convention, read the equivalent file in `temp/frontend-true/apps/admin/` or the shared `temp/frontend-true/libs/page/`, `libs/providers/`, `libs/shared/` libs.

### Stack and conventions

- **Angular 21** (`@angular/core@21.2.x`, `@angular/material@21.2.x`, `@angular/build@21.2.x`).
- **NgModule pattern, NOT standalone.** All `angular.json` schematics declare `"standalone": false`. New components, directives, and pipes go in a feature module's `declarations:` array; the feature module is then imported into `app.module.ts` or `shared.module.ts`.
- **Builder**: `@angular/build:application` (esbuild). Test target uses `@angular/build:karma`. No `karma.conf.js` — config is auto-generated.
- **Persian RTL by default**: `<html lang="fa" dir="rtl">`. UI copy is in Persian; preserve exact codepoints (no transliteration). Page title: `داشبورد کارخانه`.
- **Iran-Yekan font + Material Icons Outlined** are served locally from `frontend-spa/theme/fonts/yekan/` and `frontend-spa/theme/fonts/icon/`. Do NOT swap to Google Fonts CDN — works offline + matches reference.

### Required dependencies

The `@webilix/*` family is non-negotiable — the user explicitly approved these and was angry when they were once silently omitted (see [feedback_no_silent_dep_omissions.md](C:/Users/User/.claude/projects/c--Users-User-OneDrive-Documents-Agentic-agentic-projects-factory-dashboard/memory/feedback_no_silent_dep_omissions.md)). Pin to the same versions `temp/frontend-true/package.json` uses:

- `@webilix/helper-library@^6.1.7`
- `@webilix/jalali-date-time@^2.0.9` — Jalali (Persian) date utilities
- `@webilix/ngx-form@^5.2.5` — `NgxFormModule.forRoot()` in `app.module.ts`
- `@webilix/ngx-helper@^0.1.50` — `NgxHelperModule.forRoot({ primary: 'rgb(56, 77, 84)', ... })`; provides `NgxHelperDialogService`, `NgxHelperToastService`, `NgxHelperLoadingService`, `NgxHelperBottomSheetService`

Supporting deps (also installed because the reference uses them):
- `echarts@^6` + `ngx-echarts@^21` — chart rendering (will be needed in dashboards)
- `device-detector-js@^3` — device-size + mobile detection
- `ol@^10` — OpenLayers (peer requirement of some webilix modules; not yet used directly)

If a future dependency change creates ambiguity (e.g., `@webilix/ngx-helper-m3` vs `@webilix/ngx-helper`), **stop and ask the user** — do not silently substitute or omit. See [feedback_no_silent_dep_omissions.md](C:/Users/User/.claude/projects/c--Users-User-OneDrive-Documents-Agentic-agentic-projects-factory-dashboard/memory/feedback_no_silent_dep_omissions.md).

### Folder layout (single-app, not the reference's Nx monorepo)

```
frontend-spa/
├── package.json, angular.json, tsconfig.{,app,spec}.json
├── ngsw-config.json, Dockerfile, nginx.conf
├── theme/                                    ← SIBLING to src/, NOT inside
│   ├── fonts/yekan/                          ← Iran-Yekan binary + iran-yekan.css (33 files)
│   ├── fonts/icon/                           ← Material Icons Outlined (6 files)
│   └── style/
│       ├── styles.scss                       ← global rules, body { font-family: Yekan; }
│       └── factory/
│           ├── color.scss                    ← CSS custom properties (token values)
│           └── palette.scss                  ← Material M3 palette
└── src/
    ├── index.html, main.ts, manifest.webmanifest, favicon.ico
    ├── assets/images/
    └── app/
        ├── app.module.ts                     ← NgModule with NgxHelperModule.forRoot + NgxFormModule.forRoot
        ├── app-routing.module.ts             ← lazy-loaded feature modules
        ├── app.component.{ts,html,scss}
        ├── app.version.ts                    ← export const AppVersions = { api, app }
        ├── pages/<feature>/                  ← lazy-loaded feature modules
        │   ├── <feature>.module.ts
        │   ├── <feature>-routing.module.ts
        │   └── <feature>.component.{ts,html,scss}
        └── shared/
            ├── shared.module.ts              ← declares + exports page components + Material modules
            ├── page/                         ← page chrome — copied from reference libs/page/
            │   ├── page.component.{ts,html,scss}      ← outer wrapper, online/offline/loading overlays
            │   ├── header/page-header.component.*
            │   ├── footer/page-footer.component.*
            │   ├── loading/page-loading.component.*
            │   ├── updated/page-updated.component.*   ← Angular SwUpdate hookup
            │   └── about/page-about.component.*       ← static "about the app" dialog
            ├── services/
            │   ├── app.service.ts            ← deviceSize tracking (RxJS Subject)
            │   ├── page.service.ts           ← pageTitle (RxJS Subject)
            │   └── loading.service.ts        ← reference-counted HTTP loading flag
            ├── interfaces/                   ← PageMenu, IPageTitle, IDeviceSize
            └── interceptors/                 ← functional interceptors (loading, date)
```

### Color tokens (verbatim from `temp/frontend-true/theme/style/admin/color.scss`)

The user said "exact same colors" — do not improvise. Tokens live in `frontend-spa/theme/style/factory/color.scss` and are exposed as CSS custom properties on `:root`:

```scss
--primaryColor:    rgb(56, 77, 84);        // slate blue-gray
--accentColor:     rgb(228, 190, 146);     // warm tan
--warnColor:       rgb(255, 49, 27);       // red
--backgroundColor: rgb(238, 242, 246);     // pale blue-gray
--highlightColor:  rgb(247, 249, 251);
--borderColor:     rgb(220, 220, 220);
--whiteColor:      rgb(255, 255, 255);
--blackColor:      rgb(36, 29, 29);
--grayColor:       rgb(100, 100, 100);
```

There is no dark mode in UI-001a — the design is light-only by user direction. Dark mode is a separate task (UI-001a-dark) that EXTENDS the reference rather than replacing it.

### Page-shell strip-down

The reference's `libs/page/` and `libs/providers/` components are tightly coupled to a different backend (`UserSignin`, `UserInfo`, `UserAlertActive`, `ConfigService`, `VersionService`). We deliberately do **not** copy that stack — we have factory-specific endpoints (`/chat`, `/ingest`, `/auth/login`). Keep the visuals + Persian labels; drop ApiService/UserService/ConfigService/VersionService/AppSwitcher/AlertButton/SwUpdate flows.

What we keep from the reference's page-header:
- App title rendered in the header (Persian `داشبورد کارخانه`)
- Menu button list (one entry per route)
- About button with `aria-label="درباره نرم‌افزار"` and the static about dialog
- Mobile breakpoint at `<= 600px` (per actual `AppService` code)

What we drop:
- AppSwitcher (multi-app subdomain navigation)
- AlertButton + user-alert polling
- User signin/signout/profile flows
- VersionService polling

### Persian copy (already in source — do not change)

- App title: `داشبورد کارخانه`
- Menu: icon `home`, title `داشبورد`, route `['/']`
- About button: `aria-label="درباره نرم‌افزار"`, dialog title same
- Update toast: `اپلیکیشن با موفقیت به‌روزرسانی شد.` + button `به‌روزرسانی`
- Offline overlay: `خطا در اتصال به شبکه`
- Dashboard placeholder: `صفحه چت و تاریخچه به‌زودی اضافه می‌شوند`

### Adding a new feature page

1. Create `frontend-spa/src/app/pages/<feature>/` with `<feature>.module.ts`, `<feature>-routing.module.ts`, and `<feature>.component.{ts,html,scss}`.
2. Add a lazy route in `app-routing.module.ts`: `{ path: '<feature>', loadChildren: () => import('./pages/<feature>/<feature>.module').then(m => m.<Feature>Module) }`.
3. Add an entry to `pageMenus` in `app.component.ts`.
4. Use `SharedModule` for the page chrome — your feature component is rendered inside `<router-outlet>` inside `<app-page>`.
5. For HTTP calls: inject a service that uses Angular's `HttpClient` (loading interceptor is wired). For tabular data, use `@webilix/ngx-helper` table components. For Jalali dates, use `@webilix/jalali-date-time`.

### Playwright locator rules for the SPA

- Allowed: `get_by_role`, `get_by_label`, `get_by_text`, `get_by_placeholder`, `get_by_title`, `get_by_test_id`.
- Allowed exceptions: `page.locator("html")` for `lang`/`dir`/`data-*` attributes; `page.evaluate(...)` for computed CSS reads (color tokens, font-family).
- Forbidden: Angular Material CSS class selectors (`.mat-toolbar`, `.mdc-button`, etc.), xpath, `:nth-child`. The Material version is going to change underneath us; tests must survive that.
- Disambiguate duplicated text (e.g., "داشبورد" in header + footer) by scoping to ARIA landmarks: `page.get_by_role("banner").get_by_role("button", name="داشبورد")`.

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
