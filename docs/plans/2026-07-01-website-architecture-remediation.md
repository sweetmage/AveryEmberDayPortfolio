# Plan — Website Architecture & Quality Remediation (2026-07-01)

**Author:** Kilo (shxdowflow / plan mode)
**Branch:** `portfoliowebsite` (worktree currently dirty — user-owned, do not revert)
**Status:** Finalized — ready for an implementation-capable session
**Source review:** User-supplied code review, re-verified against live code before planning.

> This is a planning document only. No source files were changed. Implementation must be done in an implementation-capable agent, in the staged order below, with **no commits/pushes/deploys unless the user explicitly asks**.

---

## Resolved decisions (locked)

| # | Decision | Choice |
|---|---|---|
| D1 | CSS source of truth | **Tailwind v4** (pages load compiled `style.css` only; `brand.css` no longer linked raw) |
| D2 | Site framework | **Astro** (static-first) |
| D3 | Design-system portability depth | **Tokens + Tailwind preset + component CSS classes + Web Components** |
| D4 | Sequencing | **Strategy A — incremental, two stages** (harden vanilla site first, then migrate) |
| D5 | Design-system location | **npm workspace package** `packages/brand-system/` (monorepo; extractable to npm/own repo later) |
| D6 | Monorepo layout | **`apps/site/` (Astro) + `packages/brand-system/`** |
| D7 | Web Component scope | **`<brand-theme-toggle>` + `<brand-bubbles>`** packaged; nav/submenu, return-to-top, mistrust slideshow stay site-local Astro components |
| D8 | Default theme (first visit) | **Respect OS `prefers-color-scheme`**; a manual toggle is stored and overrides thereafter; keep ONE simplified system-preference fallback |

---

## 0. Verification summary — what the review got right, wrong, and missed

Every claim in the source review was checked against the actual repo before planning.

### 0.1 The critical fact the review missed: `app.css` is orphaned

**No HTML page links `app.css`.** All five pages load exactly two stylesheets:

```
brand.css   (raw, hand-written: tokens + keyframes + full component layer)
style.css   (compiled Tailwind output, generated from app.css)
```

Evidence: `index.html:12-13`, `projects/*.html:9-10`, `gallery/gallery.html:9-10`. Grep for `app.css` in HTML returns zero hits.

Real build chain:

```
app.css  --(@import "tailwindcss"; @import "./brand.css")-->  [tailwindcss v4.3.2 CLI]  -->  style.css
```

Because `app.css` `@import`s `brand.css`, compiled `style.css` **also contains brand.css's rules**. So what ships is `brand.css` (raw) **plus** its recompiled copy inside `style.css` — every brand component and the Google Fonts `@import` ships **twice** to every visitor. The fix (D1) is to make Tailwind the single source and stop linking `brand.css` raw.

### 0.2 Claim-by-claim verdict

| # | Review claim | Verdict | Correction / nuance |
|---|---|---|---|
| 1 | brand.css & app.css have ~800+ duplicated lines | **CONFIRMED** | app.css lines 114–1144 (~900–1030 lines) re-declare brand.css selectors. But app.css is not the shipped file — see 0.1. |
| 1b | Duplicated selectors byte-identical | **PARTLY WRONG** | 3 blocks are *forked*: dark selectors (`html.dark` in brand.css vs `:root[data-theme="dark"]` in app.css) and the ring animation (`::before`+`brand-outline-orbit` vs `.ring`+`brand-ring-spin`). Can conflict in the cascade. |
| 1c | "Keep brand.css as just custom properties" | **NEEDS CARE** | brand.css uniquely owns `#theme-toggle`, `@property --brand-orbit-angle`, all 17 `@keyframes`, and reduced-motion blocks — relocate, don't delete. |
| 2 | No package.json | **CONFIRMED** | `package.json` + `package-lock.json` both absent, yet `node_modules/@tailwindcss/cli` + Tailwind **v4.3.2** installed. LOGBOOK 042/043 claim a package.json/npm scripts existed; **not true in current state.** |
| 2b | Font `@import` appears twice | **CONFIRMED** | `brand.css:6` and `app.css:1`, identical URL. |
| 2c | Font URL lacks `&display=swap` (FOIT) | **REFUTED** | Both URLs already end in `&display=swap`. No FOIT fix needed. (Render-blocking `@import` is still a minor perf issue.) |
| 3 | Nav/footer/toggle/social SVGs copied into all 5 pages | **CONFIRMED** | 5/5 each. Drift: brand-page nav logo missing `<picture>`; footer `id="contact"` only on index; `robots`/`X-UA-Compatible` only on index; bubbles-div ordering differs. |
| 3b | ~180-line inline `<style>` in brand page | **CONFIRMED** | ~176 lines (`brand-avery-ember-day.html:14-191`). Also `history-of-mistrust.html` ~363 inline CSS **plus ~260 inline JS**; `patriots-low-thirds.html` ~114 inline CSS. |
| 4 | Inconsistent theme targeting (3 patterns) | **CONFIRMED** | `:root[data-theme]`, `html.dark`, `:root:not([data-theme="dark"])` coexist. JS (`Script.js:25,27,29`) sets BOTH `data-theme` and `.dark`; inline pre-paint scripts set only `data-theme` → `html.dark`-only rules can FOUC before Script.js runs. |
| 5 | Script.js var/no-defer/mixed/global | **CONFIRMED** | 12 `var`, 0 const/let; loaded WITHOUT defer (`index.html:176`) while bubbles.js has defer (`:177`); 5 concerns; global scope. |
| 6 | Missing OG/Twitter/canonical/theme-color meta | **CONFIRMED** | All absent on all pages. `meta description` present only on `index.html:8`. |
| 7 | No responsive images; PNG logos where SVG exists | **CONFIRMED** | 0 `srcset`, 0 `sizes`; `<picture>` wrappers have no `<source>`; brand page uses 6 `bubbleLogo-*.png` although `.svg` twins exist for each. |
| 8 | Security headers incomplete | **CONFIRMED** | `netlify.toml` has X-Frame-Options, X-Content-Type-Options, Referrer-Policy. Missing CSP, Permissions-Policy, HSTS. |
| — | Hardcoded colors `.brand-pill-ir`/`.brand-spectrum-bar` | **CONFIRMED** | `brand.css:911`, `brand.css:1132-1133`; `rgba(199,125,255,…)` appears 63×. Base tokens exist but no *alpha* tokens — tokenizing needs `color-mix()` or new alpha vars. |
| — | Accessibility: missing skip link | **REFUTED** | Skip link present on all 5 pages, targets `#main`, `<main id="main">` exists. Escape-closes-submenu works. Real gaps: no submenu focus trap; no `aria-expanded`; `<picture>` has no benefit. |

### 0.3 Two latent bugs found (not in the review)

1. **`@keyframes brand-ring-spin` undefined in source.** Referenced at `app.css:918,1018`, defined nowhere in `brand.css`/`app.css` — only exists in compiled `style.css:2185`. Any clean rebuild must define it in source or the ring animation silently dies.
2. **`style.css` is git-tracked AND listed in `.gitignore`.** Git keeps tracking already-committed files, so it still ships, but `netlify.toml` has **no `[build] command`** (the LOGBOOK-claimed `npm run build:css` is not present). Net: the site depends on a **manually committed, hand-rebuilt `style.css`** — stale-CSS risk whenever someone edits source and forgets to rebuild+commit.

### 0.4 Framework gate now resolved

`TODO.md` recorded a pending framework decision blocking structural refactors. **Resolved: Astro (D2).** This unblocks Stage 2. The `⚠️ Framework Decision Pending` section in `TODO.md` should be updated to reflect the decision when implementation begins.

---

## 1. Goal

Eliminate the CSS double-ship and duplication, establish a tracked/reproducible build, unify theme targeting to one convention, fix real accessibility/metadata/security gaps, and evolve the site into an Astro monorepo whose **brand system is a portable, versionable package** (tokens + Tailwind preset + component classes + Web Components) reusable in future app-like projects — done incrementally so the live site stays shippable throughout.

## 2. Non-goals

- Publishing the design system to npm now (built to `dist/`, consumed via workspace; publish later).

## 2a. Human-decision flags (confirm before implementation)

1. **CSP strictness vs. FOUC tradeoff (Phase 6c).** Using a CSP hash locks the inline pre-paint theme script's content; any change requires hash recomputation. Acceptable maintenance cost, or prefer an external script with `blocking="render"` (limited browser support)?
2. **`<brand-bubbles>` exclusion API (Phase 5B).** Pick one: attribute-based selectors (e.g., `exclude=".nav,.footer"`, simple to parse) or slot-based (arbitrary DOM elements, more flexible). Decision needed before Stage 2 begins.
3. **Brand logo theme handling.** Currently `Script.js` swaps logo `src` between `bubbleLogo-black.svg` and `bubbleLogo-white.svg` on toggle. Switch to CSS `filter: invert(1)` on the logo (eliminates JS fragility) or keep the JS src-swap?
4. **Node.js version for Netlify.** Confirm selected version (≥20) matches what Tailwind v4.3.2 requires.
5. **History of Mistrust slideshow scope.** Its ~260 lines of inline JS become a page-specific Astro component script (not a reusable component). Confirm this is acceptable.
- Rewriting the bubble physics math (reuse `scripts/bubbles.js` logic inside `<brand-bubbles>`).
- Redesigning visuals — output should be visually unchanged except intentional theme-default behavior.
- Making the nav a generic/configurable component (nav stays site-local).

---

## 3. STAGE 1 — Harden the current vanilla site (keeps it shippable)

Operates on the existing files at repo root. Each phase independently verifiable; site remains deployable after each.

### Phase 1 — CSS de-duplication + portable-layer restructure  *(highest impact)*

Make Tailwind the single source (D1) and pre-shape the CSS into the three layers that Stage 2 will lift into `packages/brand-system/`.

1. Split source CSS into clear layers (still consumed by the Tailwind build for now):
   - **Tier 1 tokens** — the `:root` custom-property blocks (dark `brand.css:111-182`, light `185-229`, plus the single simplified `prefers-color-scheme` fallback per D8) → a dedicated tokens section/file.
   - **Tier 2 Tailwind preset** — the `@theme inline` mapping (`app.css:7-36`) → its own importable file.
   - **Tier 3 component classes** — `.brand-*` component rules → one deduplicated set.
   Audit the `@source` directive (`app.css:5` currently `@source "."`) after restructuring to ensure Tailwind's JIT compiler still scans all HTML files.
2. Relocate the unique-to-brand.css pieces so nothing is lost: all 17 `@keyframes` (`brand.css:15-108`), `@property --brand-orbit-angle`, `#theme-toggle`, reduced-motion blocks. **Explicitly add `@keyframes brand-ring-spin`** (fixes 0.3.1).
3. Delete the forked/duplicated component copies so there is exactly **one** definition per selector; resolve `html.dark` vs `:root[data-theme="dark"]` forks toward `[data-theme]` (feeds Phase 3).
4. Remove the duplicate font `@import` (keep one).
5. **(Must happen AFTER steps 2-4.)** Pages stop linking `brand.css`; link only compiled `style.css`. The safest order: build the new CSS structure first, verify via visual diff with both stylesheets still linked, then remove the `brand.css` link.
6. Rebuild `style.css`; verify `brand-ring-spin` is defined in source and present in compiled output. Visual diff at 4 breakpoints × 2 themes; explicitly check bubble elements (`.brand-bubble`, `.brand-hero-blob`) render identically, hero blobs retain border-radius morphing, and global bubbles retain physics.

**Files:** `app.css`, `brand.css`, `style.css` (rebuilt), all 5 HTML `<link>` tags.
**Verify:** one definition per major selector in shipped CSS; `brand-ring-spin` defined in source AND present in compiled output; page CSS byte-size drops; screenshots at 360/768/1024/1440 × light/dark show no regression; bubble rendering explicitly checked.
**Sequencing:** foundational — do first.

### Phase 2 — Reproducible, tracked build

1. Create root `package.json` (this becomes the monorepo root in Stage 2) with pinned `tailwindcss`/`@tailwindcss/cli` (v4.3.2) and scripts `build:css` / `watch:css` (`tailwindcss -i app.css -o style.css --minify`).
2. Generate `package-lock.json` (`npm install`). Confirm `node_modules/` remains gitignored (already in `.gitignore:6`).
3. Pin Node.js version ≥20 for Netlify (Tailwind v4.3.2 requirement): add `NODE_VERSION = "20"` to `netlify.toml [build.environment]` (or an `.nvmrc` file). Resolve the tracked-but-ignored `style.css` contradiction (0.3.2): add `command = "npm run build:css"` to `netlify.toml [build]`. Keep `style.css` gitignored (build on deploy). If the Netlify build fails, temporarily commit `style.css` as a stopgap (remove from `.gitignore`, commit, deploy), debug the build offline, then restore the gitignore entry once the build succeeds.
4. `git rm --cached node_modules/.package-lock.json` (stray tracked file from TODO handoff).

**Files:** `package.json`, `package-lock.json` (new), `netlify.toml`, `.gitignore`.
**Verify:** clean `npm ci && npm run build:css` reproduces `style.css`; Netlify build log shows CSS built.

### Phase 3 — Unify theme targeting (implements D8)

1. Standardize on `:root[data-theme="dark"]` / `:root[data-theme="light"]`.
2. Replace every `html.dark` selector (`brand.css:847,916,1013,1016,1034,1147`) with `:root[data-theme="dark"]`.
3. Keep ONE simplified `:root:not([data-theme="dark"])` `@media (prefers-color-scheme: light)` fallback for first-visit system-preference (D8).
4. Update the inline pre-paint script so first visit resolves theme as: stored `localStorage.theme` → else OS `prefers-color-scheme` → set `data-theme` accordingly (no `.dark` class), matching first paint to avoid FOUC. (This logic is the seed for the `<brand-theme-toggle>` Web Component in Stage 2.)
5. In `Script.js` `applyTheme`, stop toggling the `.dark` class once grep confirms no rule depends on it.

**Files:** source CSS, `Script.js`, rebuilt `style.css`, inline scripts in all 5 heads.
**Verify:** zero `html.dark` / `.dark` in shipped CSS, `Script.js`, and all inline `<script>` blocks across all HTML files; toggle works; no console errors; no theme flash on reload in either mode; system-preference honored on a fresh profile.

### Phase 4 — Minimal `Script.js` cleanup (avoid double-work)

Only touch the bits that stay site-local; **do not** rewrite theme-toggle/nav here — those become Web Components / Astro components in Stage 2.

1. Convert `var` → `const`/`let` in the parts that remain (return-to-top, scroll-spy, smooth scroll).
2. Add `defer` to every `<script src="Script.js">` (all 5 pages); preserve load-order with bubbles.js.

**Files:** `Script.js`, all 5 HTML `<script>` tags.
**Verify:** no `var` remain in touched code; scroll-to-top, scroll-spy, smooth scroll work; zero console errors.

### Phase 6 — Metadata, images, security  *(independent, parallelizable within Stage 1; numbered to avoid collision with Stage 2 Phase 5)*

**6a. Metadata:** add `meta description` to the 4 pages missing it; add Open Graph (`og:title/description/image/url/type`), Twitter Card (`summary_large_image`), `rel="canonical"` (from `averyemberday.com`/CNAME), `<meta name="theme-color">` (dark+light via `media`). Normalize per-page drift (drop obsolete `X-UA-Compatible`; make `robots` consistent). Add one 1200×630 OG image under `images/`.
**6b. Images:** add `srcset`/`sizes` to the largest images (project thumbnails, gallery, storyboard); convert brand-page logo swatches from `.png` to existing `.svg` twins; give `<picture>` real `<source>` children or replace with plain `<img>`.
**6c. Security (`netlify.toml`):** add `Content-Security-Policy` (self + `fonts.googleapis.com`/`fonts.gstatic.com` + `sha256-...` hash for the inline pre-paint theme script), `Permissions-Policy` (lock camera/mic/geolocation), `Strict-Transport-Security`. Add `preconnect` to font hosts.
> **CSP hash decision required:** The pre-paint theme script is intentionally synchronous inline to prevent FOUC. Moving it to an external deferred file reintroduces the flash. On Netlify static headers, nonces are impractical. Use a CSP hash (`'sha256-...'`) — document that any change to the inline script requires recomputing the hash. Alternative (limited browser support): external file with `blocking="render"`.

**Files:** all 5 HTML heads, `netlify.toml`, `images/` (OG image).
**Verify:** OG/Twitter validate; no CSP console violations (fonts + theme script load); Lighthouse SEO/best-practices improve; images render at all breakpoints.

> Note: Phase 4 and Phase 6 are file-disjoint from Phase 1 and each other and may proceed in parallel; Phase 3 must land after Phase 1 settles the single CSS source.

---

## 4. STAGE 2 — Astro monorepo + portable design system + Web Components

Begin only after Stage 1 is verified and the site is stable. Adopts D2/D5/D6/D7.

### Phase 5A — Monorepo scaffold
1. Introduce npm workspaces at repo root: `workspaces: ["apps/*", "packages/*"]`.
2. Create `packages/brand-system/` with its own `package.json` (name: `@averyemberday/brand-system` or `brand-system` if scoping deferred), `src/` (tokens CSS, Tailwind preset, component classes, Web Components), and build to `dist/` via Vite library mode. The package exports three entry points:
   - CSS: `./dist/style.css` (all tiered stylesheets combined)
   - Named JS: `./dist/brand-system.js` (custom element classes for manual `customElements.define`)
   - Auto-register: `./dist/brand-system.auto.js` (side-effect entrypoint that self-registers)
   Document these in `package.json` `exports` field.
3. Create `apps/site/` for the Astro app.

### Phase 5B — Extract the design system into `packages/brand-system/`
1. Move the Stage-1 Tier 1/2/3 CSS layers into `packages/brand-system/src/` (`tokens.css`, `tailwind-preset.css` / `@theme`, `components.css`). Keep them framework-agnostic.
2. Author the two Web Components (D7):
   - **`<brand-theme-toggle>`** — custom element wrapping the Phase 3 theme logic (stored preference → OS fallback → sets `data-theme` on `:root`; dispatches a `themechange` event). Reusable in any project.
   - **`<brand-bubbles>`** — custom element wrapping the `scripts/bubbles.js` physics. **Make exclusion zones configurable via attributes/slots** (current code hardcodes site selectors like `#work h2`, `.project-card`); the site passes its own exclusions so the component stays generic. (Risk item — see §6.)
3. Build `packages/brand-system` to `dist/`.

### Phase 5C — Migrate pages to Astro (`apps/site/`)
1. Convert the 5 pages `.html → .astro`. Create shared Astro components: `Nav.astro`, `Footer.astro`, `BaseHead.astro` (centralizes all Phase 6 meta, killing per-page drift), plus a base `Layout.astro`. Move or symlink static assets (`images/`, `scripts/`, `CNAME`) into `apps/site/public/` so Astro serves them at the same paths; verify all `/images/...` references resolve.
2. `Nav.astro` uses `<brand-theme-toggle>`; the page background uses `<brand-bubbles>` with site-specific exclusion attributes.
3. Extract the repeated Email/LinkedIn/GitHub inline SVGs into a shared component or `<use>` sprite (one source).
4. Move site-local interactive logic into Astro components + scoped scripts: return-to-top, nav submenu (add the missing **focus trap + `aria-expanded`** here — the real a11y gap), and the mistrust **slideshow/lightbox** (its ~260 inline JS becomes a scoped Astro component script).
5. Consolidate the remaining inline `<style>` blocks (brand ~176, patriots ~114, mistrust ~363) into design-system component classes or scoped Astro styles.
6. `apps/site` consumes `@<scope>/brand-system` as a workspace dependency and its Tailwind preset.

### Phase 5D — Deploy config for the monorepo
1. Update `netlify.toml`: set `base`/build to `apps/site`, `command` to build the workspace (`npm run build` at root or Astro build in `apps/site`), publish Astro's `dist/`.
2. Keep `CNAME`/domain wiring intact; verify `averyemberday.com` still resolves after the layout move.

**Verify (Stage 2):** every page renders identical nav/footer/meta from single sources; `<brand-theme-toggle>` and `<brand-bubbles>` work on the Astro site AND in a throwaway plain-HTML test page (proves portability); submenu keyboard/focus-trap/`aria-expanded` pass; no inline `<style>` remains in project pages; Astro build succeeds; Netlify deploy from `apps/site` serves the site; visual parity vs Stage 1 at 4 breakpoints × 2 themes.

---

## 5. Parallel tracks (execution shape)

| Track | Scope | Depends on | Owner role |
|---|---|---|---|
| S1-T1 CSS single-source + layers | `app.css`, `brand.css`, `style.css`, HTML `<link>`s | none (first) | main agent |
| S1-T2 Build/package | `package.json`, lockfile, `netlify.toml`, `.gitignore` | S1-T1 | main agent |
| S1-T3 Theme unify | CSS selectors, `Script.js`, inline scripts | S1-T1 | pro nano-agent draft, main verifies |
| S1-T4 Script.js cleanup | `Script.js`, HTML `<script>`s | none | flash nano-agent, main verifies |
| S1-T5 Meta/images/security | HTML heads, `netlify.toml`, `images/` | none | flash nano-agent per-page, main verifies |
| S2-T6 Monorepo + package | `packages/brand-system/`, root workspace | Stage 1 done | main agent + native subagent (bundling) |
| S2-T7 Astro migration | `apps/site/`, components | S2-T6 | main agent + native subagent |

Sequential gates: S1-T1 → (S1-T2, S1-T3). All of Stage 2 gated on Stage 1 completion. S1-T4/T5 independent — safe to parallelize with S1-T1 (disjoint files), **except S1-T5 must not modify `netlify.toml` until S1-T2's build command is committed** (both write to `netlify.toml`). Split S1-T5 into `6c-meta-images` (no dependency) and `6c-security` (depends on S1-T2). Execution fan-out stays within nano-agent queue limits regardless of the table.

## 6. Risks

- **Visual regression from CSS merge (S1-T1).** Screenshot diff 4×2 before/after; forked ring/dark rules are the highest-risk merge points.
- **`brand-ring-spin` undefined (0.3.1)** The ring animation is currently dead in all environments (browsers skip undefined `@keyframes` silently). Phase 1 must define it in source so it works for the first time; verify it appears in compiled output.
- **CSP breaking the inline theme script (6c).** Move that script to an external deferred file or use a hash; test console for violations.
- **Netlify build failing** (Phase 2 / 5D). Verify `npm ci && npm run build:css` locally first; keep committing `style.css` as fallback in Stage 1.
- **`<brand-bubbles>` generality (5B).** Current exclusion zones hardcode site selectors; must become attributes/config or the component isn't reusable. Verify with the plain-HTML portability test.
- **Monorepo move breaking deploy/domain (5D).** Verify `averyemberday.com` resolves post-move; update `base`/publish dir carefully; test on a Netlify deploy preview before promoting.
- **Web Component bundling toolchain (5A/5B).** New build tool for the package; keep it minimal (library-mode Vite/tsup) and pin versions.
- **Dirty worktree is user-owned.** Build on top of the in-progress hero-bubble changes; do not revert.

## 7. Overall verification checklist

- Visual: screenshots of `index` + one project page + gallery at 360/768/1024/1440 × light/dark, before vs after each CSS-affecting phase; parity maintained. Optional automation: write a Playwright test capturing all 5 pages × 4 breakpoints × 2 themes = 40 screenshots and diff against baselines; commit baselines after each verified phase (leverages existing `tests/` and `output/playwright/` infrastructure).
- Build: clean `npm ci && npm run build:css` (Stage 1) and Astro build (Stage 2) succeed reproducibly.
- Behavior: scroll-to-top, theme toggle (no flash, honors OS on first visit), scroll-spy, submenu (mouse + keyboard + Escape + focus-trap + `aria-expanded`), smooth scroll, bubbles physics.
- CSS hygiene: one definition per major selector shipped; zero `html.dark`; `brand-ring-spin` defined.
- Portability: `<brand-theme-toggle>` + `<brand-bubbles>` function in a standalone plain-HTML page importing only `packages/brand-system/dist`.
- Meta/security: OG/Twitter/canonical/theme-color on all pages; CSP/Permissions-Policy/HSTS in `netlify.toml`; no CSP console violations.
- Deploy: Netlify builds and serves from `apps/site`; `averyemberday.com` resolves.

## 8. Documentation & handoff

- Update `LOGBOOK.md` with an entry per executed phase.
- Update `TODO.md`: resolve the "untrack node_modules/.package-lock.json" item; update the `⚠️ Framework Decision Pending` section to record the Astro decision; record Stage 2 as the active plan.
- No commits/pushes/deploys without explicit user instruction (shxdowflow default).

## 9. Suggested execution order

1. Stage 1 Phase 1 (S1-T1) → verify visually.
2. Stage 1 Phase 2 (S1-T2) → verify build reproducibility.
3. Stage 1 Phases 3, 4, 6 (file-disjoint) → verify each.
4. Confirm site stable + deployable → begin Stage 2.
5. Stage 2 Phases 5A → 5B → 5C → 5D, verifying at each step (esp. portability test after 5B, deploy preview before 5D promotion).
6. Final review (pro nano-agent + main-agent diff review), LOGBOOK/TODO update, handoff.
