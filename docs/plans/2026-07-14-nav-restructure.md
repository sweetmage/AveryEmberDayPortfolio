# Navigation Restructure — Home / Projects / Gallery / Contact

**Date:** 2026-07-14
**Source:** User request (2026-07-14): top nav gets Home, Projects, Gallery, Contact; landing page drops the Work section; Gallery unchanged (tag system stays a later plan); new Projects page switches between projects with tabs on one page.
**Status:** Implemented 2026-07-14 (LOGBOOK Entry 075, commits `94664d6` → `7bcc45a`; wrap-up in Entry 076). Deploy-gated leftovers: Netlify form-detection opt-in (UI toggle) and hash-fragment redirect verification post-deploy.

## Goal

Replace the current anchor-based nav (Work / About on the landing page) with a four-item page nav:

| Nav item | Route | State today |
|---|---|---|
| Home | `/` | Landing = hero + Work grid + About. Work grid goes away; hero + About remain. |
| Projects | `/projects/` (new) | Today two standalone routes: `/projects/brand-avery-ember-day/`, `/projects/history-of-mistrust/`. Becomes one tabbed page. |
| Gallery | `/gallery/` | Unchanged (srcset work from Entry 073 stays as-is; tag system remains a future plan). |
| Contact | `/contact/` (new) | Doesn't exist. Netlify Forms contact form + the footer's email/LinkedIn/GitHub links (user-confirmed 2026-07-14). |

Scope is the Next.js app (`app/`) — the shipping surface. Legacy root `index.html` and friends are frozen pre-migration artifacts and stay untouched.

## Decisions already made

- **Contact page = form + links** (user choice). Netlify Forms: plain HTML `<form name="contact" method="POST" data-netlify="true">` with a hidden `form-name` input; Netlify's post-build HTML processing detects it in the published `out/` directory — but detection is opt-in in the Netlify UI (see Track C step 3). CSP `form-action 'self'` already permits the POST.
- **No "coming soon" tab** for Motion Graphics / Patriots (user choice). Tabs are Brand + History of Mistrust; Patriots slots in as a third tab when its render lands (existing TODO thread).
- **All tab panels stay mounted; visibility toggles via the `hidden` attribute.** The mistrust slideshow is a classic script (`public/scripts/history-of-mistrust-slideshow.js`, IIFE) appended on mount by `SlideshowScript.tsx`. Re-executing it on tab remount would rebuild lightbox panes into the still-present `#lightbox` DOM and re-bind its element listeners — duplicated slides and double-firing handlers. Keeping panels mounted means the script runs exactly once against DOM that never unmounts. (Verified 2026-07-14: the script builds DOM at init but measures lazily — `clientWidth`/`getBoundingClientRect` only inside interaction handlers, line 158 — and binds only element-scoped listeners, so initializing while the panel is `hidden` is safe.)
- **Old project URLs get Netlify 301 redirects**, not duplicate standalone pages. External links (the mistrust piece circulated as an Instagram carousel) must not 404.
- **Tab deep-linking via URL hash** (`/projects/#brand`, `/projects/#history-of-mistrust`), read on mount, written with `history.replaceState` on tab switch (no scroll, no `hashchange`). Hash works on a static export with no extra routes; it also gives the redirects a target. **Panel `id`s must differ from the hash tokens** (e.g. `panel-brand`) or the browser races a native anchor scroll toward a still-`hidden` panel on deep-link load.
- **Mobile nav = inline links, icon-only logo** (user choice 2026-07-14): all four links stay inline at every width; below ~480 px the logo drops the "Avery Ember Day" text and keeps just the bubble icon. No hamburger/drawer returns (it was deliberately removed 2026-07-09).
- **`#lightbox` renders once at the projects-page level, outside both panels.** It is currently a *sibling* of `<main>` in the mistrust page (`history-of-mistrust/page.tsx:278-300`), not inside it — so "extract the `<main>` body" would silently orphan it. Additionally `ProjectTabs` must close the lightbox (or at minimum reset `document.body.style.overflow`) on tab switch: `openLightbox` locks body scroll (`history-of-mistrust-slideshow.js:106`), and hiding the overlay via a tab switch would otherwise leave scroll permanently locked with the close button unreachable.
- **CSS ground truth:** the Next app loads only root `brand.css` + `src/css/site.css` (via `app/globals.css`). `src/css/components.css` is on disk but **unimported/dead** — never cite it for live behavior, never "fix" it (plan-review finding 2026-07-14; earlier sweep drafts had done exactly that).

## Tracks

### Track A — Nav, Footer, landing page (independent)

**Files:** `app/components/Nav.tsx`, `app/components/Footer.tsx`, `app/page.tsx`, `app/gallery/page.tsx`

1. `Nav.tsx`: `navLinks` → `[{ '/', 'Home' }, { '/projects/', 'Projects' }, { '/gallery/', 'Gallery' }, { '/contact/', 'Contact' }]`. Normalize `isActive` by stripping trailing slashes on both sides — the current `pathname === resolved + '/'` branch degenerates to `'/projects//'` for trailing-slash hrefs, so highlighting would depend on the server's canonical-slash behavior (`/` does NOT match every path; that part is fine). Mobile: hide the logo's text below ~480 px (icon-only, per user decision) so four links fit inline; verify no wrap at 360 px in the screenshot gate.
2. `Footer.tsx`: footer links Work/About → Projects / Gallery / Contact (Home is the logo/credit; keep list parallel to nav otherwise).
3. `app/page.tsx`: delete the `#work` section (the whole Work grid incl. the hidden Motion Graphics placeholder card). Hero + spectrum bar + About remain. The About section keeps `id="about"` (harmless; no nav link points at it anymore).
4. `app/gallery/page.tsx`: back-link "← Back to work" (`href="/"`) → "← Home" or drop entirely now that the nav is global. Keep one — recommend relabeling to "← Home" for continuity, minimal diff.
5. Reference sweep (corrected after plan review 2026-07-14): `Nav.tsx:7-8` and `Footer.tsx:11,14` are the only `/#work` / `/#about` links. Back-links: `app/gallery/page.tsx:55` ("← Back to work", Track A relabels it) **and** both project pages carry "Back to Work" `project-back` links (`brand-avery-ember-day/page.tsx:79-93`, `history-of-mistrust/page.tsx:31-45`) — Track B strips those with the extraction. Live CSS (`brand.css` + `src/css/site.css` only): no `#work` or `.project-grid` rules exist there (those live in dead `components.css` — leave that file alone). One live legacy rule to delete in this track: `site.css:201-208` `#contact { display: grid; ... }` + `#contact p { text-align: center }` — it would silently re-layout any element that reuses that id.

**Risks:** removing the Work grid removes `bubble-exclude` cards from the landing — the bubble engine reads exclusion zones dynamically, so this is safe, but the landing's visual density drops; hero + About + footer is a short page. Verify it doesn't look empty at 1440 px (screenshot gate).

### Track B — Tabbed Projects page (the big one)

**Files:** `app/projects/page.tsx` (new), `app/projects/ProjectTabs.tsx` (new, client), `app/projects/BrandProject.tsx` (new), `app/projects/MistrustProject.tsx` (new), `app/projects/slideshow.css` (moved), delete `app/projects/brand-avery-ember-day/` and `app/projects/history-of-mistrust/` routes, `netlify.toml` (redirects)

1. Extract each current page's `<main>` body into a content component (`BrandProject`, `MistrustProject`) — JSX moves verbatim minus per-page `metadata`, the "Back to Work" back-links, and the `<main id="main">` wrapper (the new page owns one `<main>`). Watch the mistrust page's `#lightbox`: it sits *outside* `<main>` as a sibling (`history-of-mistrust/page.tsx:278-300`) and moves to the projects-page level, not into the panel. `slideshow.css` and `SlideshowScript` move up to the new projects page (script loads once for the page).
2. `app/projects/page.tsx` (server): one `metadata` export (title "Projects — Avery Ember Day", canonical `/projects/`), renders `<ProjectTabs>`.
3. `ProjectTabs.tsx` (client): accessible tabs — `role="tablist"`, `role="tab"` + `aria-selected` + `aria-controls`, panels `role="tabpanel"` + `hidden` when inactive, arrow-key navigation between tabs. Styling from the live `.brand-btn` / `.brand-btn-secondary` pill buttons (root `brand.css:892` region) with an active state; sticky-free simple bar under the page heading. On mount: read `location.hash` to pick the initial tab; on switch: `history.replaceState` the hash, close the lightbox / reset `document.body.style.overflow` (see Decisions), and use panel ids distinct from hash tokens (`panel-brand`, `panel-history-of-mistrust`). Unknown/no hash → Brand tab.
4. Both panels render at build time (static HTML contains both projects — good for SEO given the single route). Inactive panel `hidden`: lazy images inside won't fetch until revealed (no intersection), which is the desired behavior.
5. **Heading hierarchy:** each project body starts at `h1` today. New page gets one `h1` ("Projects" or visually-hidden), project titles demote to `h2` (cascade: their `h2`s → `h3`). The concrete hazard is the base `h2` rule at `site.css:150-161` (uppercase, letter-spacing, muted color, bottom border + padding): demoted titles must carry the same override set the existing `h2.section-title`s already use — `normal-case tracking-normal border-none p-0` plus their font/size/color utilities (pattern at `history-of-mistrust/page.tsx:53`). Verify demoted `h3`s against the base `h3` rule (`site.css:163-168`) the same way.
6. **Redirects** in `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/projects/brand-avery-ember-day/*"
     to = "/projects/#brand"
     status = 301
   [[redirects]]
     from = "/projects/history-of-mistrust/*"
     to = "/projects/#history-of-mistrust"
     status = 301
   ```
   Netlify redirect targets with fragments need a deploy-time verify (documented Netlify behavior is to pass them through, but confirm post-deploy; fallback: redirect to plain `/projects/`).
7. **Slideshow script check (verified low-risk):** the script measures only inside interaction handlers (line 158) and binds element-scoped listeners, so init-while-hidden is safe. During implementation, one manual check remains: open the lightbox from the mistrust tab after switching tabs a few times — confirm no duplicate panes and correct drag width.

**Risks:** losing per-project metadata/canonicals — accept, and add redirects so old canonical URLs 301 to the new page. `og-default.png` placeholder still pending (existing TODO item, unchanged). Lightbox placement/scroll-lock handled per the Decisions section (page-level `#lightbox`, close-on-tab-switch).

### Track C — Contact page (independent)

**Files:** `app/contact/page.tsx` (new), possibly `app/contact/ContactForm.tsx` (client, only if success-state handling needs JS)

1. Server page with metadata (canonical `/contact/`). Layout: heading, short invite line (reuse the About section's "reach me" tone — no jargon, voice per the site's copy), the three icon links from `Footer.tsx` (extract a shared `ConnectLinks` component or duplicate — prefer extracting since footer + contact must stay in sync), and the form.
2. Form: `name`, `email`, `message`, honeypot field (`netlify-honeypot`), hidden `form-name`, submit styled `.brand-btn brand-btn-primary`. Success handling: `action="/contact/thanks/"` → tiny static thanks page (`app/contact/thanks/page.tsx`) with a "back to home" link. No client JS needed; skip `ContactForm.tsx` unless styling demands it.
3. Netlify Forms detection scans the published `out/` HTML, **but detection is opt-in since late 2023**: someone must flip Site configuration → Forms → "Enable form detection" in the Netlify UI before the deploy, or the POST 404s despite correct markup. Add that as an explicit user-gated deploy step, then verify post-deploy that the form registers (deploy is user-gated as always). Do NOT give the contact section `id="contact"` — a live legacy grid rule (`site.css:201-208`, deleted in Track A) targets that id; the muted-h2 look comes free from the base `h2` rule regardless.

**Risks:** form spam (honeypot mitigates; Netlify free tier includes basic filtering); form detection not enabled at deploy time (explicit step above).

### Track D — Tests + verification (sequential, after A–C)

**Files:** `tests/visual-baseline.spec.js`, `tests/` smoke specs, `tests/baselines/*`

1. Update the spec's page list: `brand` + `mistrust` page entries → `projects` (default tab) and `projects-mistrust` (mistrust tab active — drive the tab click **before** the spec's eager-forcing/decode evaluate block at `visual-baseline.spec.js:47-64`, which filters by client rects and correctly ignores hidden-panel images). Add `contact`. Index baselines change (Work grid gone).
2. Re-baseline once, then visually inspect every changed baseline (wide + narrow, both themes) per the UI gate: filter bar/tab bar not wrapping at 360 px, no empty-looking landing at 1440 px, slideshow renders on the mistrust tab, form renders on contact.
3. `npm run build:next` — export succeeds; grep `out/` for the four nav links on every page, both project bodies in `out/projects/index.html`, `data-netlify` markup in `out/contact/index.html`.
4. `npm test` — full Playwright suite green (33+ after spec updates).
5. Console-error coverage must be **created, not extended**: the only existing smoke spec (`tests/smoke-interaction.spec.js`) targets `http://localhost:3000/` — the frozen *legacy* static site per `playwright.config.js` (the Next export serves on `:3001`). Write a new smoke spec against `:3001` covering `/`, `/projects/` (tab switch + lightbox open/close), `/gallery/`, `/contact/`, capturing `console`/`pageerror` throughout. Note: manual/spec checks of the slideshow run against the served `out/` build, never `next dev` — StrictMode double-appends the classic script in dev and duplicates lightbox panes (pre-existing, unchanged by this plan).

## Parallel tracks summary

| Track | Scope | Depends on | May run parallel |
|---|---|---|---|
| A — Nav/Footer/landing | `app/components/Nav.tsx`, `Footer.tsx`, `app/page.tsx`, `app/gallery/page.tsx` | — | Yes (with B, C) |
| B — Projects tabs | `app/projects/**`, `netlify.toml` | — | Yes (with A, C) |
| C — Contact | `app/contact/**`, shared `ConnectLinks` extraction touches `Footer.tsx` (coordinate with A) | — | Yes, except the small `Footer.tsx` overlap with A — do the extraction in whichever track runs first |
| D — Tests | `tests/**` | A, B, C | No (integration gate) |

Executor prompts per track follow the shxdowflow Helper Prompt Shapes; pro nano-agents by default, main-agent diff review before integration.

## Verification (whole task)

- `npm run build:next` + grep checks above.
- `npm test` green after spec updates; changed baselines visually adjudicated (wide + narrow, light + dark, written verdicts).
- Tab deep-link check: load `/projects/#history-of-mistrust` from the served `out/` build → mistrust tab active, slideshow alive, no native anchor-scroll jump, zero console errors. Then: open the lightbox, switch tabs, confirm body scroll unlocks and no duplicate lightbox panes exist (always against `out/`, never dev — StrictMode).
- Redirects + Netlify form registration verified post-deploy (deploy user-gated).

## Out of scope

- Gallery tag system (future plan — taxonomy groundwork noted in TODO: actual media split is Digital / Painting / Drawing; no photography in the current 11 works).
- Patriots/Motion Graphics tab (blocked on render; existing TODO thread).
- Legacy root `index.html` static site (frozen).
- Replacing `og-default.png` (existing TODO item).
