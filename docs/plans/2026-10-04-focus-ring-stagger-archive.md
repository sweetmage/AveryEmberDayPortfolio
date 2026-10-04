# Focus ring, gallery entrance stagger, plan archive — 2026-10-04

**Agent:** Opus 5.5 (fennel, main) · **Cycle:** shxdowflow · **Branch:** `portfoliowebsite`

## Acceptance contract (approved proposal, quoted)

> 1. **Scope.** (a) Fix the focus ring on `.icon-link`, `#return-to-top`, `.skip-link` so they paint the
>    2px `--brand-accent` ring, retesting headed with real Tab presses first. (b) Gallery filter entrance
>    stagger: entering cards fade up from 0.96, ~25ms staggered by grid position; staying cards only
>    tween. (c) Archive the two shipped plans out of `docs/plans/`.
> 2. **Out:** the two measure caps, orphaned icons, WebKit rectangle, Mistrust viewer, copy pass, CI
>    visual gate, **any push or deploy**.
> 4. **End state:** accent ring on Tab proven by a spec; stagger on entering cards only; plans archived;
>    TODO condensed, LOGBOOK Entry 134; committed locally, not pushed.
> 5. **Verification:** full `npx playwright test` green; new focus spec with real Tab presses on
>    chromium + webkit; motion-enabled stagger spec; visual gate with no unexplained baseline moves;
>    `grep -rn "^\s*- \[ \]" docs/plans/` empty.

## Goal

Close two "Ready to build now" TODO items and restore the "a file in `docs/plans/` means unfinished"
invariant, without a production deploy.

## Finding that sets the focus-ring approach (measured this session, headed)

Headed Chromium and headed WebKit, real `Tab` presses, `/` at 1440×900. Outline colour read on focus
and again 500ms later (`--brand-accent` = `rgb(139, 34, 224)`):

| Control | On focus | +500ms | `transition-property` |
|---|---|---|---|
| `.brand-footer-links a` (works) | accent | accent | `color` |
| `.icon-link` | `rgb(106,104,96)` | accent | Tailwind `transition-colors` (includes `outline-color`) |
| `#return-to-top` | `rgb(106,104,96)` | accent | Tailwind `transition-colors` |
| `.skip-link` | white, 1.5px (3px WebKit) | accent | Tailwind `transition-all` |

The rule was never failing. Tailwind v4's `transition-colors` lists `outline-color`, so the ring
**fades in** over `--default-transition-duration` (150ms) from `currentColor`; `transition-all` also
tweens the width. Every earlier headless reading was a sample mid-fade, which is also why "an injected
`!important` rule also fails" and "longhands behave the same" — neither touches the transition. The
"Longhands, not the shorthand" comment in `brand.css` records the same misdiagnosis.

## Approach

**Focus ring.** Narrow the transition on the three components so it no longer includes the outline:
`transition-colors` → `transition-[color,background-color,border-color]` on the three `.icon-link`
anchors (`ConnectLinks.tsx`) and `#return-to-top` (`ReturnToTop.tsx`); `transition-all` →
`transition-[top]` on `.skip-link` (`SkipLink.tsx`, the only thing it animates is `focus:top-0`). Hover
transitions are unchanged. The fix lives on the element because the CSS rule sits in
`layer(components)` and cannot override a utilities-layer `transition-property`. Rewrite the
`brand.css` comment to the real cause.

Guard: `tests/focus-ring.spec.js` — real `keyboard.press('Tab')` on every page, and for **every**
focus stop that paints an outline, assert `transition-property` neither is `all` nor contains
`outline` (catches the next `transition-colors` control, not just these three), plus the four footer /
skip controls read the accent **immediately** on focus. Runs on `chromium` and `webkit-mobile` (the
latter needs a WebKit Tab: `Alt+Tab`, as measured).

**Gallery stagger.** Inside `handleFilterClick`, compute the entering set (in the new filtered list,
not in the current one) before the transition. Hold it in state set inside the same `flushSync`
update, so for those cards only:
- the card gets `view-transition-class: gallery-enter` (in addition to its unique name), and
- the artwork's `view-transition-name` is **omitted**, so the art is flattened into the card
  snapshot and enters with it (an entering card has no old art to tween from; a separately named art
  with `animation: none` would pop in at full opacity ahead of its card).

CSS: `::view-transition-new(.gallery-enter) { animation: none; }` cancels the UA fade. On the
transition's `ready` promise, animate each entering card's `::view-transition-new(vt-gal-N)` with
`document.documentElement.animate([{opacity:0, transform:'scale(0.96)'}, {opacity:1, transform:'none'}],
{ pseudoElement, duration: var(--brand-duration-layout) resolved, easing, delay: rank × 25ms,
fill: 'backwards' })`, where **rank is the card's order among entering cards, sorted by grid position**
(so two cards entering at slots 9–10 start at 0 and 25ms rather than idling 225ms). Clear the
entering state on `finished`. Leaving cards keep the default fade; staying cards are untouched, so they
only tween. Reduced motion is already bypassed before any transition starts; WAAPI on a pseudo is
feature-detected and failure is silent (falls back to the cards simply appearing). Expand/collapse
never sets the entering state.

Guard: extend `tests/gallery-expand.spec.js` (motion enabled): on a filter change that adds cards,
only entering cards carry `gallery-enter` during the transition, staying cards do not, entering art
has no name, and the `document.getAnimations()` on `::view-transition-new(vt-gal-*)` pseudos have
delays `0, 25, 50…` in grid order. Update the "every artwork carries its own name" test only if it
runs mid-transition (it should not).

**Plan archive.** Move `2026-08-10-sticky-rail-one-column-rule.md` and
`2026-08-09-bubble-exclusion-flake.md` into `docs/archives/plans.md` as stubs in the
"Consolidation stubs 2026-08-09" format with recovery `git show <sha>:<path>` (both are tracked since
`73b5fa4` / earlier). Update `docs/plans/README.md`; repoint any references (`grep -rn` the two
filenames). This plan doc itself stays in `docs/plans/` until shipped and committed, then archives in
a later session, per the README rule.

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| T1 focus ring | main agent | `app/components/ConnectLinks.tsx`, `app/components/ReturnToTop.tsx`, `app/components/SkipLink.tsx`, `tests/focus-ring.spec.js` (new) | — | `npx playwright test tests/focus-ring.spec.js` |
| T1b focus comment | main agent | `brand.css` lines ~1842–1866 only | **T2 integrated** (T2 also writes `brand.css`) | read diff |
| T2 gallery stagger | pro nano-agent (opencode), detached worktree | `app/gallery/GalleryGrid.tsx`, `brand.css` view-transition section (~1718–1781) only, `tests/gallery-expand.spec.js` | — | `npx playwright test tests/gallery-expand.spec.js --project=chromium` |
| T3 plan archive | main agent | `docs/archives/plans.md`, `docs/plans/README.md`, the two plan files (deleted) | — | `grep -rn "^\s*- \[ \]" docs/plans/`; `grep -rn` both filenames |

T1, T2, T3 launch together (cap 3; T2 is the only helper). T1b waits on T2 because both write
`brand.css`. Then full suite, TODO/LOGBOOK, commit.

## Verification

1. `npx playwright test tests/focus-ring.spec.js` green on both projects; the same spec **red** on the
   pre-fix components (revert the three class edits locally, run, restore) — proves it detects the bug.
2. Stagger spec green; the entering-only assertion red if the class is applied to all cards.
3. Full suite `npx playwright test` green, twice (this suite has a flake history). Estimate stated
   before, actual recorded after.
4. Visual gate: no baselines regenerated. Focus rings and transitions are not captured at rest, so
   none should move; any move is investigated, not re-baselined.
5. `npx tsc --noEmit` clean.
6. Headed re-run of the scratch probe: all four controls accent on focus, not just at +500ms.

## Risks

- WAAPI `pseudoElement` on view-transition pseudos: Chrome 111+ / Safari 18+. Feature-detect; a throw
  must never break the filter.
- A filter click during a running transition: the existing catch path re-runs `update`; entering
  state must be recomputed, not stale. Clear it on `finished` *and* on a skipped transition.
- `transition-[...]` arbitrary values must be emitted by Tailwind's scanner from the TSX — verify in
  the built CSS.
- No push: a push to `portfoliowebsite` is a 15-credit Netlify production deploy.

## Planning shape

Single session; no forcing reason for more. Three tracks, cap 3 (2 authenticated + 1 free). Signoff
triggers checked: auth, installers, safety rules, review contract, publishing, billing, deletion of
user data, outbound messaging — none touched (deleting two plan docs into an archive is not data
deletion). No independent Final signoff required unless a deploy is later approved.
