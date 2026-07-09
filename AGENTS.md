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

**All changes must be committed to the `portfoliowebsite` branch.** Do not commit to `main` without explicit user direction.

## Environment Constraints

### EPERM `uv_spawn` Restriction (Windows)

The agent `bash` tool on this Windows workstation has an intermittent `EPERM: operation not permitted, uv_spawn` restriction when spawning `powershell.exe` or `cmd.exe`. The restriction is **context-dependent**:

| Pattern | Result |
|---|---|
| Direct `bash`: `powershell -Command "..."` | Usually works, intermittent EPERM |
| Direct `bash`: `cmd /c powershell -Command "..."` | Usually works |
| `node -e "execSync('powershell')"` | Consistently fails |
| `node -e "execSync('cmd')"` | Consistently fails |
| **`.js` file with same code** | **Works 100%** |
| `node scripts/shell-proxy.js pwsh "..."` | Works (canonical workaround) |

**Rule:** For any shell automation, write a `.js` file and run `node file.js`. Avoid `node -e` for `child_process` calls. Use `scripts/shell-proxy.js` for one-off PowerShell/cmd commands.

### PowerShell Syntax Avoidance

Do NOT use these in `bash` tool calls (they are PowerShell-specific and often fail):
- `&&`, `||` for command chaining
- `test`, `command -v` (Unix-isms)
- `Set-Location` + subsequent commands in the same call (use `workdir` param instead)

## Build & Test

`npm run build:css` — CSS build (Tailwind v4, compiles `app.css` → `style.css`)

`npm run watch:css` — CSS watch

`node scripts/parse-todo.js` — Parse TODO into `docs/sync/local-tasks.json`

`node scripts/sync-all.js --dry-run` — Dry-run sync to TickTick

`node scripts/link-check.js` — Check all internal links (if available)

`node scripts/spell-check.js` — Spell-check HTML files (if available)

## TickTick

Portfolio tasks live in the **Portfolio** group, **Portfolio Website** list (project id `69c8addc8f0823c509e1979f`). Do not create separate lists.

## Google Docs Agent Access

Agent can read/edit allow-listed Google Docs via `scripts/google-docs.js`. Allow-list: `docs/sync/google-docs.json` (gitignored). Only the user edits this file.

## Accessibility

- All text must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Brand tokens in `brand.css` are the source of truth for color contrast
- `prefers-reduced-motion` must disable physics bubbles, spinning rings, and float animations
- Focus-visible contract: `var(--brand-border-focus)` on all interactive elements

## Tech Stack

- Vanilla HTML/CSS/JS (no framework — migration pending user decision)
- Tailwind CSS v4 (CSS-first, source in `app.css`)
- Brand token system: `brand.css` (tokens + keyframes), `app.css` (components)
- Physics engine: `scripts/bubbles.js` (DOM-based, not canvas)

## File Conventions

- Generated `style.css` is tracked for clone-and-run convenience, but Netlify rebuilds it on deploy
- `.gitignore`: `/node_modules/`, `/tmp/`, `*.log`, `docs/sync/google-docs.json`
- All pages use `.brand-nav` + `.brand-footer` from the brand system
