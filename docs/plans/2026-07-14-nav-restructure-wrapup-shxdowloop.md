# Nav Restructure Wrap-up — shxdowloop process plan

**Date:** 2026-07-14
**Branch:** `shxdowloop/2026-07-14/nav-restructure-wrapup` (pushed; base = local `portfoliowebsite` @ `f63671d`, which is 6 ahead of origin, unpushed by user instruction)
**Mode:** Normal. User approved: wrap-up scope, reconcile dirty tree (not theirs), isolated loop branch.

## Goal

The nav restructure itself shipped in Entry 075 (commits `94664d6`→`7bcc45a`). This loop reconciles the dangling state: dirty working tree (style.css, 42 baselines, local-tasks.json), untracked + stale plan doc, stale TODO notes — then re-verifies the suite and hands off. No production push.

## Preflight results

- workspace read-write; docs/, docs/plans/ ok; npm ok; git remote ok, fetch clean.
- shxdowTracker: Claude 4% session / 60% weekly → binding 60%, below 80% ban. Codex 5%/0%. Blackbox token expired (unused).
- nano-agents available (`~/.codex/skills/nano-agents`). Routing: main-agent-first for this run — it is small, git-heavy, and judgment-bound (reconciliation decisions + diff review are main-agent work by contract). Nano dispatch only if a bounded noisy subtask appears.
- Dirty tree at startup (user confirmed NOT theirs → reconcile): `style.css` re-emitted unminified (canonical build is `css:build` = `--minify`), all 42 `tests/baselines/*.png` re-captured post-commit, `docs/sync/local-tasks.json` rewritten (~-1070 lines). Untracked: `docs/plans/2026-07-14-nav-restructure.md` with stale "Planned" header.

## Stages

## Stage 1 — Reconcile dirty tree

**Status:** Complete
**Goal:** Every dirty file either proven-correct-and-committed or restored to HEAD, with evidence.
**Phases:**
- [x] 1.1 style.css: rebuilt with `npm run css:build` — output ≠ HEAD, committed artifact was stale (Track A's `#contact` rule deletion in `src/css/site.css` never propagated to the legacy bundle). **Kept rebuilt copy.** Only consumer is the undeployed legacy root site (Netlify publishes `out/`); legacy footer grid-centering loss accepted.
- [x] 1.2 local-tasks.json: derived from TODO.md via `parse-todo.js`; regen verified byte-identical minus `generatedAt`. **Kept**, regenerated after Stage 3 TODO edits; `sync-all.js --dry-run` clean.
- [x] 1.3 baselines: **discarded re-captures, restored committed set (`229806f`).** Root cause of the churn: `visual-baseline.spec.js` is capture-only (writes into `tests/baselines/` every run, asserts existence/size only — no comparison), and bubble physics makes captures pixel-nondeterministic, so every `npm test` dirties all 40 PNGs. The committed set is the stage-4 visually-adjudicated one; testing-model follow-up recorded in TODO. Related trap killed this session: a leftover `tailwindcss --watch=always` (no `--minify`) kept re-emitting style.css unminified — terminated (PID 28292).
**Verification:** tree holds only intentional changes; evidence in LOGBOOK Entry 076.
**Checkpoint:** stage 1–2 commit (see log)

## Stage 2 — Full verification

**Status:** Complete
**Goal:** `npm run build:next` clean; `npm test` green.
**Result:** 45/45 passed in 50.3s (webServer ran `build:next` + served :3000/:3001).
**Checkpoint:** merged with Stage 1 checkpoint

## Stage 3 — Docs sync + handoff

**Status:** Complete
**Goal:** Commit nav-restructure plan doc with corrected Status header; fix stale TODO.md srcset "uncommitted" note; LOGBOOK Entry 076; final checkpoint + push of loop branch.
**Checkpoint:** final commit on this branch

## Verification matrix

| Check | Command | Status |
|---|---|---|
| CSS artifact parity | `npm run css:build` + `git diff style.css` | drift found → rebuilt artifact kept |
| Next export | `npm run build:next` (via webServer) | pass |
| Full suite | `npm test` | 45/45 pass |
| Derived sync state | `parse-todo.js` regen + `sync-all.js --dry-run` | deterministic match, clean |
| Tree intentional | `git status --short` | clean post-checkpoint |

## Open risks

- Baselines may legitimately differ if rendering drifted since `229806f` (fonts/AA nondeterminism noted in Entry 075 for gallery 360/768). If restore-and-test goes red, adjudicate visually before choosing a side.
- Production push of `portfoliowebsite` (6 commits) deliberately withheld — user decision pending. Netlify form-detection toggle + redirect verification remain deploy-gated.

## Merge readiness checklist

- [ ] Tree clean, suite green
- [ ] Plan docs + TODO + LOGBOOK consistent with reality
- [ ] Loop branch pushed; production push decision handed to user
