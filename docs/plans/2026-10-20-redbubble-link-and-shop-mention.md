# Redbubble link and shop mention

## Goal

Link the Redbubble shop from the site and add a short line about owning the shop to the About Me box.

## Open inputs (needed before building)

None. Resolved 2026-10-20: shop `https://www.redbubble.com/people/BubbleComet/shop`, name BubbleComet, icon in the footer only.

## Approved About copy (owner, 2026-10-20)

> Outside client work, I run a Redbubble shop, BubbleComet, where I make small illustrations for print on stickers, apparel, and accessories.
Per `.agents/memories/brand-voice.md` the owner writes the first draft; this one was drafted at their
request and then edited and approved by them.

## UI and UX mockup record

Not applicable: no new layout. One icon joins the existing footer icon row and one sentence joins an
existing About paragraph.

## Changes

1. `app/components/ConnectLinks.tsx`: add a fourth icon link after GitHub, same classes as the other
   three, `href` = shop URL, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="Redbubble shop"`,
   inline SVG with `fill="currentColor"` and `aria-hidden="true"`. This row renders in the footer on every
   page, so the shop is one click away site-wide.
2. `app/page.tsx`: add the approved sentence(s) to the About box, with the shop name as an inline text
   link (same external-link attributes). Text link, not icon, so the mention reads in plain English and
   screen readers get a real link name.
3. `about_me.md`: mirror the approved wording into the "Portfolio Website Version" so the source bio
   stays in step.
4. `npm run css:build` and commit `style.css` only if the build changes it (new classes would; reused
   classes should not).

## Not touched

Legacy static `index.html` (unmaintained, not deployed; see AGENTS.md).

## Tests and verification

- `npx playwright test --list`, then run the specs except `visual-baseline.spec.js` (baselines are
  `chromium-win32`; AGENTS.md Build & Test).
- `focus-ring.spec.js` already walks every `.icon-link`, so the new icon is covered with no spec change.
- Visual baselines: the footer is on every page and the About box grows by a line, so the win32 baselines
  will change. Regenerate on SOL per `docs/visual-gate.md`; do not accept platform PNGs from this host.
- Review link for the owner before any push (`.agents/memories/review-links.md`).

## Branch

Work on `claude/youthful-maxwell-k2do5o`. Nothing is pushed to `portfoliowebsite` (a push there deploys
to production and needs the owner's go-ahead in the moment).
