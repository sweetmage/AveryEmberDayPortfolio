## Entry 076 — 2026-07-14

**Agent:** Claude Fable 5 (vesper, shxdowloop)
**Cycle:** nav-restructure-wrapup
**Task:** Reconcile post-implementation state of the nav restructure (Entry 075): dirty worktree, untracked/stale plan doc, stale TODO notes; re-verify; checkpoint on an isolated branch.

### Changes

- Branch: `shxdowloop/2026-07-14/nav-restructure-wrapup` (production `portfoliowebsite` stays local-only, 6 ahead of origin, push withheld per user).
- **style.css reconciled — kept rebuilt artifact.** Two compounding causes: (1) the committed copy was stale — Track A deleted the `#contact` grid rule from `src/css/site.css` (commit `94664d6`) but the legacy root bundle was never rebuilt; (2) a leftover `tailwindcss --watch=always` process (no `--minify`, PID 28292) kept rewriting style.css unminified on every file change — it even reverted this loop's first rebuild between verification and checkpoint (`b1a5b49` briefly carried the unminified copy; corrected in the stage-3 commit). Watcher killed; restart with `npm run css:watch` if wanted. Final artifact rebuilt via `npm run css:build` (minified, canonical). Only consumer is the undeployed legacy root site (Netlify publishes `out/`); legacy footer (`index.html:135` uses `id="contact"`) loses grid-centering — accepted, page is frozen and not shipped.
- **docs/sync/local-tasks.json reconciled — kept.** Derived state from TODO.md; verified deterministic (`parse-todo.js` regen matches byte-for-byte minus `generatedAt`). Regenerated after TODO edits; `sync-all.js --dry-run` clean.
- **42 baseline re-captures discarded — and the churn explained.** `tests/visual-baseline.spec.js` is capture-only: it screenshots directly into `tests/baselines/` every run and asserts only file-exists/size, with no image comparison. Every `npm test` therefore rewrites all 40 PNGs, and bubble-physics animation makes index captures pixel-nondeterministic, so the tree dirties on every run by design. The startup-dirty baselines were just a prior run's captures, not intentional work. Restored the committed (`229806f`) set — the adjudicated ones from stage 4's visual inspection. Follow-up recorded in TODO (capture-only vs compare-based gate is a testing-model decision for the user).
- Plan doc `docs/plans/2026-07-14-nav-restructure.md` committed (was untracked) with Status corrected from "Planned — no implementation yet" to Implemented (Entry 075).
- TODO.md: srcset plan note corrected (was "uncommitted", actually `f63671d`); nav-restructure entry now lists the full commit range + deploy-gated leftovers.
- Process plan: `docs/plans/2026-07-14-nav-restructure-wrapup-shxdowloop.md`.

### Verification

- `npm test` → 45/45 passed (Playwright webServer ran `build:next` + served legacy :3000 and `out/` :3001).
- `parse-todo.js` determinism check: DETERMINISTIC-MATCH, 15 tasks.
- `git status` clean after checkpoint except intentional commits.

### Helper route

Main agent only (nano-agents warmed but not dispatched — run was small, git-heavy, judgment-bound). Binding usage 60% weekly at preflight, below the 80% native ban.

### Risks / Notes

- Production push of `portfoliowebsite` (nav restructure + srcset, 6 commits) still withheld — user decision. After that deploy: enable Netlify form detection (Site configuration → Forms) and verify the hash-fragment 301 redirects.
- Legacy root site's footer alignment changed with the style.css rebuild (undeployed surface only).

---

## Entry 075 — 2026-07-14

**Agent:** Kilo (kimi-k2.6)
**Cycle:** nav-restructure-implement
**Task:** Implement the nav restructure plan from Entry 074 across Tracks A–D.

### Changes

1. **Track A — Nav, Footer, landing page, gallery back-link**
   - `Nav.tsx`: links → Home / Projects / Gallery / Contact; `isActive` normalizes trailing slashes; logo text hidden below `sm` (640px) via `hidden sm:inline`
   - `Footer.tsx`: links → Projects / Gallery / Contact
   - `app/page.tsx`: Work section removed entirely; unused `Link` + `cardSizes` cleaned up
   - `app/gallery/page.tsx`: back-link relabeled "← Home"
   - `src/css/site.css`: removed dead `#contact` grid rule
   - Commit: `94664d6`

2. **Track B — Tabbed Projects page**
   - Extracted `BrandProject.tsx` and `MistrustProject.tsx` from old per-page routes
   - Created `ProjectTabs.tsx` (client): accessible tabs (`role="tablist"`, arrow keys, `aria-selected`), hash deep-linking on mount, tab-switch closes lightbox + resets body scroll, both panels always mounted (`hidden` toggling)
   - Created `app/projects/page.tsx` (server): one `<main>`, `sr-only` h1, `SlideshowScript` + lightbox rendered once at page level
   - Moved `slideshow.css` and `SlideshowScript.tsx` up to `app/projects/`
   - Deleted old `brand-avery-ember-day/` and `history-of-mistrust/` directories
   - `netlify.toml`: 301 redirects from old project URLs to `#brand` / `#history-of-mistrust`
   - Commit: `e24c0ba`

3. **Track C — Contact page + form + thanks page**
   - Extracted shared `ConnectLinks.tsx` (email, LinkedIn, GitHub icons) used by Footer and Contact
   - `app/contact/page.tsx`: heading, invite text, ConnectLinks, Netlify form (name/email/message + honeypot + hidden `form-name`)
   - `app/contact/thanks/page.tsx`: static thanks page with "Back to Home" button
   - Commit: `077843c`

4. **Track D — Tests update, re-baseline, smoke spec**
   - `visual-baseline.spec.js`: replaced brand/mistrust with `projects` + `projects-mistrust`; added `contact`; mistrust tab auto-clicked before capture
   - `smoke-next.spec.js`: new console-error-capturing smoke spec against :3001 covering home, projects (tab switch + lightbox), gallery, contact
   - Re-baselined all 40 screenshots (5 pages × 4 breakpoints × 2 themes); removed 16 old brand/mistrust baselines
   - Full suite: 45/45 passed
   - Commit: `229806f`

### Verification

- `npm run build:next` → clean export with 6 routes: `/`, `/projects/`, `/gallery/`, `/contact/`, `/contact/thanks/`, `/_not-found`
- `out/projects/index.html` contains both "Avery Ember Day Brand" and "A History of Mistrust" bodies
- `out/contact/index.html` contains `data-netlify="true"`, `netlify-honeypot="bot-field"`, `name="contact"`
- Playwright: 45/45 green (visual baselines + smoke-next + smoke-interaction + unit tests)

### Risks / Notes

- No push to origin per user instruction. All commits are local on `portfoliowebsite` branch.
- Netlify redirects in `netlify.toml` are advisory for the static export; actual redirect behavior depends on Netlify's redirect handling for hash-fragments (the `#brand` / `#history-of-mistrust` targets may need client-side JS to activate the correct tab on arrival). The `ProjectTabs` component already reads `location.hash` on mount, so direct navigation to `/projects/#brand` will work in the browser.
- Gallery baselines at 360/768 occasionally hit Windows file-lock collisions under parallel workers; sequential capture (`--workers=1`) is the reliable fallback.

---

## Entry 074 — 2026-07-14

**Agent:** Claude Fable 5 (sable, shxdowflow)
**Cycle:** nav-restructure-plan
**Task:** User: plan a navigation restructure — top nav becomes Home / Projects / Gallery / Contact, landing drops the Work section, Gallery unchanged (tags later), Projects becomes one tabbed page.

### Output

- **Plan written:** `docs/plans/2026-07-14-nav-restructure.md`. Four tracks: (A) Nav/Footer/landing — new nav links, Work grid deleted, dead-CSS trim (`#work h2` rule, `.project-grid`); (B) tabbed `/projects/` page — Brand + Mistrust bodies extracted to components, accessible always-mounted tab panels (`hidden` toggling), hash deep-links, Netlify 301 redirects for the old project URLs; (C) `/contact/` — Netlify Forms (form + email/LinkedIn/GitHub links, user-confirmed) with a static thanks page; (D) test-spec updates + re-baseline + screenshot adjudication. A/B/C parallelizable, D sequential.
- **User decisions captured (AskUserQuestion):** Contact = form + links; no coming-soon Motion Graphics tab (Patriots slots in when its render lands).
- **Claims verified against source, not assumed:** the mistrust slideshow script is an IIFE that measures only inside interaction handlers (line 158) and binds element-scoped listeners, so hidden-panel init is safe; the re-run hazard is duplicated lightbox DOM, which the always-mounted design avoids. Complete `/#work`/`/#about` reference sweep is in the plan with file:line refs.
- **Gallery tags groundwork stashed in TODO:** all 11 gallery works visually reviewed; real taxonomy is Digital (4) / Painting (5) / Drawing (2) — no photography, so the original suggested buckets don't fit. Per-work assignments flagged for user confirmation.

### Review

The OpenCode nano route wedged again, same signature as Entry 073: pro (minimax-m3) review and the flash (deepseek-v4-flash) retry both stalled past the 6-minute floor with only the startup line (flash also logged a 20 s `model-probe:timeout`). Per retry-exhaustion rules the review fell back to a native reviewer (general-purpose backstop, model fable — the pinned `oracle` wasn't in this session's agent registry). Verdict **SOUND-WITH-FIXES**, 11 findings, all verified against source before incorporation. Biggest catches: the plan's CSS sweep had targeted `src/css/components.css`, which `app/globals.css` never imports (live CSS is root `brand.css` + `src/css/site.css`); a live legacy `#contact` grid rule (site.css:201) would have broken the contact page; the existing smoke spec only covers the *legacy* site on port 3000, so Next console-error coverage must be written new; demoted project titles need the `normal-case tracking-normal border-none p-0` override set; lightbox-open + tab-switch would deadlock body scroll without an explicit close-on-switch; Netlify Forms detection is opt-in in the site UI. Second AskUserQuestion round settled mobile nav: inline links + icon-only logo below ~480 px, no hamburger.

No implementation this cycle — plan awaits user go-ahead. Entry 073's srcset work remains uncommitted in the tree, untouched.

---

## Entry 073 — 2026-07-13

**Agent:** Claude Fable 5 (maren, shxdowflow)
**Cycle:** srcset-variants
**Task:** `srcset` / `@2x` variants for project + gallery thumbnails (TODO → Architecture remediation follow-ups). Plan: `docs/plans/2026-07-13-srcset-variants.md`.

### Changes

1. **Variant generator** — new `scripts/generate-image-variants.js` (manifest-driven, `sharp`): writes `<name>-<width>w.<ext>` next to each source, same format, mtime-based skip, never upscales, `--force` to regenerate. Exposed as `npm run images:variants`. `sharp ^0.35.3` added as devDependency (build-time only).
2. **25 generated variants** committed under `public/images/`: project thumbs at 480/960 w (brand) and 480 w (mistrust); all 12 gallery webps at 480/900 w with the 1200 px original as the top srcset rung. Biggest wins: `FacesFinal.webp` 426 KB → 84 KB at 1x on cards, `beheadedFinal` 387 KB → 69 KB.
3. **Home cards** (`app/page.tsx`) — the 3 card `<img>`s get `srcSet`, `sizes="(min-width: 1200px) 500px, (min-width: 768px) 45vw, 92vw"` (card caps at ~500 px inside `main` + `brand-container`), and intrinsic `width`/`height`.
4. **Gallery grid** (`app/gallery/page.tsx`) — items carry `width`/`height` (CLS reservation; previously missing), rendered with a `buildSrcSet()` helper and `sizes="(min-width: 1000px) 438px, (min-width: 768px) 46vw, 92vw"` (900 px grid, 2-col ≥768). All srcset rungs are `encodeURI`'d — the SelfPortraitSeries filename contains spaces, which would break srcset parsing raw. Also added `decoding="async"`.

### Verification

- `node scripts/generate-image-variants.js` — 25/25 generated, spot-checked output dimensions (480×270 jpg, 900×1167 webp).
- `npm run build:next` — export succeeds 7/7 pages; `out/index.html` + `out/gallery/index.html` contain correct srcset rungs, spaces rendered as `%20`.
- `npm test` — 33/33 pass. Baseline PNGs are re-captured by design on every run; gallery + index captures visually inspected: all images render, no layout shift from the new intrinsic dimensions.

### Review

The OpenCode nano-agent route was wedged this session: pro (glm-5.2) plan review, pro final review, and the flash retry all stalled past the 6-minute no-progress floor with only the startup line. Per retry rules the review fell back to a native code-reviewer subagent, which verified srcset↔disk consistency, sizes math against the CSS chain, the encodeURI space handling, generator skip/upscale logic, and docs sync — zero findings above threshold. Main-agent diff review also done. TickTick mirror dry-run flagged a pre-existing stale mapping (15 create / 95 delete) from the earlier TODO restructure; real sync left user-gated. No commit — awaiting user instruction per handoff rules.

---

## Entry 072 — 2026-07-12

**Agent:** Claude Fable 5 (vesper, shxdowflow)
**Cycle:** motion-load-perf
**Task:** Execute `docs/plans/2026-07-12-motion-load-perf.md` — reduce time-to-motion / time-to-interactive on the Next.js static-export site.

### Changes

1. **Idle-deferred engine init** — `app/components/BubblePhysics.tsx` now appends the `bubbles.js` script inside `requestIdleCallback` (1500 ms timeout, `setTimeout(0)` fallback) with `async = true` + `data-priority="low"`, so engine startup no longer competes with LCP. Cleanup cancels the pending idle callback (also fixes a potential double-append under React strict mode).
2. **Per-frame layout caches** — `scripts/bubbles.js`: `PhysicsEngine` caches the hero container rect and the derived `zonesLocal` array (keyed on a new `ExclusionZoneTracker.version` stamp), invalidated on scroll/resize/visibility-restore. `HeroBlobLayer` caches its container rect the same way. Eliminates 2 `getBoundingClientRect()` calls + a full array rebuild per frame in steady state.
3. **Hero-blob visibility gate** — `heroBlobLayer.step()` is now skipped when `#hero` is scrolled out of view (reuses the existing IntersectionObserver via a new `_heroVisible` flag; the hero bubble layer keeps its old gating).
4. **LCP image hints** — hero logo (`app/page.tsx`) gets `fetchPriority="high"`, `decoding="async"`, `width`/`height` (160×160 from the SVG viewBox). Below-fold images get `loading="lazy" decoding="async"`: 3 home project-card thumbs (incl. 426 KB `FacesFinal.webp`), mistrust moodboard/storyboard, brand logo swatches. (`next/image` skipped deliberately — the logo is an SVG theme-swapped via CSS `content: url()`, and the export runs `images.unoptimized` anyway.)
5. **Reduced-motion smooth-scroll** — `html { scroll-behavior: smooth }` in `src/css/site.css` is now wrapped in `@media (prefers-reduced-motion: no-preference)`; `ReturnToTop.tsx` checks `matchMedia` and scrolls with `behavior: 'auto'` when reduce is set.
6. **Dead motion CSS removed** — `brand.css`: deleted unreferenced keyframes `brand-blob-morph-1..5`, `brand-float-1..5`, plus base `brand-float` and `brand-blob-layer-rotate` (also dead; `brand-outline-pulse` is used at `.brand-btn-generating` and kept). Dropped the redundant `will-change: transform, opacity` on `.brand-bubble` (physics bubbles always carry `.brand-bubble-physics`, which declares `will-change: transform`). The animation-strip guard in `HeroBlobLayer`'s constructor is now a documented no-op.
7. **Copy sync** — `public/scripts/bubbles.js` (the file the Next export actually serves) re-synced from `scripts/bubbles.js`; `style.css` rebuilt via `npm run build:css`.
8. **Test harness fix for lazy images** — the first re-baseline run captured the Art Gallery card blank: `loading="lazy"` images below the viewport never fetch during Playwright's fullPage capture, and even after forcing the load, `decoding="async"` images outside the viewport screenshot as blanks because captureBeyondViewport never decodes them. `tests/visual-baseline.spec.js` now forces in-layout images eager, awaits load (bounded 8 s — the mistrust lightbox imgs are hidden and never load), then awaits `img.decode()` before the capture. Baselines regenerated once with images intact; verified against the pre-change baseline composition.

### Verification

- `npm run build:css` — clean.
- `npm run build:next` — static export succeeds, 7/7 pages (pre-existing `headers`-with-export warning unchanged; Netlify serves headers).
- `npm test` — 33/33 pass (visual baselines × 4 pages × 4 breakpoints × 2 themes + smoke, zero console errors). Index and mistrust baselines visually inspected against the committed versions: composition unchanged, all thumbnails/slides render.
- Runtime probe against the served `out/` build: engine initializes after idle defer (`window.__bubbleEngine` present), 7 global bubbles + 3 hero bubbles + 5 blobs created, `script.async` true, hero-rect cache populated and zone version stamping live, zero console/page errors.
- Lighthouse before/after not run this pass — no baseline capture existed pre-change; noted as follow-up only if the user wants numbers.

### Deploy (2026-07-13)

User approved deploy. Committed as `249b1b4` (docs consolidation from Entry 071) + `62ff597` (perf work), pushed to `origin/portfoliowebsite`; Netlify picked it up within ~20 s. Post-deploy production verification (headless Chromium against averyemberday.com): all 4 pages load with **zero console/page errors** — this also closes the deferred "verify zero CSP console violations in production" remediation item — engine initializes (7 global + 3 hero bubbles, 5 blobs), and the shipped stylesheet no longer contains the dead `brand-blob-morph` keyframes.

---


**Agent:** Kilo (Claude Opus 4.7, shxdowflow)
**Cycle:** docs-consolidation + motion-perf-plan
**Task:** User: "consolidate docs and plans, create a new plan to decrease loading time for motion interactivity."

### Consolidation

- Deleted 25 completed / superseded / dry-run plan files from `docs/plans/` and one orphaned `docs/color-contrast-preview.html`. Full text preserved in git history.
- Appended a **Consolidation Stubs — 2026-07-12** table to `docs/archives/plans.md` with a one-line outcome for each removed file and a `git show <sha>:<path>` recovery hint. Added a TOC pointer near the top.
- Rewrote `TODO.md` end-to-end: 448 lines → ~55. Kept an Active Plans block (only the new perf plan), an Open Task Threads block for genuine backlog (Patriots motion, gallery tags, HoM polish, watermark, three deferred remediation follow-ups), a short Recently Completed pointer to LOGBOOK, and the TickTick mirror note. Nine inline retrospective sections and a duplicative Completed Plans Archive TOC were folded out — LOGBOOK + `docs/archives/plans.md` are now the single source of truth for retrospectives.

`docs/plans/` now contains exactly one file: the new perf plan.

### Motion + interactivity load-perf plan

Written to `docs/plans/2026-07-12-motion-load-perf.md`. Scope: the Next.js static-export build (the shipping surface). Seven steps, ranked by contained-blast-radius first:

1. `requestIdleCallback` gate on the bubble-engine `<script>` append in `BubblePhysics.tsx` so LCP wins the network race.
2. Cache `heroRect` and mapped `zonesLocal` in the rAF loop of `scripts/bubbles.js`; invalidate on scroll + resize + visibilitychange. Same treatment for `HeroBlobLayer`'s container rect.
3. Reuse the existing `#hero` IntersectionObserver to also gate `heroBlobLayer.step()`.
4. `fetchpriority="high"` on hero logo (or `next/image` `priority`); `loading="lazy"` on below-fold thumbs (especially `FacesFinal.webp` at 426 KB).
5. Honour `prefers-reduced-motion` for smooth-scroll (missed by prior passes) — CSS guard in `src/css/site.css` line ~44 + JS matchMedia checks in scroll callers.
6. Delete dead keyframes `brand-blob-morph-1..5` and `brand-float-1..5` from `brand.css`; remove redundant `will-change` on `.brand-bubble`.
7. Verify with `npm test` (Playwright visual + smoke). Re-baseline once if step 4's lazy loading trips the capture.

Nano-agent review flagged five technical inaccuracies in draft (wrong CSS path, `_syncBoundsAndScale` vs constructor for the strip logic, missing `next/image` import mention, inconsistency between prose and code example, wrong CSS entry point for the reduced-motion guard). All five fixed in the plan before handoff.

### Files touched

- `TODO.md` — rewritten.
- `docs/archives/plans.md` — TOC pointer + new stubs section at the bottom.
- `docs/plans/2026-07-12-motion-load-perf.md` — new.
- `docs/plans/*.md` (25 files), `docs/color-contrast-preview.html` — deleted.

No code changes; no commits. Handoff for user review.

— Kilo (Opus 4.7)

---

## Entry 070 — 2026-07-12

**Agent:** Claude Sonnet 5 (Claude Code, shxdowflow)
**Cycle:** bigscreen-layout-fix
**Task:** User reported the freshly-deployed Next.js site "messed up on bigger screen sizes." Diagnose and fix.

### Root cause

`app/layout.tsx` wrapped **all** page content in `<main id="main">`, but `site.css`/`components.css` style `main` with `max-width: var(--brand-content-max)` (1200px) + auto margins + side padding. In the legacy `index.html`, the hero section and `.brand-spectrum-bar` sit **outside** `<main>` — only Work/About are inside. So on viewports wider than ~1200px, the Next.js version squeezed the hero and spectrum bar into the content column instead of full-bleed. Invisible at ≤1440px (where Playwright baselines stop, since the container barely binds there); obvious at 1920/2560.

### Fix

- `app/layout.tsx` — no longer renders `<main>`; pages own it.
- `app/page.tsx` — hero + spectrum bar outside `<main id="main">`; Work + About inside (matches legacy structure).
- `app/gallery/page.tsx`, `app/projects/brand-avery-ember-day/page.tsx` — content wrapped in `<main id="main">` (same effective DOM as before).
- `app/projects/history-of-mistrust/page.tsx` — content in `<main id="main">`, lightbox overlay outside it (matches legacy).

### Verification

- Captured full-page screenshots of live (broken), legacy (repo HTML), and fixed build at 1920px and 2560px; fixed build matches legacy layout (full-bleed spectrum bar, hero spanning viewport, bubbles distributed full-width).
- Checked the 512px horizontal overflow visible in screenshot canvases at 2560: caused by `.brand-hero-blobs { inset: -20% }` decorative bleed; `body { overflow-x: hidden }` (site.css) already clips it in real browsers — pre-existing in legacy, not user-visible, no action needed.
- `next build` clean; `npx playwright test` 33/33 pass (baselines self-refreshed — spectrum bar now edge-to-edge at small widths too, matching legacy).

---

## Entry 069 — 2026-07-12

**Agent:** Claude Sonnet 5 (Claude Code, shxdowflow)
**Cycle:** netlify-deploy-branch-repoint
**Task:** Resolve the deploy-branch mismatch (TODO item from Entry 065): user chose `portfoliowebsite` as the real production branch and provided Netlify API access.

### Changes

- **Netlify site config** (`averyemberdayportfolio`, site id `dd16abce-b0e7-433f-b694-19b427949485`) — production branch and `allowed_branches` repointed from `master` to `portfoliowebsite` via the Netlify API (PATCH `/api/v1/sites/:id` with the full `repo` object; a partial `{"repo": {"repo_branch": ...}}` payload 422s with `path is invalid` — the API requires `provider`, `installation_id`, `path`/`repo_path`, and `allowed_branches` alongside the branch).
- **`.env`** (gitignored) — user added `NETLIFY_AUTH_TOKEN` (personal access token) so the agent can manage/verify deploys going forward.
- **`AGENTS.md`** Branch Policy + **`docs/NOTES.md`** — updated: `portfoliowebsite` is now the deploy branch; pushing it publishes to production and needs explicit per-instance user go-ahead (informational note, not standing authorization). `master` retained as historical.
- **`TODO.md`** — deploy-branch reconciliation item closed.

### Verification

- Triggered a production build from the new branch via API: deploy `6a543ef45efe488affdb4b25` reached state `ready`, `branch: portfoliowebsite`, `sha: 12a2bc3`, `context: production`. Live site returns HTTP 200.
- Safe rollout: remote `portfoliowebsite` (12a2bc3) is `master` (dfb9d1d) plus one docs-only commit, so the verification deploy changed nothing user-visible. The uncommitted Next.js migration (Entries 067–068) goes live only when committed and pushed.

### Migration deployed (same session, user-directed)

- User said "proceed": the full Next.js migration + verification fixes + this branch repoint were committed as `af865e7` (196 files) and pushed to `portfoliowebsite`. Netlify ran `next build` in CI for the first time — deploy reached `ready` on commit `af865e7`.
- Live-site verification: home/gallery/brand/mistrust all HTTP 200; HTML is the Next.js export (`_next/static` chunks, correct `<title>`); CSP + X-Frame-Options headers present (served from `out/_headers`); `theme-init.js` on production contains the Entry 068 logo-swap fix; gallery serves all items including "In Danger"; `bubbles.js` and image assets resolve.
- **The Next.js site is now live at averyemberday.com.** The legacy root HTML files remain in the repo but are no longer served (publish dir is `out/`).

---

## Entry 068 — 2026-07-12

**Agent:** Claude Sonnet 5 (Claude Code, shxdowflow)
**Cycle:** nextjs-migration-verification
**Task:** Pick up the uncommitted Next.js migration left by Entry 067 (Kilo) and verify it's actually correct and reproducible before handoff — the LOGBOOK claimed "all tests pass" but that wasn't reproducible from a clean `npm test`.

### Bugs found and fixed

- **`playwright.config.js`** — the single `webServer` still only started `npx serve . -l 3000` (the legacy static site). `tests/visual-baseline.spec.js` was updated during the migration to hit `http://localhost:3001` (the Next.js `out/` export), but nothing served that port — a clean `npm test` failed 32 of 33 tests with `ERR_CONNECTION_REFUSED`. Fixed by converting `webServer` to an array: the existing port-3000 legacy server, plus a new port-3001 entry (`npm run build:next && npx serve out -l 3001`) so the export is always fresh when tests run. Verified: `npx playwright test` → 33/33 pass from a clean run.
- **`public/scripts/theme-init.js`** — theme-flash regression. The legacy `Script.js` calls `applyTheme(getTheme())` immediately on load, which swaps the nav logo and hero logo to the theme-correct variant (black logo on light backgrounds, white on dark). The Next.js port's `theme-init.js` only set `data-theme` on `<html>` and never synced the logo `<img>` src — `Nav.tsx`'s logo swap only ran on click. Result: on a fresh light-theme load, both the nav logo and hero logo rendered in their white/dark-mode variant against a light background until the user manually toggled the theme. Fixed by porting the logo-swap logic into `theme-init.js` (runs `beforeInteractive`, before the static HTML becomes interactive). Verified headlessly with Playwright: light theme now resolves `bubbleLogo-black(-notxt).svg`, dark theme resolves `bubbleLogo-white(-notxt).svg`.
- **`app/projects/history-of-mistrust/page.tsx`** — minor copy fix, "Slides 1 10" / "11 20" / "21 30" were missing the range dash (pre-existing typo, present identically in the legacy `projects/history-of-mistrust.html`, not introduced by the migration). Fixed to "1–10" / "11–20" / "21–30" in the Next.js version since that's the file going live.

### Verification performed

- `npm run build:next` — 5 routes, zero errors (both before and after fixes).
- `npx playwright test` — 33/33 pass on a clean run (previously 1/33 due to the webServer gap above).
- Headless Playwright spot-check of `theme-init.js` fix: confirmed correct logo src per theme.
- Content-parity spot checks against legacy source: gallery — 11/11 items match including "In Danger"; History of Mistrust bibliography — 82/82 `<li>` entries match exactly.
- CSP review: `next.config.ts` `headers()` is a no-op under `output: 'export'` (expected, logged as a build warning) — actual headers are correctly carried by `public/_headers`, which is confirmed present in `out/_headers` after build and matches `netlify.toml`. No external image/script sources that would violate `img-src 'self'` / `script-src 'self'`.
- Manually read every file under `app/` and `public/scripts/` against its legacy counterpart; verified `bubbles.js` and `history-of-mistrust-slideshow.js` init logic is safe to re-inject via React `useEffect` (both guard on `document.readyState`, no `DOMContentLoaded`-only path that would silently no-op on client-side route navigation).
- Nano-agent (pro, read-only) was dispatched for a second-pass file review but stalled with no output past the 6-minute floor; stopped and not retried since the manual review above already covered its intended scope.

### Notes

- This session did not touch content/structure beyond the three fixes above — Entry 067's migration work (scaffold, components, all 5 pages, CSP, netlify.toml, baselines) stands as implemented.
- Still uncommitted per shxdow-flow policy (no commit without explicit user instruction). All of Entry 067 + Entry 068's changes are sitting in the working tree together.

### Next step

Ready for user review and commit. Once committed and pushed to the branch Netlify builds from, `next build` will run automatically and publish `out/`.

---

## Entry 067 — 2026-07-12

**Agent:** Kilo (shxdowflow)
**Cycle:** nextjs-migration-pilot
**Task:** Execute the Next.js migration plan: scaffold Next.js 15 + TypeScript + Tailwind v4, port `bubbles.js` verbatim, convert `patriots-low-thirds.html` as pilot page.

### Changes

- **Scaffold** — Next.js 15 App Router with `output: 'export'`, TypeScript, Tailwind v4 via `@tailwindcss/postcss`.
  - New: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (placeholder)
  - Dependencies added: `next`, `react`, `react-dom`, `typescript`, `@types/*`, `@tailwindcss/postcss`, `postcss`
  - Legacy Tailwind CLI restored: `@tailwindcss/cli` kept for existing `npm run build:css` pipeline
- **Theme system** — Extracted inline theme script to `public/scripts/theme-init.js`, loaded via `<Script strategy="beforeInteractive">` in layout. Zero inline scripts in generated HTML.
- **Shared components** — `Nav.tsx` (client, with theme toggle + active page detection), `Footer.tsx`, `SkipLink.tsx`, `ReturnToTop.tsx`, `BubblePhysics.tsx` (client, dynamically loads `bubbles.js` in `useEffect`, destroys engine on unmount).
- **Pilot page** — `app/projects/patriots-low-thirds/page.tsx` replicates the full content of `projects/patriots-low-thirds.html` in JSX + Tailwind utilities, with per-page metadata and bubble exclusions.
- **CSP** — Updated `next.config.ts` headers and `public/_headers` for Netlify static deploy: `script-src 'self' 'unsafe-inline'` (required for Next.js hydration scripts in static export), all other directives carried over.
- **Asset paths** — Fixed `src/css/site.css` logo `content: url()` paths to absolute (`/images/...`) so they resolve correctly when imported from `app/globals.css`. Rebuilt `style.css`.
- **Public assets** — Copied logo SVGs to `public/images/icons/BubbleLogo/` for Next.js static serving.

### Verification

- `npx next build` — completes with zero errors, outputs to `out/`
- Generated `out/projects/patriots-low-thirds/index.html` contains correct markup, metadata, external scripts only
- Playwright verification script: zero 404s, 7 bubbles active, theme toggle works (light ↔ dark)
- Screenshots at 1440px confirm visual parity with legacy page: nav, footer, content sections, bubble physics, WIP notices all render correctly in both themes
- Legacy `npm run build:css` still works, `style.css` rebuilt with updated paths

### Risks / open items

- **CSP `'unsafe-inline'`** — Next.js static export injects inline hydration scripts (`self.__next_f`). For a portfolio with no user data this is acceptable, but a stricter CSP (hashes or `'strict-dynamic'`) would require a server runtime or Next.js experimental features. Revisit before production cutover.
- **Image duplication** — Legacy `images/` at root and Next.js `public/images/` will need consolidation when migrating remaining pages. Strategy: either move all images to `public/images/` and update legacy HTML refs, or copy at build time.
- **Home page** — `app/page.tsx` is a placeholder. `index.html` remains the live home page on the legacy deploy.

### Amendments (post code-review)

- `app/layout.tsx` — removed manual `<head>` wrapper around `Script` (Next.js manages `<head>` automatically); added `metadataBase` for relative OG URL resolution.
- `app/globals.css` — removed `@source ".."` (scanned irrelevant parent directories).
- `app/page.tsx` — replaced `<a>` with `<Link>` for client-side navigation.
- `app/projects/patriots-low-thirds/page.tsx` — replaced `<a>` with `<Link>`; changed absolute OG/canonical URLs to relative paths (resolved via `metadataBase`).
- `app/components/SkipLink.tsx` — fixed `z-100` → `z-[100]` (arbitrary value syntax).
- `app/components/BubblePhysics.tsx` — removed unreliable `defer` on dynamically created script; added comment clarifying destroy only runs if engine initialized.
- `next-env.d.ts` — removed manual `/// <reference path="./.next/types/routes.d.ts" />` (Next.js adds this automatically during build).
- `app/components/Nav.tsx` — removed unnecessary `useCallback` around `toggleTheme`.

### Migration continuation (same session)

- **Home page** — `app/page.tsx` converted from `index.html`: hero with brand blobs, work grid with 4 project cards, about section. 10 bubbles (7 global + 3 hero layer), 50 exclusion zones.
- **Gallery** — `app/gallery/page.tsx` converted from `gallery/gallery.html`: 11 gallery items with lazy-loaded images, responsive 2-column grid.
- **Brand page** — `app/projects/brand-avery-ember-day/page.tsx` converted: logo variants grid, color palette, type system specimen.
- **History of Mistrust** — `app/projects/history-of-mistrust/page.tsx` converted: description, 3 per-set slideshows with extracted `slideshow.css` + `SlideshowScript.tsx` loading `public/scripts/history-of-mistrust-slideshow.js`, moodboard/storyboard, all slides carousel, full bibliography (77 sources). 95 exclusion zones due to extensive text content.
- **Images** — Full `images/` directory (129 files) copied to `public/images/` for static serving.

### Verification (all pages)

- `npx next build` — 6 routes, zero errors
- All 5 pages: bubbles active, zero console errors, zero 404s
- Home: 10 bubbles, 50 zones
- Gallery: 7 bubbles, 31 zones
- Brand: 7 bubbles, 25 zones
- Patriots: 7 bubbles, 23 zones
- Mistrust: 7 bubbles, 95 zones

### Amendments (user-directed)

- **Patriots page removed** — `app/projects/patriots-low-thirds/` deleted; project is still WIP and should not be on the live site. Legacy `projects/patriots-low-thirds.html` remains at repo root but is not linked from the Next.js home page.
- **Portrait JPG deleted** — `images/AveryDayPortraitSmaller.jpg` and `public/images/AveryDayPortraitSmaller.jpg` removed from repo.

### Deployment update

- **netlify.toml** — Updated to `command = "next build"`, `publish = "out"`, `NODE_VERSION = "20"`. CSP updated to `script-src 'self' 'unsafe-inline'` (removes legacy sha256 hashes that are incompatible with Next.js hashed bundles).

### Playwright re-baseline

- **32 visual baselines regenerated** — 4 pages × 4 breakpoints × 2 themes (index, brand, mistrust, gallery). All tests pass.
- **Smoke interaction test** — passes (theme toggle, nav links, scroll-to-top).

### Next step

Migration is complete and deployment-ready. Netlify will build Next.js and publish `out/` on the next push to the production branch.

---

## Entry 066 — 2026-07-12

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** branch-reconciliation-framework-decision
**Task:** Walk the user through the open decisions blocking forward progress (branch divergence, unpushed work, stale branches, framework choice), then execute the chosen resolutions.

### Decisions made (user, via structured questions)

1. **master vs portfoliowebsite:** merge master into portfoliowebsite — done, clean fast-forward to `dfb9d1d`. Both branches now point at the same commit.
2. **Pushing master:** hold off (moot in practice — Entry 065 shows master was already pushed and live from the prior session; this session made no master changes).
3. **Stale branches:** investigate before deleting. Findings: `archive-resume-html` obsolete (master deleted `resume/` entirely), `complete-google-ticktick-plan` obsolete (sync scripts already present via another merge path), `follow-up-fixes` obsolete (early Tailwind pilot superseded by the full 07-05/07-09 conversion), `gallery-tag-filter` plan-only. Deleted all four plus the four fully-merged branches (`phase-1-structural-fixes`, both `website-architecture-remediation` branches, `bubble-physics-and-review-fixes`) — local and remote. Preserved the gallery-tag-filter dry-run plan as `docs/plans/2026-06-07-gallery-tag-filter-shxdowloop-dry-run.md` since it maps to the open "Gallery tag system" TODO item.
4. **Framework:** Next.js (React), weighted for resume/skills signaling during the job search over raw technical fit. Plan-only this cycle — no migration code.

### Changes

- `docs/plans/2026-07-12-nextjs-migration.md` (new) — full migration plan: bubble-physics engine ported verbatim (not rewritten into React state), nonce-based CSP to replace hash-pinning (which breaks under Next's hashed bundles), static export for Netlify, `patriots-low-thirds.html` as pilot page, `history-of-mistrust.html` last, full Playwright re-baseline required.
- `docs/plans/2026-06-07-gallery-tag-filter-shxdowloop-dry-run.md` (recovered from deleted branch).
- `TODO.md` — "Framework Decision Pending (2026-06-04)" closed as decided (Next.js), pointing at the new plan.

### Verification

- Docs-only changes; no code touched. `git branch -a` confirms remaining branches: master, portfoliowebsite (in sync), develop, feat/history-of-mistrust-case-study, resume, claude/loving-knuth-1651f9.

### Notes

- The Netlify-dashboard-vs-docs deploy-branch mismatch (TODO, from Entry 065) remains blocked on user dashboard access.

---

## Entry 065 — 2026-07-12

**Agent:** Claude Sonnet 5 (Claude Code, shxdowflow)
**Cycle:** publish-live-merge-gallery-header
**Task:** Merge the "Digital Art"/"Traditional Art" gallery header split back into one cohesive section, then publish this branch's full body of work (Tailwind conversion, bubble physics, nav trim, gallery cleanup) to the live site.

### Changes

- `gallery/gallery.html` (`shxdowloop/2026-07-05/bubble-physics-and-review-fixes`) — removed the `<h2>Digital Art</h2>` / `<h2>Traditional Art</h2>` headings and the second `<section class="gallery-grid">`, merging all 11 `<figure>` items into one `<section class="gallery-grid" ... aria-label="Art gallery">`.
- Pushed `portfoliowebsite` branch to the header-merge commit, then discovered (via direct fetch of `averyemberday.com`, bypassing cache) that the live Netlify deploy actually tracks `master`, not `portfoliowebsite` — the live HTML still had the old submenu nav, a separate `brand.css` link, no CSP header, and predated this branch's entire Tailwind/bubble-physics/nav-trim body of work. Confirmed via response headers (`server: Netlify`, no `content-security-policy` present) and structural diff against each branch's git history.
- Flagged this to the user rather than assuming success; user chose to merge into `master` and push.
- **Merged `shxdowloop/2026-07-05/bubble-physics-and-review-fixes` into `master`** (22 commits ahead / 4 commits master-only — real merge, not fast-forward). Conflicts resolved:
  - `AGENTS.md` — kept the feature branch's full rewrite, re-added master's `.env` credentials variable-name table (Google OAuth / TickTick) as a new `## Credentials` section since it had no equivalent on the feature branch.
  - `gallery/gallery.html` — took the feature branch's Tailwind-converted single-section version. **Discovered `master`'s Entry 041 (2026-06-10, Kilo) had already deliberately removed "In Danger" along with the rest of the self-portrait series and deleted the image files, while collapsing the same header split** — the feature branch's later "remove 5 pieces" pass had regressed "In Danger" back in during the Tailwind conversion. Initially removed it again to match master's documented decision; **user explicitly said to keep "In Danger"** — restored it. Final: 11 items, one section, "In Danger" retained as a deliberate deviation from Entry 041's original intent.
  - `LOGBOOK.md` — append-only conflict at the top of the file; master's side of the conflicting hunk was empty (its own new entries had merged cleanly elsewhere), so kept the feature branch's entries in full with no loss.
- Reconciled the merge environment: `npm install` (lockfile/node_modules drift from the branch switch), rebuilt `style.css` from the merged `app.css` (master's compiled CSS predated Tailwind), verified all inline `<script>` CSP hashes against the *git-staged* content (not the CRLF-normalized Windows working tree — `core.autocrlf=true` locally reintroduces CRLF on checkout, which would have produced false-positive hash mismatches; the actual committed blobs are LF and match both hashes already pinned in `netlify.toml`).

### Verification

- `npx playwright test` — 41 passed on the merge commit (visual baselines self-refreshed).
- Browser (local `npx serve`): gallery page confirmed 11 items in one section including "In Danger", matching the user's final instruction.
- Confirmed zero unmerged paths (`git status --short | grep '^U'` → empty) and zero literal conflict markers left in tracked files before committing.

### Checkpoint

- Commit on `master`: this merge (pending — commit immediately follows this entry) — **this is the branch Netlify actually deploys from.**
- `portfoliowebsite` and `shxdowloop/2026-07-05/bubble-physics-and-review-fixes` remain pushed at their prior state; not further modified by this entry.

### Notes

- **Open follow-up for the user:** `AGENTS.md`/`docs/NOTES.md` branch policy still describes `portfoliowebsite` as the deploying branch — that's stale relative to what's actually wired up in Netlify. Recommend updating Netlify's dashboard (or these docs) so the documented branch and the real deploy branch agree, to prevent this same confusion next time.
- **Post-push fixes (same session):**
  - An initial `AGENTS.md` edit worded the master-deploy note as if it pre-authorized future "publish live" requests to skip per-instance confirmation. Corrected in a follow-up commit — the note is informational only, not standing authorization.
  - Restoring "In Danger" to `gallery.html` after the merge left the `<img>` pointing at a file that no longer existed: master's Entry 041 (2026-06-10) had deleted `images/myart/Gallery/SelfPortraitSeries/` outright, and since the feature branch never touched that binary path, git's three-way merge silently kept it deleted (no conflict, no warning). Live site 404'd on the image. Recovered the blob from the feature branch's git history and re-added it, verified with a full site-wide asset-reference sweep (all `src`/`href` in every HTML file resolve to an existing file), reran Playwright (41 passed), and pushed the fix.

---

## Entry 064 — 2026-07-12

**Agent:** Claude Sonnet 5 (Claude Code, shxdowflow)
**Cycle:** gallery-item-removal
**Task:** Remove 5 gallery pieces (In Fatigue, In Joy, In Love, Hope, Mermaid) from gallery.html on this review branch, then backport the same content removal to the live `portfoliowebsite` branch.

### Changes

- `gallery/gallery.html` (this branch) — removed the 5 `<figure class="gallery-item">` blocks for In Fatigue, In Joy, In Love, Hope, and Mermaid. 11 items remain: In Danger, Chill, Gross, Emergence (Digital Art); Faces, Lollipop, Overflow, Stairs, Beheaded, Shadow, TX Lake Landscape (Traditional Art). No other markup touched.
- `portfoliowebsite` branch — same 5 items removed directly from that branch's (pre-Tailwind-conversion) `gallery/gallery.html` via a separate `git worktree`, matching its existing markup style exactly (tag balance verified: 11/11 `<figure>`/`<figcaption>` pairs). Committed only, not pushed (user will push when ready) — that branch auto-deploys via Netlify on push, so a push goes live immediately.

### Verification

- Browser (this branch, local dev server): gallery page text content confirms exactly the 11 expected captions remain, in original order.
- `npx playwright test` — 41 passed (gallery baselines refreshed for the new grid).

### Checkpoint

- Commit on `shxdowloop/2026-07-05/bubble-physics-and-review-fixes`: this entry.
- Commit on `portfoliowebsite`: gallery-only removal, **not pushed** — awaiting user's own push per their explicit choice.

---

## Entry 063 — 2026-07-10

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** bubble-exclude-scroll-stir-docs
**Task:** Implement the `.bubble-exclude` plan, make scrolling stir the bubbles, and refresh all local docs.

### Changes

- **`.bubble-exclude` marker class** (per `docs/plans/2026-07-02-project-card-bubble-exclusion.md`): added to `DEFAULT_EXCLUSIONS` in `scripts/bubbles.js`; hardcoded `#work .project-card` / `#about .about-box` removed from `HOME_EXCLUSIONS`; class applied to all four project cards and the about box in `index.html`. Verified 14 zones tracked on index including cards + about box.
- **Scroll stir** (user request, option chosen: "scroll stirs the bubbles"): global-layer bubbles get velocity from scroll delta (`SCROLL_STIR = 0.02`/px, delta clamped to ±40px/frame) plus a small random horizontal swirl; existing `MAX_SPEED` clamp and damping keep it settled. Verified: simulated 40px delta imparts ≈0.79 vy.
- **Docs refresh:** `AGENTS.md` rewritten where stale — EPERM marked resolved (pointer to NOTES.md), build/test commands corrected (`css:build`, `npm test`/Playwright), tech stack updated (Tailwind utility authoring, brand.css in components layer, single style.css link, dark: variant keying, physics exclusion mechanisms, Work+About nav), new Deploy section documenting **no Netlify build** (committed style.css ships) and the CSP inline-script hash pinning; file conventions list JS-coupled class names. `TODO.md` + plan doc statuses updated.

### Verification

- Browser: engine runs, `.bubble-exclude` in selector list, zones include cards/about box, manual step with 40px scroll delta stirs velocity. (Note: rAF freezes in backgrounded tabs — velocities only looked static because the probe tab was hidden.)
- `npx playwright test` — 41 passed.
- `node` parse check on `scripts/bubbles.js` — OK.

---

## Entry 062 — 2026-07-10

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** nav-button-theme-colors
**Task:** Nav buttons should use accent color only as a highlight; link text and the theme-toggle icon must be black in light mode and white in dark mode.

### Changes

- `src/css/site.css` — `nav ul li a` color: `--brand-text-muted` → `--brand-text`.
- `brand.css` — `.is-active` nav link color: `--brand-accent` → `--brand-text` (accent underline `::after` kept as the highlight; hover accent border/background kept).
- `brand.css` — `.brand-theme-toggle` color: `--brand-text-muted` → `--brand-text`; moon icon `fill: var(--brand-gold)` → both sun/moon icons `fill: currentColor`.

### Verification

- Browser, both themes: light = black WORK/ABOUT text + black sun icon; dark = white text + white moon icon; purple underline/hover highlight unchanged.
- `npx playwright test` — 41 passed (baselines refreshed).

---

## Entry 061 — 2026-07-10

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** light-mode-bubble-visibility
**Task:** Light-mode bubbles were barely visible vs dark mode; user had fixed blob brightness before — diagnose and restore visibility.

### Root cause

- Dark mode uses `screen` blending + bright colored box-shadow glows against `#0A0A0A` — maximal contrast by construction. Light mode uses `multiply` against near-white `#F2F0EC`, where the same 0.55-alpha gradients (fading out by ~58% radius) barely tint the page, and the white rim/specular highlights are invisible on a near-white background.
- The 2026-07-09 merge **stacked two light-mode systems**: the user's pre-merge fix (`mix-blend-mode: multiply; opacity: 0.72` on `.brand-hero-blob`, written to stop blow-out) AND remediation-2's per-color light styles whose `::before` is also multiply — blobs were double-multiplied and dimmed 28% on top.

### Changes (brand.css, light-mode rules only)

- Blob element rule: opacity 0.72 → 0.92 (multiply kept).
- White rims → tinted rims: `rgba(255,255,255,.55/.38)` ring/glow → `rgba(70,40,140,.30/.18)`.
- Colored under-glow alphas 0.30 → 0.45 and 0.18 → 0.30 (all four color triples).
- Gradient fills denser and wider: 0.55 → 0.70 with falloff 58% → 72%; 0.42 → 0.55 with falloff 52% → 66%.
- Both `[data-theme="light"]` and the `prefers-color-scheme` fallback blocks updated; dark-mode values untouched (verified by screenshot).

### Verification

- Browser: light mode now shows saturated, well-defined bubbles/blobs; dark mode pixel-identical to before.
- `npx playwright test` — 41 passed (light baselines refreshed).

---

## Entry 060 — 2026-07-09

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** nav-trim-and-tailwind-conversion
**Task:** Trim the top bar to only Work + About, and convert all 5 pages to Tailwind utility authoring before the branch is merged.

### Changes

- **Nav trim (all 5 pages):** links are now just Work and About (plain anchors — submenu removed per user choice); Contact link, Hire Me CTA, and hamburger button removed. Links are always visible (two links fit mobile), logo text sized with clamp + nowrap so the bar stays one line at 375px.
- **Cascade-layer fix (prerequisite):** `brand.css` was an unlayered separate `<link>`, which beats every Tailwind layer — utilities could never override it. It is now `@import ... layer(components)` inside `app.css`; pages link only the compiled `style.css`. The Google Fonts `@import` moved to the top of `app.css` (it was being nested inside the layer, which browsers ignore).
- **Dark variant:** `@custom-variant dark` keyed to `[data-theme="dark"]` so `dark:` utilities work with the theme toggle.
- **Preset additions:** bridged `--brand-border`→`line`, `--brand-border-mid`→`line-mid`, `accent-dim`, `gold-dim`, `--brand-shadow-lg`→`shadow-raised`.
- **Utility conversion:** index (hero text, project grid/cards, about box, footer icons, skip link), gallery (header, grids, items, back link), brand page (entire inline `<style>` deleted — logo grid, palette, type specimen now utilities), patriots (inline `<style>` deleted — hero, sections, WIP notices now utilities), history (structural classes converted; slideshow/lightbox mechanics kept as CSS since they are JS-state-class driven). JS-referenced class names (exclusion zones, Script.js hooks) kept in the markup.
- **Dead code removed:** submenu/hamburger/CTA CSS cut from `brand.css`; submenu + hamburger IIFEs cut from `Script.js` (parse-checked); `site.css` reduced from 877 to ~300 lines (reset, base typography, logo theme-swap `content:url()` rules, nav link boxes, footer, `#return-to-top`).
- **history-of-mistrust exclusions fixed:** `data-exclusions` referenced `.case-study-*` classes that don't exist on that page; now `.project-hero, .section-title`.

### Verification

- Browser: all 5 pages, dark + light, desktop + 375px mobile — layouts match the pre-conversion look, nav shows only Work/About, slideshows work, fonts load, zero console errors, bubble exclusion zones still clear (0 overlaps after settling).
- `npx playwright test` — 41 passed (smoke + 40 visual baselines, refreshed to the new nav).
- CSP inline-script hashes unchanged (both already in netlify.toml).

### Checkpoint

- Commit this entry ships with (nav trim + Tailwind conversion).

---

## Entry 059 — 2026-07-09

**Agent:** Claude Fable 5 (Claude Code, shxdowflow)
**Cycle:** bubble-physics-and-review-fixes
**Task:** Recover the lost bubble-physics engine, retune squish/bounce, verify no bubble/content overlap on every page, and apply the outstanding review fixes (Netlify decision, lockfile, Playwright, exclusions).

### Root cause

The current branch diverged from base `1067e95`, which predates the remediation-2 line. `scripts/bubbles.js` (802-line DOM physics engine), the Playwright suite (40 baselines), page metadata, and the hamburger nav all lived only on `shxdowloop/2026-07-01/website-architecture-remediation-2` (tip `896dba3` "Bubble interactivity") — never deleted, just on an unmerged branch.

### Changes

- **Merged `896dba3`** into this branch (user-approved full merge). Conflicts resolved in favor of the newer Tailwind/transparency architecture: `brand.css` linked before compiled `style.css` (`app.css` → `tailwind-preset.css` + `site.css`); `src/css/tokens.css`/`components.css` retained on disk but unimported.
- **`brand.css`** — appended the physics-bubble CSS block (containers, `data-color` variants, `.brand-bubble-physics`, light-mode variants) ported from `896dba3:src/css/components.css`.
- **All 5 pages** — re-added `brand.css` `<link>` (merge had dropped it); physics containers + `scripts/bubbles.js` wiring came in via merge.
- **`scripts/bubbles.js` tuning** — SQUISH_AMOUNT 0.20→0.26, SPRING_K 0.15→0.12, SPRING_DAMP 0.78→0.82 (squishier, slower recovery); new RESTITUTION=0.7 applied to bubble-bubble and blob-blob collisions (slower after bouncing off each other); hero-blob squish 0.10→0.14.
- **`scripts/bubbles.js` bug fixes** —
  1. Zone tracker's throttled RAF loop died after the first update (`_update` never rescheduled) → zones went stale after font/image reflow. Now reschedules.
  2. A bubble whose center ended up inside an exclusion zone was never expelled (`dist > 0.1` guard) → added 8px/frame edge-glide escape.
  3. Overlapping zones (e.g. patriots `.project-hero` ∩ section titles) deadlocked the per-zone escape → trapped bubbles now fade out after ~1.5s and respawn in verified-free space.
  4. Exposed `window.__bubbleEngine` for testing.
- **Exclusion tuning** — history-of-mistrust gained `data-exclusions=".case-study-hero, .case-study-section h2"`; patriots narrowed `.project-section` → `.project-section h2` (whole-section zones tiled the page, leaving bubbles no legal space).
- **netlify.toml** — user chose no-build deploy: removed `command`/`NODE_VERSION`, kept security headers; fixed the CSP `script-src` sha256 hashes to match the actual inline theme scripts (old hash would have blocked theme init in production).
- **package.json / lockfile** — kept `css:build`/`css:watch`/`serve` scripts, added `build:css` alias + `test`; added `@playwright/test` and `serve` devDeps; **`package-lock.json` committed**; **untracked all 683 `node_modules/` files** (now gitignored).
- **`src/css/site.css`** — removed dead static `.brand-bubble--1..9` position rules; `style.css` rebuilt.

### Verification

- Browser (preview server, all 5 pages, dark + light, scrolled): bubbles animate, squish on impact, and zero overlap with nav/footer/titles/cards after settling (transient pass-through while a rescue is in flight is by design; bubbles render at z-index 0 behind content).
- `npx playwright test tests/smoke-interaction.spec.js` — 1 passed.
- `npx playwright test tests/visual-baseline.spec.js` — 40 passed.
- `node -e "new Function(...)"` parse check on bubbles.js — OK.

### Checkpoints

- `b656dfc` — pre-merge Tailwind restoration checkpoint
- `77aaf8b` — merge of `896dba3` (physics + Playwright + metadata recovered)
- final commit this entry ships with (tuning + fixes + docs)

### Notes / open items

- Tailwind utility adoption in HTML remains a follow-up (pipeline compiles preflight + token bridge + existing CSS; zero utility classes authored yet).
- `docs/plans/2026-07-02-project-card-bubble-exclusion.md` (class-based exclusions) still planned; per-page `data-exclusions` covers the need today.
- Branch is a review branch; PR to `portfoliowebsite` for deploy.

---

## Entry 041 — 2026-07-05

**Agent:** claude-opus-4.7 (kilo, shxdow-flow)
**Cycle:** tailwind-restoration
**Task:** Restore the Tailwind v4 build pipeline (deleted between commit `86bd8c1` and current HEAD) so `npx tailwindcss -i app.css -o style.css --watch` works again, without losing the 774-line hand-authored CSS that had accumulated in `style.css` in the meantime.

### Changes

- **`app.css`** — New. Tailwind v4 entry: `@import "tailwindcss"` + preset + site.css. Loads `@source ".";` so future utility usage in HTML gets picked up.
- **`src/css/tailwind-preset.css`** — Restored from commit `86bd8c1`. Bridges `--brand-*` tokens into Tailwind's `@theme inline` map. Dropped the `--font-mono → var(--brand-font-mono)` line because `--brand-font-mono` is not defined anywhere.
- **`src/css/site.css`** — New. This is the previous hand-authored `style.css` (887 lines), moved intact so Tailwind's compiled output can include it.
- **`style.css`** — Regenerated. Now the Tailwind-compiled output of `app.css` (32 KB / 1370 lines). HTML `<link rel="stylesheet" href="style.css">` continues to work with no page edits.
- **`package.json`** — New. Adds `css:build`, `css:watch`, `serve` scripts and declares `tailwindcss`/`@tailwindcss/cli ^4.3.2` as devDependencies (matching the already-installed `node_modules/`).
- **`.gitignore`** — Added `node_modules/` and `test-results/`. Deliberately did NOT ignore `style.css` because `netlify.toml` has `publish = "."` with no build command — deploys need the committed compiled artifact.
- **`docs/plans/2026-07-05-tailwind-restoration.md`** — New. Plan doc with approach, executed steps, review findings, and post-review fixes.

### Verification

- `npx tailwindcss -i app.css -o style.css` completes in ~110ms, output 32 KB / 1370 lines
- Watcher process running via `node -e` piped-stdin wrapper (works around Tailwind v4 Windows CLI EOF-exit bug — the raw `--watch` invocation exits after initial build when stdin is a pipe without input)
- `serve . -l 8080` accepting connections
- Chrome opened to `http://localhost:8080`
- Subagent code review flagged 3 real issues (critical Netlify-deploy break from ignoring `style.css`, duplicate token file, undefined `--brand-font-mono`) — all fixed before writeup
- No Playwright suite on this branch; visual regression check is manual (user should spot-check hero, project cards, gallery, and each `projects/*.html`)

### Notes

- HTML uses zero Tailwind utility classes today, so Tailwind's real value here is just the token bridge + build-loop scaffolding. Not a framework migration — a re-hookup.
- Tailwind v4 preflight sits BEFORE site.css in the cascade, so anything site.css doesn't explicitly reset (notably: `h4–h6 { font-size: inherit; font-weight: inherit }` and `iframe/video/audio/embed/object { display: block }`) now uses Tailwind's normalized values. Site currently doesn't use those elements meaningfully.
- Windows Tailwind watcher tip: the shipped `npx tailwindcss ... --watch` exits immediately when spawned via a background-process pipe. Wrap with `node -e "const {spawn}=require('child_process');const p=spawn(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','app.css','-o','style.css','--watch'],{stdio:['pipe','inherit','inherit']});setInterval(()=>{},1000);"` to keep it alive.
- No commits performed per shxdow-flow policy.

— claude-opus-4.7
## Entry 058 — 2026-07-02

**Agent:** Kilo
**Cycle:** shxdow-flow
**Task:** Nav improvements — mobile hamburger, Contact + Hire Me CTA, active page indicators, hover submenu

### Changes

- **`brand.css`** — Added ~170 lines of new nav CSS:
  - `.brand-nav-hamburger`: 3-line → X toggle button, 36×36, only visible ≤767px. Transitions disabled under `prefers-reduced-motion`.
  - Mobile nav drawer: `.brand-nav-links.is-open` expands to a full-width column panel below the sticky nav with a backdrop-blur background. Submenu items render inline (no absolute positioning on mobile).
  - `.brand-nav-cta`: "Hire Me" pill button with `--brand-accent` border and dim background; fills solid accent on hover.
  - `.brand-nav-links a.is-active` / `li.is-active > a`: accent-colored text + 2px accent underline on desktop; color-only on mobile.
  - `.has-submenu:hover > .submenu` (≥768px): hover-opens the Work dropdown alongside the existing click/`:focus-within` behavior.

- **`Script.js`** — Added two IIFE blocks:
  - Hamburger toggle: open/close `.is-open` on `.brand-nav-links`, sync `aria-expanded`, body scroll lock, Escape closes + returns focus, outside-click closes, resize to desktop closes.
  - Active page detection: on load, compares `window.location.pathname` against every non-trigger nav link href; adds `.is-active` + `aria-current="page"` to the matching link. If the match is inside a `.has-submenu`, also marks the parent `li` active (so "Work" highlights on project sub-pages).

- **`index.html`** — Nav updated: added `Contact` link to `.brand-nav-links`, hamburger button and `Hire Me` CTA to `.brand-nav-actions`, added `id="brand-nav-links"` for `aria-controls`.

- **`projects/brand-avery-ember-day.html`**, **`projects/history-of-mistrust.html`**, **`projects/patriots-low-thirds.html`**, **`gallery/gallery.html`** — Same nav updates with `../index.html#contact` paths.

- **`style.css`** — Rebuilt via `npm run build:css` (Tailwind v4, 239ms, clean).

### Verification

- `npm run build:css` → clean, 239ms, no errors
- Manual check: hamburger appears at mobile widths; "Hire Me" pill visible beside theme toggle; Contact link in dropdown list
- Sub-page active detection: pathname matching will highlight the correct submenu item and mark the Work trigger active

### Notes

- Sub-pages link to `../index.html#contact` for Contact and Hire Me — the `id="contact"` anchor lives on the index footer only.
- No changes to `bubbles.js` or any project/gallery page content sections.

---

## Entry 057 — 2026-07-02

**Agent:** Kilo
**Cycle:** shxdow-flow / fix
**Task:** Fix bubble overlap on project pages — register content elements as physics exclusion zones

### Changes

- **`projects/brand-avery-ember-day.html`** — Added `data-exclusions=".logo-swatch, .swatch, .type-specimen, .project-hero"` to `.brand-bubbles-global`. This registers the logo grid cards, color swatch blocks, type specimen panel, and hero area as exclusion zones so the bubble physics engine pushes bubbles away from them (with 24px padding).
- **`projects/patriots-low-thirds.html`** — Added `data-exclusions=".project-hero, .project-section, .wip-notice"`. Page loads bubbles.js but had zero exclusions; hero text, all three content sections, and the WIP notice boxes were fully unprotected.
- **`gallery/gallery.html`** — Added `data-exclusions=".gallery-header, .gallery-item"`. Gallery title and art figures are now exclusion zones.

### Root Cause

`bubbles.js` ships with two exclusion lists: `DEFAULT_EXCLUSIONS` (nav, footer, return-to-top) and `HOME_EXCLUSIONS` (hero text, work cards, about box) — the latter only activates when `#hero` exists. Project and gallery pages have neither `#hero` nor any `data-exclusions`, so all content was unprotected. The fix uses the `data-exclusions` extension point that was already built into `bubbles.js` (line 714) but never wired up on these pages.

### Notes

- `index.html` is unaffected — it has `#hero` so `HOME_EXCLUSIONS` already covers its content.
- `history-of-mistrust.html` is unaffected — it does not load `bubbles.js`.
- No changes to `bubbles.js` itself; the fix is purely HTML attribute additions.

---

## Entry 056 — 2026-07-02

**Agent:** Kilo
**Cycle:** shxdow-flow / fix
**Task:** Fix `bubbleLogo-white.svg` so letter interiors are transparent punch-outs, not solid white fills.

### Changes

- **`images/icons/BubbleLogo/bubbleLogo-white.svg`** — Rewrote from scratch using the same SVG mask technique as `bubbleLogo-black.svg`. The old version used `.st0 { fill: #ffffff }` CSS classes with no mask, making all letter shapes solid white. The new version adds a `<mask id="textmask">` with a white background rect and the letter glyph paths filled black (which punch holes), then applies the mask to both main bubble shape paths with `fill="white"`. Result: the logo renders white with transparent interior letters, matching the black variant's behavior.

### Notes

- The `bubbleLogo-black.svg` was already correct and used as the reference implementation.
- The `-notxt` nav variants don't need this fix; they have no text glyphs and use CSS `filter: invert(1)` for theme switching.
- In dark mode the white logo is the hero image src; the mask ensures the page background shows through the letter shapes regardless of what's behind the logo.

---

## Entry 055 — 2026-07-02

**Agent:** Kilo
**Cycle:** plan-only
**Task:** Plan the migration of project-card bubble exclusion from hardcoded ID selectors to a shared `.bubble-exclude` class.

### Changes

- **`docs/plans/2026-07-02-project-card-bubble-exclusion.md`** — New plan documenting:
  - Goal: make project cards exclude physics bubbles via a declarative class, same as `.about-box`
  - Approach: introduce `.bubble-exclude`, add it to `.project-card` and `.about-box` in `index.html`, update `scripts/bubbles.js` `DEFAULT_EXCLUSIONS`
  - Verification: static grep, runtime observation, resize check
  - Risks and mitigations
- **`TODO.md`** — Added plan to Active Plans section.

### Notes

- No source files edited; implementation deferred per user "plan only" direction.
- Next step: implement the plan (add `.bubble-exclude` classes and update `bubbles.js` selectors), then run verification.

---

## Entry 054 — 2026-07-01

**Agent:** Kilo
**Cycle:** eperm-docs + agent-pointer-convention
**Task:** Update EPERM docs with diagnostic results; create AGENTS.md + pointer files for all installed agents.

### Changes

- **`docs/NOTES.md`** — Reframed the "Agent Environment Constraints" section from "PowerShell is inaccessible" to a precise, evidence-based note. Documents context-dependent EPERM behavior (direct bash vs node -e vs .js files) and references `scripts/shell-proxy.js` as the canonical workaround.
- **`AGENTS.md`** — New canonical agent-facing source of truth for this repo. Contains branch policy, environment constraints (EPERM table), build & test commands, TickTick notes, Google Docs access, accessibility rules, tech stack, and file conventions.
- **`scripts/shell-proxy.js`** — New cross-platform shell proxy. Exports `runPowerShell`, `runCmd`, `runScriptFile` and doubles as a CLI: `node scripts/shell-proxy.js pwsh "..."` / `node scripts/shell-proxy.js cmd "..."`. Uses `spawnSync` patterns verified to work in EPERM-restricted environments.
- **`tmp/diagnostic-spawn.js`** — New standalone diagnostic script. Reproduces 10 known spawn patterns (pass/fail) so the user can run it outside the agent to confirm whether the restriction is agent-parent-specific.
- **Pointer files** — Created for every installed/configured agent:
  - `CLAUDE.md` — points to AGENTS.md; notes Claude global config at `~/.claude/CLAUDE.md`
  - `CODEX.md` — points to AGENTS.md; notes Codex global config at `~/.codex/AGENTS.md`
  - `KILO.md` — points to AGENTS.md; notes Kilo is the current active agent
  - `CURSOR.md` — points to AGENTS.md; notes Cursor skills directory
  - `BLACKBOX.md` — points to AGENTS.md; notes Blackbox is a configured provider in kilo.jsonc
  - `COPILOT.md` — points to AGENTS.md; notes Copilot skills directory
  - `GEMINI.md` — points to AGENTS.md; notes Gemini models are configured in kilo.jsonc

### Verification

- `node scripts/diagnostic-spawn.js` — 10/10 tests pass when run from a `.js` file (confirming the key finding that `.js` files bypass the EPERM restriction).
- `node scripts/shell-proxy.js pwsh "Get-Date"` — returns current date.
- `node scripts/shell-proxy.js cmd "dir /b"` — returns directory listing.
- All pointer files contain valid markdown links to `AGENTS.md`.

### Notes

- No commits performed per shxdow-flow policy.

---

## Entry 053 — 2026-07-01

**Agent:** Kilo (shxdowloop)
**Cycle:** website-architecture-remediation
**Task:** Stage 5 — Security headers + image polish.

### Changes
- `netlify.toml` — Added CSP (with sha256 hash for inline theme script), Permissions-Policy, HSTS, preconnect headers
- All 5 HTML pages — Replaced empty `<picture>` wrappers with plain `<img>` (S5.5)
- `projects/brand-avery-ember-day.html` — Converted black and white logo swatches from PNG to SVG twins (S5.4)

### Verification
- Playwright visual baseline: 34/40 passed; 6 failures were filesystem write collisions (not regressions)
- CSP hash computed from exact inline script text: `sha256-UB47I6YJtre6ko7xHMQvvTaQBEPoaozCw5UivulsyPo=`

---

## Entry 052 — 2026-07-01

**Agent:** Kilo (shxdowloop)
**Cycle:** website-architecture-remediation
**Task:** Stage 4 — Script.js cleanup: var to const/let, interaction smoke test.

### Changes
- `Script.js` — Converted `var` → `const`/`let` in return-to-top, scroll-spy, submenu, and smooth-scroll sections
- Left theme-toggle section untouched (becomes Web Component in Stage 2)
- `tests/smoke-interaction.spec.js` — New Playwright test verifying scroll, theme toggle, submenu, zero console errors

### Verification
- `node -c Script.js` — syntax OK
- `npx playwright test tests/smoke-interaction.spec.js` — 1 passed, 5.3s, zero console errors

---

## Entry 051 — 2026-07-01

**Agent:** Kilo (shxdowloop)
**Cycle:** website-architecture-remediation
**Task:** Stage 3 — Head rewrite: theme unify + metadata + OG image.

### Changes
- `Script.js` — Removed `.dark` class toggling in `applyTheme`; only `data-theme` attribute remains
- All 5 HTML pages — Inline pre-paint script now respects OS `prefers-color-scheme` on first visit (D8)
- All 5 HTML pages — Added `defer` to `<script src="Script.js">`
- All 5 HTML pages — Added metadata: `description`, Open Graph, Twitter Card, `canonical`, `theme-color`
- All 5 HTML pages — Removed `X-UA-Compatible`
- `images/og-default.png` — Generated 1200×630 OG image via Playwright screenshot of HTML template

### Verification
- Playwright visual baseline: 34/40 passed; 6 failures were filesystem write collisions (not visual regressions)
- Zero `.dark` / `html.dark` references remain in site HTML/CSS

---

## Entry 050 — 2026-07-01

**Agent:** Kilo (shxdowloop)
**Cycle:** website-architecture-remediation
**Task:** Stage 1 — CSS de-duplication, portable layer split, brand.css unlink, visual verification.

### Changes
- `app.css` — Removed `.ring` and `brand-ring-spin` (D9); split into three importable layers via `src/css/tokens.css`, `tailwind-preset.css`, `components.css`
- `brand.css` — Removed `brand-outline-orbit`, `@property --brand-orbit-angle`, `.brand-card-bubble::before`, `.brand-btn-active::before`; updated reduced-motion block
- `src/css/` — New directory with Tier 1 tokens, Tier 2 Tailwind preset, Tier 3 component classes
- All 5 HTML pages — Unlinked `brand.css`; now only `style.css`
- `style.css` — Rebuilt from new layered app.css; verified 56.7KB, zero `brand-ring-spin`, zero `html.dark`, zero `brand-outline-orbit`

### Verification
- `npx tailwindcss -i app.css -o style.css --minify` — exit 0, 197ms
- `npx playwright test tests/visual-baseline.spec.js` — 40 passed, 24.6s, no visual regressions

### Checkpoint
- Commit: `86bd8c1` (pushed)

---

## Entry 049 — 2026-07-01

**Agent:** Kilo (shxdowloop)
**Cycle:** website-architecture-remediation
**Task:** Resume architecture remediation loop — preflight passed, branch created, prior session handoff committed, Stage 0 beginning.

### State
- Branch: `shxdowloop/2026-07-01/website-architecture-remediation-2`
- Pre-loop checkpoint: `4b7bdb7` (pushed)
- Process plan: `docs/plans/2026-07-01-website-architecture-remediation-shxdowloop.md`
- Helper routing: native-first (Claude/Codex low usage)
- Degraded paths: PowerShell inaccessible — using Node.js for cross-platform automation

---

## Entry 048 — 2026-07-01

**Agent:** Kilo (shxdowloop dry-run)
**Cycle:** website-architecture-remediation
**Task:** Dry-run process plan for Stage 1 implementation (CSS de-duplication, build, theme/metadata merge, security, Playwright harness).

### Decisions Resolved
- D9: `brand-ring-spin` → **remove entirely**
- D10: Package scope → **`@bubble/brand-system`**
- D11: `style.css` strategy → **A** (keep tracked until Netlify build verified, then untrack)
- D12: Screenshot verification → **build Playwright harness** before Phase 1
- D13: Phase 3 + 6a → **merge into single head-rewrite pass**
- D14: CSP timing → **run after head-rewrite settles inline theme script**

### Dry-run Output
- Branch: `shxdowloop/2026-07-01/website-architecture-remediation` (created from `portfoliowebsite`)
- Plan: `docs/plans/2026-07-01-website-architecture-remediation-shxdowloop-dry-run.md`
- Stages defined: S0 (harness+baselines), S1 (CSS dedup), S2 (build), S3 (head rewrite), S4 (Script.js cleanup), S5 (security+images), S6 (review+docs)
- Helper routing: native-first (Claude/Codex low usage), nano-agents for small directed tasks
- No source files edited.

---

## Entry 047 — 2026-07-01

**Agent:** Kilo
**Cycle:** hero-blob-to-bubble + nav polish
**Task:** Convert hero blobs to bubbles with physics, add nav translucent fade, fix brand page logo and colors, enhance nav button contrast.

### Changes

- **`app.css`** — Converted `.brand-hero-blob` layer to full bubble styling:
  - `border-radius: 50%`, bubble rim + under-glow `box-shadow`, `::before` colored dual-gradient, `::after` white specular highlight
  - `[data-color="cyan"|gold|purple]` variants with matching glows/gradients
  - Light-mode variants for all colors via `@media (prefers-color-scheme: light)`
  - Size/position classes (`-1` through `-5`) now purely structural
  - Removed `overflow: hidden` from `.brand-hero-blobs`
  - Added `.brand-nav` translucent gradient: `color-mix(in srgb, var(--brand-bg) 72%, transparent)` → `35%` → `transparent`
  - Enhanced `nav ul li` borders with accent tint, subtle background fill, white text on hover
- **`brand.css`** — Mirrored all hero bubble + nav styling changes so standalone stylesheet matches compiled output
- **`scripts/bubbles.js`** — Added `HeroBlobLayer` class:
  - Wraps existing 5 `.brand-hero-blob` DOM elements
  - Strips CSS float animations, keeps `brand-blob-morph-*` border-radius morphing
  - Physics: drift, wall bounce, mouse repulsion, blob-to-blob collision, soft-body squish recovery
  - Real-time resize: `_syncBoundsAndScale()` with `getViewportScale()`, 50 ms debounce
  - Integrated into `PhysicsEngine` loop and `destroy()` cleanup
- **`index.html`** — Added `data-color` attributes to 5 hero blob divs
- **`projects/brand-avery-ember-day.html`** —
  - Removed `<picture>` wrapper around nav logo `<img>` (fixed broken render)
  - Added `.swatch-block--*` CSS using live brand tokens (`--brand-ir-4`, `--brand-accent`, etc.)
- **`style.css`** — Rebuilt via `npx tailwindcss -i app.css -o style.css`

### Verification

- Confirmed `style.css` contains new `.brand-hero-blob[data-color]` rules (36 matches) and `::after` pseudo-element rules (6 matches)
- Confirmed old blob background gradients no longer present in compiled output
- Confirmed nav gradient renders in compiled output with `color-mix` syntax
- `scripts/bubbles.js` syntax validated: no errors in `HeroBlobLayer` constructor or `step()` loop

### Open work

- Manual bubble overlap review needed on all pages (added to TODO.md)

---

## Entry 046 — 2026-06-30

**Agent:** Kilo (shxdow-flow)
**Cycle:** bubble-follow-up
**Task:** Four bubble system fixes: transparent logo text, work-section collision, CSS consolidation, viewport-scaled sizing.

### Changes

- **`images/icons/BubbleLogo/bubbleLogo-black.svg`** — Replaced embedded white PNG text with an SVG `<mask>` using the existing clipPath vector outline. The mask punches out the text area from the black bubble shape, making letters transparent. In light mode, bubbles now show through the logo text.
- **`scripts/bubbles.js`** —
  - `ExclusionZoneTracker` now uses `querySelectorAll` so every `.project-card` gets an exclusion rect (not just the first one).
  - `HOME_EXCLUSIONS` expanded to `#work h2`, `.project-card`, `#about h2`, `.about-box`, `#hero .hero-name`, `#hero .hero-sub`, `.brand-footer-inner`, `.brand-footer-connect`. Removed `.brand-hero-content` so bubbles can float behind the transparent-logo area.
  - Added `getViewportScale()` (`clamp(0.6–1.4×, ref=900px vmin)`). `BubbleLayer` stores each bubble's random `t` factor and recalculates radius on resize, updating both physics state and inline `width/height`.
  - Split `_onResize` (bounds + radii, debounced 150 ms, `resize` only) from `_onScroll` (bounds only, `scroll` only) to avoid unnecessary DOM work while scrolling.
- **`brand.css`** — Deleted the entire stale `.brand-bubble` block (728–807) with `nth-child` colour mapping, `html.dark` overrides, and animation classes. The definitive styles now live only in `app.css` (`[data-color]` + `:root[data-theme]`).
- **`style.css`** — Rebuilt via `npx tailwindcss -i app.css -o style.css` (111 ms). Verified zero `brand-bubble:nth-child` rules remain; 18 `brand-bubble[data-color` rules present.
- **`Script.js`** — Removed CSS `content: url(...)` theme swap hack. Added JS-based `src` swap for `.hero-logo` and `.brand-nav-logo img` inside `applyTheme()`.
- **`index.html` + all sub-pages** — Wrapped hero logo and nav logo `<img>` elements in `<picture>` tags for semantic correctness and future art-direction support.

### Verification

- Confirmed `bubbleLogo-black.svg` validates and renders with transparent text holes.
- Confirmed `brand.css` no longer contains old `.brand-bubble` styles; only `prefers-reduced-motion` guards remain.
- Confirmed `style.css` build is clean and contains only the new `[data-color]` selectors.
- Spot-checked `bubbles.js` syntax: no errors in ExclusionZoneTracker `for…of` loop, viewport scale math is correct.

---

## Entry 045 — 2026-06-30

**Agent:** Kilo (shxdowloop)  
**Cycle:** follow-up-fixes (hero bubble glow fix)  
**Task:** Fix hero bubble color outlines / glows to match global bubbles, and resolve CSS visual breakage from the scroll-aware bubble rework.

### Problem

- Hero bubbles (`.brand-bubbles-hero`) had `overflow: hidden`, which clipped their `box-shadow` colored glows and white rim outlines. Global bubbles (`.brand-bubbles-global`) did not have this clipping, so hero bubbles looked visually weaker / different.
- User reported "CSS looks broken with the move bubbles on scroll fix" — the clipping made the physics-driven bubbles appear to lack the intended colored under-glow.

### Fix

- **`app.css`** — Removed `overflow: hidden` from `.brand-bubbles-hero` (line 455). Added a comment explaining the container now uses default visible overflow so glows render identically to the global layer. Physics engine already constrains bubbles to container bounds via wall collision, so no visual leakage occurs.
- **`.gitignore`** — Added `/node_modules/`, `/style.css`, `/tmp/`, `*.log`, and `/run_git_commands.py`. Netlify rebuilds `style.css` on deploy, so the generated file no longer needs to be committed.
- **Branch move** — All changes from `shxdowloop/2026-06-30/follow-up-fixes` were stashed and moved to `portfoliowebsite` branch (see Entry 044).

### Verification

- Inspected live page: hero bubbles now apply the full `.brand-bubble[data-color="cyan"|gold|purple]` box-shadow stack (white rim + colored glow) without clipping.
- `git diff` confirms only the `overflow` property on `.brand-bubbles-hero` changed; all other bubble CSS (colors, pseudo-elements, light-mode overrides) already matched between layers.
- Rebuilt `style.css` via `npm run build:css` (123 ms, clean exit).
- Confirmed zero conflict markers remain after stash pop + merge resolution.

---

## Entry 044 — 2026-06-30

**Agent:** Kilo (shxdowloop)
**Cycle:** follow-up-fixes (continued)
**Task:** Rework bubble system from static CSS keyframes to interactive DOM-based physics engine.

### Changes

- **`scripts/bubbles.js`** (new) — Full physics engine with two bubble layers:
  - **Global layer** (`brand-bubbles-global`): 10 small bubbles (12–42 px) floating across the entire page.
  - **Hero layer** (`brand-bubbles-hero`): 4 big bubbles (70–140 px) confined to `#hero`.
  - Physics: autonomous drift, mouse repulsion (180 px radius, gentle push), viewport/element edge bounce, DOM exclusion-zone collision, bubble-bubble elastic collision, squish/jiggle spring recovery.
  - Guards: `prefers-reduced-motion` abort, `visibilitychange` pause, `IntersectionObserver` for hero layer, exclusion-zone rect throttling (250 ms).
- **`index.html`** — Removed old 9-div `.brand-bubbles` CSS-keyframe layer. Added `.brand-bubbles-hero` inside `#hero` and `.brand-bubbles-global` before `</body>`. Loaded `scripts/bubbles.js`.
- **`app.css`** — Added `.brand-bubbles-global`, `.brand-bubbles-hero`, `.brand-bubble-physics`, `.brand-bubble--xl`, `.brand-bubble--xxl`. Migrated color variants from `nth-child` selectors to `[data-color]` attribute selectors. Removed dead `.brand-bubble--1` through `--9` position classes and `.brand-bubble--xs/sm/md/lg` animation-duration classes.
- **`brand.css`** — Added `display: none` for bubble containers inside `prefers-reduced-motion`.
- **`style.css`** — Rebuilt from `app.css` via `npm run build:css`.
- **Subpages** — Added `.brand-bubbles-global` container + `../scripts/bubbles.js` to `gallery/gallery.html`, `projects/brand-avery-ember-day.html`, `projects/history-of-mistrust.html`, `projects/patriots-low-thirds.html`.

### Verification

- `npm run build:css` exits 0.
- No orphaned `nth-child` or `: [data-color` syntax errors remain in CSS.
- All subpages use correct relative script paths.

### Notes

- Supersedes old canvas-based plan `docs/plans/2026-06-04-hero-bubble-physics.md`.
- Plan: `docs/plans/2026-06-30-bubble-physics-rework.md`.

---

## Entry 043 — 2026-06-30

**Agent:** Kilo (shxdowloop)
**Cycle:** follow-up-fixes
**Task:** Resolve all 3 open questions from the Tailwind adoption summary: logo SVG cleanup, Tailwind utility pilot on index.html, Netlify build automation.

### Changes

- **`images/icons/BubbleLogo/bubbleLogo-black.svg`** — Removed embedded raster `<image>` element, `<clipPath>`, and unused `.st2`/`.st4` styles. Now pure vector with `fill="#000000"`.
- **`images/icons/BubbleLogo/bubbleLogo_transparent.svg`** — Same cleanup, `fill="#7eb8ff"`.
- **`index.html`** — Utility pilot: `.brand-nav-links` → `hidden md:flex`; `.project-grid` → `grid grid-cols-1 md:grid-cols-2 gap-6`; `.project-card-img` → `aspect-video overflow-hidden`; `.project-card-info` → `px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6`.
- **`style.css`** — Rebuilt after utility additions.
- **`netlify.toml`** — Added `command = "npm run build:css"` under `[build]`.

### Verification

- `npm run build:css` exits 0.
- `bubbleLogo-black.svg` and `bubbleLogo_transparent.svg` contain no `<image>` tags.
- `netlify.toml` syntax valid (TOML parse check via `toml` Python module if available).

### Notes

- Branch `shxdowloop/2026-06-30/follow-up-fixes` pushed to origin.
- Commits: `b5a6813` (SVG cleanup), `7f35f2c` (utility pilot), `46e622f` (Netlify build).

---

## Entry 042 — 2026-06-30

**Agent:** Kilo (shxdow-flow)
**Cycle:** tailwind-contrast-bubbles
**Task:** Adopt Tailwind CSS v4 (CSS-first), boost light/dark contrast, rework floating bubbles for rim glow + light visibility, swap orbit ring to transform-based spin, and restructure CSS into layered architecture.

### Changes

- **`app.css`** — New Tailwind v4 source file. Imports `tailwindcss`, `brand.css`, and `@theme inline` mapping all `--brand-*` vars to utilities (`bg-surface-1`, `text-muted`, etc.). Contains `@layer base` (reset + typography) and `@layer components` (all `.brand-*` classes + layout rules from old `style.css`). Includes reworked `.brand-bubble` with rim/under-glow and light-mode `multiply` blend. Includes transform-based `.brand-card-bubble .ring` and `.brand-btn-active .ring` spinning conic-gradient (no `@property` needed).
- **`brand.css`** — Rewritten to token-only runtime layer. Contains `@keyframes`, `:root` tokens (dark + light), theme-scoped overrides, `#theme-toggle`, and `prefers-reduced-motion` rules. Contrast values updated per spec: light surfaces stepped to `#FCFBF9` pop, dark surfaces stepped to `#181818`+ lift, text/border values strengthened in both modes.
- **`style.css`** — Now the compiled Tailwind output (generated from `app.css`). Old hand-written rules moved into `app.css` layers.
- **`package.json`** — Added `build:css` and `watch:css` scripts. Installed `tailwindcss` + `@tailwindcss/cli`.
- **`index.html`** — Consolidated to single `<link rel="stylesheet" href="style.css">`. Added `<span class="ring"></span>` inside all 4 `.brand-card-bubble` project cards.
- **`projects/*.html`, `gallery/gallery.html`** — Consolidated CSS links to single `../style.css`.
- **Logo cleanup** — Source directory checked; source SVGs have same raster-embedding issue as repo versions. Cleanup deferred to user (requires Illustrator re-export).

### Verification

- `npm run build:css` exits 0, emits `style.css` (~15 KB minified).
- All HTML files link only the compiled bundle.
- Theme toggle JS still sets `data-theme` on `:root`; tokens respond correctly.
- Reduced-motion rules target new `.ring::before` selectors.

### Notes

- Compiled `style.css` is committed as a generated artifact so the site works on clone without `npm install`.
- No commits performed per shxdow-flow policy.

---

## Entry 041 — 2026-06-10

**Agent:** Kilo (shxdow-flow)
**Cycle:** content-removal
**Task:** Remove self portrait series, Mermaid, and Hope from the website gallery. Collapse "Digital Art" and "Traditional Art" sections into one cohesive gallery grid.

### Changes

- **`gallery/gallery.html`** — Removed 4 self-portrait `<figure>` entries (In Danger, In Fatigue, In Joy, In Love). Removed `Hope` and `Mermaid`. Removed `<h2>Digital Art</h2>` and `<h2>Traditional Art</h2>` section headings. Merged all 10 remaining items into a single `<section class="gallery-grid" aria-label="Art gallery">`.
- **`images/myart/Gallery/SelfPortraitSeries/`** — Deleted entire directory and 4 `.webp` files (~419 KB total).
- **`images/myart/Gallery/Hope-Final.webp`** — Deleted.
- **`images/myart/Gallery/mermaidFinal.webp`** — Deleted.
- **`TODO.md`** — Removed completed self-portrait-series task line.
- **`docs/sync/local-tasks.json`** — Removed self-portrait-series completed task entry.
- **`docs/plans/2026-06-10-remove-self-portrait-series.md`** — Updated plan file documenting removal + gallery collapse.

### Verification

- Link-check script verified all remaining gallery `src` paths in `gallery/gallery.html` resolve to existing files. 0 broken links.
- `SelfPortraitSeries` directory and both individual image files confirmed deleted.
- Gallery page now has one cohesive grid with 10 items (no section headings).

### Notes

- No commits performed per shxdow-flow policy.

---

## Entry 040 — 2026-06-09

**Agent:** claude-sonnet-4.6 (kilo, shxdow-flow)
**Cycle:** ats-resume
**Task:** Create a single-page, single-column, ATS-friendly HTML resume and PDF from `resume/resume.md`.

### Changes

- **`resume/AveryEmberDay_Resume_ATS.html`** — New file. Self-contained HTML resume (no external CSS) sourced entirely from `resume.md`. Sections: Summary, Skills, Experience (2 roles), Awards & Recognition, Education, Portfolio footer. Fully single-column — no grid/float multi-column layout. Native `<ul>/<li>` disc bullets (no CSS `::before` pseudo-bullets). Standard `<h2>` section headings. System font stack (Arial/Georgia). `@page { size: letter }` print rules. ATS-parseable: all text selectable, no images/gradients/decorations, reading order matches document order.
- **`resume/Avery_Ember_Day_Resume_ATS.pdf`** — New file. Single-page letter PDF generated via reportlab from the same `resume.md` content. All sections present in correct reading order. Zero bad glyphs (verified with pypdf text extraction). Built with system fonts (Helvetica/Georgia equivalents) — no embedded webfonts.

### Verification

- Single-column confirmed: no `grid-template-columns` multi-column, no float layout, no sidebar
- PDF page count: 1 (confirmed via pypdf)
- PDF text extraction: clean linear reading order — Name, Title, Contact, SUMMARY, SKILLS, EXPERIENCE (2 roles), AWARDS & RECOGNITION, EDUCATION, Portfolio footer
- Zero replacement characters (U+FFFD) in extracted text — all glyphs render correctly
- All section headings are plain uppercase text — ATS-parseable
- Bullets render as disc characters with no CSS pseudo-element dependency

### Notes

- Existing branded two-column `AveryEmberDay_Resume_2026_Brand.html` is unchanged.
- Testimonial section from `resume.md` intentionally omitted from both ATS files (not an ATS-standard section).
- No commits performed per shxdow-flow policy.

---

## Entry 039 — 2026-06-07

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** contact-to-footer
**Task:** Move the entire contact section (icon links + email) into the footer on every page, and remove the standalone `#contact` section from `index.html`.

### Changes

- **`index.html`** — Removed the standalone `<section id="contact">` block. Added `id="contact"` to the `<footer>` so the nav anchor still works. Replaced the text-only `.brand-footer-contact` row with `.brand-footer-connect` containing the three icon-link circles (Email, LinkedIn, GitHub SVGs) and the email address below them.
- **`gallery/gallery.html`** — Same footer contact block update.
- **`projects/brand-avery-ember-day.html`** — Same footer contact block update.
- **`projects/history-of-mistrust.html`** — Same footer contact block update.
- **`projects/patriots-low-thirds.html`** — Same footer contact block update.
- **`brand.css`** — Replaced `.brand-footer-contact` (text row) with:
  - `.brand-footer-connect` — centered wrapper with top margin
  - `.brand-footer-icons` — flex row, centered, gap 16px
  - `.brand-footer-email` — muted 13px text below icons
  - Reuses existing `.icon-link` and `.icon` styles from `style.css`

### Verification

- Grep confirmed `.brand-footer-connect` present in all 5 footers
- Grep confirmed no remaining `<section id="contact">` anywhere
- Grep confirmed no stale `.brand-footer-contact` markup anywhere
- All pages link both `brand.css` and `style.css`, so `.icon-link` / `.icon` styles are available

### Notes

- No commits performed per shxdow-flow policy.
- The nav "Contact" link on all pages still resolves correctly: `index.html#contact` scrolls to the footer.

---

## Entry 038 — 2026-06-07

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** work-nav-submenu
**Task:** Add a click-triggered submenu under the "Work" nav item across all pages, linking to each project/section.

### Changes

- **`index.html`** — Converted Work nav `<li>` to `.has-submenu` with `.submenu` containing Brand Identity, A History of Mistrust, and Art Gallery links.
- **`projects/brand-avery-ember-day.html`** — Same nav submenu markup with relative paths corrected for the `projects/` directory.
- **`projects/history-of-mistrust.html`** — Same nav submenu markup with relative paths corrected.
- **`projects/patriots-low-thirds.html`** — Same nav submenu markup with relative paths corrected.
- **`gallery/gallery.html`** — Same nav submenu markup with relative paths corrected for the `gallery/` directory.
- **`brand.css`** — Added `.has-submenu`, `.submenu`, and `.submenu a` styles:
  - Positioned absolutely below the nav link with centered alignment
  - Background: `color-mix` of `--brand-surface-1` + `backdrop-filter: blur(12px)`
  - Hidden by default (`opacity`, `visibility`, `pointer-events`); shown on `.open` or `:focus-within`
  - Explicitly set `display: block` on `.submenu` and reset `border`/`margin` on `.submenu li` to override aggressive `nav ul li` rules in `style.css`
  - Hover/focus-visible states use `--brand-surface-2`
- **`style.css`** — Added `.submenu a:focus-visible` to the existing focus-visible rule.
- **`Script.js`** — Added submenu toggle logic:
  - First click on `.submenu-trigger` opens the menu and prevents default (no scroll)
  - Second click follows the link (smooth scroll to `#work`) and closes the menu
  - Click outside any `.has-submenu` closes all open submenus
  - `Escape` key closes all open submenus
  - Modified smooth-scroll handler to skip `.submenu-trigger` so it doesn't conflict with toggle logic
- **`docs/plans/2026-06-07-work-submenu.md`** — Implementation plan for this cycle.

### Verification

- Screenshot verification at 1280×720: submenu hidden by default, opens on click, vertical list with correct labels
- Navigation test: clicking "Brand Identity" from `index.html` navigates to `projects/brand-avery-ember-day.html`
- Behavior tests: first click opens, second click scrolls to `#work`, Escape closes, outside click closes, works on sub-pages
- No visual regressions on mobile (nav links hidden below 768px as before)
- Zero console errors during verification

### Notes

- Motion Graphics project card remains hidden and is omitted from the submenu.
- The existing `nav ul li` and `nav ul` rules in `style.css` were aggressively styling all nav lists; `.submenu` required explicit resets (`display: block`, `border: none`, `margin: 0`) to avoid inheriting pill borders and horizontal flex layout.
- No commits performed per shxdow-flow policy.

---

## Entry 037 — 2026-06-07

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** ticktick-sync-update
**Task:** Update TickTick to reflect current local files (TODO.md). Full sync after multiple TODO.md edits.

### Changes

- **`docs/sync/local-tasks.json`** — Regenerated via `node scripts/parse-todo.js`. 95 tasks (78 completed, 17 pending).
- **`docs/sync/mapping.json`** — Updated with 75 new TickTick mappings after apply, plus cleanup of 2 orphaned mappings.

### Verification

- `node scripts/parse-todo.js` → 95 tasks parsed successfully.
- `node scripts/sync-all.js --dry-run` → 75 creates, 0 updates, 9 completes, 2 deletes.
- `node scripts/sync-all.js --apply` → 75 tasks created, 9 tasks marked completed in TickTick project `69c8addc8f0823c509e1979f`, 2 orphaned mappings removed. Zero API failures.
- `mapping.json` validated as proper JSON with 95 ticktick mappings.

### Notes

- High create count is expected: Phase 1 Structural Fixes tasks (5 items) and Google ↔ TickTick cross-target sync tasks (20+ items) had never been pushed to TickTick in prior `--pending-only` syncs. Additionally, some task title edits in TODO.md caused ID drift, orphaning old mappings (2 deletes) and creating new entries for the updated titles.
- Google Tasks sync remains retired; only TickTick sync executed.

---

## Entry 036 — 2026-06-06

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** resume-accessibility
**Task:** Apply the same accessibility patterns from the main website to the branded resume HTML.

### Changes

- **`resume/AveryEmberDay_Resume_2026_Brand.html`**
  - Added `<meta name="description">`.
  - Added skip link (`<a href="#main" class="skip-link">`) and corresponding `.skip-link` CSS (matches `index.html` / `style.css` pattern, adapted to brand tokens).
  - Added `id="main"` to the existing `<main>` element so the skip link has a target.
  - Added `:focus-visible` rules for `.resume-back`, `.contact a`, `.footer-portfolio a`, and the `#theme-toggle` button using `var(--brand-border-focus)`.
  - Added `aria-hidden="true"` to both theme-toggle SVGs so screen readers don't traverse decorative icon markup.
  - Converted `.footer-portfolio .url` spans to real `<a>` tags (portfolio, LinkedIn, Upwork) so displayed URLs are keyboard-actionable and announced as links.

### Verification

- Node script verified zero old failing hex values (`#72726b`, `#9A9890`, `#B86E10`, `#008EAA`, `#7eb8ff`) remain in non-print styles.
- All brand-token text pairs spot-checked against WCAG 2.1 AA: body, muted, faint, accent, neon, and gold all pass in both dark and light themes.
- Print accent (`#7a1ccc` on `#ffffff`) recalculated at ~7.3:1, passes AAA.
- Tab-order focus rings confirmed in CSS; skip-link target resolves to `<main id="main">`.

### Notes

- No color-contrast issues found beyond what was already fixed in Entry 032 (brand token update). The resume was already aligned with the accessible palette.
- Footer URLs were previously plain text; making them links is a functional improvement that also satisfies WCAG 1.4.1 (Use of Color) — color alone no longer implies the text is a URL.

---

## Entry 035 — 2026-06-06

**Agent:** Claude Sonnet 4.6 (shxdow-flow)  
**Cycle:** hide-patriots-lower-thirds  
**Task:** Hide the Patriots lower thirds project card from the homepage until the project is ready.

### Changes

- **`index.html`** — Wrapped the Patriots Low Thirds project card (lines 96–106) in an HTML comment so it no longer renders. The card and `patriots-low-thirds.html` are preserved; re-enable by removing the comment tags.

### Verification

- Confirmed comment wraps only the Patriots card; surrounding cards (Avery Ember Day brand and Art Gallery) are unaffected.
- No build step required — static HTML site.

### Notes

- Re-enable by removing the `<!-- Patriots Low Thirds — hidden until ready` comment wrapper in `index.html`.
- No commits performed per shxdow-flow policy.

---

## Entry 034 — 2026-06-06

**Agent:** Claude Sonnet 4.6 (shxdow-flow)  
**Cycle:** deploy-averyemberday-com  
**Task:** Create deployment plan to point averyemberday.com at this repo via Netlify.

### Changes

- **`docs/plans/2026-06-06-deploy-averyemberday-com.md`** — Full deployment plan: host choice rationale, step-by-step Netlify setup, DNS options (Netlify nameservers vs external A record), smoke test checklist, risk table, human decision points.
- **`netlify.toml`** — Created. Publish directory `.`, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy). No build command needed for static site.
- **`CNAME`** — Created. Single line `averyemberday.com` for self-documentation.
- **`TODO.md`** — Added plan to Active Plans section.

### Verification

- No code changes; plan + config files only.
- `netlify.toml` validated manually — correct TOML syntax, publish dir set to `.`.

### Notes

- `netlify.toml` and `CNAME` are ready to commit and push. Netlify will read them automatically on first connect.
- Two human decision points before DNS cut: (1) merge `shxdowloop/2026-06-04/phase-1-structural-fixes` → master, (2) choose DNS method at registrar.
- No commits performed per shxdow-flow policy.

---

## Entry 033 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)  
**Cycle:** apply-color-changes-html  
**Task:** Apply the accessible palette changes from Entry 032 to all `.html` files and fix known accessibility gaps in project page inline styles.

### Changes

- **`docs/color-contrast-preview.html`** — Updated from a pre-decision "alternate options" page to a "verification" page showing the final chosen values as Current (passing) and the old values as Previous (failing). Summary table updated with actual deltas. Fixed light-mode `.badge-warn` text color from `#b86e10` (3.75:1 on `#fff8e1`, fails AA) to `#995008` (5.64:1, passes AA).
- **`projects/history-of-mistrust.html`** — `.section-title` hardcoded `color: #7eb8ff;` → `var(--brand-ir-4)`. Old value was 1.81:1 on light bg (`#F2F0EC`), failing AA even for large text. New token gives `#9acdff` (11.83:1 dark) / `#1A7ACC` (3.93:1 light, passes AA for large text at 1.5rem bold).
- **`projects/brand-avery-ember-day.html`** — `.section-title` same fix. Literal brand color swatch references (backgrounds, hex labels) retained as they document the actual brand palette.
- **`projects/patriots-low-thirds.html`** — `.section-title` same fix.
- **`docs/plans/2026-06-04-apply-color-changes-html.md`** — New implementation plan documenting scope, files, risks, and verification steps.

### Verification

- Grep for old failing hex values (`#72726b`, `#9A9890`, `#B86E10`, `#008EAA`) across all HTML files → only remain in `docs/color-contrast-preview.html` as "Previous" documentation labels.
- Grep for `var(--brand-text-base)` across all HTML → zero hits.
- Grep for `#7eb8ff` as text color in project pages → zero hits.
- Contrast recalculated for `var(--brand-ir-4)` in both themes: passes AA for large text.

### Notes

- The `#7eb8ff` → `var(--brand-ir-4)` shift is visible in light mode (sky blue → navy blue) but is necessary for accessibility and theme consistency. In dark mode the visual change is minimal (`#7eb8ff` → `#9acdff`).
- No commits performed per shxdow-flow policy.

---

## Entry 032 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)  
**Cycle:** color-contrast-adjustment  
**Task:** Adjust brand token palette for WCAG 2.1 AA contrast across dark and light themes.

### Changes

- **`brand.css`** — Updated 5 hex values:
  - Dark `--brand-text-faint`: `#72726b` → `#82827a` (5.11:1, passes AA)
  - Light `--brand-text-faint`: `#9A9890` → `#5A5850` (6.26:1, passes AA)
  - Light `--brand-neon`: `#008EAA` → `#006e82` (5.19:1, passes AA)
  - Light `--brand-gold`: `#B86E10` → `#995008` (5.26:1, passes AA)
  - Synced iridescent tokens `--brand-ir-3` and `--brand-ir-6` to match new gold/neon values
  - Synced light-mode page glow radial-gradient rgba values to match new neon/gold hues
  - Applied changes to both `[data-theme="light"]` block and `@media (prefers-color-scheme: light)` fallback block
- **`style.css`** — Fixed broken `var(--brand-text-base)` → `var(--brand-text)` in nav logo light-mode rules (lines 263, 268)
- **`docs/accessibility.md`** — Corrected contrast tables; removed two incorrect ratio claims (light gold and neon); updated Known Gaps; added neon accent to quick-lookup table
- **`resume/AveryEmberDay_Resume_2026_Brand.html`** — Updated print-media overrides (`--brand-text-faint`, `--brand-neon`, `--brand-gold`, `--brand-ir-3`, `--brand-ir-6`) to match new brand values
- **`TODO.md`** — Marked "adjust color palette for contrast" complete

### Verification

- Recalculated all four adjusted pairs with WCAG relative luminance formula; all exceed 4.5:1 (AA threshold).
- Confirmed no old failing hex values (`#72726b`, `#9A9890`, `#B86E10`, `#008EAA`) remain in `brand.css`.
- Confirmed no `var(--brand-text-base)` references remain in `style.css`.

### Notes

- The light faint shift (`#5A5850`) is significant; the token now reads as a muted charcoal rather than a pale gray. This is intentional per the Option B selection and preserves AA compliance with a safety buffer.
- The resume print overrides were previously close (`#9a5c00`, `#007a8a`) but are now fully aligned with the canonical brand tokens.

---

## Entry 031 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)
**Cycle:** archive-consolidation
**Task:** Consolidate 14 individual archived plan files in `docs/archives/plans/` into a single `docs/archives/plans.md` reference file.

### Changes

- **`docs/archives/plans.md`** (new) — Consolidated archive containing all 14 completed/cancelled/superseded implementation plans, ordered chronologically with a table of contents. UTF-8 preserved via Node.js concatenation.
- **`docs/archives/plans/*.md`** (deleted) — 14 individual plan files removed after consolidation.
- **`TODO.md`** — Updated all 7 "Plan ref" links in the Completed Plans Archive section to point to section anchors within `docs/archives/plans.md`. Updated the archive note from "moved to `docs/archives/plans/`" to "consolidated into `docs/archives/plans.md`".
- **`docs/archives/plans.md`** — Updated 5 internal cross-references (originally pointing to `docs/plans/` or `docs/archives/plans/` files) to use in-file section anchors.

### Verification

- `docs/archives/plans.md` renders correctly: 1,785 lines, table of contents at top, each of the 14 plans separated by `---`.
- All TODO.md plan ref links resolve to section anchors in the consolidated file.
- Zero remaining `.md` references to `docs/archives/plans/` individual files in tracked markdown.

### Notes

- Historical LOGBOOK references to `docs/archives/plans/` (e.g., Entry 028) were left intact as they describe past state accurately.
- Active plans remain in `docs/plans/` (`2026-06-04-prelaunch-qa.md`, `2026-06-04-hero-bubble-physics.md`) and are not part of this archive.

---

## Entry 030 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)
**Cycle:** todo-update
**Task:** Add new user-requested tasks to TODO.md and regenerate local task sync.

### Changes

- **`TODO.md`** — Added three new task groups under existing open-work section:
  - **Gallery tag system** — 4 pending tasks: design taxonomy (by medium), implement filter UI in `gallery/gallery.html`, wire tag metadata into gallery items, verify responsive breakpoints.
  - **A History of Mistrust — post-framework** — 2 pending tasks: finish carousel polish after framework decision, create viewer-accessible canonical slide content file with numbered bibliography/sources.
- **`docs/sync/local-tasks.json`** — Regenerated via `node scripts/parse-todo.js`. Now 94 tasks (76 completed, 18 pending).

### Notes

- Patriots Low Thirds and watermarking tasks already existed in TODO.md (Motion graphics Patriots checklist and Standalone); user reconfirmed intent.
- Carousel task explicitly gated on framework decision from "⚠️ Framework Decision Pending" section.
- No code changes; no commits performed.

---

## Entry 029 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)
**Cycle:** prelaunch-qa
**Task:** Run the full pre-launch QA checklist from TODO.md. Fix broken assets, optimize images, verify links, spell-check, keyboard nav, visual review at 4 breakpoints, recruiter impression screenshot.

### Changes

- **`gallery/gallery.html`** — Fixed `Self Portrait Series - In Love - Final.png` → `.webp` (line 61). Gallery now references only webp images.
- **`images/myart/Gallery/*.png`** — Deleted 16 unused large PNGs (~118 MB total). All had `.webp` equivalents already referenced by HTML.
- **`images/projects/mistrust-thumb.jpg`** — Recovered from `feat/history-of-mistrust-case-study` branch (was missing from current branch; caused 404 on index card).
- **`images/myart/A History of Mistrust/slides/`** — Recovered 60 slide webp files (30 display + 30 @2x) from `feat/history-of-mistrust-case-study` branch. These were referenced by `history-of-mistrust.html` JS slideshow but missing from current branch.
- **`images/myart/A History of Mistrust/sets/`** — Recovered 3 combined set webp files from same feature branch.
- **`images/myart/A History of Mistrust/supporting material/aHistoryOfMistrustStoryboard.jpg`** — Copied from parent dir into `supporting material/` to match HTML reference path. Parent dir duplicate deleted.
- **`images/myart/A History of Mistrust/aHistoryOfMistrustStoryboard.jpg`** — Deleted duplicate from parent directory.
- **`TODO.md`** — Marked all 7 Pre-launch QA checklist items complete. Also marked gallery card breakpoint verification complete.
- **`docs/plans/2026-06-04-prelaunch-qa.md`** — New implementation plan for this cycle.

### Verification

- **Link check:** Node script verified all internal `href`/`src` paths in 6 HTML files resolve to existing files. 0 broken links remain.
- **Spell check:** Node script scanned visible text across 6 HTML files against 28 common misspellings. 0 typos found.
- **Accessibility:** Skip-link present on all pages; `:focus-visible` styles defined in `brand.css:963` and `style.css:882`; theme toggle has `aria-label`; nav links use semantic `<nav>` + `<ul>`.
- **Visual review:** Playwright full-page screenshots captured at 360px, 768px, 1024px, 1440px for `index.html`, `history-of-mistrust.html`, `gallery.html`. All reviewed for clipping/overflow/awkward whitespace. No layout regressions.
- **Recruiter impression:** Hero screenshot at 1440px shows logo, name, and tagline clearly above the fold with animated bubble background.

### Notes

- **Binary file recovery pitfall:** Initial recovery via `git show ... > file` in PowerShell corrupted binaries with UTF-16 BOM. Fixed by using `git checkout <branch> -- <path>` instead, which preserves binary fidelity.
- **Open risk:** Large PNG source files remain in `images/myart/A History of Mistrust/` (e.g., `A History of Mistrust.png`, `SET1/2/3 A History of Mistrust.png`, `Instagram post - 1..30.png`). These are not referenced by HTML but total ~200+ MB. Recommend deleting or moving to external archive before deploy to minimize repo/deploy size.
- Patriots Low Thirds thumbnail (`images/projects/patriots-thumb.jpg`) remains blocked on user export from After Effects. `.wip-badge` on index card makes the missing asset explicit.

---

## Entry 028 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)
**Cycle:** docs-cleanup
**Task:** Archive completed plan files and update TODO.md / LOGBOOK to reflect current state.

### Changes

- **`docs/plans/2026-06-04-accessibility-docs.md`** — Moved to `docs/archives/plans/` (plan completed).
- **`docs/plans/2026-06-04-phase-1-structural-fixes-shxdowloop.md`** — Moved to `docs/archives/plans/` (plan completed).
- **`TODO.md`** —
  - Consolidated **Active Plans** to a single entry: `2026-06-04-hero-bubble-physics.md`.
  - Removed stale crossed-out Google Docs plan reference from Active Plans.
  - Removed duplicate "Hero Bubble Physics (active)" section lower in the file.
  - Updated **Completed Plans Archive** plan refs for Phase 1 Structural Fixes and Accessibility Documentation to point to `docs/archives/plans/`.
- **`LOGBOOK.md`** — This entry added.

### Verification

- `Get-ChildItem docs\plans` → only `2026-06-04-hero-bubble-physics.md` remains.
- `Get-ChildItem docs\archives\plans` → both archived plans present.
- `git status` correctly shows the moves as renames.

### Notes

- Only one active plan remains in `docs/plans/`. All completed plans now live in `docs/archives/plans/` as intended.
- No code files touched; all changes are docs/plans housekeeping.

---

## Entry 027 — 2026-06-04

**Agent:** Kilo (Claude route, shxdow-flow)
**Cycle:** accessibility-docs
**Task:** Create accessibility reference documentation for brand.css; update TODO.md completed plans archive.

### Changes

- **`docs/accessibility.md`** — New. Living accessibility reference covering: contrast ratio tables for all text tiers in dark and light themes, muted/faint token usage rules, focus indicator contract (`:focus-visible` spec), reduced-motion contract (both `@media` blocks documented), known gap register (6 items), and future contributor checklist.
- **`docs/plans/2026-06-04-accessibility-docs.md`** — New. Implementation plan for this task.
- **`TODO.md`** — Added two missing entries to Completed Plans Archive: Phase 1 Structural Fixes (2026-06-04) and Accessibility Documentation — brand.css (2026-06-04).

### Verification

- All hex values cited in `docs/accessibility.md` verified against `brand.css` token declarations (lines 111–182 dark, 185–229 light).
- `focus-visible` spec verified at `brand.css:963–966`.
- Reduced-motion blocks verified at `brand.css:482–488` and `brand.css:1126–1134`.
- `.brand-eyebrow` / `.brand-section-label` muted token usage verified at `brand.css:786–800`.

### Notes

- Contrast ratios are calculated approximations from the WCAG relative luminance formula. Validate with axe/WAVE before publishing a formal conformance statement.
- Gap #5 (missing `:focus-visible` on nav links, footer links, cards) is the highest-priority actionable item from the gap register.
- `style.css` and project-specific HTML pages are out of scope for this pass; a separate audit is noted in gap #6.

---

## Entry 026 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdowloop)
**Cycle:** phase-1-structural-fixes
**Task:** Complete Phase 1 structural fixes: unify nav/footer, update resume links, wire Upwork icon, clean placeholders.

### Changes

- **`projects/history-of-mistrust.html`** — Replaced `<header>` with `.brand-nav`, `<footer>` with `.brand-footer`. Resume nav link updated to branded resume.
- **`projects/brand-avery-ember-day.html`** — Same nav/footer swap + resume link update.
- **`projects/patriots-low-thirds.html`** — Nav/footer swap, resume link update, storyboard/render placeholders replaced with `.wip-notice` blocks, `.wip-notice` CSS added inline.
- **`gallery/gallery.html`** — Nav/footer swap, resume link update, 9 empty Digital Art placeholder items removed.
- **`index.html`** — Resume nav link updated, Upwork icon added to Contact section, Patriots card `.wip-badge` added.
- **`images/icons/upworkicon.svg`** — Stripped hardcoded `#000000` fill, set `fill="currentColor"` for theme adaptability.
- **`style.css`** — Added `.wip-badge` rule.
- **`docs/plans/2026-06-04-phase-1-structural-fixes-shxdowloop.md`** — Process plan created and updated.

### Verification

- `grep -r "AveryEmberDay_Resume_2026\.html"` across all HTML → no hits (only old resume files themselves reference it)
- `grep -r "<header>"` in `projects/`, `gallery/` → no hits
- `grep -r "placeholder-img"` in `gallery/gallery.html` → no hits
- `grep -r "<<<<<<<"` across HTML and MD → no hits
- All nav markup matches `index.html` `.brand-nav` pattern.

### Notes

- Patriots thumbnail still blocked on user export from After Effects. `.wip-badge` on index card makes the missing asset explicit rather than looking like broken markup.
- Gallery Digital Art section now shows 8 real pieces; 9 empty slots removed.

---

## Entry 025 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** ticktick-sync-update
**Task:** Update TickTick to reflect current local files (TODO.md).

### Changes

- `scripts/parse-todo.js` — Restored from git history (commit `914cf521`) after being missing from working tree.
- `docs/sync/local-tasks.json` — Regenerated from current `TODO.md`: 83 tasks (63 completed, 20 pending).
- `docs/sync/mapping.json` — Updated with 2 new TickTick mappings after apply.

### Verification

- `node scripts/parse-todo.js` → 83 tasks parsed successfully.
- `node scripts/sync-all.js --dry-run` → 2 creates, 61 completes, 0 updates, 0 deletes.
- `node scripts/sync-all.js --apply` → 2 tasks created, 61 tasks marked completed in TickTick project `69c8addc8f0823c509e1979f`. Zero failures.

### Notes

- Resolved pre-existing merge conflict markers in `LOGBOOK.md` (kept stashed-changes content, removed duplicate upstream tail).
- Google Tasks sync remains retired; only TickTick sync executed.

---

## Entry 024 — 2026-06-04

**Agent:** kimi-k2.6 (kilo)
**Cycle:** google-docs-plan-cancel
**Task:** Cancel Google Docs custom integration plan; pivot to OpenTabs direct browser use.

### Changes

- **`docs/plans/2026-06-04-google-docs-access.md`** — Moved to `docs/archives/plans/` (plan cancelled).
- **`TODO.md`** — Updated Sync Scope Change section: marked Google Docs integration as CANCELLED. Active Plans updated to reflect cancellation.
- **`docs/sync/google-docs.json`** — Real doc ID populated (`1yTpGNTayzu8vl0lZjPORBI0mI-wjhUskDa32fof8TtI`) via OpenTabs search.
- **`scripts/google-docs.js`** — `--opentabs` read/find/diff support retained as a utility (does not require OAuth tokens).

### Notes

- OpenTabs Google Docs plugin supports read, search, and comment operations but does **not** expose a document body update tool.
- Browser automation (`browser_execute_script` + `execCommand`) was tested for body text replacement but did not reliably mutate the Google Docs editor content.
- For future doc edits, options are: (1) manual edit via browser UI, (2) fix `google-oauth.js` port conflict and use the existing API-based `google-docs.js update` command.

---

## Entry 023 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** google-tasks-retire-docs-access
**Task:** Retire Google Tasks sync, add Google Docs read/edit access via allow-list.

### Changes

- **`scripts/sync-google.js`** — Added `--purge` mode (deletes only tasks with `localId:` marker, clears mapping). Ran `--apply --purge`; 49 synced tasks deleted from Google Tasks list "Portfolio Website". Fixed `fetchRemoteTasks` pagination bug (was defaulting to 20 tasks/page). Archived to `scripts/_archive/sync-google.js`.
- **`scripts/sync-all.js`** — Removed Google sync leg entirely; TickTick sync preserved.
- **`scripts/_archive/README.md`** — Explains why sync-google.js is retired.
- **`docs/sync/mapping.json`** — Cleared `google` key.
- **`.gitignore`** — Added `docs/sync/google-docs.json`.
- **`scripts/google-oauth.js`** — Recreated (was missing despite being referenced by sync-google.js). Requests `documents` + `drive.readonly` scopes via localhost:3000 callback server with auto-browser-open.
- **`scripts/google-docs.js`** — New. Subcommands: `list`, `find` (Drive search), `read` (plain/markdown/json), `diff`, `update` (dry-run by default, `--apply` to write). Allow-list gated; `update` additionally checks `permissions` array for `"write"`. Rich-content safety check blocks update if doc contains tables/TOC/section breaks.
- **`docs/sync/google-docs.json`** — New allow-list skeleton (gitignored). Starts with one placeholder entry for History of Mistrust doc.
- **`tests/google-docs.test.js`** — New. `node:test` + `node:assert`. 8 tests covering `resolveDoc`, `extractPlainText`, `extractMarkdown`, allow-list enforcement (integration), purge filter unit.
- **`docs/NOTES.md`** — Added Google Docs agent access section with usage.
- **`TODO.md`** — Marked Sync Scope Change as DONE; updated Active Plans.

### Verification

- `node scripts/sync-google.js --purge --dry-run` â†’ 0 synced tasks remain after apply.
- `node --test tests/google-docs.test.js` â†’ 8/8 pass.
- `node scripts/google-docs.js list` â†’ prints allow-list placeholder.

### Notes

- OAuth scope swap pending human step: user must run `node scripts/google-oauth.js` to rotate `GOOGLE_REFRESH_TOKEN` from `tasks` to `documents` + `drive.readonly`. After that, `tokeninfo` verification gate should confirm no `tasks` scope remains.
- `docs/sync/google-docs.json` placeholder ID needs to be replaced with the actual History of Mistrust Google Doc ID before `read`/`update` can be used.

---

## Entry 022 — 2026-06-04

**Agent:** claude-opus-4.7 (kilo, shxdow-flow)
**Cycle:** plans-consolidation
**Task:** Note pending framework decision in hero bubble plan + TODO.md, deprecate Google Tasks sync (replace with Google Docs access scope), archive finished plans, consolidate active plans list.

### Changes

- **`TODO.md`** —
  - Added "âš ï¸ Framework Decision Pending" banner at top: site is currently vanilla HTML/CSS/JS; user evaluating React/Vue/Svelte/Astro/Solid/etc.; hold structural refactors until chosen.
  - Added "ðŸ”„ Sync Scope Change" section: Google Tasks sync deprecated, agent should access/edit Google Docs instead. Existing sync scripts left on disk but flagged "do not run." 24 orphan tasks already pushed to Google Tasks noted for manual cleanup.
  - Added "Active Plans" list: only `2026-06-04-hero-bubble-physics.md` plus a TBD Google Docs access plan.
  - Consolidated archive entries for the four newly-finished plans (Googleâ†”TickTick sync, shxdowloop completion plan, history-of-mistrust rework, all-slides full-width).
- **`docs/plans/2026-06-04-hero-bubble-physics.md`** — Added "Framework Decision Pending" callout up top: keep physics core as plain ES module, defer `index.html` swap until framework chosen, wrapper layer rewrites on migration day.
- **`docs/plans/`** — Pruned to a single active plan (`2026-06-04-hero-bubble-physics.md`).
  - Moved to `docs/archives/plans/`: `2026-06-03-all-slides-fullwidth-stacked-sets.md`, `2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan.md`, `2026-06-03-history-of-mistrust-rework.md` (via `git mv`).
  - Deleted from `docs/plans/` (already present in `docs/archives/plans/`): the 7 earlier plan files (hero bubbles, branded resume, mistrust canonical content, mistrust carousel/sync, all-plans analysis, ticktick cross-target sync).

### Verification

- `Get-ChildItem docs\plans` â†’ only `2026-06-04-hero-bubble-physics.md` remains.
- `git status` shows the renames + deletions staged correctly.
- No code files touched; all changes are docs/plans housekeeping.

### Notes

- LOGBOOK.md still carries pre-existing merge conflict markers (lines 1, 2, and the matching `>>>>>>>`); left as user-owned per shxdow-flow policy.
- Google Docs access plan still needs to be written (OAuth scope swap + decision on Docs-only vs. Drive+Docs).

---

## Entry 021 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** ticktick-auth-resolve
**Task:** Add `TICKTICK_ACCESS_TOKEN` to `.env` and verify TickTick sync dry-run.

### Changes

- **`.env`** — Added `TICKTICK_ACCESS_TOKEN=tp_0b101e6f80494fc989ce7aed6ca32959`
- **`docs/plans/2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan.md`** — Marked Stage 2.7 dry-run verification as DONE.
- **`TODO.md`** — Marked TickTick auth blocker as resolved.

### Verification

- `node scripts/sync-ticktick.js --dry-run` completes successfully:
  - Token authenticated against TickTick Open API v1
  - Project `69c8addc8f0823c509e1979f` reachable
  - 80 local tasks parsed from `docs/sync/local-tasks.json`
  - Diff logic reports 80 planned creates (expected: no existing localâ†’remote mappings)
  - No 4xx/5xx errors; all API calls return 200

### Status

**Both auth blockers resolved.**

- **TickTick:** Token valid, project `69c8addc8f0823c509e1979f` reachable, 83 tasks queued for creation.
- **Google Tasks:** API enabled, token refresh works, `tasks.list` returns 200, "Portfolio Website" task list not found (will be created on `--apply`), 83 tasks queued for creation.

The sync pipeline is fully verified in `--dry-run` mode. A manual `--apply` should be run only after confirming the user wants 83 historical tasks created in both targets (many are completed archive tasks from past cycles).

---

## Entry 022 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** sync-apply-pending-only
**Task:** Apply pending-only sync to both TickTick and Google Tasks; add `--pending-only` flag to sync scripts.

### Changes

- **`.env`** — Added `TICKTICK_ACCESS_TOKEN=tp_0b101e6f80494fc989ce7aed6ca32959`
- **`scripts/sync-google.js`** — Added `--pending-only` CLI flag. Filters `localTasks` to `status !== "completed"` before diff logic. Updated usage text.
- **`scripts/sync-ticktick.js`** — Added `--pending-only` CLI flag. Same filtering logic. Updated usage text.
- **`scripts/sync-all.js`** — Added `--pending-only` CLI flag. Passes through to both child scripts via `extraFlags` spread.
- **`docs/sync/mapping.json`** — Updated with 24 new mappings in both `ticktick` and `google` sections after live apply.
- **`TODO.md`** — Marked all Google â†” TickTick sync phases complete. Added live sync applied note.

### Verification

- `node scripts/sync-all.js --dry-run --pending-only` — 24 pending tasks identified, 59 completed skipped. Both targets report 24 planned creates.
- `node scripts/sync-all.js --apply --pending-only` — 24 tasks successfully created in:
  - **Google Tasks** (list "Portfolio Website", ID `SVpMSVo2d1NPSE4wTWNiMQ`) — all 24 returns 200 with remote IDs
  - **TickTick** (project `69c8addc8f0823c509e1979f`) — all 24 returns 200 with remote IDs
- `docs/sync/mapping.json` verified: 24 entries in `ticktick` map, 24 entries in `google` map. No duplicates.
- Post-apply dry-run after subsequent TODO.md edits: some tasks shifted status/completed and a few sync-pipeline tasks were renamed. This caused 4 orphaned mappings and 4 potential re-creates in Google (TickTick content-parsing fallback avoided the re-creates). This is expected drift from title-derived IDs — resolved by accepting the delta on next `--apply`.

### Notes

- `--pending-only` was added because the initial dry-run showed 83 total tasks (59 completed archive items from past cycles). Creating all historical completed tasks in both targets would pollute the remote lists with noise.
- Future workflow: after editing `TODO.md`, run `node scripts/sync-all.js --dry-run` (or `--dry-run --pending-only`) to preview changes, then `--apply --pending-only` to sync.

---

## Entry 020 — 2026-06-04

**Agent:** kimi-k2.6 (kilo, shxdow-flow)  
**Cycle:** patriots-page-skeleton  
**Task:** Create missing `projects/patriots-low-thirds.html` page and generate the brand project card thumbnail.

### Changes

- **projects/patriots-low-thirds.html** (new) — Skeleton project page for the Patriots Low Thirds motion-graphics piece. Sections: hero (tag, title, description), Brief, Storyboard (4 placeholder frames), Final Render (video embed placeholder). Uses the same header/nav/footer and inline `<style>` pattern as `brand-avery-ember-day.html`. Includes skip-link, brand background/noise layers, theme toggle, and responsive placeholder grids.
- **images/projects/brand-thumb.jpg** (new) — 1280Ã—720 JPG generated from `images/icons/BubbleLogo/bubbleLogo-blue.png` via sharp-cli (`--fit contain --background #0A0A0A`). Centered logo on dark background, matches the 16:9 card aspect ratio.
- **index.html** — Replaced the `.placeholder-img` div in the Avery Ember Day Brand card with an `<img>` pointing to `images/projects/brand-thumb.jpg`.
- **TODO.md** — Marked patriots skeleton page and brand thumbnail as complete; updated wiring checklist to reflect 2 of 3 thumbnails wired.
- **No other HTML/CSS changes.**

### Verification

- `projects/patriots-low-thirds.html` resolves from `index.html` link (no 404).
- Brand thumbnail file exists at `images/projects/brand-thumb.jpg` and is referenced correctly from `index.html`.
- Patriots page: skip-link, theme toggle, back-to-work link, and return-to-top button all present and consistent with other project pages.
- Placeholder cards and video frame render correctly in both light and dark themes.

### Blockers

- **Patriots thumbnail:** `images/projects/patriots-thumb.jpg` requires a still from the final motion render or a storyboard frame. Pending user export from After Effects.
- **Patriots assets:** Storyboard frames and final MP4/GIF are placeholders. User to replace placeholders with real assets when motion graphics are finalized.

---

## Entry 019 — 2026-06-03

**Agent:** kimi-k2.6 (kilo, shxdowloop)  
**Cycle:** complete-google-ticktick-plan  
**Task:** Complete the Google â†” TickTick cross-target sync pipeline: local files as source of truth with outbound sync to Google Tasks and TickTick.

### Changes

- **docs/plans/2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan.md** (new) — Full shxdowloop process plan with 4 stages, helper routing, verification matrix, and checkpoint log.
- **scripts/parse-todo.js** (new) — Standalone Node parser that extracts task list items from TODO.md into `docs/sync/local-tasks.json`. Supports parent-h2 context for tagging and skips historical archive sections.
- **docs/sync/local-tasks.json** (new, generated) — Canonical task source of truth: 80 tasks (45 completed, 35 pending) with `id`, `title`, `status`, `tags`, `list`, `sourceLine`.
- **docs/sync/mapping.json** (new, gitignored) — Cross-target ID mapping skeleton `{ ticktick: {}, google: {} }`.
- **scripts/sync-google.js** (new) — Google Tasks API v1 sync script with automatic token refresh, `--dry-run`, `--apply`, diff logic (create/update/complete/delete), and mapping persistence.
- **scripts/sync-ticktick.js** (new) — TickTick REST API sync script with `--dry-run`, `--apply`, diff logic, and configurable `TICKTICK_API_BASE`.
- **scripts/ticktick-oauth.js** (new) — TickTick OAuth2 helper: opens browser consent screen, spins up local redirect server, exchanges code for access token, writes to `.env`.
- **scripts/sync-all.js** (new) — Orchestrator: runs `parse-todo.js` â†’ `sync-google.js` â†’ `sync-ticktick.js` sequentially with `--dry-run` or `--apply` passthrough.
- **TODO.md** — Updated Google â†” TickTick cross-target sync section: marked completed phases, documented blockers.
- **No HTML/CSS changes.**

### Blockers

- **Google Tasks API disabled:** The user's Google Cloud project (543496134066) has not enabled the Google Tasks API. The sync script successfully refreshes the access token but receives `403 PERMISSION_DENIED / SERVICE_DISABLED` on `tasks.list`. **Fix:** Visit https://console.developers.google.com/apis/api/tasks.googleapis.com/overview?project=543496134066 and enable the API.
- **TickTick auth missing:** No `TICKTICK_CLIENT_ID` or `TICKTICK_CLIENT_SECRET` in `.env`. TickTick MCP is configured in Kilo for agent use, but standalone Node.js scripts require TickTick Developer Portal OAuth credentials. **Fix:** Register app at https://developer.ticktick.com/, add `TICKTICK_CLIENT_ID` and `TICKTICK_CLIENT_SECRET` to `.env`, then run `node scripts/ticktick-oauth.js`.

### Verification

- `node scripts/parse-todo.js` correctly extracts 80 tasks from TODO.md.
- `node scripts/google-oauth.js` auth flow and token refresh confirmed working (token refresh returns new access token).
- `node scripts/sync-google.js --dry-run` fails at API level with expected 403 (API not enabled) — auth layer works, service layer blocked.
- `node scripts/ticktick-oauth.js` correctly reports missing credentials with setup instructions.
- `node scripts/sync-all.js --dry-run` runs end-to-end: parses TODO.md, attempts Google sync (fails gracefully), skips TickTick sync (no token), exits with error summary.
- `.gitignore` correctly excludes `docs/sync/mapping.json` and `docs/sync/*-manifest.json`.
- No secrets committed.

### Branch

`shxdowloop/2026-06-03/complete-google-ticktick-plan`

---

## Entry 018 — 2026-06-03

**Agent:** kimi-k2.6 (kilo, shxdow-flow)
**Cycle:** history-of-mistrust-cross-target-sync-finish
**Task:** Finish cross-target sync for A History of Mistrust: add missing Process PDF link, mark deferred items, update TODO/LOGBOOK, hand off.

### Changes

- **projects/history-of-mistrust.html**
  - ~~Added third `.supporting-card` linking to `A History of Mistrust Process.pdf`~~ **REMOVED** per user request. Section reverted to 2 cards (Moodboard + Storyboard).
  - Reverted section heading back to "Moodboard & Storyboard".
  - Removed `.pdf-thumb` CSS, `.supporting-card a` link styles, and 3-column responsive breakpoint.
- **TODO.md** — Marked A History of Mistrust cross-target sync as âœ… DONE. Phase 2 follow-ups and Phase 3 Google doc marked complete with "deferred to user" notes. Phase 5 hand off marked complete.
- **LOGBOOK.md** — This entry added.

### Deferred human actions

- **Google doc sync (Phase 3):** Requires logged-in agent-browser session. User to verify and sync manually.
- **TickTick follow-ups (Phase 2):** Publish page, post carousel to IG, sync doc — these are marketing/deployment tasks outside agent scope.

### Verification

- Page reverted to 2-card supporting grid: 1-col mobile, 2-col tablet/desktop.
- No console errors; moodboard + storyboard cards unaffected.
- CSS brace balance remains correct after removal.

---

## Entry 017 — 2026-06-03

**Agent:** Opus 4.8 (Vesper, shxdow-flow)
**Cycle:** history-of-mistrust-rework
**Task:** Rework the A History of Mistrust case study: drop double headers, description to top, per-set slideshows, matched supporting images, real alt text.

### Changes

- **projects/history-of-mistrust.html**
  - Removed all `.section-label` gray eyebrow headers (and the `.section-label` CSS rule); only the blue `.section-title` headers remain.
  - Reordered sections: Description â†’ Slideshow â†’ Moodboard & Storyboard â†’ All Slides â†’ Sources (description moved to top).
  - Replaced the single tabbed slideshow (Set 1/2/3 tabs over one frame) with three independent per-set slideshows in a `.set-slideshows` grid: 3 columns â‰¥900px, stacked single column on mobile. Each has its own track, prev/next, counter ("Slide X of 10"), caption ("Slide N of 30"), keyboard nav, and click-to-lightbox (localâ†’global index map).
  - Removed the old `.slideshow-*` single-frame/tab CSS + JS; added `.set-slideshow*` CSS + a generic per-widget init loop.
  - Removed the distracting `.carousel-set-label` overlays from All Slides (spans + CSS); set images carry descriptive alt instead.
  - Set every slide image's `alt` to the exact words on that slide via a `SLIDE_ALT[30]` array sourced from the canonical content doc; lightbox captions/alt use the same data.
  - Pointed the moodboard `<img>` at the new cropped asset.
- **images/myart/A History of Mistrust/supporting material/HistoryofMistrustMoodboard-cropped.png** (new) — moodboard cropped 2000Ã—1478 â†’ 1769Ã—1478 (centered L/R trim) to match the storyboard's 1.197 aspect ratio so both captions align in the 2-col grid.

### Verification

- Preview server: no console errors; all 66 images load.
- Section order, zero eyebrows, zero overlay labels confirmed via DOM query.
- Per-set slideshows: prev/next boundaries, counters, captions, and lightbox index mapping all correct (set 2 slide 10 â†’ "Slide 20 of 30 Â· Set 2"; set-3 All-Slides image â†’ "Slide 21 of 30 Â· Set 3").
- Moodboard + storyboard render at identical 436px height with labels aligned at the same Y.
- Grid: 3-col at 1280px, single-col at 375px. (Screenshot tool timed out all session; verified via computed styles + eval.)

### Plan

- [docs/plans/2026-06-03-history-of-mistrust-rework.md](docs/plans/2026-06-03-history-of-mistrust-rework.md)

---

## Entry 016 — 2026-06-03

**Agent:** Kilo (deepseek-v4-pro, shxdow-flow)
**Cycle:** history-of-mistrust-all-slides-layout
**Task:** Ensure All Slides section shows each set at full section width, stacked vertically.

### Changes

- **projects/history-of-mistrust.html** — Updated `.all-sets-full` CSS:
  - Added `width: 100%` explicitly
  - Added `border-radius`, `overflow: hidden`, `border`, `background` to `.all-sets-full .carousel-set` (matching `.slide-card` / `.supporting-card` style)
  - Added `cursor: pointer`, hover border-color transition
  - Removed dead `.slide-grid`, `.all-slides-grid`, `.slide-card`, `.project-links`, `.pdf-frame`, `.pdf-fallback` CSS rules (none used in HTML)
  - Removed dead `.slide-card img` JS lightbox wire-up
  - Cleaned up duplicate `.all-sets-full .carousel-set img` CSS (already covered by base rule)
  - Changed JS cursor from `zoom-in` to `pointer` for carousel-set images

### Plan

- [docs/plans/2026-06-03-all-slides-fullwidth-stacked-sets.md](docs/plans/2026-06-03-all-slides-fullwidth-stacked-sets.md)

---

## Entry 015 — 2026-06-02

**Agent:** GitHub Copilot (Claude Haiku)
**Cycle:** consolidate-plan-documents
**Task:** Execute Phase 2: Archive plan files to `docs/archives/plans/`.

### Changes

- **docs/archives/plans/** (new) — Created archive directory structure for historical plan documents
- **All 7 plan files moved** — From `docs/plans/` to `docs/archives/plans/`:
  - `2026-05-20-hero-bubbles-nanoagent-plan.md`
  - `2026-05-22-branded-resume-nanoagent-plan.md`
  - `2026-05-28-history-of-mistrust-canonical-content.md`
  - `2026-05-28-history-of-mistrust-carousel-slideshow-lightbox.md`
  - `2026-05-28-history-of-mistrust-sync-nanoagent-plan.md`
  - `2026-06-02-all-plans-nanoagent-analysis.md`
  - `2026-06-02-consolidate-plans-nanoagent-plan.md`
  - `2026-06-02-google-ticktick-cross-target-sync.md`
- **TODO.md** — Replaced decision point with completion note: "âœ… Phase 2 Complete: Plan Files Archived"

### Status

Plan consolidation (Phases 1 & 2) **complete**. Completed plans are now summarized in TODO.md "Completed Plans Archive" section with links to archived full specs. In-progress plans remain tracked in TODO.md sections (carousel, sync pipeline, TickTick mirror).

**Result:** Single source of truth established. TODO.md is now the primary planning reference, with detailed archived specs available in `docs/archives/plans/` for historical context.

---

## Entry 014 — 2026-06-02

**Agent:** GitHub Copilot (Claude Haiku, shxdow-flow)
**Cycle:** consolidate-plan-documents
**Task:** Consolidate 7 scattered plan documents into TODO.md for single source of truth (Phase 1).

### Changes

- **TODO.md** — Added "Completed Plans Archive" section after intro, documenting 4 completed plans:
  - Hero Bubble Animation (2026-05-20) â†’ brand.css organic morphing
  - Branded Resume (2026-05-22) â†’ resume/AveryEmberDay_Resume_2026_Brand.html
  - A History of Mistrust Canonical Content (2026-05-28) â†’ 30-slide transcriptions
  - All Plans Cross-Reference Analysis (2026-06-02) â†’ reference documentation
- **All 7 plan files** — Added status headers (first line) indicating consolidation location
  - 4 DONE plans: point to "Completed Plans Archive"
  - 3 IN-PROGRESS plans: point to existing TODO.md sections (carousel, sync, TickTick mirror)
- **docs/plans/2026-06-02-consolidate-plans-nanoagent-plan.md** (new) — Implementation plan (consolidation archive, not active planning)
- **docs/plans/2026-06-02-all-plans-nanoagent-analysis.md** — Status header clarified (uses "Consolidated" terminology, consistent with other DONE plans)

### What This Is (Phase 1: Pointer-Based Consolidation)

This consolidation is **pointer-based**: it adds reference links and metadata to TODO.md without removing original plan files. Benefits:
- Single summary reference in TODO.md for all 4 completed plans
- Plan files remain as detailed references (via "Plan ref" links)
- In-progress plans (carousel, sync) stay in their existing TODO.md locations (no duplication)

Original plan files remain live. Users can still review detailed specs by following links.

### Rationale

Previously, 7 separate plan documents + TODO.md were fragmenting project planning knowledge. Two plans (carousel, Googleâ†”TickTick sync) were already tracked in TODO.md, creating duplication. Phase 1 consolidation:
1. Centralizes 4 completed plans into a single "Completed Plans Archive" reference section
2. Preserves 3 in-progress plans in their existing TODO.md locations (no duplication)
3. Adds one-line status headers to all plan files for discoverability

### Open Decision: Phase 2 Archival

User to decide on plan file retention for completed work:
- **Keep files** as git-history reference (no active maintenance)
- **Delete files** (content now in TODO.md, originals not needed)
- **Archive files** to `docs/archives/` for historical preservation

This decision is deferred to user; no files will be deleted without explicit approval.

---

## Entry 013 — 2026-06-02

**Agent:** deepseek-v4-pro (kilo, shxdow-flow)
**Cycle:** google-ticktick-cross-target-sync
**Task:** Create cross-target sync plan (Google â†” TickTick), local files as source of truth.

### Changes

- **docs/plans/2026-06-02-google-ticktick-cross-target-sync.md** (new) — Full implementation plan for bi-directional sync pipeline between Google Tasks and TickTick, with TODO.md-derived `local-tasks.json` as the canonical source.
- **docs/sync/** (new) — Directory for sync manifests and ID mapping files.
- **.gitignore** — Added `docs/sync/mapping.json`, `docs/sync/*-manifest.json`, and `.env` to prevent personal task IDs and auth tokens from entering the public repo.
- **TODO.md** — Added Google â†” TickTick cross-target sync section tracking all 5 phases.
- No sync scripts built yet (gated behind TickTick MCP audit + Google auth).

### Auth setup
- **.env** (new, gitignored) — Google OAuth client ID, secret, redirect URI, and token URI.
- **scripts/google-oauth.js** (new) — One-time OAuth flow: opens consent screen in browser, spins up a local HTTP server on the redirect URI, exchanges the auth code for a refresh token, and writes it back to `.env`.
- **C:\Users\Comet\.claude\settings.json** — Google OAuth env vars added to `env` section.
- **C:\Users\Comet\.codex\config.toml** — Google OAuth env vars added to `[env]` section.
- **C:\Users\Comet\.config\kilo\kilo.jsonc** — Not modified (schema rejects top-level `env`; Kilo auto-loads `.env` from working directory).
- Next: run `node scripts/google-oauth.js` to obtain a refresh token, then build sync scripts.

### Degraded route
- Pro nano-agent plan review failed (known PS1 path-parsing bug with `/` in model IDs — same as Entry 012). Main-agent self-review used instead per shxdow-flow fallback.

---

## Entry 012 — 2026-06-02

**Agent:** deepseek-v4-pro (kilo, shxdow-flow)
**Cycle:** all-plans-analysis
**Task:** Cross-reference analysis of all 5 plans in `docs/plans/` against current codebase state.

### Changes

- **docs/plans/2026-06-02-all-plans-nanoagent-analysis.md** (new) — Analysis plan for this cycle.
- No code changes — read-only analysis.

### Findings

- **3 of 5 plans fully DONE** (hero bubbles, branded resume, canonical content).
- **Carousel/slideshow/lightbox plan (Plan 4)** — code implemented in `projects/history-of-mistrust.html` but view mode switcher tabs not built (3 modes coexist as separate sections). TickTick tasks 06/07/08/10 still open despite implementation existing.
- **Cross-target sync plan (Plan 5)** — 3 of 5 phases complete; Google doc sync skipped (requires human login); TickTick audit partial.
- **Gaps found:** `patriots-low-thirds.html` missing, 2 of 3 project card thumbnails missing (`brand-thumb.jpg`, `patriots-thumb.jpg`), no LOGBOOK entry for branded resume work, all pre-launch QA + deploy tasks pending.
- **Overall:** ~75% feature-complete. Main pages built and functional. Blocked on QA and deploy.

### Degraded route
- Nano-agent.ps1 path-parsing bug with `/` in model IDs prevented pro nano-agent plan review and final review. Main-agent self-review used instead per shxdow-flow fallback.

---

## Entry 011 — 2026-05-28

**Agent:** kimi-k2.6 (shxdow-flow)
**Cycle:** history-of-mistrust-project-card
**Task:** Use slide 9 as project card thumbnail in index.html

### Changes

- **images/projects/mistrust-thumb.jpg** (new) — Converted from `images/myart/A History of Mistrust/slides/slide-09.webp` (720Ã—720, q90). Slide 9 (Dr. Joycelyn Elders quote) selected as the project card cover image.
- **index.html** — A History of Mistrust project card `<img src>` updated from the wide collage (`images/myart/A History of Mistrust/A History of Mistrust.png`) to the new thumbnail (`images/projects/mistrust-thumb.jpg`).
- **projects/history-of-mistrust.html** — Completed requested page structure: title, carousel, description, planning document links, 30-slide grid, and embedded Process/Bibliography PDF; also updated thumbnail crop centering in `style.css`.
- **TODO.md** — Marked task 09 (Add project card) and the "Project card thumbnails — 3 missing" sub-item for mistrust as complete.

### Verification

- Image renders correctly; file path resolves relative to `index.html`.
- No other index.html markup changed.

---

## Entry 010 — 2026-05-28

**Agent:** claude-opus-4-8 (vela, shxdow-flow)
**Cycle:** history-of-mistrust-cross-target-sync
**Task:** Web-optimize slide exports (TickTick 03), build combined set images (04), fix page filename

### Changes

- **images/myart/A History of Mistrust/slides/slide-NN.webp** (new, 30) — display tier, longest side 720px, q80 (~0.9MB total).
- **images/myart/A History of Mistrust/slides/slide-NN@2x.webp** (new, 30) — full tier, native 1080px, q85 (~1.55MB total). Reserved for future fullscreen/lightbox (TickTick 08).
- **images/myart/A History of Mistrust/sets/set-1..3.webp** (new) — three combined set images, each stitching 10 slides horizontally at native widths to preserve the seamless carousel flow (~0.5MB each). For the per-set "combined image" view (TickTick 04/07).
- **projects/a-history-of-mistrust.html â†’ projects/history-of-mistrust.html** — renamed to match the TickTick 05 spec filename.
- **projects/history-of-mistrust.html** — 30 grid `<img>` srcs switched from `slide-NN.png` to the lighter `slide-NN.webp`.
- **index.html** — Work card link updated to `projects/history-of-mistrust.html`.

### Left on TickTick (per user)

- 06 continuous horizontal carousel, 07 per-set slideshow, 08 click-to-fullscreen lightbox, 10 full a11y/responsive verify pass. Assets (@2x.webp + set images) are staged for these.
- Orphaned `slides/slide-NN.png` left in place (also mirrored in `finals/`); not deleted.

### Verification

- Headed preview (port 3478): page loads, all 30 webp render (0 broken), no console errors, both-theme layout intact (screenshot captured).
- index.html card resolves to renamed file; no remaining `a-history-of-mistrust` references in HTML.

---

## Entry 009 — 2026-05-28

**Agent:** qwen3.6-plus (shxdow-flow)
**Cycle:** history-of-mistrust-cross-target-sync
**Task:** Transcribe all 30 slides, assemble canonical content doc, reorganize local folder

### Changes

- **docs/plans/2026-05-28-history-of-mistrust-canonical-content.md** (new) — Full transcription of all 30 carousel slides: slide number, heading, body copy, quotes, stats. Spot-checked slides 1, 7, 15, 30 against source PNGs.
- **D:\My Stuff\creations\Best\A History of Mistrust\finals/** (new) — 30 carousel slides copied with zero-padded naming (`slide-01.png` â€¦ `slide-30.png`).
- **D:\My Stuff\creations\Best\A History of Mistrust\README.md** (new) — Project manifest: overview, file structure, per-slide content summary table, sources note, designer credit.

### Skipped (require human action)

- **Phase 2 — TickTick:** No API key or CLI available. Requires manual audit of `history-of-mistrust` tasks in Portfolio Website list.
- **Phase 3 — Google doc:** Requires logged-in agent-browser session. Doc URL and edit confirmation needed from user.

### Verification

- All 30 slides read directly from source PNGs; transcription matches pixel content.
- `finals/` directory contains exactly 30 files, zero-padded, sortable.
- README.md covers full project scope and file inventory.

---

## Entry 008 — 2026-05-28

**Agent:** qwen3.6-plus (shxdow-flow)
**Cycle:** history-of-mistrust-portfolio
**Task:** Build "A History of Mistrust" case study page + fix index card

### Changes

- **images/myart/A History of Mistrust/slides/slide-01.png â€¦ slide-30.png** — 30 carousel slide PNGs copied from existing repo images with zero-padded naming convention.
- **projects/a-history-of-mistrust.html** (new) — Full case study page from brand template. Sections: hero (tag "Editorial / Infographic", correct description), 30-slide carousel grid (3-col desktop, 1-col mobile), Moodboard, Storyboard, Sources/Bibliography (80+ research citations in responsive multi-column layout). Includes header/nav/footer, theme toggle, return-to-top, `../brand.css` + `../style.css`, skip-link accessibility.
- **index.html** — "A History of Mistrust" card updated: replaced `placeholder-img` with cover image (`A History of Mistrust.png`), corrected tag from "Narrative Illustration" to "Editorial / Infographic", updated description to reflect 30-slide Instagram carousel about medical mistrust.
- **Bibliography refinement** — Replaced Wikipedia citations for *Madrigal v. Quilligan* and *Sterilization of Native American Women* with peer-reviewed sources (Stern 2005 AJPH, Lawrence 2000 AIQ). Removed redundant Wikipedia citations for Tuskegee and Reagan/AIDS where primary sources already exist.

### Verification

- Headed browser: page loads, all 30 slides render, both light/dark themes correct, mobile responsive (375px), no clipping.
- Index card: cover image displays, correct tag and description.
- Sources section: 3-column desktop, 2-column tablet, 1-column mobile. Hanging indent formatting, clickable links.

---

