# Nav button restyle — bigger, modern segmented pill group

**Date:** 2026-07-23
**Agent:** Opus 4.8 (quartz, main)
**Status:** In progress

## Goal

The primary nav buttons are visually undersized and dated: 11px uppercase text with
`0.08em` tracking, `4px 10px` padding, three detached grey `--brand-surface-2` boxes,
all inside a cramped 44px sticky bar. Restyle them into something bigger and more
modern while staying inside the brand token system.

> **Final direction (after live user review) — supersedes the pill-group spec below.**
> Three iterations: (1) segmented pill group with a visible track, as specced; (2) track and
> resting fills removed so segments match the nav bar unless hovered or current; (3) square
> highlights with all borders/rings dropped. Shipped rule: **no chrome at rest; a square
> `--brand-accent-dim` fill on current page and press, a `--brand-surface-3` square on
> hover; `border-radius: 0` throughout, including the theme toggle.** Then (4) the fills
> stretched to the full bar height — zero vertical padding, no `min-height`, flex chain
> switched from `center` to `stretch`, toggle width pinned to the bar height so it stays
> square. Verified numerically: button height is always `navH - 1px` across 320→2560px and
> both themes, never exceeding the header. The type, size, and horizontal-spacing decisions
> below all held; the container, shape, and vertical sizing changed.

## Direction

One **segmented pill group** instead of three detached boxes:

- Taller bar: `height: 44px` → `clamp(56px, 5.5vw, 68px)`.
- `.brand-nav-links` becomes the segment track — full-round container, hairline border,
  translucent `--brand-surface-1` fill, `4px` inner padding, `2px` gap.
- Links: sentence case (drop `text-transform: uppercase` + wide tracking, which is what
  makes short labels wide), `clamp(13px, 1.05vw, 15px)`, weight 500, full-round,
  `clamp(7px, 1vw, 11px) clamp(11px, 1.6vw, 20px)` padding, `min-height: 38px` so the
  tap target roughly doubles.
- Rest state `--brand-text-muted`; hover fills `--brand-surface-3` and lifts to
  `--brand-text`.
- Active state becomes a **filled pill** (accent-tinted fill + `--brand-text` label +
  accent hairline ring), replacing the 2px `::after` underline. Underline is deleted.
- Theme toggle grows 36 → 40px, icon 16 → 18px, to stay proportional to the group.

Rationale for keeping the active label at `--brand-text` rather than `--brand-accent`:
LOGBOOK Entry 067 already moved it off accent for contrast. Accent stays as fill/ring.

## Files

| File | Change |
|---|---|
| `brand.css` | `.brand-nav` height; new `.brand-nav-links` track + link rules; `.is-active` filled-pill rewrite; `.brand-theme-toggle` sizing; `.brand-nav-logo` button affordances; `.brand-nav-inner` flex-start + `.brand-nav-actions` `margin-left: auto`; `.project-tab` block mirroring nav-link aesthetic; `.brand-hero` `overflow: hidden` to clip blob overflow |
| `app/components/Nav.tsx` | Removed explicit Home link from `navLinks` — logo serves as home button |
| `app/projects/ProjectTabs.tsx` | Replaced `brand-btn` classes with `project-tab` + `is-active`; rail hugs left, content area widened |
| `app/projects/BrandProject.tsx` | Removed `max-w-(--brand-content-max)` from all sections |
| `app/projects/MistrustProject.tsx` | Removed `max-w-(--brand-content-max)` from all sections |
| `src/css/site.css` | Delete the generic `nav ul li` / `nav ul li a` box rules (they were the old small-button styling and leaked to every `nav ul`); keep the focus-visible rule |
| `style.css` | Rebuilt artifact via `npm run css:build` |
| `tests/visual-baseline.spec.js-snapshots/*` | 40 intentional re-baselines |

`src/css/components.css` and `src/css/tokens.css` are **not** in the `app.css` cascade
(only root `brand.css` + `src/css/site.css` are) — they are stale duplicates and are
deliberately left alone rather than half-updated. Noted for a future cleanup task.

Both the Next.js app (`app/components/Nav.tsx`) and legacy `index.html` use
`.brand-nav-links`, so scoping the new rules to that class covers both without the
element-selector leak.

## Constraints

- No markup change needed — `Nav.tsx` already emits `is-active` + `aria-current`.
- 360px is the binding width: logo mark (32) + toggle (40) + gutters + gaps leaves
  ~250px for three labels. Sentence case + clamped padding is what makes it fit;
  verify no horizontal overflow at 360.
- WCAG AA on both themes for rest / hover / active label colors.
- `--brand-border-focus` focus-visible contract must survive the restyle.

## Verification

1. `npm run css:build`, confirm `style.css` rebuilt minified.
2. `npm test` — expect 40 visual failures (intentional), smoke green.
3. Inspect the actual/diff PNGs, then `npm test -- --update-snapshots` and review the
   regenerated set before committing. Unreviewed updates defeat the gate (AGENTS.md).
4. Re-run `npm test` clean.
5. Screenshot verdicts at 360 / 768 / 1024 / 1440 × dark/light: no overflow, no clipped
   labels, active pill legible, toggle aligned.

## Plan review outcome (pro nano-agent, OpenCode route)

Reviewer raised 9 findings. Verified each against the files before acting:

- **#1 blocking, confirmed + fixed.** `#theme-toggle` (`brand.css:230`) carries the real
  toggle styling at 32px/15px, and ID specificity beats the `.brand-theme-toggle` class
  mirror — so editing only the class was a **no-op**. Both blocks now say 40px/18px, and
  the ID block carries a comment explaining that size changes belong there. Reviewer was
  also right that the plan's "36 → 40px" was wrong (#4): the real starting size was 32px.
- **#2 focus-visible token — deliberately not "fixed."** AGENTS.md names
  `--brand-border-focus` as the contract, but that token is
  `rgba(255,255,255,0.24)` in dark, a markedly *weaker* ring than the
  `--brand-accent` the code actually uses. Downgrading to satisfy a doc line would make
  focus less visible. Kept accent; the AGENTS.md line is the stale side and is corrected
  there instead.
- **#3 generic `nav` / `nav ul` rules kept.** They are base layout only (no boxes, no
  type) and the legacy pages rely on them. The leak the plan cared about was the styling,
  which is gone.
- **#5 / #6 confirmed, no change.** 360px fits with ~6px slack; active-pill contrast is
  ~8.5:1 dark / ~12:1 light. Reviewer's note that a fourth label would not fit is real
  and matters for re-enabling Contact — recorded in TODO.
- **#7 recorded as follow-up**, not fixed here: `src/css/components.css` +
  `src/css/tokens.css` are out-of-cascade duplicates that still contain the old
  small-button rules. Deleting dead CSS is its own scoped task, out of this diff.
- **#8 confirmed:** four legacy HTML pages also use `.brand-nav-links` and pick up the
  restyle. Not deployed, so not baselined.
- **#9 declined for this diff:** an axe sweep is worth having but is a test-harness
  addition, not part of a CSS restyle. The contrast math in #6 is recorded above instead.

## Risks

- Taller nav shifts every page's first-paint layout, so all 40 baselines move; a real
  regression could hide inside an intentional 40-file re-baseline. Mitigation: read the
  diff PNGs for the non-nav regions before accepting.
- `next build` must not run while `npm run dev` is live (AGENTS.md / Entry 080).
