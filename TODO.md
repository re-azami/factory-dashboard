# TODO — Active Backlog

Kanban-style tracker. Tasks move through columns by cut-and-paste:

**Backlog → To Do → In Progress → Test → Done**

A task in **Test** means the code is written and its Playwright integration test must pass before moving to **Done**. Per project rule: every feature task ends with a Playwright check.

For historical Phase 1 / Phase 2 plan see [TASKS.md](TASKS.md).

---

## Open design decisions

Recorded here so they're visible; resolve them in the noted task.

1. **Frontend stack** — stay on Streamlit vs. migrate to an SPA (React / Next.js / etc.). Affects AUTH-003, UI-001, UI-002, DASH-005/007/008. Decide before starting **UI-001** at the latest.
2. **Session storage** — JWT in localStorage vs. signed cookies. Decide in **AUTH-002**.
3. **Compaction strategy** — summarize-oldest vs. sliding window vs. hierarchical summary. Decide in **CC-004**.

---

## In Progress

_(empty)_

---

## Test

### AUTH-001 — User / permission DB schema + seed admin
- [x] Design tables: `users` (id, username, password_hash, created_at, is_active), `permissions` (name PK), `user_permissions` (user_id, permission_name)
- [x] Alembic migration `005_add_users.py`
- [x] Password hashing util (argon2 or bcrypt) — bcrypt
- [x] Seed admin from `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) on startup if no users exist
- [x] Admin gets all permissions on seed
- [x] Backend unit test for seed + hash (test_auth_hashing.py, test_auth_models.py, test_auth_seed.py)
- [ ] Playwright integration test passes (covered later in AUTH-010 once login exists)

---

## To Do

### UI — Theme + PWA

#### UI-003 — Mobile-responsive layout pass
- [ ] Test all pages at 360px and 768px viewports
- [ ] RTL still correct on mobile
- [ ] Tap targets ≥ 44px

#### UI-004 — Playwright: theme + PWA
- [ ] Theme switch persists
- [ ] `manifest.json` served with correct content-type
- [ ] Service worker registers (`navigator.serviceWorker.controller`)
- [ ] On mobile viewport, install prompt is reachable
- _Depends on:_ UI-001, UI-002, TEST-001

### AUTH — Login, users, permissions

#### AUTH-003 — Frontend login page + auth state
- [ ] Login page with username / password
- [ ] Auth state stored on client (per decision in AUTH-002)
- [ ] Redirect unauthenticated users to `/login`
- [ ] Logout button visible when logged in
- [ ] Show username + role indicator in header
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-002

#### AUTH-004 — Admin: add user
- [ ] `POST /admin/users` (gated by `add_user`)
- [ ] Admin → Users page lists users
- [ ] "Add user" form (username, initial password, initial permissions)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-003

#### AUTH-005 — Admin: delete user
- [ ] `DELETE /admin/users/{id}` (gated by `delete_user`)
- [ ] Confirm dialog in UI
- [ ] Cannot delete the last admin
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-004

#### AUTH-006 — Admin: change user permissions
- [ ] `PATCH /admin/users/{id}/permissions` (gated by `change_user_permission`)
- [ ] Checkbox grid of all permission names (from AUTH-009 registry)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-004, AUTH-009

#### AUTH-007 — Wire `developer_mode` → model dropdown
- [ ] Hide model dropdown for users without `developer_mode`
- [ ] Non-dev users get `LLM_MODEL` from `.env` (current default)
- [ ] Backend rejects model override if user lacks `developer_mode`
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-003

#### AUTH-008 — Gate chat modes by permission
- [ ] `use_simple_chat` controls simple-mode availability
- [ ] `use_data_science_chat` controls deep-research-mode availability
- [ ] If user has neither, chat page shows a "no access" message
- [ ] Backend rejects mode if user lacks the permission
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-003

#### AUTH-009 — Permission registry in code
- [ ] Single Python module exporting the canonical list of permission names
- [ ] Initial list: `developer_mode`, `daily_report_adder`, `daily_report_editor`, `daily_report_delete`, `change_user_permission`, `use_simple_chat`, `use_data_science_chat`, `add_user`, `delete_user`, `dashboard_manager`
- [ ] Helper to add a new permission (and migrate to DB)
- [ ] Document how to add a new one in [CLAUDE.md](CLAUDE.md)

#### AUTH-010 — Playwright: auth flow end-to-end
- [ ] Login as admin → access admin page → succeeds
- [ ] Logout → admin page redirects to /login
- [ ] Login as regular user → admin page returns 403 / hides nav
- [ ] Wrong password → error shown, no token issued
- _Depends on:_ AUTH-003, AUTH-004, TEST-001

#### AUTH-011 — Self-service: change own password
- [ ] `POST /auth/change-password` (body: current_password, new_password)
- [ ] Verifies current password before accepting new
- [ ] Re-hashes via `app.auth.hashing`
- [ ] Optionally invalidates other active sessions for this user
- [ ] Backend unit test (success, wrong current pw, weak new pw)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-002

#### AUTH-012 — Admin: reset another user's password
- [ ] `POST /admin/users/{id}/reset-password` (gated by `change_user_permission`)
- [ ] Body: new password (admin-supplied) OR server-generated temp password returned once
- [ ] Forces target user to change on next login (sets `must_change_password = true`)
- [ ] Cannot reset your own via this route (use AUTH-011)
- [ ] Activity-log entry written (LOG-001)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-004, AUTH-013

#### AUTH-013 — Force password change on first login
- [ ] Add `must_change_password BOOLEAN NOT NULL DEFAULT false` to `users`
- [ ] Alembic migration `006_add_must_change_password.py`
- [ ] `seed_admin` sets the flag to `true` for the seeded admin
- [ ] Login still succeeds but `/auth/me` reports the flag
- [ ] Frontend: when flag is set, redirect to change-password page; block other routes until cleared
- [ ] AUTH-011 clears the flag on successful change
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-011

#### AUTH-014 — Self profile page
- [ ] `/profile` page shows username, active status, permissions list, `created_at`, `last_login_at`
- [ ] Embeds the change-password form (AUTH-011)
- [ ] Accessible to any logged-in user (no extra permission)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-003, AUTH-011

#### AUTH-015 — Admin: edit user (rename / activate / deactivate)
- [ ] `PATCH /admin/users/{id}` accepts `username` and/or `is_active`
- [ ] Gated by `change_user_permission`
- [ ] Inactive users cannot log in (login returns 401 even with correct password)
- [ ] Cannot deactivate or rename the last active admin (HTTP 409)
- [ ] Admin → Users table shows toggle for active/inactive
- [ ] Activity-log entry written (LOG-001)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-004

#### AUTH-016 — Failed-login lockout
- [ ] Add `failed_login_attempts INT NOT NULL DEFAULT 0` and `locked_until TIMESTAMPTZ` to `users`
- [ ] Alembic migration `007_add_login_lockout.py`
- [ ] Lock for N minutes after K consecutive failures (configurable: `LOGIN_LOCKOUT_THRESHOLD`, `LOGIN_LOCKOUT_MINUTES`)
- [ ] Successful login clears the counter
- [ ] While locked: login returns 423 with "try again in X minutes"
- [ ] Admin edit endpoint (AUTH-015) can clear lockout fields
- [ ] Backend unit test (counter increments, lock triggers, lock expires)
- [ ] Playwright integration test passes
- _Depends on:_ AUTH-002

#### AUTH-017 — Rate-limit `/auth/login`
- [ ] Per-IP rate limit (default 5 requests / minute) using `slowapi` or equivalent
- [ ] Returns 429 with `Retry-After` header on exceed
- [ ] Configurable via `.env` (`LOGIN_RATE_LIMIT`)
- [ ] Exempts internal health checks
- [ ] Backend unit test
- _Depends on:_ AUTH-002

#### AUTH-019 — Password policy
- [ ] Add validators in `app.auth.hashing` or a new `policy.py`: min length (default 12), require digit + letter, reject common passwords
- [ ] Configurable via `.env` (`PASSWORD_MIN_LENGTH`)
- [ ] Enforced on: `seed_admin`, AUTH-011 change-password, AUTH-012 admin-reset
- [ ] Returns 422 with field-level error on violation
- [ ] Backend unit test for each rule
- _Depends on:_ AUTH-001

#### AUTH-020 — Track `last_login_at`
- [ ] Add `last_login_at TIMESTAMPTZ` to `users`
- [ ] Alembic migration `009_add_last_login.py`
- [ ] Updated on successful login (AUTH-002)
- [ ] Shown on profile page (AUTH-014) and admin users list
- _Depends on:_ AUTH-002

---

## Backlog

### UI — Polish

#### UI-005 — Replace placeholder PWA icons with branded artwork
- [ ] Design or supply the brand artwork (replaces the flat factory-glyph placeholders generated by `frontend-spa/scripts/generate_pwa_icons.py` in UI-002)
- [ ] Regenerate the 8 standard sizes (72/96/128/144/152/192/384/512) plus the 512×512 maskable variant; keep filenames the same so `manifest.webmanifest` and `index.html`'s `apple-touch-icon` keep working
- [ ] Swap into `frontend-spa/src/assets/icons/`
- [ ] Visual check on Android (Chrome adaptive icon mask) and iOS (apple-touch-icon home-screen render)
- _Depends on:_ UI-002

---

### OPS — Production server (DigitalOcean droplet)

#### OPS-001 — Rsync `data/raw/` to the server
- [ ] From laptop: `rsync -avz --exclude='_redundant/' data/raw/ factory@165.227.231.224:~/factory-dashboard/data/raw/`
- [ ] Excludes `_redundant/` (1405.xlsx — see `memory/project_redundant_1405.md`)
- [ ] Verify file count and total size match laptop after rsync
- [ ] On server: `ls -la ~/factory-dashboard/data/raw/factory/` returns expected workbooks

#### OPS-002 — Re-run `/ingest` on the server for each Excel file
- [ ] After OPS-001, hit `POST /ingest?source=factory` from the server for every workbook in `data/raw/factory/`
- [ ] Verify `production_shift`, `downtime`, `daily_report`, `raw_sheet_cells` row counts match laptop DB
- [ ] Smoke-test agent: `POST /chat` with a Persian question that exercises the data

#### OPS-003 — Pre-embed downtime on laptop, push to server (Phase 2)
- [ ] On laptop (GPU): `POST /ingest/enrich` once Phase 2 lands → populates `downtime.embedding`
- [ ] Dump: `docker compose exec db pg_dump -U factory -d factory > backup.sql`
- [ ] Push: `scp backup.sql factory@165.227.231.224:~/`
- [ ] Restore on server: `docker compose exec -T db psql -U factory -d factory < ~/backup.sql`
- [ ] Avoids running CPU-only bulk embedding on the droplet
- _Depends on:_ Phase 2 work landing first

---

### TEST — Playwright integration testing

#### TEST-002 — Shared test fixtures
- [ ] Reset / seed DB fixture
- [ ] `login_as(role)` helper that drops a session cookie / token
- [ ] Screenshot on failure
- [ ] CI-friendly run (artifacts on failure)

---

### LOG — Activity logging (all user activities + HTTP requests)

#### LOG-001 — `activity_log` table + request middleware
- [ ] `activity_log` table: `id BIGSERIAL, user_id NULL, username_snapshot TEXT NULL (denormalised so deleted users still show), ip INET, user_agent TEXT, method TEXT, path TEXT, query_params JSONB, status_code INT, duration_ms INT, request_body JSONB NULL (PII-redacted), response_summary JSONB NULL, event_tag TEXT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [ ] Indexes on `user_id`, `created_at DESC`, `event_tag`, `path`
- [ ] Alembic migration `008_add_activity_log.py`
- [ ] FastAPI middleware logs every authenticated HTTP request (skip `/health`, `/docs`, `/redoc`, `/openapi.json`, static assets)
- [ ] Redact `password`, `current_password`, `new_password`, `token` fields from `request_body` before persisting
- [ ] Auth events also written with `event_tag` set: `login_success`, `login_failure`, `logout`, `password_change`, `password_reset`, `permission_change`, `user_add`, `user_edit`, `user_delete`, `account_locked`
- [ ] `factory_ro` role must NOT have SELECT on `activity_log` (REVOKE in migration) — would leak login attempts + payloads to the SQL agent
- [ ] Async/best-effort write so logging failures never break the request
- [ ] Backend unit test: middleware logs row, redaction strips sensitive fields, failed login still recorded with `success=false` derived from `status_code`
- [ ] Replaces the auth-only audit log scoped in the original AUTH-018
- _Depends on:_ AUTH-002

#### LOG-002 — Admin: activity log viewer
- [ ] `GET /admin/activity-log` paginated, filterable by `user_id`, `event_tag`, `path`, `method`, `status_code`, date range
- [ ] Gated by admin permission (decide which: reuse `change_user_permission` or introduce a new `audit_viewer` — flag in PR)
- [ ] Admin → Activity page lists entries with filters, link from a row to that user's profile, CSV export of current filter
- [ ] Playwright integration test passes
- _Depends on:_ LOG-001, AUTH-004

---

### DR — Daily report form (form-based ingestion + edit/delete)

#### DR-001 — Backend: add daily report via form
- [ ] `POST /daily-reports` validates + writes `daily_report` + `production_shift` + downtime rows (same shape as parser output)
- [ ] Gated by `daily_report_adder`
- [ ] Reuse existing model code; do not duplicate parser logic
- [ ] Backend test passes
- _Depends on:_ AUTH-002

#### DR-002 — Backend: edit daily report
- [ ] `PATCH /daily-reports/{id}` partial update
- [ ] Gated by `daily_report_editor`
- [ ] Audit log entry on edit
- [ ] Backend test passes

#### DR-003 — Backend: delete daily report
- [ ] `DELETE /daily-reports/{id}` cascades to production_shift + downtimes
- [ ] Gated by `daily_report_delete`
- [ ] Audit log entry on delete
- [ ] Backend test passes

#### DR-004 — Frontend: add form
- [ ] Persian labels, RTL layout
- [ ] Jalali date picker
- [ ] Two-shift (day/night) per line input grid
- [ ] Three downtime sections (factory / feed_input / filter_press)
- [ ] Submit posts to DR-001
- _Depends on:_ DR-001, AUTH-003

#### DR-005 — Frontend: edit / delete UI
- [ ] List of existing daily reports with date filter
- [ ] Edit page reuses DR-004 form pre-filled
- [ ] Delete confirms before calling DR-003
- _Depends on:_ DR-002, DR-003, DR-004

#### DR-006 — Excel upload remains, but gated
- [ ] Existing upload UI is hidden unless user has `daily_report_adder`
- [ ] Backend `/ingest` rejects without permission

#### DR-007 — Playwright: add → edit → delete roundtrip
- [ ] Login as a user with all three DR permissions
- [ ] Add a new daily report via form
- [ ] Edit it, change a value, save
- [ ] Delete it, confirm gone
- _Depends on:_ DR-004, DR-005, TEST-001

---

### CC — Chat continuation + compaction at 500K tokens

#### CC-001 — DB schema for conversations
- [ ] `conversations` (id, user_id, title, llm_provider, llm_model, created_at, updated_at, tokens_total)
- [ ] `conversation_messages` (id, conversation_id, role, content, tool_calls JSONB, tokens_estimate, created_at)
- [ ] Alembic migration `006_add_conversations.py`

#### CC-002 — Backend: persist messages + conversation endpoints
- [ ] `GET /conversations` (current user's list)
- [ ] `GET /conversations/{id}` (with messages)
- [ ] `POST /conversations` (new)
- [ ] `POST /conversations/{id}/messages` extends current `/chat` to write into a conversation
- [ ] Existing `/chat` becomes a thin wrapper that creates an ephemeral conversation if none specified
- _Depends on:_ CC-001, AUTH-002

#### CC-003 — Send conversation history to LLM
- [ ] Load messages for `conversation_id`, pass as message history
- [ ] Maintain `tokens_total` on `conversations`
- _Depends on:_ CC-002

#### CC-004 — Compaction at 500K tokens
- [ ] Configurable threshold (`COMPACTION_THRESHOLD_TOKENS=500000`)
- [ ] Also respect the active model's real context limit (don't exceed it regardless)
- [ ] Strategy decision (Open Decisions #3) — summarize-oldest by default
- [ ] When triggered: summarize oldest N messages into one system message, replace, recompute `tokens_total`
- [ ] Store the original messages with a `compacted_into` pointer (don't lose history; just exclude from prompt)
- _Depends on:_ CC-003

#### CC-005 — Frontend: previous conversations sidebar
- [ ] Sidebar lists user's conversations (title + last updated)
- [ ] Click resumes the conversation
- _Depends on:_ CC-002, AUTH-003

#### CC-006 — Frontend: new chat button
- [ ] "New chat" creates a fresh conversation
- [ ] Current single-session behavior is just the most-recent conversation
- _Depends on:_ CC-005

#### CC-007 — Playwright: continuation + compaction
- [ ] Send several messages, reload, conversation still shows them
- [ ] Resume from sidebar — LLM remembers prior context
- [ ] Force-compact (lower threshold via env), send a follow-up that references early context — answer stays coherent
- _Depends on:_ CC-005, CC-006, TEST-001

---

### DATA — Multi-year ingestion

#### DATA-1401 — Ingest 1401.xlsx
- [ ] **Must** canonicalize supervisor names in parser before ingestion (deduped to 3 people on 2026-05-10; without normalization, duplicates return)
- [ ] Verify parser handles 1401 template variant (anchor-based should cover it; tune if not)
- [ ] Ingest, count rows, agent smoke query for a 1401 metric
- [ ] Backend test for the supervisor normalization specifically

#### DATA-1400 — Ingest 1400.xlsx
- [ ] Ingest, smoke query, address any new template quirks

#### DATA-1399 — Ingest 1399.xlsx
- [ ] Ingest, smoke query, address any new template quirks

#### DATA-1398 — Ingest 1398.xlsx
- [ ] Ingest, smoke query, address any new template quirks

#### DATA-VERIFY — Cross-year agent verification
- [ ] Ask agent for yearly recovery averages across 1398–1405
- [ ] Ask agent for yearly downtime totals
- [ ] Spot-check against Excel sources
- [ ] No parser regressions across template variants

---

### MODELS — New models + external auth

#### MODELS-001 — Add Gemma 4 model
- [ ] Run [scripts/quantize_gemma.ps1](scripts/quantize_gemma.ps1) → Q4_K_M GGUF
- [ ] `ollama create gemma4-31b-q4`
- [ ] Add to model dropdown (visible only with `developer_mode`)
- [ ] Smoke test: agent answers a SQL question correctly with `LLM_MODEL=gemma4-31b-q4`

#### MODELS-002 — Claude Code login
- [ ] Investigate Claude Code OAuth / credential flow
- [ ] Backend: support using Claude Code subscription credentials instead of API key
- [ ] Frontend: "Sign in with Claude Code" option in model settings
- [ ] Document the auth flow in [CLAUDE.md](CLAUDE.md)

#### MODELS-003 — Codex / ChatGPT login
- [ ] Investigate availability + ToS for using ChatGPT-Codex credentials programmatically
- [ ] If viable: backend + frontend support analogous to MODELS-002
- [ ] If not viable: document the blocker and close this task

#### MODELS-004 — Gate model picker by `developer_mode`
- [ ] Frontend hides dropdown for non-dev users
- [ ] Backend rejects model override request from non-dev users
- _Depends on:_ AUTH-007 (already covers this — merge if duplicate)

---

### DASH — Dashboards (last phase)

#### DASH-001 — DB schema for dashboards
- [ ] `dashboards` (id, name, owner_user_id, layout JSONB, created_at)
- [ ] `dashboard_items` (id, dashboard_id, function_name, params JSONB, position)
- [ ] `dashboard_assignments` (dashboard_id, user_id)
- [ ] Alembic migration `007_add_dashboards.py`

#### DASH-002 — Wire `dashboard_manager` permission
- [ ] Dashboard CRUD endpoints gated by `dashboard_manager`
- [ ] Assigned users (read-only) gated by assignment, not permission
- _Depends on:_ DASH-001, AUTH-002

#### DASH-003 — `implemented_function` registry
- [ ] Python decorator `@implemented_function(name, params_schema, render_hint)`
- [ ] Returns a callable + a JSON spec
- [ ] Endpoint `GET /implemented-functions` returns the spec list
- [ ] Endpoint `POST /implemented-functions/{name}/run` executes with params
- [ ] All execution uses the read-only `factory_ro` role
- _Depends on:_ DASH-001

#### DASH-004 — Implement 20+ functions
Seed list (extend as needed; target ≥ 20):
- [ ] `avg_iron_grade(period)` — daily/weekly/monthly/yearly/custom range
- [ ] `total_input_feed(period)`
- [ ] `recovery_trend(period)`
- [ ] `downtime_by_category(period)`
- [ ] `downtime_by_equipment(period)`
- [ ] `top_n_downtime_reasons(period, n)`
- [ ] `production_by_line(period)`
- [ ] `production_by_shift(period)`
- [ ] `concentrate_tonnage(period)`
- [ ] `tailings_grade(period)`
- [ ] `feed_grade_vs_recovery(period)` (scatter)
- [ ] `downtime_minutes_per_day(period)`
- [ ] `mtbf(period)` — mean time between failures
- [ ] `mttr(period)` — mean time to repair
- [ ] `shift_supervisor_performance(period)`
- [ ] `filter_press_uptime(period)`
- [ ] `thickener_downtime(period)`
- [ ] `electrical_vs_mechanical_downtime(period)`
- [ ] `monthly_summary_card(period)`
- [ ] `yearly_comparison(years[])`
- [ ] Each function has a unit test
- _Depends on:_ DASH-003, DATA-VERIFY

#### DASH-005 — Dashboard composer UI
- [ ] `dashboard_manager` users see "New dashboard" page
- [ ] Pick function(s) from registry, set params, place in layout
- [ ] Save dashboard
- _Depends on:_ DASH-003, DASH-004

#### DASH-006 — Assign dashboards to users
- [ ] UI to attach dashboards to specific users
- [ ] Bulk assign by selecting multiple users
- _Depends on:_ DASH-005

#### DASH-007 — Dashboard viewer
- [ ] Regular users see only their assigned dashboards
- [ ] Each function renders with its `render_hint` (table / line / bar / scatter / kpi-card)
- [ ] Loading + error states
- _Depends on:_ DASH-006

#### DASH-008 — Dynamic dashboards (user-defined functions in UI)
- [ ] UI to define a new function: name, params, SQL body, optional Python post-processing, render hint
- [ ] Execution sandboxed via `factory_ro` + existing `python_exec` sandbox
- [ ] Saved as a row in a `user_defined_functions` table; available alongside built-in ones
- [ ] Permission scope: only `dashboard_manager` can create
- _Depends on:_ DASH-007

#### DASH-009 — Playwright: dashboards end-to-end
- [ ] dashboard_manager creates a dashboard with built-in functions
- [ ] Assigns it to a regular user
- [ ] Regular user logs in, sees only their dashboard, all widgets render
- [ ] dashboard_manager creates a dynamic function, adds it to a dashboard, it renders
- _Depends on:_ DASH-007, DASH-008, TEST-001

---

## Done

#### UI-002 — PWA support _(2026-05-19)_
- [x] `manifest.json` (name, icons, theme color, start URL)
- [x] Service worker (offline shell, cache strategy)
- [x] Install prompt
- _Depends on:_ UI-001

#### UI-001e — Render Markdown in chat assistant messages _(2026-05-19)_
- [x] Decide library: `ngx-markdown` vs hand-rolled (ask before adding the dep, per the no-silent-dep-omissions rule)
- [x] Render `**bold**`, `*italic*`, headings, lists, inline `code`, fenced ` ``` ` blocks, and GFM pipe tables (the agent uses pipe tables in its replies — see the «۱۱ روز در سال ۱۴۰۴…» reply that motivated this task)
- [x] Sanitize output (no raw HTML injection — assistant text is untrusted)
- [x] Persian/RTL still works: code blocks stay LTR (`direction: ltr; unicode-bidi: isolate`), paragraphs stay `unicode-bidi: plaintext`, table cells inherit RTL
- [x] Only applies to assistant `text` blocks — user bubbles stay literal
- [x] Angular unit tests cover: each markdown construct, sanitization, Persian inside markdown, pipe table from a real agent reply
- [x] Playwright e2e: ask a question whose answer uses bold + a pipe table, assert the rendered DOM has `<strong>` and `<table>` elements (not the literal `**` / `|` characters)
- _Depends on:_ UI-001b

#### UI-001d — Retire Streamlit frontend _(2026-05-19)_
- [x] Remove `frontend/` service from docker-compose and stop building/publishing its image
- [x] Delete `frontend/` Python code and `frontend/tests/`
- [x] Drop Streamlit-specific Playwright tests in `tests/e2e/` (replaced by SPA-targeted ones)
- [x] Update CLAUDE.md (Common Commands, Architecture sections) to reflect Angular SPA
- _Depends on:_ UI-001c

#### UI-001c — Port Query History page to Angular SPA _(2026-05-19)_
- [x] Build History route in the new Angular SPA
- [x] `GET /history?limit=N` fetch + paginated render
- [x] Tool-calls expandable JSON view
- [x] Angular unit tests + Playwright e2e
- [x] Once chat + history parity is verified, remove Streamlit `frontend/` service from docker-compose (track in a follow-up cleanup task — do not delete in this one)
- _Depends on:_ UI-001b

#### UI-001b — Port Chat page to Angular SPA _(2026-05-19)_
- [x] Build Chat route in the new Angular SPA
- [x] NDJSON stream parser for `POST /chat` (text, tool_start, tool_end, error events)
- [x] Tool-card collapsible component with SQL/Python syntax highlighting
- [x] Persian/RTL handling for mixed-script messages
- [x] Agent mode selector (Simple / Deep) — reuse from existing Streamlit semantics
- [x] Angular unit tests + Playwright e2e
- _Depends on:_ UI-001a

#### UI-001a-dark — Add dark mode to Angular SPA (deferred from UI-001a) _(2026-05-14)_
- [x] Define dark palette as overrides on top of `theme/style/factory/color.scss` light tokens
- [x] Add `AppService.colorMode` + `toggleColorMode()` (RxJS Subject) — pattern not in reference, build it here
- [x] Add a toggle button to the page header (Persian aria-labels "تغییر به حالت تاریک"/"تغییر به حالت روشن")
- [x] Persist choice to localStorage under `factory-dashboard:color-mode` (`LIGHT`/`DARK`)
- [x] Angular unit tests + Playwright e2e
- _Depends on:_ UI-001a

#### UI-001a — Angular SPA scaffold _(2026-05-14)_
- [x] **Resolve Open Decision #1 (frontend stack)** — RESOLVED 2026-05-14: Angular 21 SPA, NgModule-based, mirroring `temp/frontend-true/apps/admin/`
- [x] Rebuilt `frontend-spa/` on Angular 21 (NgModule, not standalone). `@angular/core@21.2.13`, `@angular/material@21.2.11`, `@angular/build@21.2.11`.
- [x] Full @webilix family installed: `helper-library@6.1.7`, `jalali-date-time@2.0.9`, `ngx-form@5.2.5`, `ngx-helper@0.1.50` — and used (NgxHelperModule.forRoot, NgxFormModule.forRoot in AppModule).
- [x] Supporting deps installed: `echarts@6.0.0`, `ngx-echarts@21.0.0`, `device-detector-js@3.0.3`, `ol@10.9.0`.
- [x] Theme structure mirrors reference: `frontend-spa/theme/fonts/yekan/` (33 files), `theme/fonts/icon/` (6 files), `theme/style/factory/{color,palette}.scss` (byte-identical to reference admin variants), `theme/style/styles.scss`.
- [x] Color tokens EXACT from reference: `--primaryColor: rgb(56,77,84)`, `--accentColor: rgb(228,190,146)`, `--backgroundColor: rgb(238,242,246)`, `--warnColor: rgb(255,49,27)`, `--whiteColor: rgb(255,255,255)`, etc.
- [x] **Light-only**. Dark mode deferred to UI-001a-dark.
- [x] Page-header strip-down: copied reference visuals/icons/Persian labels ("داشبورد کارخانه", "داشبورد", "درباره نرم‌افزار", "اپلیکیشن با موفقیت به‌روزرسانی شد."); dropped ApiService/UserService/ConfigService/VersionService/AppSwitcher/AlertButton/sign-out flows.
- [x] Placeholder dashboard page renders "صفحه چت و تاریخچه به‌زودی اضافه می‌شوند".
- [x] docker-compose: `frontend-spa` service on port 4200 alongside Streamlit on 8501.
- [x] Karma+Jasmine: 45 tests authored (Stage 2) + a few existing = 47 total, all green.
- [x] Playwright e2e at `tests/e2e/test_ui_001a_scaffold.py`: 7 tests (Persian title, RTL, dashboard placeholder, header title/menu/about labels, reference color tokens applied, Iran-Yekan font loaded).

#### AUTH-002 — Auth endpoints + permission dependency _(2026-05-13)_
- [x] `POST /auth/login` returns session token (decision: JWT vs. signed cookie — see Open Decisions)
- [x] `POST /auth/logout`
- [x] `GET /auth/me` returns user + permission list
- [x] `require_permission(name)` FastAPI dependency
- [x] Tighten CORS to only the frontend origin
- [x] Playwright integration test passes
- _Depends on:_ AUTH-001

### TEST-001 — Configure Playwright _(2026-05-13)_
- [x] `pytest-playwright` + chromium installed
- [x] `tests/e2e/` with `conftest.py`, `test_smoke.py`, `test_chat.py`
- [x] Smoke: title, heading, sidebar, chat input
- [x] E2E: chat → execute_sql → result table; Query History lists the question
- [x] Headless default, `--headed` flag for debugging
- [x] Backend `/chat` NDJSON stream verified separately from the UI
- [x] All 7 tests green; run with `python -m pytest tests/e2e`
