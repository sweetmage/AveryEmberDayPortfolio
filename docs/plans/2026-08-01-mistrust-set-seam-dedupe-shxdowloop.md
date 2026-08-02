# Mistrust set-strip seam dedupe — shxdowloop — 2026-08-01

## Goal

The user re-exported the three `A History of Mistrust Set N.png` Figma strips. Investigation showed
the real bug was never the exports: **the composed `set-1.webp` we ship has a visible seam artifact**
because slides 1 and 2 share a 19px band of artwork and composition duplicates it. Fix the composer
to dedupe shared bleed, refresh the source-of-record set PNGs, and re-verify the visual gate.

## Preflight results and degraded paths

- Workspace read/write; `docs/`, `docs/plans/` present.
- Started on `develop`, 127 commits ahead of `origin/develop`, 0 behind (fetched). Dirty worktree
  carried Entry 113's re-export, **uncommitted and user-owned**.
- shxdowTracker healthy: Claude session 2%, weekly 25% → binding 25%, well under the 80% native ban.
  Codex 0%. Blackbox token expired (unused).
- nano-agents available (`nano-agent.ps1`; the `.sh` is not the Windows route). shxdowmap present.
- npm ok, git remote ok. No degraded paths.

## Branch and remote

`shxdowloop/2026-08-01/mistrust-set-seam-dedupe`, branched from `develop` at `06bd820`.
Remote `origin` exists. **Not pushed** — `develop` is 128 ahead of origin under a deploy pause
until Aug 6 (LOGBOOK Entry 113), so push timing is the user's call.

## Pre-stage: user-directed commit to develop

Per the user's preflight answer, Entry 113's uncommitted re-export was committed **to `develop`**
before branching: `06bd820`. `.shxdowmap/` (a 1MB+ regenerable seed cache) was added to
`.gitignore` rather than committed.

## Investigation (pre-stage, read-only)

The user chose "investigate first, then decide". Method and results:

- **Tile identification.** Every slide reduced to a 32x32 grey signature; each strip tile matched
  against all 30 slides. Confirms Set 3 now holds slides 21–30 (it held 11–20 before).
- **Offset location.** Column-mean profiles (`resize(w, 1)` = per-column averages) template-matched
  each slide inside each strip to 1px. **Every slide matched at d=0.00** — the strips are 1:1, with
  no rescaling. Set 1: slide 1 at x=0, slides 2–10 at native−19 → exactly one 19px overlap at the
  1→2 seam. Set 2: no overlap. Set 3: one 1px overlap at 24→25.
- **Band content.** Slide 1's trailing 19 columns vs slide 2's leading 19: **99.7% identical**
  (61 of 20520 px differ, antialiasing on the orange arc). Real artwork, not margin.
- **Visual.** Seam crops at 1:1 confirm it: the Figma export renders a smooth orange arc and
  continuous tan curve; the composed webp shows a jagged notch and a broken curve.

| | before | after | verdict |
|---|---|---|---|
| Set 1 | 10750px, 50px short | 10781px, 19px short | improved; the 19px is a real shared bleed, not a defect |
| Set 2 | 10800px | same pixels, re-encoded | was already correct |
| Set 3 | 10800px, **held slides 11–20** | 10775px, **holds 21–30** | genuinely fixed — the real bug |

**Decision (user):** compose from slides, but dedupe the overlap using export-derived offsets.
Pixels stay slide-derived so a bad export can never inject wrong slides again (the Set 3 failure);
geometry comes from the export so seams are right. Guarded by a width assertion.

A dead end worth recording: the first shared-bleed audit required byte-exact column equality and
reported "no shared columns", contradicting the band statistics. The 0.3% antialiasing was the
reason. The tolerant rewrite then over-corrected, reporting 1–6px false positives on flat cream
margins (Set 2 "6px shared" despite exporting at exactly 10800 with zero overlap). Neither
auto-detector is trustworthy without a content-variation guard — which is precisely why the chosen
approach takes offsets from the export rather than inferring them.

## Helper routing

Main agent throughout — exploration, forensics, implementation, verification, docs, and the final
diff review. Image forensics is precision work where a wrong helper summary would have inverted the
conclusion: the finding hinges on d=0.00 vs d≈4, and on 99.7% vs byte-exact. Binding usage 25%
left native subagents available, but none of the four reserved cases applied.

**Deviation from the standing contract, stated plainly:** on an Opus session the final shippability
review should be oracle-class in a fresh context. This session runs under a harness instruction not
to dispatch subagents unless the user asks, and the user did not. The final review was therefore
done by the main agent — the same context that wrote the code, which is exactly the blind-spot risk
the maker-verifier split exists to avoid. The compensating evidence is mechanical rather than
judgemental: both new guards were verified **non-vacuous** by replaying known-bad inputs (the July
Set 3 export against the build; the pre-fix `set-1.webp` against the spec), so the claims rest on
observed failures, not on self-certification. A fresh-context review before merge is still worth
having.

## Stage outline

## Stage 1 — Source-of-record refresh

**Status:** Complete
**Goal:** Bring the three tracked Set PNGs in line with the fixed Figma export.
**Phases:**
- [x] 1.1 Copy the 3 fixed Set PNGs into `images/myart/A History of Mistrust/sets/`
- [x] 1.2 Confirm the `public/` mirror still intentionally omits them (Entry 113 hash check)
**Verification:** dimensions 10781 / 10800 / 10775 confirmed. Set 2's replacement is a re-encode —
same pixels (every tile d=0.00, same dimensions) but a different hash, so git shows it modified;
"byte-identical" in the first read of the export folder was imprecise. Note the old Set 3 file was
973495 bytes, *exactly* Set 2's size — the wrong-slides bug visible in a directory listing.
**Checkpoint:** `83e9f44`

## Stage 2 — Teach the composer to dedupe shared bleed

**Status:** Complete
**Goal:** `set-N.webp` composed from slides at export-derived offsets, with a loud width guard.
**Phases:**
- [x] 2.1 Add offset derivation: template-match each slide into its set export via column profiles
- [x] 2.2 Compose at those offsets instead of cumulative native widths
- [x] 2.3 Assert composed width == export width; fail the build on mismatch
- [x] 2.4 Rewrite the stale 2026-07-27 header comment
- [x] 2.5 Extend set staleness to the export files — a re-export moves seams with no slide change
- [x] 2.6 Assert height too, so a taller slide cannot be silently cropped

**Verification:**
- `node scripts/generate-mistrust-assets.js` → `set-1: deduped 19px`, `set-3: deduped 1px`,
  set-2 unchanged. All three composed widths equal their export widths exactly.
- Column-profile comparison of each composed strip against its export: mean |diff| 0.105 / 0.115 /
  0.097 grey levels, worst 3, **zero** columns over 8. That is webp q80 noise with no drift.
- Seam crop at 1:1 read by eye: the notch in the orange arc and the broken tan curve are gone; the
  composed strip now matches the export.
- **Negative test.** Restored the defective 2026-07-27 Set 3 export (still in `HEAD`) and re-ran:
  the build threw `slide 21 does not match its strip (best distance 17.62, tolerance 2)` and named
  both possible causes. The bug that shipped in July would now fail the build.

**Notes:** Running `--all` for the negative test re-encoded all 60 slide webps and produced
different bytes than the committed ones — libwebp noise, precisely what the script's default mode
exists to prevent. Reverted with `git checkout -- .../slides/`; only the set strips are staged. A
stray `unable to open for write` on `slide-02@2x.webp` aborted one `--all` run mid-way; the revert
cleared it and the following default run was clean. `--all` is a re-encode hazard, not a
convenience — the default path is the correct one after a re-export.

**Checkpoint:** `83e9f44` (local only, not pushed)

## Stage 3 — Visual and suite verification

**Status:** Complete
**Goal:** Prove the seam artifact is gone and nothing else moved.
**Phases:**
- [x] 3.1 Seam crops at 1:1, composed vs export, read by eye — the notch and the broken tan curve
      are gone; the composed strip now matches the export
- [x] 3.2 `npx playwright test` — **67 passed**, and **no baseline needed re-recording**
- [x] 3.3 Read every regenerated baseline before committing — vacuous, none were regenerated
- [x] 3.4 Close the coverage gap that 3.2's green result exposed

**The finding that made 3.4 necessary.** The suite stayed green through both the defect and the
fix. That is not the fix being subtle — the `projects-mistrust` baselines *cannot* see these
strips. `app/projects/SlideGrid.tsx` renders its own CSS mosaic from the individual slides and
says so at lines 13–14: "The strips stay on disk; they are the shareable full-set artefact and the
legacy root site still references them." Their only page consumer is
`projects/history-of-mistrust.html` (lines 347–353), which the suite never screenshots. So a
duplicated seam could ship for five days without a single red test.

New `tests/mistrust-sets.spec.js`: six assertions holding each committed strip to its export
(exact width/height, zero columns drifting over 8 grey levels, mean under 1) and each strip
identical across the `images/` and `public/` trees. It uses no browser. **Verified non-vacuous** by
restoring the pre-fix `set-1.webp` and confirming the width assertion fails.

**Verification:** full suite **73 passed** (67 + 6 new).
**Checkpoint:** `d380d95` (local only, not pushed)

## Stage 4 — Docs and handoff

**Status:** Complete
**Goal:** Leave the repo's knowledge true.
**Phases:**
- [x] 4.1 LOGBOOK Entry 114; TODO reconciled — the standing "re-export or drop the set PNGs" item
      is closed, with a note that the investigation inverted its premise
- [x] 4.2 `docs/plans/2026-08-01-mistrust-asset-reexport.md` Risks corrected and its status set to
      committed; the risk it named pointed at the wrong artefact
- [x] 4.3 Shippability review + main-agent final diff review
**Verification:** docs match what the code now does.
**Checkpoint:** `d380d95` (local only, not pushed)
## Verification matrix

| Claim | How it is checked |
|---|---|
| Strips contain the right slides | 32x32 signature match, all 30 slides ranked per tile |
| No rescaling in the exports | column-profile template match, d=0.00 required |
| Overlap is real artwork | per-pixel band comparison, content spread measured |
| Seam artifact gone | 1:1 seam crops read by eye, composed vs export |
| Nothing else regressed | full Playwright suite |
| Composer can't drift again | width assertion against the export |

## Open risks

- ~~**Baseline churn.**~~ Did not materialise, for a worse reason than expected: the baselines
  cannot see these strips at all (Stage 3). No snapshot was re-recorded.
- **Slide 21 is 1056px wide**, not square. Offset logic uses native widths throughout, never an
  assumed 1080 grid — but anything added later must keep that in mind.
- **Set PNGs live in `images/` only**, never mirrored to `public/`. Preserved; the new spec asserts
  the *derived* strips match across trees, not the source PNGs.
- **The strips now depend on the exports being present and current.** That is the point of the
  design, but it means deleting the set PNGs — an option the old TODO item explicitly allowed —
  would now break the build rather than being free. The build says so when they are missing.
- **`--all` re-encodes every slide** into different bytes on a different libwebp. Not introduced
  here, but this run tripped over it; the default path is correct after a re-export.
- **Reach.** The strips are consumed only by the legacy root page, which nothing links to. The fix
  is correct but its audience is small — see the `?` in LOGBOOK Entry 114.

## Merge readiness checklist

- [x] Suite green — 73 passed
- [x] Seam crops read at 1:1
- [x] Header comment no longer claims composition is defect-free
- [x] LOGBOOK + TODO + this plan reconciled
- [x] Main-agent final diff review — no hardcoded strip widths anywhere downstream; the legacy page
      uses intrinsic `<img>` sizing, so the new dimensions are safe
- [ ] **Fresh-context review still recommended** — see the deviation noted under Helper routing
- [x] Not merged to `develop`; push timing left to the user (deploy pause until Aug 6)
