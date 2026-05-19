---
description: Stage and commit all changed files with a descriptive message, then push to the upstream remote; flag anything that should probably be in .gitignore
---

# Add, commit, and push all changes

Stage every changed and untracked file in the working tree, create a single commit with a descriptive message, and push the result to the upstream remote.

## What to do

1. **Survey the repo state** (run in parallel):
   - `git status` (no `-uall`) — see modified and untracked files
   - `git diff` — staged + unstaged changes
   - `git diff --staged` — already-staged changes
   - `git log -n 10 --oneline` — match this repo's commit message style
   - `git rev-parse --abbrev-ref HEAD` — current branch name (needed for the push step)
   - `git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null` — does this branch have an upstream? (empty/error = no)

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

6. **Push to the upstream remote**:
   - If the branch has an upstream (step 1 returned one): `git push`
   - If the branch has no upstream: `git push -u origin <branch>` using the branch name from step 1
   - Never use `--force` / `--force-with-lease` unless the user explicitly asks for it
   - Never use `--no-verify` to skip pre-push hooks
   - If the push is rejected as non-fast-forward, **stop and tell the user** — show the remote-ref state and ask whether to `git pull --rebase` or take another action. Do not force-push on your own.

7. **Verify** with `git status` after the push. Report: the commit subject, files committed, the branch + remote it was pushed to, and any files deliberately left out (with the reason).

## Rules

- **Do not amend** an existing commit — always create a new one.
- **Do not use `--no-verify`** or skip hooks (pre-commit or pre-push). If a hook fails, fix the underlying issue, re-stage, and create a new commit.
- **Never force push.** If a normal push fails, surface the failure and ask the user how to proceed.
- **Never commit secrets.** If the user insists on committing a file that looks like it contains credentials, warn them clearly first.
- If there are no changes at all, say so and stop — don't create an empty commit and don't push.
