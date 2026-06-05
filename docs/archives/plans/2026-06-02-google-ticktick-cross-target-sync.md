> **Status:** Tracked in TODO.md > TickTick mirror — Portfolio Website list

# Nanoagent Plan: Google ↔ TickTick Cross-Target Sync (2026-06-02)

## Goal
Establish a cross-target task sync pipeline where **local files** (TODO.md, plus `docs/sync/` manifests) are the source of truth. Changes to local files are pushed outward to both **Google Tasks** and **TickTick** via MCP/API calls. No bidirectional pull — local wins always.

## Source of Truth
- `TODO.md` (existing task mirror sections)
- `docs/sync/ticktick-manifest.json` — TickTick project/task serialization (new)
- `docs/sync/google-manifest.json` — Google Tasks task-list serialization (new)
- `docs/sync/mapping.json` — cross-target ID mapping (local → Google ID, local → TickTick ID) (new)

## Approach
1. **Define the local schema** — a single canonical task representation in `docs/sync/local-tasks.json` derived from TODO.md; a regeneration script (`scripts/parse-todo.js`) extracts tasks from TODO.md's structured sections
2. **Build sync scripts** — two standalone Node scripts: `scripts/sync-ticktick.js` and `scripts/sync-google.js`
3. **Auth** — TickTick via existing MCP server (already working); Google via agent-browser logged-in session (Google Tasks API or direct DOM)
4. **Mapping layer** — after first push, persist `localId → remoteId` in `docs/sync/mapping.json` so subsequent syncs update existing tasks instead of duplicating
5. **Deletion sync** — if a task is removed from local-tasks.json, mark it `deleted` in mapping; sync scripts skip deleted tasks and optionally delete or archive the remote copy
6. **Dry-run mode** — `--dry-run` flag on all scripts outputs planned changes without mutating remote state
7. **Security** — `.gitignore` `docs/sync/mapping.json` and `docs/sync/*-manifest.json` to prevent leaking personal task IDs into the public repo

## Roles
| Role | Worker | Type |
|------|--------|------|
| Exploration | Main agent | — |
| Plan review | Pro nano-agent (readonly) | Review this plan |
| Implementation | Main agent + native Codex subagents | Build sync scripts + manifests |
| Verification | Main agent | Dry-run against TickTick MCP |
| Final review | Pro nano-agent (readonly) | Review working tree |

## Steps

### Phase 0 — Auth & access audit
- [ ] Verify TickTick MCP is running — list available MCP tools (check for `getTasks`, `listProjects`, `createTask`, `updateTask`, `completeTask`)
- [ ] Pull live TickTick data to confirm tool schemas and project/task structure
- [ ] Document Google auth path: agent-browser logged-in session OR Google Tasks API with OAuth token
- [ ] Surface login prompts for user (see Login Prompts section below)
- [ ] Create `docs/sync/` directory; add `.gitignore` entries for mapping/manifest files

### Phase 1 — Local schema
- [ ] Create `docs/sync/local-tasks.json` — canonical task array with fields: `id`, `title`, `description`, `dueDate`, `priority`, `status`, `tags`, `list/project`
- [ ] Populate from TODO.md TickTick mirror section + any Google-relevant tasks
- [ ] Create `docs/sync/mapping.json` — skeleton `{ ticktick: {}, google: {} }`

### Phase 2 — TickTick sync script
- [ ] Build `scripts/sync-ticktick.js` using TickTick MCP tools
- [ ] Support: create new tasks, update existing (by mapping), close completed
- [ ] Dry-run mode

### Phase 3 — Google sync script
- [ ] Build `scripts/sync-google.js` using Google Tasks API (REST via fetch)
- [ ] Same CRUD + dry-run support
- [ ] Auth: prompt for OAuth token or use agent-browser session cookies

### Phase 4 — Orchestration
- [ ] `scripts/sync-all.js` — runs both sequentially, reports diff, updates mapping
- [ ] Wire into TODO.md maintenance workflow (run after manual TODO.md edits)

### Phase 5 — Document + review
- [ ] Update TODO.md with sync pipeline section
- [ ] Update LOGBOOK.md
- [ ] Final diff review

## Files to Touch
- `docs/sync/` directory (new)
- `docs/sync/local-tasks.json` (new)
- `docs/sync/mapping.json` (new, gitignored)
- `docs/sync/ticktick-manifest.json` (new, gitignored)
- `docs/sync/google-manifest.json` (new, gitignored)
- `scripts/sync-ticktick.js` (new)
- `scripts/sync-google.js` (new)
- `scripts/sync-all.js` (new)
- `scripts/parse-todo.js` (new) — extracts tasks from TODO.md into local-tasks.json
- `.gitignore` (update — add `docs/sync/mapping.json` and `docs/sync/*-manifest.json`)
- `TODO.md` (update)
- `LOGBOOK.md` (update)
- No HTML/CSS changes

## Verification
- `scripts/parse-todo.js` correctly extracts all TickTick-mirror tasks from TODO.md into local-tasks.json
- TickTick MCP `getTasks` returns data matching local manifest
- Dry-run output shows correct create/update/delete operations
- Deleted tasks in local-tasks.json trigger remote archive/delete in dry-run
- Mapping file persists IDs correctly; no duplicates on re-sync
- No destructive operations fire without `--apply` flag
- Google sync gated behind login
- `docs/sync/mapping.json` and `docs/sync/*-manifest.json` are gitignored (not in repo)

## Login Prompts (for user)

### TickTick
TickTick MCP server is already configured and working (confirmed in Entry 012). No additional login needed — MCP handles auth via the existing TickTick account session.

### Google
Google sync requires one of two authentication paths. Choose one:

**Option A — Google Tasks API (recommended)**
A Google Cloud project with Tasks API enabled is needed and an OAuth 2.0 client ID configured. Use the following prompt with an agent-browser session:

```
Log into Google at https://accounts.google.com. Navigate to https://console.cloud.google.com/apis/credentials. Create an OAuth 2.0 client ID (Desktop application type), download the JSON, and provide the client_id, client_secret, and refresh token. Store these in a local .env file (never committed).
```

**Option B — Agent-browser DOM automation**
Use a logged-in agent-browser session to interact with https://tasks.google.com/ directly:

```
Log into Google at https://accounts.google.com and keep the session open. Navigate to https://tasks.google.com/ to verify your task lists are visible. Provide the session cookie string so the sync script can use it for authenticated API calls.
```

## Risks
- Medium: Google OAuth setup requires human with Google Cloud Console access
- Low: TickTick MCP rate limits on mass create/update
- Low: ID mapping drift if tasks are manually created in TickTick/Google outside the sync pipeline
- Mitigation: dry-run mode always runs first; `--apply` guarded by confirmation prompt

## Queue
Sequential. Phase 0 must complete before implementation. Phases 1-4 can be parallelized within scope.

## Model Route (Codex via Kilo)
- Flash nano-agent: opencode/deepseek-v4-flash-free
- Pro nano-agent: opencode/go/deepseek-v4-pro (paid route available)
