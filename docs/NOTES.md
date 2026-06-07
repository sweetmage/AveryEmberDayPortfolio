# Project Notes

## TickTick

All TickTick to-do lists for this portfolio website live in the **Portfolio** group, in the **Portfolio Website** list (project id `69c8addc8f0823c509e1979f`). Do not create separate lists or groups for portfolio work — add tasks to that list. Project-scoped tasks are tagged by project slug (e.g. `history-of-mistrust`).

## Google Docs Agent Access

The agent can read and edit specific Google Docs via `scripts/google-docs.js`. Access is gated by an allow-list in `docs/sync/google-docs.json` (gitignored). Only the user edits this file; the agent never adds doc IDs autonomously.

**Usage:**
- `node scripts/google-docs.js list` — show allow-listed docs
- `node scripts/google-docs.js find <query>` — search Drive by title (read-only)
- `node scripts/google-docs.js read <alias|id>` — print doc as plain text
- `node scripts/google-docs.js diff <alias|id> <local-file>` — compare doc against local file
- `node scripts/google-docs.js update <alias|id> --from=<local-file>` — preview replacement
- `node scripts/google-docs.js update <alias|id> --from=<local-file> --apply` — write replacement

**Auth:** run `node scripts/google-oauth.js` to obtain a refresh token scoped to `documents` + `drive.readonly`. Google Tasks sync was retired on 2026-06-04; the old `tasks` scope is no longer used.
