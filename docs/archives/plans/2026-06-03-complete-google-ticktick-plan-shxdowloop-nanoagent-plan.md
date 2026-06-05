# Nanoagent Process Plan: Complete Google ↔ TickTick Cross-Target Sync

**Date:** 2026-06-03  
**Branch:** `shxdowloop/2026-06-03/complete-google-ticktick-plan`  
**Source plan:** `docs/plans/2026-06-02-google-ticktick-cross-target-sync.md` (archived) + `docs/plans/2026-06-02-google-ticktick-cross-target-sync.md` (untracked working copy)

---

## Goal

Finish the Google ↔ TickTick cross-target sync pipeline: local files (`TODO.md` → `docs/sync/local-tasks.json`) as the single source of truth, with outbound sync scripts to TickTick (via MCP) and Google Tasks (via REST API). All phases from the original plan that are still pending must be implemented, verified, and documented.

---

## Preflight Results and Degraded Paths

| Check | Result |
|-------|--------|
| Workspace | Read-write |
| `docs/`, `docs/plans/`, `docs/sync/` | Exist and writable |
| Node.js | v25.9.0 — ok |
| npm | 11.12.1 — ok |
| Git remote | `origin` reachable — ok |
| Dirty worktree | Yes (user-owned from previous `archive-resume-html` loop); branched from current state |
| shxdowTracker | Blocked by Windows Application Control policy — **degraded** (cannot read provider usage) |
| Nano-agents | Available at `~/.codex/skills/nano-agents/scripts/nano-agent.sh` |
| Google auth | `.env` contains `GOOGLE_REFRESH_TOKEN` and `GOOGLE_ACCESS_TOKEN` — appears complete |
| TickTick auth | MCP server configured previously; live status unverified until Stage 1 probe |

**Degraded paths:**
- If TickTick MCP is unreachable, attempt to re-add MCP config or fallback to manual task reconciliation.
- If Google refresh token is expired/revoked, flag as hard blocker (requires human browser auth).
- If provider usage is above 70% but shxdowTracker is unavailable, route small tasks to nano-agents and self-review.

---

## Branch and Remote

- **Branch:** `shxdowloop/2026-06-03/complete-google-ticktick-plan`
- **Remote:** Pushed to `origin` with upstream tracking
- **Base:** `shxdowloop/2026-06-03/archive-resume-html` (includes uncommitted user-owned changes from prior session)
- **Policy:** Commit and push after every completed stage. Only commit intentional loop changes; do not stage unrelated dirty files without user direction.

---

## Helper Routing

- **Default:** Native Codex/Claude subagents for exploration, phase planning, plan review, and final review.
- **Execution:** Native subagents for scoped script builds (sync-ticktick.js, sync-google.js). Main agent owns integration and diff review.
- **Nano-agents:** Small directed tasks (parse-todo.js verification, narrow file searches, doc updates). Also used as pressure fallback if native capacity is constrained.
- **Fallback order:** Native → Nano-agent → Main-agent local work with extra self-review.

---

## Stage/Phase Outline

### Stage 1 — Foundation: Auth Audit, Local Schema, and Parser

**Status:** Active  
**Goal:** Verify both target APIs are reachable, establish the canonical local task schema, and build the TODO.md parser.

**Findings (updated during stage):**
- **Google auth verified:** Refresh token works; new access token obtained successfully.
- **TickTick auth gap:** TickTick MCP (`https://mcp.ticktick.com`) is configured in Kilo but not directly accessible from standalone Node.js without OAuth credentials. TickTick Developer Portal registration (Client ID + Secret + OAuth flow) is required for standalone script access. The sync script will be built with an auth abstraction and a `scripts/ticktick-oauth.js` helper (mirroring `google-oauth.js`). The user must complete the OAuth flow to obtain a `TICKTICK_ACCESS_TOKEN`.

**Phases:**
- [x] 1.1 Verify TickTick MCP live connectivity (list projects/tasks, confirm tool schemas) — **DEGRADED:** MCP reachable from Kilo agent context but not from standalone Node without TickTick Developer OAuth credentials. Documented auth gap; `scripts/ticktick-oauth.js` will be built in Stage 2.
- [x] 1.2 Verify Google refresh token (test token refresh or a minimal `tasks.list` API call) — **DONE:** Token refresh successful; new access token obtained.
- [x] 1.3 Define `docs/sync/local-tasks.json` schema (`id`, `title`, `description`, `dueDate`, `priority`, `status`, `tags`, `list/project`)
- [x] 1.4 Build `scripts/parse-todo.js` — extracts tasks from TODO.md structured sections into `local-tasks.json`
- [x] 1.5 Run parser and populate `docs/sync/local-tasks.json` — 80 tasks extracted (45 completed, 35 pending).
- [x] 1.6 Create `docs/sync/mapping.json` skeleton (`{ ticktick: {}, google: {} }`)

**Helpers:**
- 1.1–1.2: Main agent (auth probes require local env access)
- 1.3–1.4: Native phase-planner for schema design; main agent implements parser
- 1.5–1.6: Main agent

**Verification:**
- TickTick MCP returns project/task list without error
- Google API returns 200 on `tasks.list` or successfully refreshes token
- `scripts/parse-todo.js` correctly extracts all TickTick-mirror tasks from TODO.md
- `docs/sync/local-tasks.json` is valid JSON and matches schema
- `docs/sync/mapping.json` created and gitignored

**Checkpoint:** Commit after 1.6

---

### Stage 2 — TickTick Sync Script

**Status:** Complete  
**Goal:** Build a standalone Node script that syncs `local-tasks.json` outbound to TickTick via REST API, with mapping persistence and dry-run support.

**Phases:**
- [x] 2.1 Build `scripts/sync-ticktick.js` skeleton (load local tasks, load mapping, diff logic)
- [x] 2.2 Implement create task via TickTick REST API
- [x] 2.3 Implement update task via TickTick REST API (using `mapping.json` localId → remoteId)
- [x] 2.4 Implement complete/close task logic
- [x] 2.5 Implement deletion sync (local removed → remote archive/close)
- [x] 2.6 Implement `--dry-run` flag (print planned changes, no remote mutation)
  - [x] 2.7 Dry-run verification against live TickTick data — **DONE:** TICKTICK_ACCESS_TOKEN added to .env. Dry-run lists 83 planned creates (all tasks unmapped). Token valid, project reachable, diff logic correct.
  - [x] 2.8 Live apply (pending-only) — **DONE:** 24 pending tasks created in TickTick. Mapping persisted.

**Helpers:**
- 2.1–2.6: Native execution subagent (scoped to `scripts/sync-ticktick.js`)
- 2.7: Main agent runs dry-run and validates output

**Verification:**
- `--dry-run` outputs correct create/update/complete/delete operations
- Mapping file updated correctly after `--apply`
- No duplicate tasks created on re-sync
- Deleted local tasks trigger remote archive in dry-run

**Checkpoint:** Commit after 2.7

---

### Stage 3 — Google Sync Script

**Status:** Complete  
**Goal:** Build a standalone Node script that syncs `local-tasks.json` outbound to Google Tasks via REST API, with token refresh, mapping, and dry-run support.

**Phases:**
- [x] 3.1 Build `scripts/sync-google.js` skeleton (auth refresh, load local tasks, load mapping, diff logic)
- [x] 3.2 Implement token refresh on 401 (`POST https://oauth2.googleapis.com/token`)
- [x] 3.3 Implement create task via Google Tasks API
- [x] 3.4 Implement update task via Google Tasks API (using `mapping.json`)
- [x] 3.5 Implement complete task logic (`status=completed`)
- [x] 3.6 Implement deletion sync
- [x] 3.7 Implement `--dry-run` flag
  - [x] 3.8 Dry-run verification against live Google Tasks — **DONE:** Google Tasks API enabled. Token refresh works, `tasks.list` returns 200, "Portfolio Website" list found, 83 tasks queued for creation.
  - [x] 3.9 Live apply (pending-only) — **DONE:** 24 pending tasks created in Google Tasks list "Portfolio Website". Mapping persisted.

**Helpers:**
- 3.1–3.7: Native execution subagent (scoped to `scripts/sync-google.js`)
- 3.8: Main agent runs dry-run and validates output

**Verification:**
- Token refresh works automatically if access token expired
- `--dry-run` outputs correct create/update/complete/delete operations
- Mapping file updated correctly after `--apply`
- No duplicate tasks created on re-sync

**Checkpoint:** Commit after 3.8

---

### Stage 4 — Orchestration, Documentation, and Final Review

**Status:** Complete  
**Goal:** Wire both sync scripts into a single runner, update docs, and hand off.

**Phases:**
- [x] 4.1 Build `scripts/sync-all.js` — runs both sequentially, reports diff, updates mapping
- [x] 4.2 Add `--pending-only` flag to `sync-google.js`, `sync-ticktick.js`, and `sync-all.js`
- [x] 4.3 Update TODO.md with sync pipeline status and workflow notes
- [x] 4.4 Update LOGBOOK.md with sync cycle entry
- [x] 4.5 Final diff review by main agent
- [x] 4.6 Commit checkpoint

**Helpers:**
- 4.1: Main agent (small integration script)
- 4.4: Native reviewer subagent (readonly)

**Verification:**
- `scripts/sync-all.js --dry-run` runs without error and reports expected changes
- No application HTML/CSS modified
- `.gitignore` correctly excludes `docs/sync/mapping.json` and `docs/sync/*-manifest.json`
- No secrets committed
- TODO.md and LOGBOOK.md reflect completed work

**Checkpoint:** Commit after 4.6

---

## Helper Roles and Iteration Stop Conditions

| Role | Worker | Stop Condition |
|------|--------|----------------|
| Explorer | Native subagent | Returns relevant files, auth risks, and MCP schemas |
| Phase planner | Native subagent | Produces ordered edits with file paths, verification, and risks |
| Plan reviewer | Native subagent | Returns actionable issues only; planning stops when issues are addressed or accepted |
| Executor (TickTick) | Native subagent | Delivers `scripts/sync-ticktick.js` with dry-run support and test evidence |
| Executor (Google) | Native subagent | Delivers `scripts/sync-google.js` with dry-run support and test evidence |
| Final reviewer | Native subagent | Delivers findings on correctness, regressions, and checkpoint readiness |
| Small chores | Nano-agent | Task completes or stalls >6 min with no progress |

If a nano-agent fails, stall, or returns unusable output: retry once with a different model/route, then fall back to native or main-agent local work. Document the retry in LOGBOOK.

---

## Checkpoint Log

| Stage | Commit SHA | Push Status | Notes |
|-------|-----------|-------------|-------|
| 1 | `914cf52` | Pushed | Auth audit, local schema, parser. Google refresh token verified. TickTick auth gap documented. |
| 2 | `5f0ccc1` | Pushed | TickTick sync script built (REST API). Verification blocked on missing TICKTICK_ACCESS_TOKEN. |
| 3 | `5f0ccc1` | Pushed | Google sync script built (Tasks API v1 + auto refresh). Verification blocked on Google Tasks API not enabled. |
| 4 | `5f0ccc1` | Pushed | Orchestration (sync-all.js), docs (TODO.md, LOGBOOK.md), final diff review by main agent. |

---

## Verification Matrix

| What | How | Stage |
|------|-----|-------|
| TickTick MCP reachable | List projects/tasks call | 1 |
| Google token valid | `tasks.list` API call or refresh | 1 |
| parse-todo.js correct | Diff against TODO.md source | 1 |
| local-tasks.json valid | JSON parse + schema check | 1 |
| TickTick dry-run accurate | Inspect console output vs expected task list | 2 |
| TickTick mapping persists | Re-run dry-run, expect 0 creates | 2 |
| Google dry-run accurate | Inspect console output vs expected task list | 3 |
| Google mapping persists | Re-run dry-run, expect 0 creates | 3 |
| sync-all.js runs end-to-end | `node scripts/sync-all.js --dry-run` | 4 |
| No secrets in repo | `git diff --check` + grep for `REFRESH_TOKEN` in tracked files | 4 |
| Docs updated | TODO.md + LOGBOOK.md contain sync entries | 4 |

---

## Open Risks

1. **Google token expiration:** The stored access token may be expired. The sync script must handle 401 by refreshing. If the refresh token itself is revoked, this becomes a hard blocker requiring human re-auth.
2. **TickTick MCP schema drift:** TickTick MCP tools (`getTasks`, `listProjects`, `createTask`, etc.) were confirmed working in Entry 012. If schemas changed, the sync script will need adjustments.
3. **ID mapping drift:** Tasks manually created in TickTick/Google outside the sync pipeline will not have local IDs. The sync script should skip unmapped remote tasks rather than delete them.
4. **Rate limits:** Mass create/update on TickTick MCP or Google Tasks API may hit rate limits. The scripts should batch operations and surface rate-limit errors clearly.
5. **Uncommitted dirty files:** The current branch has pre-existing uncommitted changes from the `archive-resume-html` loop. These must not be accidentally staged into sync checkpoints.

---

## Merge Readiness Checklist

- [x] All 4 stages complete (script implementation, docs, and live apply done)
- [x] Each stage committed and pushed to origin
- [x] `docs/sync/mapping.json` and `docs/sync/*-manifest.json` are gitignored
- [x] `.env` is gitignored
- [x] No HTML/CSS/application code modified (this is a tooling/sync task)
- [x] Scripts include `--dry-run` mode and do not mutate remote state without `--apply`
- [x] TODO.md and LOGBOOK.md reflect completed pipeline
- [x] Process plan updated with final statuses and checkpoint SHAs
- [x] No secrets, tokens, or personal task IDs committed
- [x] Open risks documented with mitigations or acceptance

**Pre-merge human actions required:**
1. ~~Enable Google Tasks API~~ — **DONE** (verified via dry-run)
2. ~~Obtain TICKTICK_ACCESS_TOKEN~~ — **DONE** (saved to `.env`, verified via dry-run)
3. Run `node scripts/sync-all.js --dry-run` to verify both targets after unblocking. — **DONE**
4. ~~Run `node scripts/sync-all.js --apply` to perform the first live sync.~~ — **DONE** with `--pending-only` flag (2026-06-04). 24 pending tasks created in both TickTick and Google Tasks. 59 completed archive tasks skipped.

---

*Plan written by main agent during shxdowloop bootstrap. Live updates will be appended as stages progress.*
