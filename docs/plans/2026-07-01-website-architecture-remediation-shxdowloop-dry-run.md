# Dry Run — Website Architecture & Quality Remediation (2026-07-01)

**Mode:** `shxdowloop dry-run`  
**Branch:** `shxdowloop/2026-07-01/website-architecture-remediation`  
**Source plan:** `docs/plans/2026-07-01-website-architecture-remediation.md`  
**Status:** Dry run — no source files edited. Only documentation/planning writes permitted.

---

## Preflight Results

| Check | Result |
|---|---|
| Branch base | `portfoliowebsite` (dirty, user-owned) |
| New branch | `shxdowloop/2026-07-01/website-architecture-remediation` (created from current state) |
| Remote | `origin` reachable |
| Node / npm | v25.9.0 / 11.12.1 |
| Provider usage | Claude 8%/13%, Codex 5%/0% — native subagents available |
| Nano-agents | OpenCode paid route available; Exa MCP configured |
| Helper routing | Native-first for exploration/planning/review; nano-agents for small directed execution |
| Degraded paths | None |

---

## Resolved Decisions (Locked for This Run)

| # | Decision | Choice |
|---|---|---|
| D1 | CSS source of truth | Tailwind v4 (`style.css` only; `brand.css` unlinked) |
| D2 | Site framework | Astro (Stage 2 only) |
| D3 | Portability depth | Tokens + Tailwind preset + component classes + Web Components |
| D4 | Sequencing | Incremental: harden vanilla → migrate to Astro |
| D5 | Design-system location | `packages/brand-system/` npm workspace |
| D6 | Monorepo layout | `apps/site/` + `packages/brand-system/` |
| D7 | Web Component scope | `<brand-theme-toggle>` + `<brand-bubbles>` |
| D8 | First-visit theme | Respect OS `prefers-color-scheme` (user confirmed) |
| D9 | `brand-ring-spin` | **Remove entirely** — bubbles behave the same on all layers |
| D10 | Package scope | `@bubble/brand-system` |
| D11 | `style.css` strategy | **A** — keep tracked until Netlify build verified, then `git rm --cached` |
| D12 | Screenshot verification | Build Playwright harness before Phase 1 |
| D13 | Phase 3+6a merge | Rewrite all `<head>` blocks in one combined pass (theme + metadata) |
| D14 | CSP timing | 6c-security runs **after** the merged head-rewrite settles the inline theme script |

---

## Process Plan — Stages & Phases

### Stage 0 — Harness + Pre-Phase 1 Baselines *(new, pre-requisite)*

**Goal:** Build a Playwright screenshot harness and capture 40 baselines (5 pages × 4 breakpoints × 2 themes) before any CSS changes.

**Phases:**
- **S0.1** Install Playwright (`npm install -D @playwright/test`) and scaffold test file.
- **S0.2** Write `tests/visual-baseline.spec.js`:
  - Serve site at `localhost:3000` (or `file://` via `npx serve .`).
  - Pages: `index.html`, `projects/brand-avery-ember-day.html`, `projects/history-of-mistrust.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`.
  - Breakpoints: 360, 768, 1024, 1440.
  - Themes: light (`localStorage.theme='light'`, `data-theme="light"`) and dark (`localStorage.theme='dark'`, `data-theme="dark"`).
  - Output: `tests/baselines/<page>_<w>_light.png` / `_dark.png`.
- **S0.3** Run harness, review screenshots for completeness, commit baselines.

**Would run commands:**
```bash
npm install -D @playwright/test
npx playwright install chromium
node -e "require('@playwright/test')" # verify
npx playwright test tests/visual-baseline.spec.js --update-snapshots
```

**Would spawn helpers:**
- Nano-agent (flash) — scaffold test file and verify Playwright wiring.
- Main agent — review baseline screenshot completeness.

**Files touched:** `package.json` (devDep), `package-lock.json`, `tests/visual-baseline.spec.js`, `tests/baselines/` (40 PNGs).
**Checkpoint:** Commit baselines.

---

### Stage 1 — CSS De-duplication + Portable Layers *(S1-T1)*

**Goal:** Make Tailwind the single CSS source, split into Tier 1/2/3 layers, remove `brand-ring-spin` and `.ring`, deduplicate forked dark selectors.

**Phases:**
- **S1.1** Remove `.ring` and `brand-ring-spin` from `app.css`:
  - Delete `.brand-card-bubble .ring`, `.brand-card-bubble .ring::before`, `.brand-card-bubble:hover .ring`, `:root[data-theme="dark"] .brand-card-bubble .ring`, and the `animation: brand-ring-spin …` declarations.
  - Delete `.brand-btn-active .ring`, `.brand-btn-active .ring::before`, and its `brand-ring-spin` animation.
- **S1.2** Remove legacy orbit animation from `brand.css`:
  - Delete `.brand-card-bubble::before` block that defines `brand-outline-orbit` (old equivalent of `.ring`).
  - Delete `@keyframes brand-outline-orbit` if present.
  - Remove `@property --brand-orbit-angle` (no longer needed).
- **S1.3** Verify no `<span class="ring">` remains in `index.html` project cards.
- **S1.4** Split `app.css` into three importable layers (still one build entry):
  - `src/css/tokens.css` — `:root` custom properties (dark + light + simplified `prefers-color-scheme` fallback).
  - `src/css/tailwind-preset.css` — `@theme inline` mapping.
  - `src/css/components.css` — all `.brand-*` component rules, deduplicated, with `html.dark` → `:root[data-theme="dark"]`.
  - `app.css` becomes: `@import "tailwindcss"; @import "./src/css/tokens.css"; @import "./src/css/tailwind-preset.css"; @import "./src/css/components.css";` plus `@source` audit.
- **S1.5** Rebuild `style.css` (`npx tailwindcss -i app.css -o style.css --minify`).
- **S1.6** Verify compiled output contains zero `brand-ring-spin`, zero `html.dark`, one definition per major selector.
- **S1.7** Visual diff: run Playwright harness against current tree, compare to S0 baselines. No regression expected except dead ring removal.

**Would run commands:**
```bash
# S1.1–S1.4: manual edits via agent tools
npx tailwindcss -i app.css -o style.css --minify
grep -c "brand-ring-spin" style.css # expect 0
grep -c "html.dark" style.css # expect 0
grep -c "\.brand-card-bubble" style.css # expect ~1 block, not duplicated
npx playwright test tests/visual-baseline.spec.js # compare to baselines
```

**Would spawn helpers:**
- Native subagent (explore) — verify layer split does not break `@source` scanning; report missing selectors.
- Nano-agent (flash) — run grep/byte-size checks on compiled output.

**Files touched:** `app.css`, `brand.css`, `style.css` (rebuilt), new `src/css/tokens.css`, `src/css/tailwind-preset.css`, `src/css/components.css`.
**Checkpoint:** Commit S1.

---

### Stage 2 — Reproducible Build *(S1-T2)*

**Goal:** Create `package.json`, lockfile, Netlify build command, pin Node ≥20.

**Phases:**
- **S2.1** Create root `package.json`:
  - `name`: `averyemberday-portfolio` (monorepo root).
  - `workspaces`: `["apps/*", "packages/*"]` (seeded for Stage 2).
  - `devDependencies`: `tailwindcss@4.3.2`, `@tailwindcss/cli@4.3.2`, `@playwright/test` (if not already added in S0).
  - `scripts`: `build:css`, `watch:css`.
- **S2.2** Run `npm install` → `package-lock.json`.
- **S2.3** Update `netlify.toml`:
  - `[build.environment]`: `NODE_VERSION = "20"`.
  - `[build]`: `command = "npm run build:css"`.
  - Keep publish dir `.` for Stage 1.
- **S2.4** Verify `npm ci && npm run build:css` reproduces `style.css` identically.
- **S2.5** `git rm --cached node_modules/.package-lock.json` (close open TODO item).
- **S2.6** Update `.gitignore` to explicitly ignore `node_modules/`, `style.css`, `tmp/`, `*.log`.

**Would run commands:**
```bash
npm install
npm ci && npm run build:css
git rm --cached node_modules/.package-lock.json
```

**Would spawn helpers:**
- Nano-agent (flash) — verify `package.json` syntax, check `npm ci` reproducibility.

**Files touched:** `package.json` (new), `package-lock.json` (new), `netlify.toml`, `.gitignore`.
**Checkpoint:** Commit S2.

---

### Stage 3 — Head Rewrite: Theme Unify + Metadata *(merged S1-T3 + S1-T5-meta)*

**Goal:** Rewrite every HTML `<head>` in one pass: unify theme targeting, implement D8, add all metadata.

**Phases:**
- **S3.1** Standardize CSS selectors to `:root[data-theme="dark"]` / `:root[data-theme="light"]` (already done in S1; verify).
- **S3.2** Rewrite inline pre-paint script on all 5 pages:
  ```js
  (function() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
  ```
  Remove any `.dark` class manipulation.
- **S3.3** Update `Script.js` `applyTheme`:
  - Stop toggling `.dark` class.
  - Only set `data-theme` on `:root`.
- **S3.4** Add `defer` to all 5 `<script src="Script.js">` tags.
- **S3.5** Add metadata to all 5 pages (consistent set):
  - `<meta name="description">` (index already has it; add to others).
  - Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
  - Twitter Card: `summary_large_image`.
  - `<link rel="canonical" href="https://averyemberday.com/...">`.
  - `<meta name="theme-color" content="#181818" media="(prefers-color-scheme: dark)">` and `content="#FCFBF9" media="(prefers-color-scheme: light)">`.
  - Normalize: drop `X-UA-Compatible` from all pages; ensure `robots` consistent.
- **S3.6** Generate 1200×630 OG image → `images/og-default.png` (or `.jpg`).
- **S3.7** Visual diff + theme toggle test: harness runs at both themes, no FOUC, no console errors.

**Would run commands:**
```bash
# S3.2: inline script rewrite (5 HTML files)
# S3.3: Script.js edit
# S3.4: HTML script tag edits
# S3.5: HTML head meta edits
npx playwright test tests/visual-baseline.spec.js --update-snapshots
```

**Would spawn helpers:**
- Native subagent (execute) — rewrite all 5 HTML heads in parallel (bounded scope, do not commit).
- Nano-agent (flash) — verify `Script.js` has zero `.dark` class references after edit.
- Nano-agent (flash) — verify all 5 pages have identical meta patterns (grep audit).

**Files touched:** `index.html`, `projects/*.html`, `gallery/gallery.html`, `Script.js`, `images/og-default.png`.
**Checkpoint:** Commit S3.

---

### Stage 4 — Script.js Cleanup *(S1-T4)*

**Goal:** Minimal cleanup of site-local JS; defer theme-toggle/nav to Stage 2.

**Phases:**
- **S4.1** Convert `var` → `const`/`let` in return-to-top, scroll-spy, smooth-scroll functions.
- **S4.2** Verify `defer` present on all `Script.js` tags (already done in S3).
- **S4.3** Smoke test: scroll-to-top, scroll-spy, smooth-scroll, submenu behavior.

**Would run commands:**
```bash
node -c Script.js # syntax check
grep -c "\bvar\b" Script.js # expect 0 in touched code
npx playwright test tests/smoke-interaction.spec.js # if harness includes it
```

**Would spawn helpers:**
- Nano-agent (flash) — `var` → `const`/`let` mechanical refactor.

**Files touched:** `Script.js`.
**Checkpoint:** Commit S4.

---

### Stage 5 — Security Headers + Image Polish *(S1-T5-security + S1-T5-images)*

**Goal:** Add CSP (post-theme-script-finalization), Permissions-Policy, HSTS, preconnect; add responsive images where impactful.

**Phases:**
- **S5.1** Compute `sha256-…` hash of the final inline pre-paint theme script (from S3).
- **S5.2** Update `netlify.toml`:
  - `Content-Security-Policy`: `default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self'; script-src 'self' 'sha256-<hash>'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`.
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`.
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`.
  - Add `Link` preconnect headers for `fonts.googleapis.com` and `fonts.gstatic.com`.
- **S5.3** Add `srcset`/`sizes` to project thumbnails and gallery images (largest visual assets).
- **S5.4** Convert brand-page `.png` logo swatches to `.svg` twins.
- **S5.5** Fix `<picture>` elements: add real `<source>` or replace with plain `<img>`.
- **S5.6** CSP console test: open each page in headless browser, verify zero CSP violations (fonts load, theme script runs).

**Would run commands:**
```bash
# Compute CSP hash
echo -n '(function(){const stored=localStorage.getItem("theme");...})();' | openssl dgst -sha256 -binary | openssl base64
# Or use a Node script to hash the exact script block content

npx playwright test tests/csp-console.spec.js # verify no console violations
```

**Would spawn helpers:**
- Nano-agent (flash) — compute CSP hash script.
- Nano-agent (flash) — verify `netlify.toml` syntax (TOML parse).

**Files touched:** `netlify.toml`, `index.html`, `projects/*.html`, `gallery/gallery.html` (image markup), brand page (logo swatches).
**Checkpoint:** Commit S5.

---

### Stage 6 — Final Review + Baseline Commit

**Goal:** Main-agent diff review + pro nano-agent review + update docs.

**Phases:**
- **S6.1** Main agent reviews final diff of all stages.
- **S6.2** Pro nano-agent final review:
  - Review current branch vs base for request alignment, regressions, tests, security, docs sync.
- **S6.3** Fix critical/major findings; rerun verification if needed.
- **S6.4** Update `LOGBOOK.md` with Stage 0–5 entries.
- **S6.5** Update `TODO.md`:
  - Mark `node_modules/.package-lock.json` untracking complete.
  - Update `⚠️ Framework Decision Pending` → record Astro decision.
  - Add Stage 2 as active plan.
- **S6.6** Commit final checkpoint.

**Would spawn helpers:**
- Nano-agent (pro, readonly) — final diff review.

**Files touched:** `LOGBOOK.md`, `TODO.md`.
**Checkpoint:** Commit S6.

---

## Sequential Command Summary (Would Run)

```bash
# === Stage 0 ===
npm install -D @playwright/test
npx playwright install chromium
npx playwright test tests/visual-baseline.spec.js --update-snapshots

# === Stage 1 ===
npx tailwindcss -i app.css -o style.css --minify
grep -c "brand-ring-spin" style.css
grep -c "html.dark" style.css
npx playwright test tests/visual-baseline.spec.js

# === Stage 2 ===
npm install
npm ci && npm run build:css
git rm --cached node_modules/.package-lock.json

# === Stage 3 ===
# (inline script + meta edits; no single CLI)
npx playwright test tests/visual-baseline.spec.js --update-snapshots

# === Stage 4 ===
node -c Script.js
grep -c "\bvar\b" Script.js

# === Stage 5 ===
node scripts/compute-csp-hash.js # would create
npx playwright test tests/csp-console.spec.js

# === Stage 6 ===
git status --short
git diff --stat
git diff --check
```

---

## Helper Dispatch List (Would Spawn)

| Stage | Role | Route | Model | Permissions | Prompt summary | Fallback |
|---|---|---|---|---|---|---|
| S0 | Scaffold Playwright test | Nano-agent (flash) | `opencode-go/deepseek-v4-flash` | Read + write bounded to `tests/` | Write `tests/visual-baseline.spec.js` for 5 pages × 4 widths × 2 themes. | Native subagent |
| S1 | Verify `@source` coverage | Native subagent | — | Read-only | Explore `app.css` layer split; confirm Tailwind JIT still scans all HTML files. | Pro nano-agent |
| S1 | Post-build grep audit | Nano-agent (flash) | `opencode-go/deepseek-v4-flash` | Read-only | Run `grep`/`wc` checks on compiled `style.css`; report duplicates. | Main agent local |
| S3 | Rewrite 5 HTML heads | Native subagent | — | Read + write bounded to `*.html` | Implement S3.2 + S3.5: rewrite inline theme script and add metadata to all 5 pages. | Main agent |
| S3 | Verify `.dark` removal | Nano-agent (flash) | `opencode-go/deepseek-v4-flash` | Read-only | Grep all HTML and `Script.js` for `.dark` class usage; report zero hits. | Main agent local |
| S4 | `var` → `const`/`let` | Nano-agent (flash) | `opencode-go/deepseek-v4-flash` | Read + write `Script.js` | Mechanical refactor of `var` in non-theme code. | Main agent |
| S5 | CSP hash script | Nano-agent (flash) | `opencode-go/deepseek-v4-flash` | Read + write bounded to `scripts/` | Write `scripts/compute-csp-hash.js` that reads inline script and outputs base64 sha256. | Main agent |
| S6 | Final diff review | Nano-agent (pro) | `opencode-go/glm-5.2` | Read-only | Review full branch diff for regressions, security, docs sync, shippability. | Native subagent |

---

## Expected File Changes by Stage

| Stage | New files | Modified files | Deleted / untracked |
|---|---|---|---|
| S0 | `tests/visual-baseline.spec.js`, `tests/baselines/` (40 PNGs), `package.json` (devDeps), `package-lock.json` | — | — |
| S1 | `src/css/tokens.css`, `src/css/tailwind-preset.css`, `src/css/components.css` | `app.css`, `brand.css`, `style.css` | `brand-ring-spin` references |
| S2 | `package.json` (root scripts), `package-lock.json` | `netlify.toml`, `.gitignore` | `node_modules/.package-lock.json` (untracked) |
| S3 | `images/og-default.png` | 5 HTML files, `Script.js` | `.dark` class references |
| S4 | — | `Script.js` | — |
| S5 | `scripts/compute-csp-hash.js` (maybe) | `netlify.toml`, 5 HTML files (image markup), brand page | `.png` logo swatches (replaced by `.svg`) |
| S6 | — | `LOGBOOK.md`, `TODO.md` | — |

---

## Verification Matrix

| Checkpoint | Command / Check | Expected Signal |
|---|---|---|
| S0 baselines | `npx playwright test tests/visual-baseline.spec.js --update-snapshots` | 40 PNGs written, zero test failures |
| S1 build | `npx tailwindcss -i app.css -o style.css --minify` | Exit 0, `style.css` byte-size drops |
| S1 hygiene | `grep -c "brand-ring-spin" style.css` | `0` |
| S1 hygiene | `grep -c "html.dark" style.css` | `0` |
| S1 visual | `npx playwright test tests/visual-baseline.spec.js` | Pass or expected diffs (dead ring only) |
| S2 reproducibility | `npm ci && npm run build:css` | Exit 0, identical `style.css` checksum |
| S3 theme | `npx playwright test tests/visual-baseline.spec.js` | Pass at both themes, no FOUC |
| S3 console | Browser console check | Zero `.dark` errors, zero theme flash |
| S4 syntax | `node -c Script.js` | Exit 0 |
| S5 CSP | `npx playwright test tests/csp-console.spec.js` | Zero CSP violation console logs |
| S5 meta | `grep -c "og:" index.html` | `> 0` |

---

## Risks

1. **Visual regression from CSS merge (S1).** Highest-risk phase. Mitigation: Playwright baselines committed before edits; diff after rebuild.
2. **Dead `brand-ring-spin` removal reveals other broken animations.** Mitigation: grep for all `animation:` references in compiled output; confirm every name has a matching `@keyframes`.
3. **Netlify build fails (S2).** Mitigation: keep `style.css` tracked as fallback (strategy A); untrack only after Netlify build log confirms CSS built successfully.
4. **CSP hash invalidates on any future theme script edit.** Mitigation: document in `netlify.toml` comment that hash must be recomputed; add a script (`scripts/compute-csp-hash.js`) to automate recomputation.
5. **`<picture>` / responsive image changes break paths.** Mitigation: link-check script verifies all `src`/`srcset` paths resolve.
6. **Dirty worktree collision.** Mitigation: branch from current state; commit only intentional loop changes; never revert unrelated user work.

## Hard Stops (Would Not Proceed Without User Input)

- No hard stops identified for Stage 1. Stage 2 (Astro migration) is out of scope for this run.
- If Netlify build fails after S2, the loop would commit `style.css` as fallback and continue; no destructive deploy.

## Merge Readiness Checklist

- [ ] All 40 baselines captured and committed.
- [ ] `style.css` builds cleanly from `app.css` with zero `brand-ring-spin` and zero `html.dark`.
- [ ] All 5 pages have identical head structure (theme script + metadata).
- [ ] `Script.js` has zero `.dark` class references.
- [ ] CSP console test passes (zero violations).
- [ ] `npm ci && npm run build:css` reproducible.
- [ ] `LOGBOOK.md` and `TODO.md` synced.
- [ ] Final pro nano-agent review clean or all findings fixed.
- [ ] Checkpoint commits on branch `shxdowloop/2026-07-01/website-architecture-remediation`.

---

**End of dry run. No source files were edited.**
