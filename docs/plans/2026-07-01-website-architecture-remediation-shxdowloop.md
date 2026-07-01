# Process Plan — Website Architecture & Quality Remediation (2026-07-01)

**Mode:** `shxdowloop` (Normal)  
**Branch:** `shxdowloop/2026-07-01/website-architecture-remediation-2`  
**Base:** `portfoliowebsite` (dirty, user-owned prior session work retained)  
**Source plan:** `docs/plans/2026-07-01-website-architecture-remediation.md`  
**Status:** Active — Stage 0 pending

---

## Preflight Results

| Check | Result |
|---|---|
| Workspace | Read-write (`D:\My Stuff\Git\CometGit\portfoliowebsite`) |
| Branch base | `portfoliowebsite` (dirty, user-owned) |
| Current branch | `shxdowloop/2026-07-01/website-architecture-remediation-2` (auto-incremented on collision) |
| Remote | `origin` reachable (`github.com/sweetmage/AveryEmberDayPortfolio`) |
| Node / npm | v25.9.0 / 11.12.1 |
| Provider usage | Claude 8%/13%, Codex 5%/0% — native subagents available |
| Nano-agents | OpenCode paid route available; Exa MCP configured |
| Helper routing | Native-first for exploration/planning/review; nano-agents for small directed execution |
| Degraded paths | PowerShell inaccessible to agents; use Node.js scripts for cross-platform automation |

---

## Resolved Decisions (Locked)

| # | Decision | Choice |
|---|---|---|
| D1 | CSS source of truth | Tailwind v4 (`style.css` only; `brand.css` unlinked) |
| D2 | Site framework | Astro (Stage 2 only) |
| D3 | Portability depth | Tokens + Tailwind preset + component classes + Web Components |
| D4 | Sequencing | Incremental: harden vanilla → migrate to Astro |
| D5 | Design-system location | `packages/brand-system/` npm workspace |
| D6 | Monorepo layout | `apps/site/` + `packages/brand-system/` |
| D7 | Web Component scope | `<brand-theme-toggle>` + `<brand-bubbles>` |
| D8 | First-visit theme | Respect OS `prefers-color-scheme` |
| D9 | `brand-ring-spin` | **Remove entirely** — bubbles behave the same on all layers |
| D10 | Package scope | `@bubble/brand-system` |
| D11 | `style.css` strategy | **A** — keep tracked until Netlify build verified, then `git rm --cached` |
| D12 | Screenshot verification | Build Playwright harness before Phase 1 |
| D13 | Phase 3 + 6a merge | Rewrite all `<head>` blocks in one combined pass (theme + metadata) |
| D14 | CSP timing | 6c-security runs **after** the merged head-rewrite settles the inline theme script |

---

## Parallel Tracks

| Track | Scope | Depends on | Owner role |
|---|---|---|---|
| S0 — Harness + baselines | `tests/`, Playwright install, 40 baseline PNGs | none | main agent + nano-agent scaffold |
| S1 — CSS single-source + layers | `app.css`, `brand.css`, `style.css`, HTML `<link>`s | S0 | main agent |
| S2 — Build/package | `package.json`, lockfile, `netlify.toml`, `.gitignore` | S1 | main agent + nano-agent verify |
| S3 — Head rewrite (theme + metadata) | 5 HTML `<head>` blocks, `Script.js` | S1 | native subagent execute, main verify |
| S4 — Script.js cleanup | `Script.js` | S3 | nano-agent flash refactor, main verify |
| S5 — Security + images | `netlify.toml`, image markup | S2 + S3 | nano-agent flash, main verify |
| S6 — Review + docs | `LOGBOOK.md`, `TODO.md`, diff review | S1–S5 | pro nano-agent review, main fix |

Sequential gates: S0 → S1 → (S2, S3). S4 depends on S3. S5 depends on S2 + S3. S6 depends on all.

---

## Stage 0 — Harness + Pre-Phase 1 Baselines

**Status:** Pending  
**Goal:** Build a Playwright screenshot harness and capture 40 baselines (5 pages × 4 breakpoints × 2 themes) before any CSS changes.  
**Phases:**
- [ ] S0.1 Install Playwright (`npm install -D @playwright/test`) and scaffold test file.
- [ ] S0.2 Write `tests/visual-baseline.spec.js`.
- [ ] S0.3 Run harness, review screenshots for completeness, commit baselines.

**Helpers:** Nano-agent (flash) — scaffold test file; main agent — review baselines.
**Verification:** 40 PNGs written, zero test failures.
**Checkpoint:** Commit baselines.

---

## Stage 1 — CSS De-duplication + Portable Layers *(S1-T1)*

**Status:** Pending  
**Goal:** Make Tailwind the single CSS source, split into Tier 1/2/3 layers, remove `brand-ring-spin` and `.ring`, deduplicate forked dark selectors.  
**Phases:**
- [ ] S1.1 Remove `.ring` and `brand-ring-spin` from `app.css`.
- [ ] S1.2 Remove legacy orbit animation from `brand.css`.
- [ ] S1.3 Verify no `<span class="ring">` remains in `index.html` project cards.
- [ ] S1.4 Split `app.css` into three importable layers (`src/css/tokens.css`, `src/css/tailwind-preset.css`, `src/css/components.css`).
- [ ] S1.5 Rebuild `style.css` (`npx tailwindcss -i app.css -o style.css --minify`).
- [ ] S1.6 Verify compiled output contains zero `brand-ring-spin`, zero `html.dark`, one definition per major selector.
- [ ] S1.7 Visual diff: run Playwright harness against current tree, compare to S0 baselines.

**Helpers:** Native subagent (explore) — verify `@source` coverage; nano-agent (flash) — post-build grep audit.
**Verification:** Exit 0 build, `style.css` byte-size drops, zero `brand-ring-spin`, zero `html.dark`, Playwright passes or expected diffs (dead ring only).
**Checkpoint:** Commit S1.

---

## Stage 2 — Reproducible Build *(S1-T2)*

**Status:** Pending  
**Goal:** Create `package.json`, lockfile, Netlify build command, pin Node ≥20.  
**Phases:**
- [ ] S2.1 Create root `package.json` with workspaces seeded for Stage 2.
- [ ] S2.2 Run `npm install` → `package-lock.json`.
- [ ] S2.3 Update `netlify.toml` with `NODE_VERSION = "20"` and `command = "npm run build:css"`.
- [ ] S2.4 Verify `npm ci && npm run build:css` reproduces `style.css` identically.
- [ ] S2.5 `git rm --cached node_modules/.package-lock.json`.
- [ ] S2.6 Update `.gitignore` to explicitly ignore `node_modules/`, `style.css`, `tmp/`, `*.log`.

**Helpers:** Nano-agent (flash) — verify `package.json` syntax and `npm ci` reproducibility.
**Verification:** `npm ci && npm run build:css` exits 0, identical checksum.
**Checkpoint:** Commit S2.

---

## Stage 3 — Head Rewrite: Theme Unify + Metadata *(merged S1-T3 + S1-T5-meta)*

**Status:** Pending  
**Goal:** Rewrite every HTML `<head>` in one pass: unify theme targeting, implement D8, add all metadata.  
**Phases:**
- [ ] S3.1 Standardize CSS selectors to `:root[data-theme="dark"]` / `:root[data-theme="light"]` (already done in S1; verify).
- [ ] S3.2 Rewrite inline pre-paint script on all 5 pages.
- [ ] S3.3 Update `Script.js` `applyTheme` — stop toggling `.dark` class.
- [ ] S3.4 Add `defer` to all 5 `<script src="Script.js">` tags.
- [ ] S3.5 Add metadata to all 5 pages (description, OG, Twitter Card, canonical, theme-color).
- [ ] S3.6 Generate 1200×630 OG image → `images/og-default.png`.
- [ ] S3.7 Visual diff + theme toggle test: harness runs at both themes, no FOUC, no console errors.

**Helpers:** Native subagent (execute) — rewrite all 5 HTML heads; nano-agent (flash) — verify `.dark` removal and meta pattern consistency.
**Verification:** Zero `.dark` references, OG present on all pages, no FOUC, no console errors.
**Checkpoint:** Commit S3.

---

## Stage 4 — Script.js Cleanup *(S1-T4)*

**Status:** Pending  
**Goal:** Minimal cleanup of site-local JS; defer theme-toggle/nav to Stage 2.  
**Phases:**
- [ ] S4.1 Convert `var` → `const`/`let` in return-to-top, scroll-spy, smooth-scroll functions.
- [ ] S4.2 Verify `defer` present on all `Script.js` tags (already done in S3).
- [ ] S4.3 Smoke test: scroll-to-top, scroll-spy, smooth-scroll, submenu behavior.

**Helpers:** Nano-agent (flash) — mechanical `var` refactor.
**Verification:** `node -c Script.js` exits 0, zero `var` in touched code, interaction smoke tests pass.
**Checkpoint:** Commit S4.

---

## Stage 5 — Security Headers + Image Polish *(S1-T5-security + S1-T5-images)*

**Status:** Pending  
**Goal:** Add CSP (post-theme-script-finalization), Permissions-Policy, HSTS, preconnect; add responsive images where impactful.  
**Phases:**
- [ ] S5.1 Compute `sha256-…` hash of the final inline pre-paint theme script (from S3).
- [ ] S5.2 Update `netlify.toml` with CSP, Permissions-Policy, HSTS, preconnect headers.
- [ ] S5.3 Add `srcset`/`sizes` to project thumbnails and gallery images.
- [ ] S5.4 Convert brand-page `.png` logo swatches to `.svg` twins.
- [ ] S5.5 Fix `<picture>` elements: add real `<source>` or replace with plain `<img>`.
- [ ] S5.6 CSP console test: open each page in headless browser, verify zero CSP violations.

**Helpers:** Nano-agent (flash) — compute CSP hash script; verify `netlify.toml` syntax.
**Verification:** Zero CSP console violations, OG meta present, image paths resolve.
**Checkpoint:** Commit S5.

---

## Stage 6 — Final Review + Baseline Commit

**Status:** Pending  
**Goal:** Main-agent diff review + pro nano-agent review + update docs.  
**Phases:**
- [ ] S6.1 Main agent reviews final diff of all stages.
- [ ] S6.2 Pro nano-agent final review (read-only): alignment, regressions, security, docs sync.
- [ ] S6.3 Fix critical/major findings; rerun verification if needed.
- [ ] S6.4 Update `LOGBOOK.md` with Stage 0–5 entries.
- [ ] S6.5 Update `TODO.md`: mark `node_modules/.package-lock.json` complete, record Astro decision, add Stage 2 as active plan.
- [ ] S6.6 Commit final checkpoint.

**Helpers:** Nano-agent (pro, readonly) — final diff review.
**Verification:** All merge-readiness checklist items pass.
**Checkpoint:** Commit S6.

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
4. **CSP hash invalidates on any future theme script edit.** Mitigation: document in `netlify.toml` comment; add `scripts/compute-csp-hash.js` to automate recomputation.
5. **`<picture>` / responsive image changes break paths.** Mitigation: link-check script verifies all `src`/`srcset` paths resolve.
6. **Dirty worktree collision.** Mitigation: branch from current state; commit only intentional loop changes; never revert unrelated user work.

---

## Merge Readiness Checklist

- [ ] All 40 baselines captured and committed.
- [ ] `style.css` builds cleanly from `app.css` with zero `brand-ring-spin` and zero `html.dark`.
- [ ] All 5 pages have identical head structure (theme script + metadata).
- [ ] `Script.js` has zero `.dark` class references.
- [ ] CSP console test passes (zero violations).
- [ ] `npm ci && npm run build:css` reproducible.
- [ ] `LOGBOOK.md` and `TODO.md` synced.
- [ ] Final pro nano-agent review clean or all findings fixed.
- [ ] Checkpoint commits on branch `shxdowloop/2026-07-01/website-architecture-remediation-2`.

---

## Checkpoint Log

| Stage | Commit SHA | Push Status | Notes |
|---|---|---|---|
| Pre-loop checkpoint | `4b7bdb7` | pushed | Prior session handoff (hero blobs, nav polish) |
| S0 — Harness | — | — | Pending |
| S1 — CSS dedup | — | — | Pending |
| S2 — Build | — | — | Pending |
| S3 — Head rewrite | — | — | Pending |
| S4 — Script.js cleanup | — | — | Pending |
| S5 — Security + images | — | — | Pending |
| S6 — Final review | — | — | Pending |
