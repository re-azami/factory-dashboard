---
description: Stage and commit all changed files with a descriptive message; flag anything that should probably be in .gitignore
---

# Add and commit all changes

Stage every changed and untracked file in the working tree and create a single commit with a descriptive message.

## What to do

1. **Survey the repo state** (run in parallel):
   - `git status` (no `-uall`) — see modified and untracked files
   - `git diff` — staged + unstaged changes
   - `git diff --staged` — already-staged changes
   - `git log -n 10 --oneline` — match this repo's commit message style

2. **Scan for files that should probably NOT be committed.** Before staging anything, check the untracked / modified list for:
   - Secrets or credentials (`.env`, `*.key`, `*credentials*`, tokens in config files)
   - Large binaries, model weights, datasets, Excel dumps (anything in `data/`, `*.gguf`, `*.bin`, `*.xlsx` not already tracked)
   - Build/output artifacts (`__pycache__/`, `*.pyc`, `dist/`, `build/`, `.pytest_cache/`, `node_modules/`, `.next/`, coverage reports)
   - Editor / OS junk (`.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/` workspace files)
   - Scratch / experimental files the user likely doesn't want in history
   
   If you find any such files, **stop and tell the user**: list each candidate and recommend adding it to `.gitignore` (with the exact pattern). Wait for the user's decision before continuing — do not silently skip or silently include them.

3. **Stage files explicitly by name** (never `git add -A` or `git add .` — that risks pulling in the items from step 2). Group related changes mentally so the commit message can describe them coherently.

4. **Analyze the staged diff and draft a commit message** that follows this repo's style (see `git log` output):
   - 1-2 sentences focused on the *why*, not a file-by-file *what*
   - Use the right verb: `add` for new features, `update` / `improve` for enhancements, `fix` for bugs, `refactor` for restructuring, `test` for test-only changes, `docs` for documentation
   - If the changes span multiple unrelated areas, point this out and ask whether to split into multiple commits

5. **Create the commit** using a HEREDOC so formatting is preserved, ending with the Co-Authored-By trailer:

   ```
   git commit -m "$(cat <<'EOF'
   <subject line>

   <optional body>

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```

6. **Verify** with `git status` after the commit. Report: the commit subject, files committed, and any files deliberately left out (with the reason).

## Rules

- **Do not push** unless the user explicitly asks.
- **Do not amend** an existing commit — always create a new one.
- **Do not use `--no-verify`** or skip hooks. If a pre-commit hook fails, fix the underlying issue, re-stage, and create a new commit.
- **Never commit secrets.** If the user insists on committing a file that looks like it contains credentials, warn them clearly first.
- If there are no changes at all, say so and stop — don't create an empty commit.
