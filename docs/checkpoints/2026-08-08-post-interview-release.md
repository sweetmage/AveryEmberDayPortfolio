# Checkpoint — 2026-08-08 · Post-interview release (contact form proven)

**Commit:** `bc3e2782...` (`bc3e278`) — the deployed SHA
**Docs follow-up:** `2536575` (docs-only; build cancelled by the `ignore` rule, nothing rebuilt)
**Branch:** `portfoliowebsite` (production — `bc3e278` is what averyemberday.com serves)
**Previous production SHA:** `da4b4be` (published 2026-07-26, 13 days stale)
**Logbook:** Entry 126

A known-good restore point, taken at the user's request after they confirmed the live site.
This is the first production deploy since the credit pause, and the first one where the contact
form is proven to work end to end.

## Why this SHA matters

The user had just interviewed for a job and could not risk a broken site, so the whole release was
staged on a **free branch deploy** and verified before production changed. `da4b4be` had been live
for 13 days with 48 commits stranded behind it.

| SHA | Change |
|---|---|
| `bc3e278` | Bubbles bounce off the picture at every width; `.gallery-item` removed as an exclusion zone |
| `e228be1` | Orthogonal gallery reflow; Mistrust first on Projects; slideshow capped to one screen |
| `172e3a2` | 16px form controls on touch — stops iOS zooming and pushing the nav off screen |
| `737f19d` | The art box IS the picture — kills the shrink-then-grow on expand |
| `30d0199` | An expanded card stays on the row it was clicked on |
| `b6ec900` | Artwork tweens as its own element |
| `a917420` | Decode the expanded rung before the transition starts (flicker) |
| +41 more | Everything accumulated on `develop` during the 2026-07-26 → 08-07 deploy pause |

## Verified state at this SHA

Verified against **the live site**, not a local build or the preview:

| Check | Result |
|---|---|
| Netlify deploy | `state: ready`, `skipped: null`, 15 credits — it genuinely built |
| Pages | `/`, `/projects/`, `/gallery/`, `/contact/`, `/contact/thanks/` all 200 |
| Page errors | none |
| `npx playwright test` | **131/131, twice consecutively** before the push |
| Projects page | opens on *A History of Mistrust*, first in the rail |
| Mistrust viewer | block 823px against an 824px budget at 1440×900 — fits one screen |
| Gallery bubbles | artwork is a padding-free frame zone; the card is **not** a zone |
| Gallery expand | works; card stays on its row; no shrink-then-grow |

### The contact form is fully proven

The thing the entire deploy pause existed to unblock, and the one part that could never be
verified locally:

| | |
|---|---|
| Form | `contact`, id `6a76439ee6fac40008881b68` |
| Fields | `bot-field` / `name` / `email` / `message` |
| Real submission | 1, recorded 2026-08-07 22:25Z |
| Redirect | `/contact/thanks/` returns 200 |
| **Notification email** | **confirmed received by the user, 2026-08-08** |

`/contact/thanks/` says "Your message has been sent." As of this checkpoint that is true, and it is
the first time it has been. The About copy invites readers to "reach out through my contact page",
so this is the difference between a working invitation and a lost enquiry.

**It registered from a free BRANCH deploy, not a production one.** `docs/deploys.md` said that was
impossible; the advice was right when written and expired unnoticed — `develop` was not in
`allowed_branches` *and* the credit block is account-level, so every deploy was skipped regardless
of branch. Neither condition survived the credit reset.

## Restoring to this point

```bash
git checkout portfoliowebsite
git reset --hard bc3e278    # discards later local work — check `git log` first
git push --force-with-lease origin portfoliowebsite
```

Force-pushing `portfoliowebsite` republishes production. Per `docs/NOTES.md`, that needs the user's
explicit go-ahead in the moment.

**Faster, and preferred for a live emergency:** Netlify → Deploys → select this deploy →
*Publish deploy*. Instant, no git, no credits. Rolling back to the pre-release state means
publishing `da4b4be` — but note that reverts the contact form to unregistered.

Baselines are `-chromium-win32` suffixed, so they only regrade correctly on Windows until the
containerization item in `TODO.md` lands.

## Known-open at this checkpoint

- **Two bubble-spec flakes, neither fixed.** `Contact form @ 1440px` (~1950px², the long-standing
  one) and `Projects tabs @ 768px` (~838px², new — twice in ~10 runs on 2026-08-07). Both pass on
  re-run. The recorded hypothesis is the `_relocating` rescue path; a second zone at a second width
  weakens the "something about that one form" framing. **Do not raise a tolerance** — twice the
  cause was elsewhere entirely.
- **At 390px a bubble centre can enter the artwork.** Geometry, not a defect: a 342px card holding a
  308px picture leaves ~17px of band, narrower than a 28px bubble. Invisible in practice — the layer
  is behind content on phones and the picture is opaque.
- **The iOS zoom fix is verified in Chromium touch emulation, not on real hardware.** The 16px
  threshold is a fixed Safari rule, and the user has since confirmed the site on a phone, but no
  automated coverage runs on iOS.
- **Visual gate still is not wired into CI.** `netlify.toml` runs `next build` with no test step, so
  a regression deploys unchallenged if the suite is skipped locally.
- **Preview branch deploys are off again.** `allowed_branches` is back to `["portfoliowebsite"]`.
  To stage another release, re-add the branch — it is free, and it is how this one was tested.
