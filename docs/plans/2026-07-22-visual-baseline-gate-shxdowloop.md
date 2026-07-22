# Visual Baseline Gate — shxdowloop process plan

**Date:** 2026-07-22
**Branch:** `shxdowloop/2026-07-22/visual-baseline-gate` (from `portfoliowebsite` @ `493b054`)
**Remote:** `origin` — pushed, tracking
**Mode:** Normal (unattended stage loop)

## Goal

Turn `tests/visual-baseline.spec.js` from a capture-only script into a real
regression gate: compare-based assertions, deterministic captures under
animation, an explicit update flag, and a tree that stays clean across runs.

Success = `npm test` twice in a row on an unchanged tree is green and leaves
`git status` clean, and a deliberate visual change turns it red.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/plans/` ok |
| npm / Playwright | 11.12.1 / 1.61.1 |
| Remote | `origin` reachable |
| shxdowTracker | claude session 30%, weekly 17% → **binding 30%**, below the 80% native ban |
| Codex | 0% — available as handoff target |
| nano-agents | available (`~/.claude/skills/nano-agents/scripts/nano-agent.sh`) |
| Startup tree | 40 dirty baseline PNGs — discarded per user decision (regenerate clean) |

Degraded paths: none.

## User decisions (gated preflight, 2026-07-22)

1. **Baseline layout:** Playwright native `toHaveScreenshot()` convention
   (`*-snapshots/`), not the current `tests/baselines/` path. Accepts relocating
   the 40 PNGs in exchange for built-in diff artifacts and `--update-snapshots`.
2. **Dirty PNGs:** discard and regenerate clean under the new capture
   conditions, then commit as the authoritative set.

## Findings that shape the work

1. **Capture-only confirmed.** `visual-baseline.spec.js:78-88` writes into
   `tests/baselines/` and asserts only `existsSync` + `size > 1024`.
2. **`npm test` runs `next build`** (`playwright.config.js:19`), which deletes a
   running dev server's runtime — `distDir` is `out`. Dev must be stopped first.
3. **Port-3000 collision.** webServer #1 is `npx serve . -l 3000` (the *legacy*
   static site) with `reuseExistingServer: true` locally, so it silently adopts
   whatever already holds 3000 — including a Next dev server. Latent bug.
4. **Animation is not just CSS.** `animations: 'disabled'` freezes CSS
   animations/transitions but not canvas/rAF work. `BubblePhysics` and the five
   `brand-hero-blob` elements need explicit freezing or masking.

## Helper routing

Nano-first per shxdowloop default. Binding usage 30% → native permitted for the
four reserved cases. Planned:

- Main agent: all implementation (single tightly-coupled test/config surface,
  small diff, correctness-critical — splitting it across helpers would cost more
  in integration than it saves).
- Oracle-class final shippability review (standing contract, Opus session):
  native `oracle` → Codex sol@high → Cursor pro → two distinct OpenCode/Kilo.
- Flash nano-agent: only if a research question comes up (Playwright masking
  semantics) that the local docs don't answer.

Ledger maintained in the checkpoint log and the final handoff.

## Parallel tracks

None. Every stage touches the same two files (`visual-baseline.spec.js`,
`playwright.config.js`) and each stage depends on the previous stage's captures.
Sequential by nature — noted here so the absence is a decision, not an oversight.

---

## Stage 0 — Pre-change green

**Status:** Active
**Goal:** Prove the suite passes before touching it (executable verification gate).
**Phases:**
- [ ] 0.1 Run `npm test` on the untouched tree, capture result
- [ ] 0.2 Discard the resulting PNG churn
**Verification:** exit 0, 45 tests
**Checkpoint:** no commit (no intentional changes)

## Stage 1 — Compare-based gate

**Status:** Pending
**Goal:** Replace capture-only assertions with `toHaveScreenshot()`; make captures deterministic.
**Phases:**
- [ ] 1.1 Freeze animation: `animations: 'disabled'` + init script neutralizing bubble physics / hero blobs
- [ ] 1.2 Swap the `p.screenshot(path)` + `existsSync` block for `expect(p).toHaveScreenshot(name)`
- [ ] 1.3 Configure `maxDiffPixelRatio` / `threshold` conservatively; keep the existing image-eager/decode preamble
- [ ] 1.4 Fix the port-3000 `reuseExistingServer` collision
- [ ] 1.5 Delete the now-unused `tests/baselines/` path handling
**Verification:** `next build` clean; spec parses; a single-page subset runs
**Checkpoint:** commit + push

## Stage 2 — Regenerate authoritative baselines

**Status:** Pending
**Goal:** Produce the 40 compared baselines under the new conditions and accept them deliberately.
**Phases:**
- [ ] 2.1 `npm test -- --update-snapshots`
- [ ] 2.2 Visually adjudicate a sample across breakpoints/themes (not a rubber stamp)
- [ ] 2.3 Remove the 40 obsolete `tests/baselines/*.png`
**Verification:** written verdict per sampled capture
**Checkpoint:** commit + push

## Stage 3 — Prove the gate actually gates

**Status:** Pending
**Goal:** Demonstrate red-on-change and green-on-no-op. A gate that cannot fail is not a gate.
**Phases:**
- [ ] 3.1 Run `npm test` twice unchanged — both green, `git status` clean after each (flake check)
- [ ] 3.2 Inject a deliberate visual change, confirm the suite goes red and names the right captures
- [ ] 3.3 Revert the injection, confirm green again
**Verification:** recorded exit codes + failing capture names for each step
**Checkpoint:** commit + push

## Stage 4 — Docs and handoff

**Status:** Pending
**Goal:** Repo knowledge matches reality.
**Phases:**
- [ ] 4.1 `AGENTS.md` Build & Test section — currently describes the baselines as self-refreshing
- [ ] 4.2 `TODO.md` — close the baseline item, condense to house format
- [ ] 4.3 `LOGBOOK.md` entry
- [ ] 4.4 Oracle-class shippability review + main-agent final diff review
**Checkpoint:** commit + push

---

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| 0 | — | — | in progress |

## Verification matrix

| Property | How proven |
|---|---|
| Gate detects regressions | Stage 3.2 injected change → red |
| Gate is not flaky | Stage 3.1 two consecutive green runs |
| Tree stays clean | `git status` empty after each Stage 3.1 run |
| Update path works | Stage 2.1 `--update-snapshots` regenerates |
| Build unaffected | `next build` green each stage |

## Open risks

- Bubble physics may not fully freeze via init script; fallback is masking the
  bubble layers, which reduces coverage of the hero area. Record which was used.
- `fullPage` captures at 4 breakpoints can differ by a pixel row on font
  settling; `maxDiffPixelRatio` needs to be tight enough to catch real changes
  but loose enough to survive that. Tune with evidence from Stage 3.1, not guesswork.
- Windows/Chromium snapshot names are platform-suffixed; baselines generated here
  will not match a Linux CI. Out of scope (no CI configured) but noted.

## Merge readiness checklist

- [ ] Two consecutive green runs, clean tree
- [ ] Injected-change run goes red
- [ ] 40 obsolete PNGs removed, new snapshots committed
- [ ] AGENTS.md / TODO.md / LOGBOOK.md updated
- [ ] Oracle-class review passed
- [ ] Main-agent final diff review
