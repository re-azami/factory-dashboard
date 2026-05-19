---
description: Pull the current branch from its GitHub upstream and resolve any merge that's needed; stop and ask if conflicts can't be resolved safely
---

# Pull from GitHub (and merge if needed)

Bring the current branch up to date with its GitHub upstream. If the remote has diverged from local, perform the merge. If merge conflicts arise, try to resolve them; otherwise stop and ask the user.

## What to do

1. **Survey the repo state** (run in parallel):
   - `git status` (no `-uall`) — see modified and untracked files; note whether the working tree is dirty
   - `git rev-parse --abbrev-ref HEAD` — current branch name
   - `git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null` — upstream tracking ref (empty/error = none)
   - `git fetch --prune` — refresh remote refs (use the configured remote, normally `origin`)

2. **Check for an upstream.** If the branch has no upstream tracking ref:
   - Stop and tell the user: report the branch name and ask whether to set the upstream (e.g., `origin/<branch>`) or skip the pull. Do not guess the remote branch name.

3. **Compare local vs upstream** with `git rev-list --left-right --count HEAD...@{u}`:
   - `0 0` → already up to date. Say so and stop.
   - `N 0` (ahead, not behind) → nothing to pull; say so and suggest running `/add_commit_and_push` if the user wants those commits pushed.
   - `0 N` (behind, not ahead) → fast-forward case. Run `git pull --ff-only`.
   - `N M` (diverged — both ahead and behind) → a real merge is needed. Continue to step 4.

4. **Handle a dirty working tree before merging.** If `git status` shows uncommitted or untracked changes AND the branch has diverged, stop and ask the user how to proceed:
   - Commit first via `/add_commit_and_push`?
   - Stash with `git stash push -u -m "pre-pull stash"` (restore with `git stash pop` after the pull)?
   - Pull anyway (only safe if untracked files don't collide with incoming changes)?

   Do not silently stash. Do not run `git checkout -- .` or `git reset --hard` to "make the pull work" — that destroys the user's work.

5. **Run the pull.** Use the user's configured pull strategy (do not force `--rebase` or `--no-rebase` unless they've asked):
   - `git pull`
   - Capture stdout and stderr — git reports the merge result and any conflicts there.

6. **If the merge succeeds cleanly**, stop here. Report: the branch, how many commits were pulled, and whether a merge commit was created or it was a fast-forward.

7. **If merge conflicts are reported:**
   - Run `git status` and `git diff --name-only --diff-filter=U` to list conflicted files.
   - For each conflicted file, read it and inspect the `<<<<<<<` / `=======` / `>>>>>>>` markers.
   - **Only auto-resolve when the resolution is unambiguous**, e.g.:
     - Both sides added new, non-overlapping entries to a list/dict/import block → keep both.
     - One side is a strict superset of the other (whitespace, comment-only, or trivially additive) → keep the superset.
     - The conflict is in a lockfile (`package-lock.json`, `poetry.lock`, `Cargo.lock`) → don't hand-edit; regenerate with the appropriate tool after resolving the source manifest.
   - **Stop and ask the user** when the resolution requires judgment: semantic disagreement between sides, conflicts in business logic, or anything where picking the wrong side silently loses work. List the file(s) and a short summary of each conflict.
   - After hand-editing, run `git add <file>` for each resolved file, then `git commit --no-edit` to finish the merge (this uses the merge message git prepared — do **not** invent a new one).
   - If asked to abort instead, run `git merge --abort` (this restores the pre-pull state) and report.

8. **Verify** with `git status` and `git log -n 5 --oneline --graph --decorate`. Report: how many commits were merged in, whether any conflicts were resolved (and which files), and the final HEAD position.

## Rules

- **Never force-pull-equivalent operations.** No `git reset --hard @{u}`, no `git checkout origin/<branch> -- .`, no `git pull --force`. These discard local work.
- **Never run `git push --force`** to make a diverged branch match the remote.
- **Never use `--no-verify`** to bypass hooks.
- **Don't override the user's pull strategy.** If `pull.rebase` is configured, respect it.
- If the working tree has uncommitted changes and the branch has diverged, **always ask** before stashing or pulling — do not silently move the user's work around.
- For conflicts that aren't trivially mechanical, surface them to the user with the conflicting hunks — don't pick a side on your own.
