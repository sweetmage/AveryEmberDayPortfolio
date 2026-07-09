# Plan — Local Test: Gallery / History of Mistrust Not Viewable

**Date:** 2026-07-02
**Status:** Resolved — user confirmed `npx serve` (or equivalent static server) as their local-test method; under that setup both pages already load with zero console/network errors once the `Script.js` fix below is applied. No further code change needed unless the user still can't view the pages after a hard refresh.
**Agent:** Claude (shxdowflow, plan-only)
**Scope:** Diagnosis first; likely `Script.js`, possibly `netlify.toml` / page `<head>` blocks / a local test-runner choice

---

## Background — already fixed this session

Before this plan was written, a real, confirmed, reproducible bug was found and fixed in `Script.js`'s theme-toggle IIFE:

1. **Logo 404 on every sub-page.** `applyTheme()` set `heroLogo.src` / `navLogo.src` to page-relative strings (`'images/icons/BubbleLogo/...'`). Since `Script.js` is included as `../Script.js` on every sub-page (`gallery/gallery.html`, `projects/*.html`), a page-relative src resolved under the sub-page's own folder (e.g. `/gallery/images/...`) — a guaranteed 404/broken-image icon on every page except `index.html`, every load.
   - **Fix:** derive `assetBase` from `document.currentScript.src` (stripping `Script.js` off the end) and prefix all four logo src assignments with it, so the path always resolves to the site root regardless of page depth.
2. **Theme flips from dark to light after load for OS-dark-mode visitors.** The inline `<head>` script (sets `data-theme` before first paint) checks `prefers-color-scheme`; `Script.js`'s `getTheme()` did not — it silently defaulted to `'light'` whenever `localStorage.theme` was unset, then `applyTheme()` overwrote the correct `data-theme="dark"` attribute the head script had already set.
   - **Fix:** `getTheme()` now checks `window.matchMedia('(prefers-color-scheme: dark)')` when nothing is stored, matching the head script's logic.

Both verified via headless-browser checks (cleared `localStorage`, both `color-scheme` emulations, both root and sub-pages): nav logo now loads (`naturalWidth: 150`, no 404) and `data-theme` now matches the OS preference on first visit, on every page.

**Not yet confirmed:** a case where the gallery or history-of-mistrust page fails to load at all. Under `npx serve . -l 3000` (the server `playwright.config.js` already uses), both pages return full HTML, no fatal JS errors, and both direct-URL navigation and clicking the Work submenu succeed. So the user's "cannot view" report is likely one of:

- (a) the now-fixed broken logo icon reading as "the page is broken," rather than true unreachability,
- (b) a different local-serving method than `npx serve` (e.g. opening `index.html` via `file://`, a different dev server/port, or `netlify dev`) that behaves differently for these two pages specifically,
- (c) something not yet reproduced.

---

## Goal

Reproduce the user's actual "cannot view gallery / history of mistrust" experience, find the root cause, and fix it — for whatever local-testing method the user is actually using — without assuming `npx serve` is that method.

---

## Investigation Phase (do first, before touching more code)

1. **Ask the user how they are locally testing**, if not already obvious: double-clicking `index.html` (file://), `npx serve`, `netlify dev`, a VS Code Live Server/Preview extension, or something else. This single fact determines which of the branches below applies and should be confirmed via `AskUserQuestion` rather than guessed, since the three methods fail differently:
   - `file://` — relative links (`gallery/gallery.html`, `projects/history-of-mistrust.html`) should still resolve fine from `index.html` opened directly, but any code relying on `fetch`, absolute paths, or CORS (none currently known, but worth checking `gallery/gallery.html` and `projects/history-of-mistrust.html` specifically for `fetch(...)`/`XMLHttpRequest`/`import` usage) would silently fail under `file://` and could look like a blank or partially-broken page.
   - `netlify dev` — this is the one path where `netlify.toml`'s CSP header (`script-src 'self' 'sha256-UB47I6...'`) is actually enforced. If the inline `<head>` theme-detection script's bytes differ at all between `index.html` and the sub-pages (even by a single space/newline), the sha256 hash won't match on the sub-page and the inline script will be silently blocked by CSP, breaking `data-theme` (and, before this session's fix, potentially cascading into the logo bug too). **Action:** diff the inline `<head>` script block across `index.html`, `gallery/gallery.html`, `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html` byte-for-byte; if any differ, either recompute per-page hashes for `netlify.toml` or (preferred) make the script byte-identical across pages so one hash covers all of them.
   - A different static-file server / port — check for the same clean-URL behavior difference `npx serve` has (strips `.html`), and whether that server 404s on directory-style URLs (`/gallery/` vs `/gallery/gallery.html`) — a common source of "page not found" for exactly two of five pages if those two are the only ones under a subdirectory the user tried as a bare folder URL.

2. **Check browser console/network tab** in the user's actual browser session for the two pages (not just headless Chromium) — ask the user to paste or screenshot any red console errors, or drive it live with the `dev-browser`/`playwright` skill against non-headless Chromium if the user can describe reproduction steps precisely enough.

3. **Check for anything unique to these two pages vs. the three that "work."** Both `gallery/gallery.html` and `projects/history-of-mistrust.html` are one directory level deep, same as `projects/brand-avery-ember-day.html` and `projects/patriots-low-thirds.html`, which the user did *not* flag — so directory depth alone doesn't explain it. Diff each sub-page's `<head>` block and script includes against a working sub-page (e.g. `projects/patriots-low-thirds.html`) to isolate what's actually different about the two flagged pages specifically (extra scripts, different image counts/sizes that could time out on a slow connection, larger DOM, carousel/lightbox JS unique to `history-of-mistrust.html`, filter/tag JS unique to `gallery.html`).

---

## Candidate Fixes (pick based on investigation findings — do not apply speculatively)

| If investigation shows... | Fix |
|---|---|
| (a) User was reacting to the broken-logo icon | No further code fix needed — confirm with user that the already-applied `Script.js` fix resolves it; close out. |
| (b) CSP hash mismatch under `netlify dev` because inline scripts differ per page | Make the inline theme-detection `<script>` block byte-identical across all 5 HTML files (extract to a single canonical snippet used everywhere), so the existing `netlify.toml` sha256 hash covers all pages. Re-verify by running `netlify dev` (or equivalent) locally and checking for zero CSP console violations — this is also already an open TODO item ("CSP live validation" in `TODO.md`). |
| (c) `file://` breaks due to a `fetch`/module/CORS dependency in gallery or history-of-mistrust JS | Identify the offending call and either inline the data, guard it with a `file:` protocol check plus fallback, or document that local testing must use a server (update `AGENTS.md`/`docs/NOTES.md` "local test" instructions to say `npx serve .` explicitly, since `package.json` has no `dev`/`start` script pointing users at it today). |
| (d) Clean-URL / trailing-slash mismatch specific to how the user navigated | Add `netlify.toml` redirect rules or adjust links, or simply document the correct local URL pattern. |
| (e) Something else found during investigation | Scope a new fix once root cause is known; do not guess further here. |

---

## Files Likely Involved

- `Script.js` (already patched this session for the confirmed bug — no further changes unless investigation finds more)
- `index.html`, `gallery/gallery.html`, `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html` (inline `<head>` script diff, if CSP hash is the cause)
- `netlify.toml` (CSP hash / redirect rules, if needed)
- `package.json` (add a `"dev": "npx serve . -l 3000"` script if the real problem is simply that there's no documented/discoverable way to run a local server — `AGENTS.md` should point here too)
- `AGENTS.md` / `docs/NOTES.md` (document the correct local-test method once confirmed)

---

## Verification (once root cause is fixed)

1. Reproduce the user's original setup exactly and confirm gallery + history-of-mistrust now load.
2. Re-run the full 5-page x however-many-themes matrix already exercised this session for the logo fix, to make sure the new fix doesn't regress it.
3. If CSP is involved, validate with the actual header enforced (`netlify dev` or a deploy preview), not just `npx serve` (which does not apply `netlify.toml` headers).

---

## Parallel Tracks

Single track. The investigation phase is a hard prerequisite — none of the candidate fixes should be applied in parallel since they're mutually exclusive hypotheses about one root cause.

---

## Out of Scope

- Any further bubble-physics, gallery tag-filter, or content work already tracked elsewhere in `TODO.md`.
- Committing/pushing (per branch policy, requires explicit user go-ahead).

---

## Next Step

Ask the user (via `AskUserQuestion`) which local-testing method they use, since that single answer determines which candidate fix applies — do not implement any of the candidate fixes until that's known or independently reproduced.
