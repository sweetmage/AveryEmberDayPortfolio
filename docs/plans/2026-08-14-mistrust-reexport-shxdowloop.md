# shxdowloop — A History of Mistrust re-export

**Date:** 2026-08-14
**Agent:** Opus 5 (vellum, ShxdowCaptain)
**Mode:** Normal, **commit-only (no push)** by user decision at the preflight gate
**Implementation plan:** [`2026-08-14-mistrust-reexport-frame-geometry.md`](2026-08-14-mistrust-reexport-frame-geometry.md)

## Goal

Re-export the 30 "A History of Mistrust" slide frames from Figma through the user's own logged-in
browser, replace the repo's source PNGs, regenerate every derived asset, and verify.

The geometry half of the work — replacing the raster-derived strip layout with a committed
coordinate manifest — was completed before the loop started and is carried in as Stage 0.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/plans` writable; npm ok |
| Remote | `origin` github.com/sweetmage/AveryEmberDayPortfolio; 0 ahead / 0 behind after fetch |
| Usage (Claude, binding) | 31% session / 4% weekly — below the 80% native ban |
| Nano-agents | available; opencode + kilo authenticated; parallel-max 4; **Fable unavailable on this host** |
| OpenTabs | running on :9515, extension connected, Figma tab live |
| Creds | no `FIGMA_*` in `.env` or the voidware keystore — not needed; the browser route uses the user's session |

**Degraded paths:** oracle-class review drops one rung to pro nano (no Fable). No push, so every
checkpoint is `commit-only: user directive`.

## Branch and remote

`shxdowloop/2026-08-14/mistrust-reexport`, branched from `portfoliowebsite`.
**Not pushed** — user chose commit-only at the gate. Netlify's allowed-branches list is
`["portfoliowebsite"]` alone, so even a pushed loop branch would not deploy; production deploys
cost 15 of 20 monthly credits and only happen on merge.

## Helper routing

Nano-first. Pro nano (opencode/kilo) for the assumption check and the final shippability review,
standing in for oracle-class since Fable is unavailable. The main agent owns the Figma session, the
coordinate read, the cross-check, integration, verification, and the final diff review: it is
coupled work against a live browser and a guarded asset pipeline, and it is the one thing that
must not be second-hand. No native subagents expected.

## Stage outline

## Stage 0 — Geometry manifest (carried in, pre-loop)

**Status:** Complete
**Goal:** Take strip layout from committed frame coordinates instead of raster set exports.
**Phases:**
- [x] 0.1 Capture offsets from the verified-good committed state (all 30 matched at d ≤ 0.001)
- [x] 0.2 `frame-geometry.json` + generator rework onto it
- [x] 0.3 Rework `tests/mistrust-sets.spec.js` onto the manifest, per-slide placement not just width
- [x] 0.4 Negative-test the guards; `AGENTS.md` + `docs/ARCHITECTURE.md`
**Verification:** regeneration byte-identical in both trees; gap / resize / short-manifest /
missing-manifest all throw and exit 1; suite 173, set-strip specs 6 → 8; `tsc` clean.
**Checkpoint:** pending — commits as this loop's first checkpoint.

## Stage 1 — Export and coordinate read

**Status:** Pending
**Goal:** Get the 30 re-exported PNGs and the frames' true canvas coordinates out of Figma.
**Phases:**
- [ ] 1.1 Select the 30 frames, add a PNG 1x export setting, export
- [ ] 1.2 Retrieve the download and unpack to a scratch dir
- [ ] 1.3 Read each frame's canvas x/y/w/h from the Design panel
- [ ] 1.4 Cross-check consecutive-frame deltas against the Stage 0 bootstrap
**Verification:** 30 files present and named as expected; deltas reproduce 1061 / 1056 / 4295 and
the rest at 1080. Disagreement stops the stage and is reported, never reconciled by guesswork.
**Notes:** The user is a live collaborator in this file. Take the tab only after their go, change
nothing but selection, and add export settings as the one document-touching action.

## Stage 2 — Swap, regenerate, verify

**Status:** Pending
**Goal:** Land the new artwork with an honest diff and green assets.
**Phases:**
- [ ] 2.1 Copy the export in; revert byte-identical files so the diff shows only real changes
- [ ] 2.2 Update the manifest to true canvas coordinates
- [ ] 2.3 Regenerate (default mode — never `--all`)
- [ ] 2.4 Read back `SLIDE_ALT` against any slide whose pixels moved
- [ ] 2.5 Seam inspection at 1:1 across the Section 81 overlay
**Verification:** `mistrust-sets.spec.js`, `mistrust-slideshow.spec.js`, full suite, `tsc`. Visual
baseline movement adjudicated from the diff image **before** any re-baseline.

## Stage 3 — Docs and handoff

**Status:** Pending
**Goal:** Leave the repo's knowledge true.
**Phases:**
- [ ] 3.1 `LOGBOOK.md` entry (+ `split-logbook --check`)
- [ ] 3.2 `TODO.md` condensed to house format, incl. the font-load flake note
- [ ] 3.3 `shxdowmap refresh --auto`
- [ ] 3.4 Final pro-nano shippability review, then main-agent final diff review

## Verification matrix

| Area | Command |
|---|---|
| Set strips | `npx playwright test tests/mistrust-sets.spec.js` |
| Slideshow invariants | `npx playwright test tests/mistrust-slideshow.spec.js` |
| Everything | `npm test` |
| Types | `npx tsc --noEmit` |
| Assets | `node scripts/generate-mistrust-assets.js` reports only genuinely changed sources |

## Open risks

- **Two hands in one Figma file.** Mitigated by taking the tab only on the user's go.
- **Manifest staleness on a pure frame translation.** Caught by nothing in the pixels; the Stage 1
  cross-check is the actual defence, which is why a disagreement halts rather than reconciles.
- **`SLIDE_ALT` drift.** Artwork is the source of truth for alt text *and* lightbox captions.
- **Re-baselining as laundering.** 8 of 40 visual baselines cover `projects-mistrust`.
- **Known flake, not ours.** 4 visual baselines timed out on font loading under full-suite
  parallelism and passed 40/40 standalone. Tracked, not chased.

## Checkpoint log

| Stage | SHA | Push |
|---|---|---|
| 0 | pending | commit-only: user directive |

## Merge readiness checklist

- [ ] Suite green, flake distinguished from regression with evidence
- [ ] Diff contains only genuinely changed slide PNGs plus derived output
- [ ] Manifest carries true Figma canvas coordinates, cross-checked
- [ ] `SLIDE_ALT` verified against any re-worded slide
- [ ] Docs, LOGBOOK, TODO, architecture map current
- [ ] User reviews before any push or merge
