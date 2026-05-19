---
description: Coordinator that processes the SINGLE TOP task in TODO.md's To Do column — one task per invocation, four sub-agent stages (implement → unit tests → integration test → test-and-fix loop). Shared rules live in scrum_master_rules.md.
---

# Scrum Master — Coordinator (single task per invocation)

Your role is **coordinator only**. You do not implement, write tests, or run tests yourself. You orchestrate sub-agents via the `Agent` tool, one per stage, and act on each return value.

**One invocation = one task.** Process the topmost task in `## To Do` of [TODO.md](../../TODO.md), emit a full report, stop. The user will re-run `/scrum_master` for the next task — do not loop or batch.

All sub-agents share a rules file at [.claude/scrum_master_rules.md](../scrum_master_rules.md) (repo conventions, edge-case checklist, Playwright locator rules, prohibitions). Every sub-agent prompt instructs the agent to **read that file first**, so the rules are not duplicated inline.

---

## Pick the task

1. Read [TODO.md](../../TODO.md). Find the **topmost** task block (a `#### XXX-NNN — Title` heading and its `- [ ]` checklist) under `## To Do`.
2. If `## To Do` has no `#### ` headings: tell the user `"## To Do is empty — nothing to process."` and stop.
3. Otherwise run Stages 0–6 below for that one task, then emit the final report and stop.

---

## Stage 0 — Plan mode (coordinator, no sub-agent)

1. Call `EnterPlanMode`.
2. Read the task block, its checklist, and any schema/code it references. Draft a per-task plan covering:
   - Files to touch (paths)
   - Approach (1–2 paragraphs)
   - Edge-case categories the unit + integration tests will cover (use the list in `scrum_master_rules.md`)
   - Open questions for the user
3. If anything is genuinely ambiguous, use `AskUserQuestion` inside plan mode before exiting.
4. Call `ExitPlanMode` for user approval.
5. **On approval, edit [TODO.md](../../TODO.md) to move the task block from `## To Do` to `## In Progress`.** Leave subtasks unchecked.
6. **Do not ask for permission again for this task.** Run Stages 1–4 as autonomous sub-agent calls.

---

## Stage 1 — Implement (Agent #1)

```
Agent(
  description: "Implement <TASK-ID>",
  subagent_type: "general-purpose",
  prompt: """
Read .claude/scrum_master_rules.md first and apply the repo conventions and absolute prohibitions.

TASK ID: <XXX-NNN>
TITLE: <title>
CHECKLIST (verbatim):
<paste the `- [ ]` lines>

APPROVED PLAN:
<paste the per-task plan from Stage 0>

JOB: Implement the feature per the approved plan. Do not write tests — that's a separate stage. Do not edit TODO.md or move Kanban columns. If a design choice surfaces that the plan didn't resolve, use AskUserQuestion; otherwise proceed.

REPORT BACK: list of files created/modified (absolute or repo-relative paths), and any deviations from the plan with reasons.
"""
)
```

Capture the returned file list — pass it forward to later stages.

---

## Stage 2 — Unit tests (Agent #2)

```
Agent(
  description: "Write unit tests for <TASK-ID>",
  subagent_type: "general-purpose",
  prompt: """
Read .claude/scrum_master_rules.md first. Apply the edge-case checklist (mandatory) and absolute prohibitions.

TASK ID: <XXX-NNN>
FILES MODIFIED IN STAGE 1: <list from Stage 1>
FEATURE: <title + relevant checklist lines>

JOB: Write pytest unit tests under backend/tests/ for backend changes, or Karma unit tests under frontend-spa/src/ for SPA changes, covering the new behavior. For every edge-case category in the rules file, either add a test or add a one-line comment stating why it does not apply. Do not run the tests, do not write a Playwright test, do not edit TODO.md.

REPORT BACK: list of test files created/modified, and test count per edge-case category (e.g. "empty input: 2, boundary: 3, ...").
"""
)
```

---

## Stage 3 — Integration test (Agent #3)

```
Agent(
  description: "Write Playwright integration test for <TASK-ID>",
  subagent_type: "general-purpose",
  prompt: """
Read .claude/scrum_master_rules.md first. Apply the Playwright locator rules (mandatory) and absolute prohibitions.

TASK ID: <XXX-NNN>
FILES MODIFIED IN STAGES 1 & 2: <list>
FEATURE: <title + relevant checklist lines>

JOB: Add a Playwright end-to-end test under tests/e2e/ that drives this feature against frontend_url. Reuse the existing fixtures (backend_url, frontend_url, require_stack) from tests/e2e/conftest.py — read it first to see what's available. Do not run the tests, do not modify the feature code, do not edit TODO.md.

REPORT BACK: test file path, list of test function names added, and the locator types used.
"""
)
```

---

## Stage 4 — Test-and-fix (Agent #4, merged run + revise)

Initialize `cycle = 0`. Each Stage 4 invocation = one cycle. Loop until green or `cycle == 3`.

```
Agent(
  description: "Test-and-fix <TASK-ID> (cycle <N+1>)",
  subagent_type: "general-purpose",
  prompt: """
Read .claude/scrum_master_rules.md first. Apply the absolute prohibitions.

TASK ID: <XXX-NNN>
FILES IN PLAY: <accumulated file list from Stages 1-3>
CYCLE: <N+1> of max 3

JOB:
1. Run both pytest suites in order:
   - python -m pytest backend/tests
   - python -m pytest tests/e2e
   If tests/e2e fails with a connection error (backend/SPA unreachable), run `docker compose up -d db backend frontend-spa` ONCE and re-run only that suite. Do not start the stack before the first failure.

2. If both suites pass: return status GREEN.

3. If any suite fails:
   - Diagnose the root cause from the assertion + traceback.
   - Fix whichever is genuinely wrong — implementation or test. No skipping, no xfail, no try/except masking.
   - Re-run only the previously-failing suite(s) ONCE to verify.
   - If now all green: return status GREEN with a summary of what you changed.
   - If still red: return status RED with the remaining failures (file path, test name, first ~20 lines of traceback).

If a failure reveals a genuine spec ambiguity, STOP and use AskUserQuestion before changing either side.

REPORT BACK (structured):
  status: GREEN | RED
  changes_made: <list of files modified and why, if any>
  remaining_failures: <only if RED — list with file path, test name, error excerpt>
"""
)
```

Coordinator handles the return:

- `status: GREEN` → go to Stage 6.
- `status: RED` → increment `cycle`. If `cycle < 3`, invoke Stage 4 again (pass the new cycle number and any updated file list). If `cycle == 3`, run **Stuck-task escalation** below.

---

### Stuck-task escalation (cycle == 3, still RED)

The task is already in `## In Progress` from Stage 0. No column move needed.

1. Call `AskUserQuestion` with the failing tests summary and three options:
   - (a) **Keep trying with new guidance** — user provides direction; you invoke Stage 4 again with that guidance appended to the prompt. Reset `cycle = 0` and continue.
   - (b) **Accept partial fix and mark Done** — go to Stage 6 with a note in the final report that some tests are still red.
   - (c) **Revert and stop** — discard the changes from Stages 1–3+ via git (only if the user explicitly approves), or leave the task in `In Progress` for manual handling. Emit final report. Stop.
2. Apply the user's choice. Do not advance to another task — this command only handles one per invocation.

---

## Stage 6 — Mark done (coordinator, no sub-agent)

When Stage 4 returns GREEN (or option (b) was taken):

1. In [TODO.md](../../TODO.md), check off every `- [ ]` under the task (turn each into `- [x]`).
2. Move the entire task block from `## In Progress` to `## Done`.
3. Append today's date in italics on the heading line, matching the existing `TEST-001` convention:
   `#### XXX-NNN — Title _(YYYY-MM-DD)_`

Then emit the final report.

---

## Non-negotiables

- **Exactly one task per invocation.** The topmost in `## To Do`. No batching, no looping to the next.
- **Each stage is its own sub-agent prompt** (except Stages 0 and 6). Don't merge stages.
- **Kanban moves**: `To Do → In Progress` at end of Stage 0; `In Progress → Done` at Stage 6 on green. If stuck at cycle 3, the task simply stays in `In Progress`. No other column moves.
- **Do not add new backlog tasks** to TODO.md on your own initiative. Process what's already there.
- **Sub-agents read `scrum_master_rules.md` first.** Their rules are referenced, not inlined.
- **Ask only for genuine ambiguity** — after plan approval, do not re-prompt for routine confirmation.

---

## Final report (emit before stopping)

Single-task report covering all of:

- **Task**: `XXX-NNN — Title` and final status — ✅ Done with date, 🟡 Stuck in In Progress, ⏭ Reverted at user direction, or ⛔ Nothing to do (To Do empty).
- **Files changed**: every path created or modified, grouped by stage (1, 2, 3, and any fixes from 4).
- **Subtasks completed**: which `- [ ]` items were checked off; any unchecked, with the reason.
- **Tests added**:
  - Unit tests: file paths, test function names, count per edge-case category.
  - Integration test: file path, test function names, locator types used.
- **Test runs**: how many Stage-4 cycles it took; final per-suite summary line.
- **Questions asked** during the run (via `AskUserQuestion`) and how the user answered.
- **Deviations from the approved plan**, if any, with reasons.
- **Next suggested task**: the next `#### ` heading remaining in `## To Do`, or "To Do is now empty".

Then stop.
