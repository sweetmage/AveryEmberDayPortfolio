# Tailwind Restoration — 2026-07-05

## Goal

Restore the Tailwind v4 build pipeline that existed at commit `86bd8c1` (deleted between then and current HEAD) so the CSS test environment's watcher (`npx tailwindcss -i app.css -o style.css --watch`) works again, without regressing the hand-authored CSS the user has been iterating on since Tailwind was removed.

## Context (from GATHER)

- **Last Tailwind-enabled commit:** `86bd8c1` (shxdowloop stage 1, 2026-07-01). It introduced `app.css`, `src/css/tokens.css`, `src/css/tailwind-preset.css`, `src/css/components.css`. `style.css` at that commit was compiled output.
- **Post-`86bd8c1`:** `app.css` and `src/css/` were deleted (never committed to a subsequent state on this branch). `style.css` was hand-authored back up to 887 lines. `node_modules/@tailwindcss/*` was re-added in `c7eb714`.
- **Current HTML usage:** Zero real Tailwind utilities. All 5 HTML pages (`index.html`, `gallery/gallery.html`, `projects/*.html`) load `brand.css` then `style.css`. So Tailwind's value here is limited to the token bridge and preflight — utility generation contributes nothing.
- **Token source of truth:** `brand.css` defines the `--brand-*` custom properties. `src/css/tokens.css` (at `86bd8c1`) was a bridge that aliases them, and `tailwind-preset.css` maps them into `@theme` for Tailwind's design system.

## Approach

Minimal-diff restoration:

1. Restore `src/css/tokens.css` and `src/css/tailwind-preset.css` verbatim from `86bd8c1`.
2. **Move** current `style.css` → `src/css/site.css` (preserves user work).
3. Create a fresh `app.css` that imports (in order): `tailwindcss`, `tokens`, `preset`, `site`. Include `@source ".";` so future utility usage is picked up.
4. Add `package.json` with `css:build`, `css:watch`, `serve` scripts.
5. Compile once to regenerate `style.css` (the tracked filename HTML already links to — no page edits needed).
6. Add `.gitignore` entries for `node_modules/` and `style.css` (build artifact).
7. Wire the launcher: Tailwind watcher (piped-stdin wrapper to sidestep the v4 Windows CLI early-exit bug), `serve` on :8080, open Chrome.

## Steps (as executed)

- [x] Restore `src/css/tailwind-preset.css` from `git show 86bd8c1:src/css/tailwind-preset.css`
- [x] Move `style.css` → `src/css/site.css`
- [x] Write `app.css` (Tailwind entry)
- [x] Write `package.json` (scripts + devDependencies)
- [x] Run initial build (`npx tailwindcss -i app.css -o style.css`)
- [x] Start watcher via `node -e` piped-stdin wrapper (works around Windows v4 CLI EOF-exit)
- [x] Start `npx serve . -l 8080`
- [x] Open Chrome to `http://localhost:8080`
- [x] `.gitignore` — added `node_modules/`, `test-results/` (kept `style.css` tracked — see review-fix note below)

### Post-review fixes (2026-07-05)

Code review flagged:
- **Critical:** gitignoring `style.css` would break Netlify deploys (`netlify.toml` has `publish = "."` with no build command). → Reverted; `style.css` stays tracked as a committed build artifact.
- **Moderate:** the restored `src/css/tokens.css` was a *duplicate* of the `--brand-*` definitions in `brand.css` (not a bridge), silently shadowing brand.css. → Deleted `src/css/tokens.css` and updated `app.css` to skip that import; `tailwind-preset.css` still references `var(--brand-*)` because `brand.css` loads first on every HTML page and its `:root` scope is inherited by the compiled `style.css` output.
- **Moderate:** `tailwind-preset.css` mapped `--font-mono → var(--brand-font-mono)` which is undefined. → Commented that line out so Tailwind keeps its own mono default.
- **Minor:** No `package-lock.json`. Deferred — `node_modules/` is committed elsewhere in-repo history so drift is bounded for now.

Rebuild after fixes: 32 KB / 1370 lines (down from 36 KB / 1490).

## Testing / Verification

- **Build succeeds:** `npm run css:build` completes without error. ✅ (verified: 36 KB output)
- **Watcher rebuilds on save:** touching `app.css` or any imported file triggers a rebuild. ✅ (watcher process is running and printed "Done in Nms" twice.)
- **Visual parity:** page renders match pre-restoration state. **Manual check required** — user should visit http://localhost:8080 and spot-check `index.html`, `gallery/gallery.html`, and each `projects/*.html`.
- **No playwright suite** exists on this branch (`tests/` has only a `google-docs.test.js` unit test), so no automated visual regression is available here.

## Risks / Open Questions

- **Preflight overlap:** Tailwind v4 emits a `@layer base` preflight that partially duplicates the hand-authored reset at the top of `site.css` (both set `box-sizing`, `margin: 0`, `border: 0`). Cascade order (preflight → site.css) means site.css wins for any conflicting rule, but Tailwind's `line-height: 1.5` on `html` may leak through since site.css only overrides on `body`. Low risk, but worth eyes-on.
- **Utility gap:** No HTML page uses Tailwind utility classes today. If the user's intent for "restore Tailwind" was purely to unblock the watcher and dev loop, this is done. If they intended to start authoring in utilities, no HTML has been converted — that would be a follow-up task.
- **Framework decision pending (see TODO.md):** the TODO warns against structural refactors before a framework is chosen. This restoration is scoped as *reactivating an existing build step*, not a structural change — no HTML converted to utilities, no component model change.

## Files touched (final state)

- Added: `app.css`, `package.json`, `src/css/tailwind-preset.css`, `src/css/site.css`, `docs/plans/2026-07-05-tailwind-restoration.md`
- Modified: `style.css` (now Tailwind-compiled output), `.gitignore` (added `node_modules/`, `test-results/`)
- Preserved: `brand.css`, all HTML files, `script.js`
- Considered but dropped: `src/css/tokens.css` (redundant with `brand.css`)
