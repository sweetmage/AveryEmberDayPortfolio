# Project Notes

## Branch Policy

> **⏸ Deploy pause until 2026-08-07 — work on `develop`.** Netlify credits are exhausted and the
> user has paused all updates to the live URL. Push `develop`, never `portfoliowebsite` (a
> self-expiring `pre-push` hook enforces it). Preview with `npm run dev` at
> <http://localhost:3000>. Merge `develop` → `portfoliowebsite` in one push on/after Aug 7.
> Full reference: [`docs/deploys.md`](deploys.md). See also `AGENTS.md` Branch Policy and
> `LOGBOOK.md` Entries 104/105.

All changes for this portfolio website must be committed to the **`portfoliowebsite`** branch. Do not commit to `main`/`master` or any other branch without explicit user direction.

**Live deploy branch is `portfoliowebsite`** (repointed from `master` 2026-07-12 via the Netlify API — see `AGENTS.md` Branch Policy and `LOGBOOK.md` Entry 069). Pushing `portfoliowebsite` publishes to production, so every push needs the user's explicit go-ahead in the moment.

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

## Agent Environment Constraints

**EPERM `uv_spawn` — root cause found and resolved (2026-07-02).** The intermittent `EPERM: operation not permitted, uv_spawn 'C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.EXE'` errors were Microsoft Defender's local ML command-line heuristic (`!#SLF:CMD_HSTR:General.ML.B/D`, severity 5) false-positively blocking `powershell.exe -EncodedCommand <base64>` launches from Node extension hosts. Confirmed via `Get-MpThreatDetection` (blocks logged 2026-07-01 1:18 PM). A Defender platform update the evening of 2026-07-01 plus the 2026-07-02 signature update stopped the false positive; the exact spawn pattern now passes 5/5.

If it recurs: check `Get-MpThreatDetection` for fresh `SLF:CMD_HSTR` entries, allow the detection in Windows Security → Protection history, and update signatures (`Update-MpSignature`). Cloud-delivered protection (MAPS) is disabled on this machine, which makes local ML heuristics block unilaterally instead of getting a cloud second opinion — enabling it reduces these false positives.

The earlier `.js`-file/`shell-proxy.js` workarounds below are no longer required but remain valid fallbacks while a block is active:
- Write a `.js` file and run `node file.js` instead of `node -e`.
- One-off PowerShell: `node scripts/shell-proxy.js pwsh "Get-Date"`; one-off cmd: `node scripts/shell-proxy.js cmd "dir /b"`.
