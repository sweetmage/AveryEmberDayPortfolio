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

**`master` is the branch Netlify actually deploys from** (confirmed 2026-07-12 by fetching the live site directly — it was serving `master`'s content, not `portfoliowebsite`'s, despite this doc previously saying otherwise). Publishing to production means merging into `master`, not just pushing `portfoliowebsite`. This is a standing discrepancy between the documented workflow and the real deploy config — reconcile by either repointing Netlify at `portfoliowebsite` or updating this policy to treat `master` as the integration branch (see `TODO.md`). A merge/push to `master` is still a production-affecting action: get the user's explicit go-ahead in the moment before doing it, every time — this note is informational, not standing authorization.

## Environment Constraints

### EPERM `uv_spawn` (Windows) — resolved 2026-07-02

The intermittent `EPERM uv_spawn` failures were a Microsoft Defender ML heuristic false positive, fixed by Defender platform/signature updates (see `docs/NOTES.md` for the full diagnosis and recurrence playbook). If it recurs, the old workaround remains valid: write a `.js` file and run `node file.js` (avoid `node -e` for `child_process`), or use `node scripts/shell-proxy.js pwsh "..."`.

### PowerShell Syntax Avoidance

Do NOT use these in `bash` tool calls (they are PowerShell-specific and often fail):
- `&&`, `||` for command chaining
- `test`, `command -v` (Unix-isms)
- `Set-Location` + subsequent commands in the same call (use `workdir` param instead)

## Build & Test

`npm run css:build` (alias `build:css`) — CSS build (Tailwind v4, compiles `app.css` → `style.css`, minified). **Run after any CSS or class change and commit the rebuilt `style.css`.**

`npm run css:watch` — CSS watch

`npm run serve` — local dev server on :8080

`npm test` / `npx playwright test` — smoke test + 40 visual baselines (`tests/*.spec.js`; baselines self-refresh, so manual visual review is the real gate)

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
- Focus-visible contract: `var(--brand-border-focus)` on all interactive elements

## Tech Stack

- Vanilla HTML/JS, **pages authored in Tailwind v4 utility classes** (converted 2026-07-09; no framework — migration pending user decision)
- CSS pipeline: `app.css` → compiled `style.css` (the only stylesheet pages link). `brand.css` (tokens, keyframes, component visuals) is imported into the `components` cascade layer so utilities can override it — **never re-add a separate `brand.css` <link>**
- `src/css/tailwind-preset.css` bridges `--brand-*` tokens to Tailwind theme names (`text-text`, `bg-surface-1`, `border-line`, `text-accent`, …); `src/css/site.css` holds only reset, base typography, logo theme-swaps, and `#return-to-top`
- `dark:` variant is keyed to `[data-theme="dark"]` (set by the inline head script + theme toggle), not `prefers-color-scheme`
- Physics engine: `scripts/bubbles.js` (DOM-based). Exclusion zones come from `DEFAULT_EXCLUSIONS` (includes the semantic `.bubble-exclude` marker class), `HOME_EXCLUSIONS` (index-only), and per-page `data-exclusions` on `.brand-bubbles-global`. Scrolling stirs the global-layer bubbles (`SCROLL_STIR`). `window.__bubbleEngine` is exposed for testing
- Nav: **Work + About only** (plain anchors — no submenu, Contact link, Hire Me CTA, or hamburger)

## Deploy

- Netlify publishes the repo as-is (`publish = "."`, **no build command**) — the committed `style.css` is what ships
- `netlify.toml` CSP pins sha256 hashes of the inline theme scripts; if an inline `<script>` changes, recompute and update the hashes or theme init breaks in production

## File Conventions

- Generated `style.css` is tracked and deployed directly (see Deploy)
- `.gitignore`: `/node_modules/` (lockfile committed), `/tmp/`, `*.log`, `/test-results/`, `docs/sync/google-docs.json`
- All pages use `.brand-nav` + `.brand-footer` from the brand system
- Class names referenced by JS must stay in markup even when styled by utilities: `.project-card`, `.about-box`, `.bubble-exclude`, `.hero-name`, `.hero-sub`, `.gallery-item`, `.wip-notice`, `.brand-nav*`, `.brand-footer*`
