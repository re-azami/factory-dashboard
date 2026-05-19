---
description: Test a feature in the running app using playwright-cli
argument-hint: <feature description>
---

# Test feature: $ARGUMENTS

Use the `playwright-cli` skill to exercise the feature described above against the running app.

## What to do

1. **Confirm a target**. The feature to test is: **$ARGUMENTS**.
   - If `$ARGUMENTS` is empty, stop and ask the user which feature to test.
   - If the feature is ambiguous, ask one clarifying question before opening the browser.

2. **Make sure the app is reachable.** Default frontend is the Angular SPA on `http://localhost:4200`; backend on `http://localhost:8000`. If the relevant service is not running, tell the user instead of starting it yourself.

3. **Drive the browser via `playwright-cli`** (invoke the `playwright-cli` skill for the exact command surface):
   - `playwright-cli open http://localhost:4200` (or the URL most relevant to the feature)
   - `playwright-cli snapshot` to get refs
   - Interact with `click`, `fill`, `select`, `press`, etc. using refs from the snapshot
   - After each meaningful action, take another `snapshot` to verify the expected state
   - Capture a `screenshot` for any visual assertion the user might want to see
   - Check `console` and `requests` for errors when behavior looks wrong

4. **Cover the golden path and one or two edge cases** for the feature. Don't just smoke-test — actually verify the outcome matches what the feature is supposed to do.

5. **Always `playwright-cli close`** at the end, even on failure.

6. **Report results plainly**: what you tested, what passed, what failed, and any console errors or unexpected network calls. Don't claim success if you couldn't actually verify the behavior — say so explicitly.

## Notes

- This project's UI is in Persian. Match Persian labels when targeting elements (e.g. `getByRole('button', { name: 'ارسال' })`) and don't assume English text.
- Per project rules, do not silently skip bugs or warnings — surface every issue you observe.
