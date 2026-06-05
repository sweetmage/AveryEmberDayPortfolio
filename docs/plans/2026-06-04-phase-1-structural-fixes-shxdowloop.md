# Process Plan — Phase 1 Structural Fixes

**Date:** 2026-06-04
**Branch:** `shxdowloop/2026-06-04/phase-1-structural-fixes`
**Goal:** Complete Phase 1 structural fixes before framework decision.

---

## Preflight Results

- Workspace: read-write
- Git branch: `master` → `shxdowloop/2026-06-04/phase-1-structural-fixes` (created)
- Remote: origin reachable
- Tools: npm ok, nano-agents available, shxdowTracker ok
- Provider pressure: Claude 30% / Codex 5% — native-first route

---

## Stage Outline

### Stage 1 — Unify Navigation & Footer
**Status:** Complete
**Files:** `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`
**Goal:** Replace old `<header>` / `<footer>` markup with `.brand-nav` / `.brand-footer` patterns from `index.html`. Update all resume nav links to branded resume.
**Changes:** Replaced `<header>` with `<nav class="brand-nav">` and `<footer>` with `<footer class="brand-footer">` in all four sub-pages. Resume nav links updated to `AveryEmberDay_Resume_2026_Brand.html`.

### Stage 2 — Resume Links & Upwork Icon
**Status:** Complete
**Files:** `index.html`, all sub-pages from Stage 1
**Goal:** Point every Resume nav link to `resume/AveryEmberDay_Resume_2026_Brand.html`. Wire existing `images/icons/upworkicon.svg` into `index.html` Contact section.
**Changes:** `index.html` resume nav link updated. Upwork icon added to Contact section with `currentColor` fill. `upworkicon.svg` stripped of hardcoded `#000000` fill.

### Stage 3 — Clean Placeholders
**Status:** Complete
**Files:** `projects/patriots-low-thirds.html`, `gallery/gallery.html`, `index.html`
**Goal:** Replace Patriots storyboard/render placeholders with a clean WIP notice. Remove 9 empty Digital Art placeholder items from gallery. Add a visible WIP label to the Patriots project card in `index.html`.
**Changes:** Patriots storyboard grid + video frame replaced with `.wip-notice` blocks. 9 empty gallery placeholders removed. `.wip-badge` added to Patriots card in `index.html`; `.wip-badge` CSS added to `style.css`.

### Stage 4 — Verification
**Status:** Complete
**Goal:** Grep for leftover old resume paths, old `<header>` patterns, 404-risk links. Confirm no merge conflict markers remain.
**Results:** All checks pass — zero old resume links in HTML, zero `<header>` tags in sub-pages, zero gallery placeholders, zero conflict markers.

### Stage 5 — Documentation & Checkpoint
**Status:** Complete
**Goal:** Update `TODO.md`, `LOGBOOK.md`, process plan. Commit and push checkpoint.
**Commit:** TBD

---

## Verification Matrix

| Check | Command / Method |
|---|---|
| No old resume links | `grep -r "AveryEmberDay_Resume_2026\.html" --include="*.html" .` (should only appear in archive/docs or old resume files) |
| No old header pattern in sub-pages | `grep -r "<header>" --include="*.html" projects/ gallery/ resume/` (branded resume excluded) |
| No empty gallery placeholders | Check `gallery.html` Digital Art section has no `.placeholder-img` items |
| Patriots WIP present | Check `patriots-low-thirds.html` has clean WIP notice |
| Upwork icon wired | Check `index.html` Contact section references `images/icons/upworkicon.svg` |
| No conflict markers | `grep -r "<<<<<<<\|=======\|>>>>>>>" --include="*.html" --include="*.md" .` |

---

## Risks

- `history-of-mistrust.html` is large (879 lines); header/footer swap must not break embedded slideshow JS or lightbox CSS.
- `brand-avery-ember-day.html` inline CSS is heavy; footer swap must preserve styles.
- Patriots thumbnail still missing; can only add a text/label WIP indicator, not a real image.
