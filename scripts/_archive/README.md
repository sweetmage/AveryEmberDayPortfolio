# Archived Scripts

These scripts were retired as part of the Google Tasks sync deprecation (2026-06-04).
They are preserved in git history but should not be run.

## `sync-google.js`

Originally: outbound sync pipeline from `docs/sync/local-tasks.json` to Google Tasks API.
Retired because the user no longer wants repo state mirrored to Google Tasks.
The 24 (actually 49) orphan tasks previously pushed to the "Portfolio Website" list were
purged via `--purge --apply` before this file was archived.

If you need to restore Google Tasks sync, revert the `git mv` and re-authorize the
`tasks` OAuth scope (the current token only has `documents` + `drive.readonly`).

