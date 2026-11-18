# shxdowloop — A History of Mistrust re-export

> **Not on portfoliowebsite (2026-11-17, Tableau).** This loop ran on the old `develop` branch, which
> Comet retired unmerged (LOGBOOK Entry 155, 2026-10-13). None of its code or assets are on this branch
> or the live site. The stage 0 commit, the Stage 1 slide re-export and the corrected geometry survive
> only in `D:\My Stuff\Git\CometGit\_archive\portfoliowebsite-develop-2026-11-17\` (git bundle plus
> patches; see its `README.txt`). "Complete" below means done on `develop`. Kept for its finding: the
> live set strips 1 and 3 are not faithful 1x renders. See TODO, "Mistrust set strips".

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
**Checkpoint:** **merged into `develop` at `b617a77` on 2026-08-25** (Entry 136), conflict-free.
Not merged as this loop's checkpoint in the end — it was pulled in mid-flight by a later
shxdowflow run that hit the exact failure Stage 0 was written to prevent.

## Stage 1 — Export and coordinate read

**Status:** Complete 2026-08-25 (Entry 137). 1.1–1.2 were done by the user outside this loop — a
full-file Figma export downloaded to
`D:\My Stuff\creations\Best\A History of Mistrust\A History of Mistrust (2).zip` — so the loop's own
browser export pass never ran. 1.3–1.4 ran through OpenTabs against the live file.
**The cross-check failed, which is the point of having it.** Live canvas coordinates disagreed with
the Stage 0 bootstrap on the first gap of sets 1 and 3 (1080 vs 1061, 1046 vs 1056). The
disagreement was reported rather than reconciled, and the manifest was then rewritten to the live
coordinates on the user's call. See the superseding note in the implementation plan.
**Phases:**
- [x] 1.1 Export — done by the user, full-file export rather than a 30-frame selection
- [x] 1.2 Retrieve and unpack — already extracted beside the zip
- [x] 1.3 Read each frame's canvas x/y/w/h — Design panel via `Tab` sibling walk, 30/30
- [x] 1.4 Cross-check deltas against the Stage 0 bootstrap — **disagreed**; bootstrap was wrong
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

**Status:** Complete 2026-08-25 (Entry 136)
**Goal:** Land the new artwork with an honest diff and green assets.
**Phases:**
- [x] 2.1 Copy the export in; revert byte-identical files so the diff shows only real changes —
      only the 13 content-changed files were copied, so no reverts were needed
- [x] 2.2 Update the manifest to true canvas coordinates — done after Stage 1.4 (Entry 137); all
      three sets rebuilt, sets 1 and 3 changed width
- [x] 2.3 Regenerate (default mode — never `--all`) — 52 generated / 74 up to date
- [x] 2.4 Read back `SLIDE_ALT` against any slide whose pixels moved — all 12 still verbatim
- [x] 2.5 Seam inspection at 1:1 across the Section 81 overlay — all 9 set-1 seams continuous
**Verification:** `mistrust-sets.spec.js`, `mistrust-slideshow.spec.js`, full suite, `tsc`. Visual
baseline movement adjudicated from the diff image **before** any re-baseline.

## Stage 3 — Docs and handoff

**Status:** Complete 2026-08-25 (Entry 136)
**Goal:** Leave the repo's knowledge true.
**Phases:**
- [x] 3.1 `LOGBOOK.md` entry (+ `split-logbook --check` → `lines=591 entries=7 split-needed=no`)
- [x] 3.2 `TODO.md` condensed to house format
- [x] 3.3 `shxdowmap` — reported `fresh`; Stage 0's own `docs/ARCHITECTURE.md` edit carried it
- [x] 3.4 Main-agent final diff review (no helper review: single-session flow, not this loop)

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
| 0 | `287c46b`, merged to `develop` as `b617a77` (2026-08-25) | not pushed |
| 1 | uncommitted; 1.1/1.2 done by the user outside the loop, 1.3/1.4 via OpenTabs (Entry 137) | not pushed |
| 2 | uncommitted working tree at handoff, awaiting user review | not pushed |
| 3 | uncommitted working tree at handoff, awaiting user review | not pushed |

## Merge readiness checklist

- [x] Suite green, flake distinguished from regression with evidence — 178/3 under full parallelism,
      the 3 being `768px` visual baselines that pass 10/10 standalone
- [x] Diff contains only genuinely changed slide PNGs plus derived output — 13 sources, no reverts
      needed because only content-changed files were copied in
- [x] Manifest carries true Figma canvas coordinates, cross-checked — and the cross-check **failed
      and was acted on**; see Stage 1
- [x] `SLIDE_ALT` verified against any re-worded slide — all 12 repainted slides still verbatim
- [x] Docs, LOGBOOK, TODO, architecture map current — Entries 136 and 137
- [ ] User reviews before any push or merge — **outstanding**; assets uncommitted by design
