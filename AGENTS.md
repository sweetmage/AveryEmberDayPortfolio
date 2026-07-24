# AGENTS.md — Portfolio Website Agent Guide

This is the canonical agent-facing source of truth for the `portfoliowebsite` repo. If you are Claude, Codex, Kilo, Cursor, Blackbox, Copilot, Gemini, or any other AI agent: **read this file first**.

## Quick Links

| File | Purpose |
|---|---|
| `README.md` | Human-facing project overview |
| `TODO.md` | Active tasks, handoffs, completed plans |
| `LOGBOOK.md` | Session history (newest-first) |
| `docs/NOTES.md` | Project notes: branch policy, TickTick, Google Docs, environment constraints |
| `docs/accessibility.md` | WCAG 2.1 / AudioEye compliance reference |
| `docs/plans/*.md` | Active implementation plans |
| `docs/archives/plans.md` | Completed/cancelled plan archive |

## Branch Policy

**All changes must be committed to the `portfoliowebsite` branch.** Do not commit to `main` or `master` without explicit user direction.

**`portfoliowebsite` is the branch Netlify deploys from** (repointed 2026-07-12 via the Netlify API at the user's direction — production branch and allowed-branches both changed from `master` to `portfoliowebsite`, verified with a production deploy from the new branch; see `LOGBOOK.md` Entry 069). Pushing `portfoliowebsite` publishes to production. That makes every push to this branch a production-affecting action: get the user's explicit go-ahead in the moment before pushing, every time — this note is informational, not standing authorization. `master` is retained as a historical branch; do not merge into it without explicit user direction.

## Environment Constraints

### EPERM `uv_spawn` (Windows) — resolved 2026-07-02

The intermittent `EPERM uv_spawn` failures were a Microsoft Defender ML heuristic false positive, fixed by Defender platform/signature updates (see `docs/NOTES.md` for the full diagnosis and recurrence playbook). If it recurs, the old workaround remains valid: write a `.js` file and run `node file.js` (avoid `node -e` for `child_process`), or use `node scripts/shell-proxy.js pwsh "..."`.

### PowerShell Syntax Avoidance

Do NOT use these in `bash` tool calls (they are PowerShell-specific and often fail):
- `&&`, `||` for command chaining
- `test`, `command -v` (Unix-isms)
- `Set-Location` + subsequent commands in the same call (use `workdir` param instead)

## Build & Test

`npm run css:build` (alias `build:css`) — CSS build (Tailwind v4, compiles `app.css` → `style.css`, minified). **Run after any CSS or class change and commit the rebuilt `style.css`.** The committed copy was found 8 days stale on 2026-07-23 (Entry 082); if your `style.css` diff is wider than your change, that is why — check `git log -1 -- style.css` against the source commits.

> **Never write a Tailwind class name into a tracked `.md` file expecting it to be inert.** `app.css` and `app/globals.css` both scan the repo for classes, and until 2026-07-23 that included `LOGBOOK.md`/`TODO.md`/`docs/` — merely *mentioning* `gap-0` in a changelog recompiled the class into the shipped CSS (Entry 082). `@source not` rules now exclude `**/*.md`, `docs/**`, `out/**`, and `test-results/**`. Keep those exclusions in both entry files, and expect three consecutive builds to be byte-identical.

`npm run css:watch` — CSS watch

`npm run dev` — Next.js dev server on :3000 (hot reload; this is the real app)

`npm run build:next` — production static export → `out/`

> **Never run `build:next` while `npm run dev` is live.** `distDir` is `out`, so the build deletes the running dev server's runtime and every route starts 500ing with `ENOENT .../out/routes-manifest.json`. Stop dev first, build, then restart dev. (Hit 2026-07-22, Entry 080.)

`npm run serve` — serves the repo root on :8080 (**legacy static site only** — not the Next.js app)

`npm test` / `npx playwright test` — smoke tests + a **compare-based** visual regression gate, plus bubble-engine coverage (51 tests: 40 visual = 5 pages × 4 breakpoints × 2 themes, plus smoke and 6 bubble-exclusion specs).

> The visual suite is a real gate: it fails on unintended visual change and leaves the working tree clean. Snapshots live in `tests/visual-baseline.spec.js-snapshots/`; failures write actual/expected/diff PNGs to `test-results/`.
>
> **To accept an intentional visual change:** `npm test -- --update-snapshots`, then *review the regenerated PNGs before committing them*. An unreviewed update defeats the gate.
>
> **A bulk `--update-snapshots` can silently skip files.** Seen twice on 2026-07-23 (Entry 082): a full-suite update left 3 of 40 snapshots un-rewritten, then a later one left 2. The next run "fails" against baselines still showing the *previous* design, which reads exactly like a real regression. Fix: re-run just those tests, `npx playwright test --update-snapshots -g "<test name>"`, which writes them reliably.
>
> **The check is re-running the suite, not file timestamps.** Do not use snapshot mtimes to verify a bulk update was complete — `--update-snapshots` only rewrites snapshots whose pixels changed, so unchanged files legitimately keep old timestamps and a mixed set of mtimes is normal, not evidence of a skip. The only trustworthy gate is: update, then run the full suite until it is green **twice in a row**. One green run does not prove stability.
>
> Two things that are load-bearing and easy to break (both cost a debugging cycle on 2026-07-22, Entry 081):
> - Reduced motion is applied via `page.emulateMedia()`, **not** `test.use({ reducedMotion })` — the declarative option is silently ignored for `reducedMotion` on Playwright 1.61.1, which leaves the bubble engine running and captures unstable.
> - `next build` runs in `tests/global-setup.js`, **not** in `webServer.command` — `reuseExistingServer` skips the command when the port is already held, which made the suite grade a stale `out/`.
>
> `threshold: 0.02` is empirically derived; at Playwright's 0.2 default an entire-theme text-colour shift passed undetected. Don't relax it without re-running the injected-regression check in the Stage 3 plan.

> **`tests/bubbles-exclusion.spec.js` is the only motion-enabled spec**, and the only coverage the bubble engine has — the visual gate captures under `prefers-reduced-motion`, where the engine creates nothing, so bubbles are otherwise invisible to the suite (that blind spot hid a regression for a week; Entry 090).
>
> **Sample per animation frame, not per millisecond, when asserting on the physics.** The engine integrates a fixed velocity per frame rather than scaling by elapsed time, so under `fullyParallel` contention rAF is starved and bubbles/blobs travel less per wall-clock second. A time-based sample then observes fewer frames of motion and under-reports, which looks exactly like a regression. This bit once already: the blob test passed 3/3 standalone and failed in the full suite (Entry 090). Frame-based sampling needs a raised `test.setTimeout`, since wall-clock duration then depends on the frame rate the worker gets.

`node scripts/parse-todo.js` — Parse TODO into `docs/sync/local-tasks.json`

`node scripts/sync-all.js --dry-run` — Dry-run sync to TickTick

## TickTick

Portfolio tasks live in the **Portfolio** group, **Portfolio Website** list (project id `69c8addc8f0823c509e1979f`). Do not create separate lists.

## Google Docs Agent Access

Agent can read/edit allow-listed Google Docs via `scripts/google-docs.js`. Allow-list: `docs/sync/google-docs.json` (gitignored). Only the user edits this file.

## Credentials

All credentials for this project are stored in `.env` at the repo root (gitignored). Load environment variables from `.env` before running any script that requires API access.

Available variables:

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI (localhost) |
| `GOOGLE_TOKEN_URI` | Google token endpoint |
| `GOOGLE_REFRESH_TOKEN` | Long-lived Google OAuth refresh token |
| `GOOGLE_ACCESS_TOKEN` | Short-lived Google OAuth access token (may expire) |
| `TICKTICK_ACCESS_TOKEN` | TickTick API access token |

In Node.js scripts, load with `import 'dotenv/config'` (or `require('dotenv').config()`); in Python, `from dotenv import load_dotenv; load_dotenv()`; in shell scripts, `export $(grep -v '^#' .env | xargs)`.

> The `GOOGLE_ACCESS_TOKEN` is short-lived and may be expired. Use `GOOGLE_REFRESH_TOKEN` + `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to obtain a fresh access token via the token endpoint (`GOOGLE_TOKEN_URI`).

## Accessibility

- All text must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Brand tokens in `brand.css` are the source of truth for color contrast
- `prefers-reduced-motion` must disable physics bubbles, spinning rings, and float animations
- Focus-visible contract: **`var(--brand-accent)`**, 2px outline, on all interactive
  elements. (This line previously named `--brand-border-focus`; that token is
  `rgba(255,255,255,0.24)` in dark and produces a much weaker ring than the accent the
  code has always shipped. Corrected 2026-07-23 to match the code, not the reverse.)

## Tech Stack

- **Next.js 15 static export** (`app/` router, migrated 2026-07-12, Entries 066–068), pages authored in Tailwind v4 utility classes. The legacy root `index.html` site is retained but not deployed
- CSS pipeline: `app.css` → compiled `style.css` (the only stylesheet pages link). `brand.css` (tokens, keyframes, component visuals) is imported into the `components` cascade layer so utilities can override it — **never re-add a separate `brand.css` <link>**
- `src/css/tailwind-preset.css` bridges `--brand-*` tokens to Tailwind theme names (`text-text`, `bg-surface-1`, `border-line`, `text-accent`, …); `src/css/site.css` holds only reset, base typography, logo theme-swaps, and `#return-to-top`
- `dark:` variant is keyed to `[data-theme="dark"]` (set by the inline head script + theme toggle), not `prefers-color-scheme`
- Physics engine: `scripts/bubbles.js` (DOM-based). Exclusion zones come from `DEFAULT_EXCLUSIONS` (includes the semantic `.bubble-exclude` marker class), `HOME_EXCLUSIONS` (index-only), and per-page `data-exclusions` on `.brand-bubbles-global`. Scrolling stirs the global-layer bubbles (`SCROLL_STIR`). `window.__bubbleEngine` is exposed for testing
- **Two bubble systems, two avoidance rules.** The `.brand-bubble` physics layers honour the full exclusion list. The five `.brand-hero-blob` shapes are the hero's ambient colour wash and deliberately do **not** — they roam the whole hero. Their one constraint is `heroContentRects()`: the logo plus the *Range-measured glyph extents* of `.hero-name`/`.hero-sub`, which steer blobs off the hero copy via a soft force (`BLOB_ZONE_PUSH`). Measure the ink, not the element box — those headings are full-width blocks with centred text, so their boxes span the hero and excluding them would evict blobs from the entire band
- `scripts/bubbles.js` is **duplicated** to `public/scripts/bubbles.js`, which is the copy the Next export actually serves. Edit the former and copy it to the latter, or the built site silently keeps the old behaviour
- Nav: **Home / Projects / Gallery / Contact** (nav restructure 2026-07-14, Entry 075 — no submenu, Hire Me CTA, or hamburger). Contact is temporarily commented out of nav + footer pending the Netlify Forms toggle (Entry 078)
- Nav buttons (Entry 082) paint **no chrome at rest** — a square fill appears only on hover (`--brand-surface-3`), press, or current page (`--brand-accent-dim`). They run the full bar height via `height: 100%`, which is why `.brand-nav`, `.brand-nav-inner`, and `.brand-nav-actions` all use `align-items: stretch` rather than `center`. **Bar height lives in `--brand-nav-height`; change it only there** — three rules read it, and the theme toggle uses `height: 100%` + `aspect-ratio: 1` to stay square against it. Note the theme toggle carries both `id="theme-toggle"` and `class="brand-theme-toggle"` and **the ID block wins**, so editing only the class is a no-op

## Deploy

- Netlify runs `next build` and publishes the static export (`publish = "out"`); the committed `style.css` only serves the undeployed legacy root site
- `netlify.toml` CSP pins sha256 hashes of the inline theme scripts; if an inline `<script>` changes, recompute and update the hashes or theme init breaks in production

## Design Conventions

### Wide-screen-first layout verification

**Always verify layouts at 2560px and 3440px (ultrawide), not just 1440px.**

Modern desktop monitors commonly exceed 1920px. A layout that looks correct at 1440px can break or look lopsided at 3440px if:
- A single sidebar rail creates an enormous empty right half
- Content is locked to a small max-width while the viewport stretches
- Asymmetric padding (left rail vs. none on right) makes the page feel off-balance

**Rule:** After any layout change, capture or preview at **2560px and 3440px** in both themes. The projects-page rail-and-content pattern (Entry 086) uses a centered container (`lg:max-w-[1400px] lg:mx-auto`) so the whole layout stays centered with equal whitespace on both sides at all widths, rather than hugging one edge.

## File Conventions

- Generated `style.css` is tracked and deployed directly (see Deploy)
- `.gitignore`: `/node_modules/` (lockfile committed), `/tmp/`, `*.log`, `/test-results/`, `docs/sync/google-docs.json`
- All pages use `.brand-nav` + `.brand-footer` from the brand system
- Class names referenced by JS must stay in markup even when styled by utilities: `.project-card`, `.about-box`, `.bubble-exclude`, `.hero-logo`, `.hero-name`, `.hero-sub`, `.project-tab`, `.gallery-item`, `.wip-notice`, `.brand-nav*`, `.brand-footer*`
- **Renaming or retagging an element silently drops it out of the bubble exclusion zones.** `DEFAULT_EXCLUSIONS` is matched by selector, so an element stops being avoided the moment it stops matching — no error, and nothing red in the suite unless `tests/bubbles-exclusion.spec.js` covers it (the visual gate runs under reduced motion, where the engine creates no bubbles at all). **This has now happened twice in one day:** the hero logo when it was inlined from `<img>` to `<svg>` for `currentColor` theming (Entry 090), and the Projects rail when the tabs were restyled from `.brand-btn` to `.project-tab` (Entry 085, found and fixed in Entry 093 — bubbles had been crossing the rail in 30 of 30 sampled frames). When you rename or retag a UI element, check this list in the same change, and add a case to the bubble spec.
