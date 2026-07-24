# Bubble hero exclusions — shxdowloop process plan

**Date:** 2026-07-24
**Branch:** `shxdowloop/2026-07-24/bubble-hero-exclusions` (from `portfoliowebsite` @ `098f0b1`)
**Remote:** `origin` — pushed, tracking
**Mode:** Normal (unattended stage loop)
**Session model:** Opus 4.8 (main)

## Goal

Finish and land the "fix bubbles" work started under `shxdowflow`: physics bubbles were drifting
across the hero logo, and the ambient hero blobs were parking on the logo and name. The fix is
written and verified by probe; what remains is turning the ad-hoc probes into honest automated
coverage, cleaning up, and landing it on a reviewable branch.

Success = the regression has automated coverage that would actually catch it, `npm test` green,
no temp artefacts, and the whole change committed and pushed.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/`, `docs/plans/` ok |
| Branch/remote | `portfoliowebsite` in sync with origin (0/0); fetch only |
| Startup tree | **this session's own uncommitted bubble work** + 6 untracked temp files |
| npm | 11.12.1 |
| shxdowTracker | claude session 50%, weekly 14% → **binding 50%**, below the 80% native ban |
| nano-agents | Kilo authenticated; **OpenCode wedges on this host** (characterised earlier today) |
| shxdowmap | no `docs/ARCHITECTURE.md` in this repo |

Degraded paths:

- OpenCode nano route is known-bad on this host this session (bare startup line, no events). Helper
  work goes to **Kilo** directly rather than paying the wedge-and-retry cost again.
- A `serve` process was left holding port 4399 by the previous run's probes; killed at preflight.

## The state this loop inherited

Already done and probe-verified under `shxdowflow` (carried onto this branch):

1. `.hero-logo` added to `DEFAULT_EXCLUSIONS` / `HOME_EXCLUSIONS`. The list matches the `img` tag,
   and the logo had been re-inlined as an `<svg>` for `currentColor` theming (Entry 083), so it
   silently stopped being an exclusion zone.
2. `heroContentRects()` + `BLOB_ZONE_PUSH`: hero blobs are steered off the logo and the
   Range-measured glyph extents of `.hero-name`/`.hero-sub`, per explicit user decision to keep the
   ambient wash everywhere else.
3. `public/scripts/bubbles.js` re-synced (the copy the export actually serves).
4. `AGENTS.md` + `LOGBOOK.md` Entry 090.

**Unresolved, and the reason this loop exists:** `tests/bubbles-exclusion.spec.js` has four tests;
three pass, the hero-blob one fails at 8,200px² against a **6,000 threshold chosen by guesswork**.
The assertion shape is wrong, not just the constant: blobs are steered by a soft force rather than
hard-clamped, so an instantaneous-maximum assertion measures transient pass-through. Nudging the
constant until green is precisely the rubber-stamping this repo's visual gate exists to prevent.

## Helper routing

Binding usage 50% → native permitted for the four reserved cases; oracle-class review contract
active (Opus session).

- **Main agent:** the assertion-shape decision (judgment, and the whole point of the stage),
  integration, verification, final diff review, commits.
- **Kilo pro nano-agent:** shippability review.
- **Oracle-class:** final review per the standing contract — `verifier` @ fable while native is
  allowed and the ultracode gate passes.
- No parallel tracks: one file's test assertions plus cleanup. Splitting costs more than it saves.

## Parallel tracks

None — see above. Recorded so the absence is a decision, not an oversight.

---

## Stage 1 — Re-derive the blob assertion from measurement

**Status:** Complete
**Goal:** An assertion whose shape and threshold both come from observed behaviour, or no assertion
at all if it cannot be made non-flaky.
**Phases:**
- [x] 1.1 Measured the distribution, 60 samples over 15s at 768 and 1440:

  | Viewport | blob vs hero copy (ink) | blob vs logo (box) |
  |---|---|---|
  | 768px | median 0, p90 0, max 232, **97% exactly zero** | median 0, p90 404, max 8,280, 70% zero |
  | 1440px | median 0, p90 28, max 2,017, **90% exactly zero** | median 0, p90 1,804, max 18,158, 90% zero |

- [x] 1.2 **The assertion shape was wrong, not just the constant.** The original asserted an
  instantaneous maximum under a guessed 6,000 and failed at 8,200. The data shows blobs are not on
  the copy at all in 90–97% of samples; the spikes are transient pass-through as a blob is steered
  back out. Switched to asserting the **zero-fraction** — the direct expression of "not parked".
- [x] 1.3 Rewritten with the bar at ≥0.6 against a measured 0.90–0.97, so it has wide margin
  against normal behaviour while still failing loudly on the pre-fix behaviour (a blob sat on the
  copy continuously, so the zero-fraction would read ~0).
- [x] 1.4 Ran three consecutive times: 4/4 passed each time.
**Verification:** three consecutive green runs; every number in the test comment traceable to the
table above
**Checkpoint:** folded into the Stage 2 checkpoint (same coupled surface)

### Gate proven to fail

A test that cannot fail is not a test — the lesson this repo already paid for in Entry 081. With
`.hero-logo` deliberately removed from both exclusion lists and the export rebuilt, **3 of 4 tests
went red**: both bubble-vs-logo cases and the zone-registration guard.

The blob test correctly stayed green, and that is the right result rather than a gap: the injection
removes the logo from the *bubble* exclusion lists, while `heroContentRects()` queries
`#hero .hero-logo` directly and was untouched, so blob steering genuinely still worked. The suite
discriminates between the two avoidance systems instead of failing as an undifferentiated block.

Injection reverted from a scratch copy; both `bubbles.js` files verified byte-identical afterwards
and free of injection markers.

## Stage 2 — Cleanup and full verification

**Status:** Complete
**Goal:** No stray artefacts; whole suite green.
**Phases:**
- [x] 2.1 Deleted all seven `tmp-*` probe scripts and screenshots; killed the stray `serve` on 4399
- [x] 2.2 `scripts/bubbles.js` and `public/scripts/bubbles.js` verified byte-identical
- [x] 2.3 `npm test` — **49 passed** (45 existing + 4 new)
- [x] 2.4 Zero visual-snapshot churn, confirming the change is confined to the motion path
**Verification:** `npm test` exit 0; `git status` shows only intentional files
**Checkpoint:** commit + push

## Stage 3 — Docs, review, handoff

**Status:** Active

### Oracle-class review — PASS

Ran on the `verifier` agent @ fable (this session's registry does not expose the pinned `oracle`;
`verifier` is the equivalent fresh-context PASS/FAIL judge), ultracode gate passing at 50%/14%.

It verified rather than trusted: ran `npm test` itself (49 passed), `diff`ed the two `bubbles.js`
copies to confirm byte-identity, checked `.hero-logo` exists in `app/page.tsx`, and traced every
cache-invalidation path.

Two findings worth keeping:

- **The invalidation question is settled.** The per-frame guard
  (`if (!this.heroBlobLayer._cRect) this._heroContentZones = null;`) runs *before*
  `heroBlobLayer.step()` recomputes `_cRect`, so a fresh rect can never pair with stale zones —
  independent of which path nulled it, including the debounced `_syncBoundsAndScale()`. No missed
  path found.
- **The injection proof is my evidence alone.** A read-only verifier cannot mutate the source and
  rebuild, so it explicitly marked the "3 of 4 go red" claim unverified-but-plausible. Recorded here
  so the claim's provenance is not overstated later.

### Deliberately not changed

The hero-content zones are **scroll-invariant** — the logo and the blob container both live inside
`#hero` and shift together — so nulling them on every scroll event is redundant work (3
`querySelector`s + 2 `Range` measurements per scroll frame while the hero is visible). Noted rather
than optimised: the cost is negligible, the current scheme is verified correct on every invalidation
path, and rearranging it to pair the caches would trade a proven-correct design for a micro-gain.
If the blob layer is ever reworked, cache the *local* zones alongside `_cRect` so both derive from
the same instant.
**Goal:** Repo knowledge matches reality; diff reviewed by helper and main agent.
**Phases:**
- [x] 3.1 LOGBOOK Entry 090 updated with the measured distribution, the corrected assertion, and the
  gate-proof result
- [x] 3.2 `TODO.md` reconciled — the "no bubble coverage" gap is now closed rather than deferred
- [x] 3.3 Pro nano shippability review (Kilo route; OpenCode skipped, known-bad on this host today)
  — **no defects.** Confirmed byte-identity by SHA256 rather than by `diff` alone, and judged all
  four tests would catch the regression. One consistency nit accepted and applied: the new spec used
  `waitUntil: 'load'` while every existing spec uses `'networkidle'`. Re-verified after: 49 passed,
  zero churn.
- [x] 3.4 Oracle-class review — **PASS** (see above)
- [x] 3.5 Main-agent final diff review — done before dispatching helpers and again after applying
  the `networkidle` change
**Verification:** both verdicts recorded; suite re-run green after the final edit
**Checkpoint:** commit + push

---

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| pre | — | — | branch created + pushed; stray probe server killed |
| 1-3 | `b271168` | ✅ | single checkpoint: fix, first motion-enabled spec, docs, cleanup |

## Verification matrix

| Property | How proven |
|---|---|
| Bubbles never cover the hero logo | New spec, motion enabled, sampled over time, 768 + 1440 |
| The logo is a registered zone | New spec asserts against `__bubbleEngine.zones.rects` |
| Blobs are not parked on the copy | Stage 1, assertion derived from measured distribution |
| Fix is motion-path only | Zero visual-snapshot churn on a full `npm test` |
| Served copy matches source | `diff` of the two `bubbles.js` files |

## Open risks

- The blob assertion may prove genuinely unstable. If so the honest outcome is deleting it and
  keeping the three deterministic tests — the bubble-vs-logo guarantee is hard-enforced by
  `resolveZoneCollisions`, the blob steering is not, and a flaky test in a repo whose gate is already
  opt-in would erode trust in the suite.
- The new spec runs with motion **enabled**, unlike every existing spec. It is therefore the only
  test sensitive to physics timing; keep its waits generous.

## Merge readiness checklist

- [x] Blob assertion re-derived from a measured distribution, with the numbers in the test comment
- [x] New spec stable across three consecutive runs, and **proven to fail** on an injected regression
- [x] Temp artefacts gone; the two `bubbles.js` copies verified identical (SHA256)
- [x] `npm test` green (49 passed), zero snapshot churn
- [x] LOGBOOK / TODO / AGENTS / plan consistent
- [x] Shippability review passed — one nit applied
- [x] Oracle-class review passed — PASS, independently re-verified
- [x] Main-agent final diff review

## Notes for whoever merges

- The behaviour change is **motion-only**. Every visual baseline is captured under
  `prefers-reduced-motion`, where the engine creates nothing, which is why 30 snapshots did not move
  and why this bug was invisible for a week.
- `tests/bubbles-exclusion.spec.js` is the repo's **first motion-enabled spec**. It is inherently
  more timing-sensitive than the rest of the suite; the waits are deliberately generous. If it ever
  flakes, the honest fix is deleting the soft-physics blob test and keeping the three deterministic
  ones — not widening the threshold until it passes.
- Still true, and unchanged by this branch: the suite is opt-in and `netlify.toml` deploys without
  it, so none of this runs in CI. That gap is tracked in `TODO.md`.
