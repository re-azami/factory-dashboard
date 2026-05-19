# Scrum Master — Sub-agent Rules

This file is referenced by every sub-agent spawned from `/scrum_master`. Read it once at the start of your sub-agent run and apply every section that's relevant to your stage.

## Repo conventions (apply in every stage that writes code)

- **LLM provider abstraction**: lives in `backend/app/llm/`. Extend it, don't bypass. Tool-result message shape differs by provider: Anthropic uses `{role: "user", content: [{type: "tool_result", ...}]}`; OpenAI-compatible uses `{role: "tool", tool_call_id, content}`. Each client's `build_tool_result_message()` handles this.
- **Excel parser**: anchor-based, never row-number-based. See `backend/app/ingestion/parser.py` and its `_find_cell()` helper.
- **SQL agent**: uses the `factory_ro` PostgreSQL role (SELECT-only). Do not introduce write paths through the agent's `execute_sql` tool.
- **Persian text**: normalize via `_normalize()` before comparison. Never modify `raw_text` columns — they are the original Persian intact.
- **Supervisor names**: must be canonicalized before any ingestion or duplicates return (see the supervisor-normalization memory).
- **Calendar**: both `report_date` (Gregorian DATE) and `jalali_date` (TEXT) are stored. `1405/01/01` ≈ `2026-03-21`.

## Edge-case checklist (mandatory in Stage 2 — unit tests)

For every new behavior, address each category below. Either add a test for it, or add a one-line comment in the test file stating it does not apply and why. Do **not** skip a category silently.

1. **Empty / missing input** — empty string, empty list, missing DB row, missing Excel sheet/cell.
2. **Boundary values** — zero, one, max, off-by-one, single-row vs multi-row results.
3. **Persian / Unicode text** — RTL strings, mixed Persian + English, `_normalize()` invariants, supervisor-name canonicalization.
4. **Duplicate rows** — same `(report_date, shift, line)`, duplicate downtime entries.
5. **Null DB columns** — recovery percent null, jalali_date null, supervisor null.
6. **Calendar conversion** — Gregorian ↔ Jalali boundary days, year/month rollovers.
7. **Permission denials** — `factory_ro` rejecting writes, unauthenticated user, missing permission.
8. **LLM provider switches** — cover both message-shape conventions if the change touches `backend/app/llm/`.

Tests must be **deterministic**: no real network calls, no real wall-clock time (use `freezegun` or a fixture clock). Reuse existing fixtures from `backend/tests/conftest.py` when present.

## Playwright locator rules (mandatory in Stage 3 — integration test)

The UI library (currently Angular Material) will change versions underneath us. Tests must survive that.

**Allowed locators:**

- `page.get_by_role("button", name="…")`
- `page.get_by_label("…")`
- `page.get_by_text("…")`
- `page.get_by_placeholder("…")`
- `page.get_by_title("…")`
- `page.get_by_test_id("…")` — only if the implementation explicitly adds a `data-testid` for this purpose.

**Forbidden:**

- Angular Material CSS class selectors (`.mat-toolbar`, `.mdc-button`, etc.) — the Material version is going to change underneath us.
- xpath that depends on the framework's DOM structure.
- `:nth-child` / positional selectors.

**UI language:** the project's UI is in Persian. Match Persian labels (e.g. `get_by_role("button", name="ارسال")`); do not assume English text.

**Fixtures:** reuse `backend_url`, `frontend_url`, and `require_stack` from `tests/e2e/conftest.py`. Do not re-invent them.

**Assertions:** assert observable outcomes — visible text, accessible state, backend API responses, DB state via the backend. Do not assert on implementation details like class names or internal DOM structure.

## Absolute prohibitions (apply in every stage)

- No `@pytest.skip`, no `xfail`, no marking tests as expected to fail.
- No `try/except` wrapping the failing assertion to hide it.
- No commenting out a test to make the suite green.
- No silent deletion of a test "because the feature changed" without explicit user direction.
- No `--no-verify` or `-c commit.gpgsign=false` on git commits.
- No modifications to TODO.md from sub-agents — column moves and check-offs are coordinator-only.
- No starting Docker services speculatively — only after a connection-refused failure during the test stage.

If you encounter a real ambiguity in the spec (the test and the code disagree because the requirement is unclear), **stop and surface it via `AskUserQuestion`** rather than guess.
