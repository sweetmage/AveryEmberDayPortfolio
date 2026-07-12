# Next.js Migration Plan

**Status:** Planning only — not started. Written per user decision 2026-07-12; execution deferred to a future cycle.

## Decision context

- **Framework:** Next.js (React) over SvelteKit or staying vanilla. Chosen partly for resume/skills-signaling value (site doubles as a portfolio for a job search) over raw technical fit — user explicitly weighed this tradeoff and accepted Next.js's heavier runtime/boilerplate in exchange for ecosystem size and hiring-market recognition.
- **Scope decision:** Plan-only this cycle. No pilot page, no code changes. Resolves the "Framework Decision Pending (2026-06-04)" TODO item — the decision itself is now made; only execution remains, and execution is a distinct future task.
- **This does not block current work.** Existing vanilla HTML/CSS/JS + Tailwind pages stay as-is and remain the live site until migration execution begins.

## What has to survive the migration

1. **`scripts/bubbles.js` (885 lines)** — hand-rolled DOM-based physics engine (global bubble layer + hero blob layer, mouse repulsion, squish/collision, scroll-stir, `.bubble-exclude` zone tracking). This is the single highest-risk piece: it's imperative, mutates the DOM directly every animation frame, and has been tuned through ~15 LOGBOOK entries. It must NOT be rewritten as part of the migration — port it as a self-contained client-side module invoked from a `useEffect`, not translated into React state/render logic.
2. **CSP hash-pinning** (`netlify.toml:12`) — currently pins 2 inline `<script>` blocks by SHA-256 hash (the theme-init script + one other). Next.js's build emits hashed/chunked JS files, not stable inline scripts, so this CSP strategy breaks by default and needs a different approach (nonce-based CSP via middleware, or moving the theme-init script to a static asset with a stable hash).
3. **Tailwind v4 setup** (`app.css` → `style.css` compiled, `src/css/tailwind-preset.css` bridge, `dark:` variant keyed to `[data-theme=dark]` not `prefers-color-scheme`) — Next.js supports Tailwind v4 natively; the token/preset files port with minor config changes, but the `[data-theme]`-keyed dark mode (as opposed to the `class` strategy Tailwind expects by default) needs explicit config.
4. **5 static pages** — `index.html` (181 lines), `gallery/gallery.html` (152), `projects/brand-avery-ember-day.html` (234), `projects/history-of-mistrust.html` (768 — largest, has carousel/lightbox/slideshow JS), `projects/patriots-low-thirds.html` (134).
5. **Netlify static hosting + security headers** (`netlify.toml`) — HSTS, Permissions-Policy, X-Frame-Options, etc. carry over unchanged; only the CSP `script-src` line needs rework.
6. **41 Playwright visual-regression baselines** (`tests/baselines/`, 5 pages × 4 breakpoints × 2 themes) — these become invalid the moment markup/CSS output changes structurally. Full baseline re-capture is required post-migration, not a port.

## Proposed approach

**Framework shape:** Next.js App Router, static export (`output: 'export'`) — no server runtime needed since this is a fully static portfolio; keeps Netlify deployment simple (publish the exported `out/` directory, same as today's `publish = "."`).

**Migration order (for the future execution cycle — not this session):**

1. **Scaffold** — new Next.js + TypeScript + Tailwind v4 project alongside the current repo (separate branch, e.g. `shxdowloop/<date>/nextjs-migration`). Port `tailwind-preset.css` tokens into Next's Tailwind config; verify `dark:` variant works with `[data-theme]` attribute strategy (`darkMode: ['selector', '[data-theme="dark"]']` in Tailwind v4 config).
2. **Port `bubbles.js` unchanged** — drop it into `public/` or `src/lib/` as-is and load it via a thin client component (`'use client'`) that mounts it in `useEffect` and tears it down on unmount. Do not rewrite the physics logic in JSX/React state — that risks re-introducing bugs already fixed across LOGBOOK Entries 057–064.
3. **Convert one page first as validation** (even though execution is deferred, the plan should specify this): `projects/patriots-low-thirds.html` — smallest project page (134 lines), lowest content risk, good canary for the bubble-exclusion-zone + Tailwind port before touching `index.html` or the large `history-of-mistrust.html`.
4. **Solve CSP** before porting more pages — pick nonce-based CSP (Next.js middleware generates a per-request nonce, injected into script tags) since static hash-pinning doesn't survive Next's build-hashed bundle filenames. Update `netlify.toml` headers accordingly.
5. **Port remaining pages** — `index.html`, `gallery/gallery.html`, `brand-avery-ember-day.html`, then `history-of-mistrust.html` last (largest, has bespoke carousel/lightbox JS in embedded `<script>` — this needs the most componentization work).
6. **Re-point Netlify** — new build command (`next build`), publish directory (`out`), `NODE_VERSION` bump if needed.
7. **Full Playwright re-baseline** — all 41 shots regenerated against the new output; manual visual diff review (not just pixel-match) since DOM structure will differ from the hand-written HTML.
8. **Cutover** — DNS/Netlify site swap only after full QA pass; this ties into the still-open "Launch — point averyemberday.com live" TODO checklist, which should be re-run post-migration, not skipped.

## Files/systems touched (future execution)

- New: Next.js project structure (`app/`, `next.config.js`, component tree per page)
- Ported as-is: `scripts/bubbles.js`, `images/`, gallery/project content
- Rewritten: all 5 `.html` files → React components/pages, `Script.js` (theme toggle + misc DOM logic) → React hooks or a small client module
- Reworked: `netlify.toml` (build command, publish dir, CSP strategy), `tailwind-preset.css` → Next Tailwind config
- Invalidated and regenerated: all 41 `tests/baselines/*.png`
- Unaffected: `docs/`, `LOGBOOK.md`, `TODO.md` process files (continue as-is)

## Risks

- **Bubble-physics regression** — highest risk item. Mitigate by porting the file verbatim and testing the mouse-repulsion/exclusion-zone/scroll-stir behaviors manually against the current site's known-good behavior before considering any page "done."
- **CSP breakage** — Next's default build output is incompatible with the current hash-pinned `script-src`. Must be solved before any page ships, not discovered at deploy time.
- **history-of-mistrust.html complexity** — 768 lines with bespoke carousel/lightbox JS; likely the single largest chunk of migration effort. Should not be the pilot page.
- **Two-system period** — if migration runs incrementally (pilot page first) rather than all-at-once, the repo will temporarily have both a Next.js app and legacy static HTML pages live side by side. Needs a clear routing/deploy story for that window (e.g., Next.js app deployed to a preview URL until full cutover) so averyemberday.com doesn't serve a half-migrated mix.
- **Resume-signaling motivation vs. site stability** — noted per user's own tradeoff: this migration is not solving a technical problem with the current site (it works, tests pass), so it should not be rushed at the expense of breaking a working, tested, deployed portfolio during an active job search.

## Verification (future execution)

- `npx playwright test` full suite green against new baselines
- Manual cross-browser check at 360/768/1024/1440px, both themes (matches current QA bar)
- CSP: zero browser console violations in production build
- Lighthouse/perf spot check — Next.js's larger runtime should not regress current static-HTML load times materially

## Next step

This plan is ready for a future execution cycle. Recommended entry point when picked back up: scaffold the Next.js project on a new branch and port `patriots-low-thirds.html` as the pilot page (step 3 above) before committing further effort.
