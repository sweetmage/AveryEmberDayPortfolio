# Pre-launch audit — nanoagent plan

**Status:** in progress, 2026-08-06
**Trigger:** user — "use nano agents to double check website functionality and fluidity before launch"
**Branch:** `develop` (deploy pause lifts Aug 7; this is the last check before the one production deploy)
**Execution target:** agent's own shell (Windows PowerShell on AVERYBOT) for the live probe; nano-agents run read-only against the repo.

## Goal

Find anything that would embarrass the site on the day the pause lifts. One production deploy costs 15
of 20 monthly credits, so a defect found after the push is expensive to fix — this is the cheap moment.

## Division of labour

Nano-agents read code and docs. **They do not drive a browser**, so anything that only shows up at
runtime is the main agent's job, run against the **production export** (`out/`) rather than the dev
server, because the export is what actually ships.

| Track | Owner | Scope |
|---|---|---|
| A — Accessibility & semantics | pro nanoagent (opencode) | WCAG 2.1 AA, focus contract, ARIA correctness, heading order, alt text, reduced motion |
| B — Responsive & layout consistency | pro nanoagent (kilo) | Breakpoint behaviour, shared container geometry, overflow risks, wide-screen |
| C — Published copy accuracy | pro nanoagent (opencode) | Every user-visible string: typos, stale claims, em dashes, promises the site cannot keep |
| D — Functionality & dead references | pro nanoagent (kilo) | Interaction logic, links, stale doc/code references, config correctness |
| E — Live runtime probe | **main agent** | 5 routes × 4 viewports × 2 themes against `out/`: console/page errors, failed requests, horizontal overflow, broken images, missing alt, plus interaction smoke |

## Concurrency

**Two at a time, queued** — not a four-way fan-out. Standing preference (2026-05-10) is that looped
nano-agent batches default to sequential, with two concurrent tracks only where the work is clearly
independent. Batch 1 = A + B, batch 2 = C + D, spread across both authenticated routes (opencode,
kilo) rather than stacking one runtime. Track E runs on the main agent throughout.

## Stop conditions

- Each track returns findings once. No iteration loops.
- A track that stalls past the no-progress floor is retried once on the other runtime, then dropped
  with the gap recorded rather than silently missing.
- Helper output is **advisory**. Every finding is verified against the actual file or the live page by
  the main agent before any fix, per the standing rule that subagent file claims are not ground truth.

## Verification after fixes

- `npm test` green twice (currently 90).
- `node scripts/measure-content-widths.js` exit 0.
- Re-run the live probe on the rebuilt export.
- Any visual-baseline movement reviewed as an image, never bulk-accepted.

## Risks

- **False positives on the physics/bubble specs** — the known ~1-in-3 Contact-form flake (Entry 121)
  is not a new defect; do not let a helper relabel it as one.
- **Helpers inventing file contents.** Verify before acting.
- **Scope creep.** This is a defect hunt before a deploy, not a redesign. Findings that are taste
  rather than defect go to `TODO.md`, not into the diff.
