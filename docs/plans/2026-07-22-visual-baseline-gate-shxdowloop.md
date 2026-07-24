# Visual Baseline Gate — shxdowloop process plan

**Date:** 2026-07-22
**Status:** **Complete** — all stages landed; branch merged to `portfoliowebsite` and pushed
2026-07-24 as `098f0b1` (LOGBOOK Entry 087).
**Branch:** `shxdowloop/2026-07-22/visual-baseline-gate` (from `portfoliowebsite` @ `493b054`) — merged
**Remote:** `origin` — pushed, tracking
**Mode:** Normal (unattended stage loop)

> Nothing in this plan is outstanding. The one surviving follow-up — running the gate in CI, blocked
> on the `-win32` snapshot suffix — is owned by `TODO.md` under **Standalone**, not by this document.

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

**Status:** Complete
**Goal:** Prove the suite passes before touching it (executable verification gate).
**Phases:**
- [x] 0.1 Run `npm test` on the untouched tree, capture result — 45 passed
- [x] 0.2 Discard the resulting PNG churn
**Verification:** exit 0, 45 tests
**Checkpoint:** no commit (no intentional changes)

## Stage 1 — Compare-based gate

**Status:** Complete (`833d46a`)
**Goal:** Replace capture-only assertions with `toHaveScreenshot()`; make captures deterministic.
**Phases:**
- [x] 1.1 Freeze animation — **solved differently than planned:** no init script was needed.
  `page.emulateMedia({ reducedMotion: 'reduce' })` makes the bubble engine return before creating a
  single bubble (`bubbles.js:13`) and zeroes the CSS animations `brand.css` already guards. Hero
  blobs stay rendered but static, so hero coverage is retained rather than masked away.
  **Load-bearing detail:** it must be `emulateMedia()`, not `test.use()` — on Playwright 1.61.1 the
  declarative option is silently ignored for `reducedMotion` specifically (probed: `colorScheme` and
  `viewport` from the same `test.use` applied while `matchMedia` still reported false).
- [x] 1.2 Swap the `p.screenshot(path)` + `existsSync` block for `expect(p).toHaveScreenshot(name)`
- [x] 1.3 Configure `maxDiffPixelRatio` / `threshold` conservatively — initial value proved far too
  loose and was fixed in Stage 3; see the Stage 3 outcome below
- [x] 1.4 Fix the port-3000 `reuseExistingServer` collision — legacy static server moved to 4321
  (4000 was held by an unrelated process)
- [x] 1.5 Delete the now-unused `tests/baselines/` path handling
**Also landed:** `next-env.d.ts` untracked + gitignored (it oscillates between `.next/types` and
`out/types` depending on which command ran last); dropped the fixed 1500 ms settle sleep for
`document.fonts.ready`, cutting suite time 46.2s → 19.7s.
**Verification:** `next build` clean; spec parses; a single-page subset runs
**Checkpoint:** commit + push — `833d46a` (committed jointly with Stage 2, same coupled surface)

## Stage 2 — Regenerate authoritative baselines

**Status:** Complete (`833d46a`)
**Goal:** Produce the 40 compared baselines under the new conditions and accept them deliberately.
**Phases:**
- [x] 2.1 `npm test -- --update-snapshots`
- [x] 2.2 Visually adjudicate a sample across breakpoints/themes — `index-1440-dark` and
  `gallery-360-light` adjudicated: full render, all 11 gallery images decoded, no blanks
- [x] 2.3 Remove the obsolete `tests/baselines/*.png` — **48 removed, not the 40 estimated here**,
  including 8 for a `patriots` page the spec no longer captures
**Verification:** written verdict per sampled capture
**Checkpoint:** commit + push — `833d46a`

## Stage 3 — Prove the gate actually gates

**Status:** Complete (`ce3fe3a`) — and the stage earned its keep; see the outcome section below
**Goal:** Demonstrate red-on-change and green-on-no-op. A gate that cannot fail is not a gate.
**Phases:**
- [x] 3.1 Run `npm test` twice unchanged — both green, `git status` clean after each (flake check)
- [x] 3.2 Inject a deliberate visual change — **first attempt passed 45/45, exposing two defects
  that made the gate blind.** Both fixed, then the injection correctly went red (16 failures, all
  dark-theme, matching the dark-only edit)
- [x] 3.3 Revert the injection, confirm green again
**Verification:** recorded exit codes + failing capture names for each step
**Checkpoint:** commit + push — `ce3fe3a`

## Stage 4 — Docs and handoff

**Status:** Complete (`75842e5`, `6ddccd2`)
**Goal:** Repo knowledge matches reality.
**Phases:**
- [x] 4.1 `AGENTS.md` Build & Test section — rewritten: baselines now compare, `--update-snapshots`
  documented as the explicit accept path, plus the two load-bearing details (`emulateMedia` over
  `test.use`; `next build` in `globalSetup`, not `webServer.command`) and why `threshold 0.02` is
  not arbitrary
- [x] 4.2 `TODO.md` — baseline item closed
- [x] 4.3 `LOGBOOK.md` — Entry 081
- [x] 4.4 Shippability review + main-agent final diff review — **routing deviation:** the oracle-class
  OpenCode route wedged, so the review ran on a pro nano-agent via the kilo route. Verdict: real
  compare-based gate, low flakiness risk. Four residual risks triaged in `6ddccd2`; the CI gap was
  deferred to `TODO.md` with its blocker named, and one finding (reused server serving a different
  directory) was assessed as loud rather than silent and left unchanged — disagreement recorded
  rather than churned.
**Checkpoint:** commit + push — `75842e5`, `6ddccd2`

---

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| 0 | — | n/a | 45 passed pre-change; no intentional edits to commit |
| 1-2 | `833d46a` | ✅ | migration + 40 regenerated snapshots; committed together (same coupled surface) |
| 3 | `ce3fe3a` | ✅ | gate proven to fail correctly; threshold + stale-build defects fixed |
| 4 | `75842e5`, `6ddccd2` | ✅ | AGENTS/TODO/LOGBOOK sync; review outcome + CI gap deferred |
| merge | `098f0b1` | ✅ | branch merged into `portfoliowebsite` 2026-07-24 (Entry 087) |

## Stage 3 outcome — the gate was blind

Recorded because it is the most important result of the run. The migration
looked complete and green, then the injected regression passed 45/45. Two
defects were hiding behind that green:

1. `threshold` default 0.2 too loose — an 8-point whole-theme colour shift
   produced zero differing pixels. Now `0.02`.
2. `reuseExistingServer` skipped the entire `next build && serve` command when
   the port was held, so the suite graded a stale `out/`. Build moved to
   `tests/global-setup.js`.

Evidence chain: blind (45 pass) → threshold fixed + port freed (16 fail) →
globalSetup fixed with a stale server *deliberately planted* (16 fail) →
reverted (45 pass, twice). Failures were 100% dark-theme, matching the
dark-only edit.

## Verification matrix

| Property | How proven |
|---|---|
| Gate detects regressions | Stage 3.2 injected change → red |
| Gate is not flaky | Stage 3.1 two consecutive green runs |
| Tree stays clean | `git status` empty after each Stage 3.1 run |
| Update path works | Stage 2.1 `--update-snapshots` regenerates |
| Build unaffected | `next build` green each stage |

## Risks — closed at merge

- ~~Bubble physics may not fully freeze via init script~~ — **resolved better than planned.**
  `emulateMedia({ reducedMotion: 'reduce' })` stops the engine at source, so no masking was needed
  and hero coverage was retained in full.
- ~~`fullPage` captures may differ by a pixel row on font settling~~ — **did not materialise.**
  Tuned with Stage 3.1 evidence; two consecutive green runs on an unchanged tree, clean `git status`
  after each.

### Still open — but owned elsewhere

- **Windows/Chromium snapshots are platform-suffixed (`-chromium-win32`)**, so a Linux CI runner
  cannot reuse them. This is the sole blocker on running the gate in CI, and it is now tracked in
  `TODO.md` under **Standalone** (user decision 2026-07-23: containerise capture via the official
  `mcr.microsoft.com/playwright` image, requiring a one-time regeneration of all baselines). Do not
  re-plan it here.
- **`--update-snapshots` review is unenforced** — inherent to the tool. Documentation in `AGENTS.md`
  is the only available lever and is already prominent. Accepted, not tracked.

## Merge readiness checklist

- [x] Two consecutive green runs, clean tree
- [x] Injected-change run goes red (after the two Stage 3 defects were fixed)
- [x] Obsolete PNGs removed (48), new snapshots committed
- [x] AGENTS.md / TODO.md / LOGBOOK.md updated
- [x] Shippability review passed — pro nano (kilo route); the oracle-class OpenCode route wedged
- [x] Main-agent final diff review
- [x] Merged to `portfoliowebsite` and pushed — `098f0b1`, 2026-07-24
