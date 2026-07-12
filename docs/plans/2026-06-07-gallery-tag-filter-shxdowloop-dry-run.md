# Dry Run: Gallery Tag Filter System

**Date:** 2026-06-07  
**Branch:** `shxdowloop/2026-06-07/gallery-tag-filter`  
**Mode:** Dry run — no application code is modified.  
**Plan file:** `docs/plans/2026-06-07-gallery-tag-filter-shxdowloop-dry-run.md`

---

## Goal

Update `gallery/gallery.html` so each artwork shows its medium tags, the "Hope" piece is removed, the "Digital Art" / "Traditional Art" section titles are removed, and a clickable tag filter bar is added at the top of the page. All work stays vanilla HTML/CSS/JS (no framework).

---

## Preflight Results

| Check | Result |
|---|---|
| Workspace | Read-write |
| Docs / Plans | Exist and writable |
| npm | OK |
| Git remote network | OK |
| shxdowTracker | OK — Claude 0% session / 8% weekly; Codex 5% session / 0% weekly |
| Nano-agents | Available at `C:\Users\Comet/.codex/skills/nano-agents/scripts/nano-agent.sh` |

**Routing:** Native-first (both providers well below 70%). Nano-agents reserved for small directed chores.

---

## Branch and Remote

- **Created from:** `master` (clean worktree, no uncommitted changes)
- **Branch:** `shxdowloop/2026-06-07/gallery-tag-filter`
- **Remote:** `origin` → `github.com/sweetmage/AveryEmberDayPortfolio.git`
- **Push status:** Would push after each checkpoint (`git push -u origin HEAD`)

---

## Stage Outline

### Stage 1 — HTML structure update (`gallery/gallery.html`)

**Status:** Would run  
**Goal:** Remove Hope, remove section headers, add tag metadata, add filter bar.

**Phases:**
1.1 Remove the `<figure>` for `Hope-Final.webp` (currently lines 76–79).  
1.2 Remove the `<h2>Digital Art</h2>` (line 50) and `<h2>Traditional Art</h2>` (line 87).  
1.3 Collapse the two `<section class="gallery-grid">` blocks into one unified grid (the second section wrapper is removed; all `<figure>` elements move into the first section).  
1.4 Add `data-tags` attributes to every remaining `<figure class="gallery-item">` with a normalized, lowercase, comma-separated tag list:

| Piece | `data-tags` |
|---|---|
| In Danger | `adobe-photoshop` |
| In Fatigue | `adobe-photoshop` |
| In Joy | `adobe-photoshop` |
| In Love | `adobe-photoshop` |
| Chill | `colored-pencil,procreate,adobe-photoshop` |
| Gross | `colored-pencil,procreate,adobe-photoshop` |
| Emergence | `procreate` |
| Faces | `watercolor,ink` |
| Lollipop | `acrylic` |
| Overflow | `acrylic` |
| Mermaid | `colored-pencil` |
| Stairs | `colored-pencil` |
| Beheaded | `acrylic` |
| Shadow | `acrylic` |
| TX Lake Landscape | `chalk-pastel` |

1.5 Add a `<div class="gallery-filter">` bar immediately after `.gallery-header` (before the unified grid). It contains:
- One button per unique tag plus an "All" button.
- Tags derived from the list above: `All`, `Adobe Photoshop`, `Colored Pencil`, `Procreate`, `Acrylic`, `Watercolor`, `Ink`, `Chalk Pastel`.
- Each button gets `data-filter="<slug>"` matching the `data-tags` slugs, or `data-filter="all"`.

1.6 Below each `<figcaption>`, append a `<div class="gallery-tags">` containing `<span class="gallery-tag">...</span>` elements displaying the human-readable tags for that piece.

**Expected file changes:** `gallery/gallery.html` only.

---

### Stage 2 — CSS additions (`style.css`)

**Status:** Would run  
**Goal:** Style the filter bar and per-piece tags.

**Phases:**
2.1 Add `.gallery-filter` rules:
- `display: flex; flex-wrap: wrap; gap: 0.5em; justify-content: center;`
- `margin-bottom: 2em; max-width: 900px; margin-left: auto; margin-right: auto;`

2.2 Add `.gallery-filter button` rules:
- Pill-shaped buttons (`border-radius: 9999px;`)
- `padding: 6px 14px; font-size: 0.8em;`
- Background `var(--brand-surface-2)`, text `var(--brand-text-muted)`, border `1px solid var(--brand-border)`
- Cursor pointer, transition on background/color/border.

2.3 Add `.gallery-filter button.active` / `:hover` states:
- Hover: border-color `var(--brand-border-focus)`, color `var(--brand-text)`
- Active/selected: background `var(--brand-accent-dim)`, border-color `var(--brand-accent)`, color `var(--brand-accent)`

2.4 Add `.gallery-tags` rules:
- `display: flex; flex-wrap: wrap; gap: 0.35em; justify-content: center;`
- `margin-top: 0.25em;`

2.5 Add `.gallery-tag` rules:
- `font-size: 0.75em; color: var(--brand-text-faint);`
- `background: var(--brand-surface-2); padding: 2px 8px; border-radius: 9999px;`

2.6 Add `.gallery-item.hidden` rule:
- `display: none;` (simplest toggle for filtering)

**Expected file changes:** `style.css` only (inside the existing `/* ── Gallery ── */` block or immediately after it).

---

### Stage 3 — JavaScript filter logic (`Script.js`)

**Status:** Would run  
**Goal:** Wire click handlers on filter buttons to show/hide gallery items.

**Phases:**
3.1 Append a new IIFE to `Script.js`:

```js
(function () {
  var filterBar = document.querySelector('.gallery-filter');
  if (!filterBar) return;

  var buttons = filterBar.querySelectorAll('button[data-filter]');
  var items   = document.querySelectorAll('.gallery-item[data-tags]');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      items.forEach(function (item) {
        if (filter === 'all') {
          item.classList.remove('hidden');
        } else {
          var tags = item.getAttribute('data-tags').split(',');
          item.classList.toggle('hidden', tags.indexOf(filter) === -1);
        }
      });
    });
  });
})();
```

3.2 Ensure the script runs after DOM is ready. Since `Script.js` is loaded at the end of `<body>`, the existing deferred execution pattern is sufficient.

**Expected file changes:** `Script.js` only (append after the smooth-scroll IIFE).

---

### Stage 4 — Verification

**Status:** Would run  
**Goal:** Confirm no 404s, filter works, responsive OK.

**Commands that would run:**

```bash
# 1. Link/path check — no 404 references inside gallery.html
grep -n "src=" gallery/gallery.html

# 2. Open in browser and smoke-test (Playwright or manual)
npx playwright test --grep gallery  # if a gallery test exists; otherwise manual open

# 3. Responsive check — would capture screenshots at 4 breakpoints
#    360px, 768px, 1024px, 1440px
```

**Manual checks that would be performed:**
- Open `gallery/gallery.html` in browser.
- Click each filter button; confirm only matching pieces remain visible.
- Click "All"; confirm all 15 pieces are visible.
- Confirm "Hope" is absent.
- Confirm no "Digital Art" or "Traditional Art" headings remain.
- Confirm tag pills render below each caption.

---

## Helper Dispatch List

| Role | Route | Prompt Summary | Expected Output |
|---|---|---|---|
| Explorer | Native subagent | Explore `gallery/gallery.html`, `style.css`, `Script.js` for existing gallery conventions and responsive breakpoints | File list, breakpoint notes, risk register |
| Phase Planner | Native subagent | Plan exact edits for Stages 1–3 with line numbers and content snippets | Detailed phase plan with snippets |
| Plan Reviewer | Native subagent | Review phase plan for correctness, accessibility, and framework-agnostic compliance | Actionable issues list |
| Executor (HTML) | Main agent or nano-agent | Apply Stage 1 edits to `gallery/gallery.html` | Changed file diff |
| Executor (CSS) | Main agent or nano-agent | Apply Stage 2 edits to `style.css` | Changed file diff |
| Executor (JS) | Main agent or nano-agent | Apply Stage 3 edits to `Script.js` | Changed file diff |
| Final Reviewer | Native subagent | Review branch diff for task alignment and regressions | Findings only |

**Degraded path:** If native subagents are unavailable, the main agent performs exploration and planning directly, using nano-agents only for mechanical verification chores.

---

## Expected File Changes by Phase

| Phase | File | Lines Added | Lines Removed |
|---|---|---|---|
| 1.1 | `gallery/gallery.html` | 0 | ~4 (Hope figure) |
| 1.2 | `gallery/gallery.html` | 0 | ~2 (two `<h2>`) |
| 1.3 | `gallery/gallery.html` | 0 | ~2 (extra `<section>` wrapper) |
| 1.4 | `gallery/gallery.html` | ~15 | 0 (`data-tags` attrs) |
| 1.5 | `gallery/gallery.html` | ~12 | 0 (filter bar) |
| 1.6 | `gallery/gallery.html` | ~45 | 0 (tag spans) |
| 2.1–2.6 | `style.css` | ~45 | 0 (filter + tag styles) |
| 3.1 | `Script.js` | ~25 | 0 (filter IIFE) |

**Net change estimate:** ~120 lines added, ~8 lines removed across 3 files.

---

## Risks, Hard Stops, Degraded Paths

| Risk | Mitigation |
|---|---|
| Removing section headers may affect CSS that targets `h2 + .gallery-grid` or similar | Scan `style.css` for adjacent-sibling selectors referencing gallery; none found in current file |
| Light/dark theme contrast on new tag pills | Reuse existing `--brand-surface-2` and `--brand-text-faint` tokens (already theme-aware) |
| Filter bar overflow on 360px | `flex-wrap: wrap` + small pill padding ensures natural wrapping |
| `Script.js` is shared across all pages | New IIFE is guarded by `document.querySelector('.gallery-filter')`; safe no-op on non-gallery pages |
| `data-tags` normalization mismatch | Use kebab-case slugs consistently in HTML and JS; human-readable labels only in UI text |

**Hard stops:** None identified. No secrets, billing, production deploys, or irreversible migrations involved.

---

## Merge Readiness Checklist

- [ ] Hope removed
- [ ] "Digital Art" and "Traditional Art" `<h2>` headers removed
- [ ] Single unified gallery grid
- [ ] Every piece has `data-tags` matching its mediums
- [ ] Tag pills visible below each caption
- [ ] Filter bar visible above grid
- [ ] Clicking a filter button shows only matching pieces
- [ ] "All" button restores full grid
- [ ] No console errors on gallery page
- [ ] No regressions on other pages (`Script.js` no-op safety)
- [ ] Responsive at 360px, 768px, 1024px, 1440px
- [ ] `LOGBOOK.md` and `TODO.md` updated
- [ ] Checkpoint committed and pushed

---

## Decision Log

1. **Tag normalization:** Use kebab-case slugs (`adobe-photoshop`, `colored-pencil`) in `data-tags` and `data-filter` to avoid spacing/quoting issues in HTML attributes. Display human-readable titles in the UI.
2. **Filter hiding method:** Use a `.hidden` class with `display: none;` rather than `opacity` or `visibility`, so the grid reflows automatically.
3. **Framework decision hold:** Per `TODO.md`, the site is vanilla HTML/CSS/JS pending a framework choice. This feature is implemented with plain DOM APIs only.
4. **Color casing consistency:** User provided mixed casing (`Colored pencil` vs `colored pencil`). Decision: normalize to title case in UI (`Colored Pencil`, `Chalk Pastel`) for visual consistency.

---

## Next Step

Run `shxdowloop` in **Normal** mode (or say `go ahead` / `proceed`) to execute the plan above, create the actual code changes, verify, and checkpoint-commit.
