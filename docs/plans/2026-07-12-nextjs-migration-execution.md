# Next.js Migration — Execution Plan (Pilot)

**Date:** 2026-07-12  
**Scope:** Scaffold Next.js + TypeScript + Tailwind v4, port `bubbles.js` verbatim, convert `patriots-low-thirds.html` as pilot page.  
**Branch:** `portfoliowebsite` (all changes committed here per AGENTS.md)  
**Base plan:** `docs/plans/2026-07-12-nextjs-migration.md`

---

## Goal

Create a working Next.js App Router project (static export) co-located in the existing repo, with one migrated page (`/projects/patriots-low-thirds`) that renders identically to the current vanilla HTML version, including the bubble physics engine, theme toggle, and brand design system.

The legacy HTML site remains untouched and fully functional during this pilot. Next.js outputs to `out/`; Netlify still publishes `.` (legacy) until full cutover.

---

## Parallel Tracks

### Track A — Scaffold & Config (sequential foundation)
**Owner:** Main agent  
**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `app/globals.css`  
**Dependencies:** None  
**Steps:**
1. Add Next.js 15 + React + TypeScript + Tailwind v4 dependencies to `package.json`
2. `npm install` to generate lockfile
3. Create `next.config.ts` with `output: 'export'`, `distDir: 'out'`, asset prefix handling for static paths
4. Create `tsconfig.json` (Next.js strict preset)
5. Create `postcss.config.mjs` with `@tailwindcss/postcss`
6. Port `app.css` → `app/globals.css`: `@import "tailwindcss"`, import brand.css layer, import tailwind-preset.css, `@custom-variant dark` keyed to `[data-theme="dark"]`
7. Ensure fonts are loaded (Google Fonts via `@import` in globals.css)

### Track B — Shared Components (depends on Track A for build)
**Owner:** Main agent  
**Files:** `app/components/Nav.tsx`, `Footer.tsx`, `SkipLink.tsx`, `ReturnToTop.tsx`, `ThemeProvider.tsx`, `BubblePhysics.tsx`  
**Dependencies:** Track A  
**Steps:**
1. **`ThemeProvider.tsx`** (`'use client'`): loads `/scripts/theme-init.js` via `<Script strategy="beforeInteractive">`, manages theme state, toggles `data-theme` on `<html>`, provides context for theme toggle
2. **`Nav.tsx`** (`'use client'`): Renders `.brand-nav` markup. Logo with `Link`, nav links with `Link`, theme toggle button. Active page detection via `usePathname()`.
3. **`Footer.tsx`**: Renders `.brand-footer` markup. Static — no client directive needed.
4. **`SkipLink.tsx`**: Static skip-to-content link.
5. **`ReturnToTop.tsx`** (`'use client'`): Scroll listener + scroll-to-top behavior (port from `Script.js`).
6. **`BubblePhysics.tsx`** (`'use client'`): The critical verbatim port.
   - Renders `<div className="brand-bubbles-global" aria-hidden="true" data-exclusions="..." />`
   - In `useEffect`, dynamically imports `/scripts/bubbles.js` and calls its init function
   - On cleanup, calls `window.__bubbleEngine.destroy()`
   - **The `bubbles.js` file is copied verbatim to `public/scripts/bubbles.js`** — zero modifications to the physics logic

### Track C — Pilot Page (depends on Track B)
**Owner:** Main agent  
**Files:** `app/projects/patriots-low-thirds/page.tsx`, `app/layout.tsx`  
**Dependencies:** Track A + Track B  
**Steps:**
1. **`app/layout.tsx`**: Root layout with `<html lang="en">`, metadata (title, description, OG, canonical), imports `globals.css`, wraps children with `ThemeProvider`, renders `SkipLink`, `Nav`, `Footer`, `ReturnToTop`
2. **`app/projects/patriots-low-thirds/page.tsx`**: Replicates the entire `<main>` content from `projects/patriots-low-thirds.html` using JSX + Tailwind utility classes. Includes `BubblePhysics` component with correct `data-exclusions`.

### Track D — CSP & Security Headers (depends on Track A)
**Owner:** Main agent  
**Files:** `next.config.ts`  
**Dependencies:** Track A  
**Steps:**
1. Move theme-init inline script to `public/scripts/theme-init.js` (external file, stable path)
2. Configure CSP in `next.config.ts` `headers`:
   - `script-src 'self'` — no hashes needed because all scripts are external files (Next.js chunks + our static assets)
   - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` — `'unsafe-inline'` needed for Tailwind's generated utility styles (standard for Tailwind)
   - Carry over all other directives from `netlify.toml` unchanged
3. Note: `next.config.ts` headers only apply during `next dev` and when served via a Node server. For static export, these headers need to be in `netlify.toml` or `_headers` file. We will generate a `_headers` file in `out/` or update `netlify.toml` with conditional headers for the `out/` directory. **For this pilot, we write the headers into `_headers` in `public/` so they are copied to `out/` during build.**

### Track E — Verification (depends on Track C)
**Owner:** Main agent  
**Files:** N/A (commands only)  
**Dependencies:** All tracks  
**Steps:**
1. `npm run next:build` (or `next build`) — must complete with zero errors
2. Inspect `out/projects/patriots-low-thirds/index.html` — must contain:
   - Correct nav, footer, main content
   - External `<script src="/_next/static/...">` for Next.js bundles
   - External `<script src="/scripts/theme-init.js">` before interactive
   - External `<script src="/scripts/bubbles.js">` deferred
   - Bubble container div
   - No inline `<script>` blocks (CSP clean)
3. `npx serve out` — manual browser check at 360/768/1024/1440px, both themes
4. Verify bubbles animate, mouse repulsion works, theme toggles
5. Check browser console for zero CSP violations

---

## Key Design Decisions

### bubbles.js port strategy
- **File is copied verbatim** to `public/scripts/bubbles.js`. No edits.
- **Initialization is controlled** by `BubblePhysics.tsx` via dynamic import in `useEffect`.
- The engine auto-inits on `DOMContentLoaded` when loaded as a deferred script. In the React context, we load it dynamically after mount to ensure the container exists.
- `window.__bubbleEngine.destroy()` is called on unmount to clean up listeners and animation frames.

### Theme init strategy
- Extract the inline theme script from `<head>` to `public/scripts/theme-init.js`.
- Load via Next.js `<Script strategy="beforeInteractive">` in `layout.tsx`.
- This eliminates inline scripts entirely, allowing `script-src 'self'` CSP.
- The script must still run before render to prevent FOUC. `beforeInteractive` achieves this.

### Tailwind v4 in Next.js
- Next.js 15 supports Tailwind v4 natively via PostCSS.
- Configuration is CSS-based (`globals.css`) not JS-based (`tailwind.config.ts`).
- The `@theme inline` block from `src/css/tailwind-preset.css` is imported directly.
- The `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` is preserved.

### Path handling
- In static export, `next/link` `href` values must work without a server.
- For the pilot, paths are simple: `/` for home, `/projects/patriots-low-thirds` for the pilot page.
- `assetPrefix` is not set (site deploys to domain root).
- Images referenced in JSX use `next/image` or standard `<img>` with paths relative to `public/`.

### Coexistence with legacy site
- Legacy HTML files (`index.html`, `projects/*.html`, `gallery/gallery.html`) remain at repo root.
- Next.js source lives in `app/`, `public/`, config files at root.
- Next.js build output goes to `out/` (gitignored? No — for Netlify deploy we'd want it committed or built at deploy time. But current Netlify has no build command. For the pilot, `out/` is gitignored; only source is committed.)
- **Actually:** since Netlify currently has `publish = "."` and no build command, the Next.js `out/` directory won't be deployed until we update `netlify.toml`. This is fine for the pilot.

---

## Files to Touch

### New files
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx` (placeholder — redirects or minimal content)
- `app/projects/patriots-low-thirds/page.tsx`
- `app/components/Nav.tsx`
- `app/components/Footer.tsx`
- `app/components/SkipLink.tsx`
- `app/components/ReturnToTop.tsx`
- `app/components/ThemeProvider.tsx`
- `app/components/BubblePhysics.tsx`
- `public/scripts/theme-init.js`
- `public/scripts/bubbles.js` (copy from `scripts/bubbles.js`)
- `public/_headers` (CSP headers for static export)

### Modified files
- `package.json` — add Next.js, React, TypeScript, PostCSS dependencies
- `.gitignore` — add `/.next/`, `/out/` if not present

### Unaffected (legacy site)
- All existing `.html` files at root and in subdirectories
- `style.css` (legacy compiled CSS)
- `app.css` (legacy Tailwind entry)
- `brand.css`
- `src/css/*.css`
- `scripts/bubbles.js` (original remains)
- `Script.js`
- `netlify.toml` (legacy deploy config)
- `tests/` (Playwright baselines for legacy site)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Bubble physics regression** | File copied verbatim; init controlled by React lifecycle but physics logic untouched. Manual verification of mouse repulsion, exclusion zones, scroll-stir. |
| **CSP breakage with static export** | Zero inline scripts (theme-init externalized). `script-src 'self'` only. `_headers` file carries directives for Netlify static deploy. |
| **Tailwind v4 dark mode mismatch** | `@custom-variant dark` preserved in `globals.css`. Verified against `[data-theme="dark"]` attribute. |
| **Font loading FOUC** | Google Fonts `@import` in `globals.css` (render-blocking but standard). Theme-init is `beforeInteractive`. |
| **Path resolution in static export** | `next.config.ts` uses `trailingSlash: true` for clean static paths. Links use `next/link` with correct hrefs. |
| **Next.js build fails** | Step-by-step: scaffold first, verify `next dev`, then add pages, then `next build`. Fix errors iteratively. |

---

## Verification Checklist

- [ ] `npm install` completes without peer dependency warnings
- [ ] `npx next dev` starts dev server on :3000
- [ ] `next build` completes with zero errors and zero warnings
- [ ] `out/projects/patriots-low-thirds/index.html` exists and contains expected markup
- [ ] No inline `<script>` tags in generated HTML (CSP-safe)
- [ ] Manual browse of `/projects/patriots-low-thirds` shows correct layout, nav, footer
- [ ] Theme toggle switches light/dark without FOUC
- [ ] Bubbles animate, mouse repulsion works, exclusion zones respected
- [ ] No console errors or CSP violations
- [ ] Responsive at 360/768/1024/1440px

---

## Next Step After Pilot

If pilot passes verification, proceed with remaining pages in order: `index.html` (home), `gallery/gallery.html`, `projects/brand-avery-ember-day.html`, then `projects/history-of-mistrust.html` last. Update `netlify.toml` to build Next.js and publish `out/` only when all pages are migrated and QA passes.
