# Google Tasks Retire + Google Docs Access — Plan

**Date:** 2026-06-04
**Owner:** Avery (user) — agent implements after plan review.
**Replaces:** `docs/archives/plans/2026-06-02-google-ticktick-cross-target-sync.md` (Google Tasks half only; TickTick half stays as one-way reference).
**Status:** Reviewed and decisions resolved (2026-06-04). Ready for implementation on user go-ahead.

---

## Goal

Two-part scope change:

1. **Retire Google Tasks sync** — stop all writes from this repo to Google Tasks; clean up 24 orphan tasks pushed on 2026-06-04; remove or quarantine the Google-Tasks-specific code paths so they cannot be run by accident.
2. **Stand up Google Docs read/edit access** for the agent — re-scope the existing Google OAuth credentials to the Docs API, build a thin `scripts/google-docs.js` helper that supports `get`, `read` (export plain text/markdown), and `update` (batchUpdate) operations against a small allow-list of doc IDs, and document the workflow.

The pipeline stays local-first: the source of truth remains repo files; Google Docs becomes a **target the agent can read/edit on request**, not an autonomous sync target.

---

## Decisions (resolved 2026-06-04)

| # | Decision | Choice |
|---|----------|--------|
| D1 | **Doc scope** | **Allow-list** of doc IDs in `docs/sync/google-docs.json`. Agent never edits this file. |
| D2 | **OAuth scope** | `https://www.googleapis.com/auth/documents` **+** `https://www.googleapis.com/auth/drive.readonly`. Drive read access enables `find <name>` (title → ID) so user can discover doc IDs to add to the allow-list without leaving the terminal. Drive remains read-only; all writes go through the Docs API and are still gated by the allow-list. |
| D3 | **Orphan cleanup** | Scripted `sync-google.js --purge --apply` before retiring the script. |

**Implications of D2 (drive.readonly added):**
- The `find <alias_or_query>` subcommand becomes part of the `google-docs.js` MVP (was previously listed as optional/deferred).
- Token swap will request both scopes; verification gate must check **both** scopes are present and `tasks` is absent.
- `find` is read-only and unrestricted by the allow-list (it only returns IDs); `read`/`update` remain allow-list-gated.

---

## Approach

### Part A — Retire Google Tasks (one-shot cleanup, then quarantine)

1. **Add a `--purge` mode to `scripts/sync-google.js`** (single targeted addition, not a rewrite): deletes every task in list "Portfolio Website" whose `notes` contains `localId:` (i.e. previously synced by us). Dry-run first, then `--apply --purge`. Skips tasks the user added by hand. After each successful delete, clears the corresponding entry from `docs/sync/mapping.json` `google` map so stale mappings don't survive.
2. **Run purge once.** Verify Google Tasks UI shows 0 synced tasks remaining and `mapping.google` is empty (or only contains entries for tasks not in the list, which step 6 of Part A will drop wholesale).
   - **Recovery note:** if `--apply --purge` fails partway, re-run it. The `localId:` marker is idempotent (deleted tasks don't re-appear), and remaining tasks still get matched. Do **not** swap OAuth scope (Part B) until purge confirms 0 synced tasks remain. If the purge is unrecoverable for any reason, fall back to manual deletion in the Google Tasks UI before scope swap.
3. **Quarantine the scripts** by creating `scripts/_archive/` (does not exist yet), moving `sync-google.js` (and possibly `sync-all.js`, see step 4) into it, and dropping a `README.md` there explaining why they are retired. Use `git mv` so history is preserved.
4. **Update `scripts/sync-all.js`** to drop the Google leg (TickTick stays). If sync-all only had Google + TickTick, archive it too and keep TickTick callable directly.
5. **Trim `.env`** — leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI`/`GOOGLE_TOKEN_URI` (reused for Docs); rotate `GOOGLE_REFRESH_TOKEN` + `GOOGLE_ACCESS_TOKEN` when scope is swapped (Part B step 2).
6. **Update `docs/sync/mapping.json`** — drop the `google` key; keep `ticktick` for the live TickTick mirror.

### Part B — Google Docs access

1. **Add `scripts/google-oauth.js`** (recreate; was deleted). One-shot OAuth helper that:
   - Prompts for the new scope (driven by D2).
   - Opens browser to consent URL, captures code via local `http://localhost` redirect.
   - Exchanges for refresh + access token, writes both to `.env`.
   - Idempotent: re-running rotates tokens cleanly.
2. **Run the OAuth helper** with both scopes from D2 (`documents` + `drive.readonly`). **Verification gate (must pass before continuing):** `curl -s "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"` returns a `scope` field containing **both** `https://www.googleapis.com/auth/documents` **and** `https://www.googleapis.com/auth/drive.readonly`, and **not** `https://www.googleapis.com/auth/tasks`. If the old `tasks` scope is still present, the user revokes the old grant in Google Account → Security → Third-party apps and re-runs the OAuth helper.
3. **Create `docs/sync/google-docs.json`** — allow-list of doc IDs the agent may touch (D1=a). Schema:
   ```json
   {
     "version": "1.0",
     "docs": [
       { "id": "<doc-id>", "alias": "history-of-mistrust", "permissions": ["read", "write"], "notes": "Phase 3 deferred sync from 2026-05-28 plan" }
     ]
   }
   ```
   Start with one entry: the History of Mistrust doc (Phase 3 of the 2026-05-28 plan was deferred specifically for this).
4. **Build `scripts/google-docs.js`** — thin Node helper, no extra deps, mirrors `sync-google.js` patterns (raw `https`, env loader, token refresh). Subcommands:
   - `node scripts/google-docs.js list` — print allow-list.
   - `node scripts/google-docs.js read <alias|id>` — fetches the document; outputs plain text by default; `--format=markdown` runs a minimal paragraph/heading converter; `--format=json` dumps raw `documents.get` response.
   - `node scripts/google-docs.js diff <alias|id> <local-file>` — reads doc, diffs against a local file, exits non-zero on differences. Read-only.
   - `node scripts/google-docs.js update <alias|id> --from=<local-file> [--apply]` — replaces the entire body via a single `batchUpdate` (`deleteContentRange` + `insertText`). Default is dry-run; `--apply` writes. Refuses if `permissions` lacks `write`.
   - All write paths require the alias/id to be present in `google-docs.json` AND have `write` in `permissions`.
5. **`find` subcommand (in MVP per D2):** `node scripts/google-docs.js find <query>` — Drive search by title (`drive.googleapis.com/drive/v3/files?q=name contains '<query>' and mimeType='application/vnd.google-apps.document'`) returns matching `(id, name, modifiedTime)` rows so the user can copy an ID into the allow-list manually. Read-only; bypasses the allow-list intentionally (it's a discovery tool that returns nothing actionable on its own).
6. **Documentation**:
   - Add a "Google Docs access" section to `AGENTS.md` (or `README.md` near the scripts table if AGENTS.md doesn't exist) with one-paragraph usage and the allow-list rule.
   - Note that **the agent never adds entries to `google-docs.json` autonomously** — user must edit it. This is the safety boundary.

---

## Files to Touch

**Add:**
- `scripts/google-oauth.js` (new; recreates retired helper, scope-configurable). Note: this file was referenced by `scripts/sync-google.js:232` but is currently **absent** from the repo — recreating it is mandatory, not optional.
- `scripts/google-docs.js` (new)
- `docs/sync/google-docs.json` (new; allow-list, starts with 1 entry). **Add to `.gitignore`** alongside `.env` — doc IDs are sensitive and the allow-list should not enter git history.
- `scripts/_archive/` (new directory) + `scripts/_archive/README.md` (new; explains retired sync scripts)
- `tests/google-docs.test.js` (new; minimal `node --test` style or plain `node -e` assertions — no new dependency. Covers: allow-list enforcement, purge filter, scope rejection.)

**Modify:**
- `scripts/sync-google.js` → add `--purge` mode, then move to `scripts/_archive/`
- `scripts/sync-all.js` → drop Google leg, then archive if only Google+TickTick
- `docs/sync/mapping.json` → drop `google` key
- `TODO.md` → close the "Sync Scope Change" item; add brief "Google Docs access" reference under Active Plans
- `LOGBOOK.md` → entry for retire + Docs setup
- `AGENTS.md` (or `README.md`) → Docs access usage paragraph

**Untouched:**
- `scripts/sync-ticktick.js` (still useful one-way mirror)
- TickTick portion of `docs/sync/local-tasks.json` and TickTick MCP config

---

## Steps (in order)

1. User answers D1 / D2 / D3.
2. Implement Part A step 1 (`--purge` mode in `sync-google.js`); dry-run; user confirms; `--apply --purge`.
3. Verify Google Tasks list is clean.
4. Archive `sync-google.js` + adjust `sync-all.js` per Part A 3–4.
5. Update `mapping.json`, `TODO.md`, `LOGBOOK.md` for retire.
6. Write `scripts/google-oauth.js`; run it with chosen scope; verify token swap.
7. Create `docs/sync/google-docs.json` with the History of Mistrust doc ID (user pastes ID into the file).
8. Write `scripts/google-docs.js`; manual test against the allow-listed doc:
   - `read` → confirm content matches what user sees in Docs UI.
   - `diff` against `docs/plans/2026-05-28-history-of-mistrust-canonical-content.md` → confirm exit code and output.
   - `update --from=... ` (dry-run) → confirm planned change preview.
   - `update --from=... --apply` only after user explicit go-ahead, on a doc the user accepts may be overwritten.
9. Add docs section.
10. Final review pass.

---

## Reuse / Dependencies

- **No new npm deps.** Match existing pattern in `sync-google.js`: raw `node:https`, `node:fs`, `URLSearchParams`, manual `.env` loader.
- Reuse Google OAuth client + secret already in `.env`; only the scope and resulting refresh token change.
- Reuse the env-loader / `request()` / `apiGet` style from `sync-google.js` for `google-docs.js`.

---

## Verification

- **Auth:** `curl -s "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"` returns the chosen Docs scope and **no** `tasks` scope.
- **Read path:** `node scripts/google-docs.js read history-of-mistrust` returns non-empty text matching Docs UI (spot-check first 200 chars + final paragraph).
- **Allow-list enforcement:** running `read`/`update` with an alias not in `google-docs.json` exits 1 with a clear message. Covered by `tests/google-docs.test.js` using built-in `node:test` + `node:assert` (no framework, no new deps).
- **Purge filter test:** `tests/google-docs.test.js` includes a unit test that feeds a mixed array of remote tasks (some with `localId:` in notes, some without) into the purge filter function and asserts only the marked ones are selected for deletion.
- **Scope rejection:** test that `update` aborts when the allow-list entry's `permissions` array lacks `"write"`.
- **Write path (gated):** `update --apply` is run only with explicit user confirmation, on a doc whose allow-list entry has `permissions: ["read", "write"]`. Re-read after write to confirm round-trip.
- **No regressions:** TickTick sync (`node scripts/sync-ticktick.js --dry-run`) still works.
- **Repo cleanliness:** `git status` shows only the intended additions/moves; `.env` `GOOGLE_*` keys present and consistent.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OAuth scope swap invalidates the existing refresh token mid-flight before purge runs | Run purge **first** while `tasks` scope is still valid; then swap scopes for Docs. Plan steps reflect this order. |
| `batchUpdate` whole-body replace corrupts a doc with embedded objects (images, tables) | MVP `update` only handles plain text. Refuse (or warn) if the fetched doc has non-text structural elements; require user opt-in via `--allow-rich-loss` flag. |
| Allow-list bypass via direct script edit | Acceptable: agent operates inside the repo; user owns the file. Document the rule explicitly in AGENTS.md. **Also gitignore `docs/sync/google-docs.json`** so doc IDs don't enter public history (mitigates the secondary risk of leaking which docs the user has granted access to). |
| Partial purge failure leaves tasks half-cleaned and OAuth scope half-swapped | Plan sequences purge fully before scope swap. `--purge` is idempotent (re-runnable). Verification gate (`tokeninfo`) blocks Part B until purge is confirmed. Last-resort fallback: manual deletion in Google Tasks UI. |
| Google Tasks list "Portfolio Website" contains user-added tasks the agent didn't sync | `--purge` only deletes tasks whose `notes` contain `localId:` — user-created tasks have no such marker and are skipped. |
| Token storage (`.env`) leak | Already gitignored; unchanged. Just call out scope rotation in LOGBOOK. |
| Scope creep — agent gradually adds doc IDs to allow-list autonomously | Hard rule in AGENTS.md: only the user edits `google-docs.json`. Plan reviewer should flag if any implementation step tries to write that file from a script. |

---

## Out of Scope

- TickTick sync changes (untouched).
- A Drive-wide search/list UX (deferred until D2 changes or user requests it).
- Real-time bidirectional Doc ↔ repo sync (this plan is on-demand read/edit, not autosync).
- Rich-content (images/tables/comments) editing in `update`.
- A Docs MCP server (could come later; out of scope for MVP).

---

## Review Owner

- **Plan review:** pro nano-agent (per shxdow-flow Claude route).
- **Final code review:** dedicated Codex agent if available, else pro nano-agent.
- **Main agent (Claude) owns correctness on diff before handoff.**
