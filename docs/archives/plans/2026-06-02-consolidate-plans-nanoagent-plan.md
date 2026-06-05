> **Status:** Consolidated in TODO.md > Completed Plans Archive

# Plan Consolidation — Nanoagent Plan (2026-06-02)

**Goal:** Consolidate 7 scattered plan documents (`docs/plans/*.md`) into a single authoritative reference within TODO.md. Make TODO.md the native source of truth for all project planning.

**Scope:** Documentation only. No code changes, no file deletions (yet — archive after user approval).

---

## Current State

**Plan files in `docs/plans/`:**
| File | Goal | Status | TickTick Ref |
|------|------|--------|--------------|
| 2026-05-20-hero-bubbles-nanoagent-plan.md | Rebuild hero blobs → organic iridescent animation | ✅ DONE | (no tasks) |
| 2026-05-22-branded-resume-nanoagent-plan.md | Create branded resume using brand.css tokens | ✅ DONE | (no tasks) |
| 2026-05-28-history-of-mistrust-canonical-content.md | Transcribe 30 carousel slides (source of truth) | ✅ DONE | (no tasks) |
| 2026-05-28-history-of-mistrust-carousel-slideshow-lightbox.md | 3 interactive viewing modes + lightbox for slides | ⏳ PARTIAL | Tasks 06, 07, 08, 10 open |
| 2026-05-28-history-of-mistrust-sync-nanoagent-plan.md | Sync source PNGs → portfolio, TickTick, Google, local folder | ⏳ PARTIAL | Phases 0–2 done; 3–5 pending |
| 2026-06-02-all-plans-nanoagent-analysis.md | Cross-reference all 5 plans vs. current codebase | ✅ DONE | (analysis only) |
| 2026-06-02-google-ticktick-cross-target-sync.md | Bi-directional task sync pipeline (TickTick ↔ Google) | ⏳ PARTIAL | Phase 0 done; 1–5 pending; auth setup done |

**Problem:** Planning knowledge is scattered across 7 files + TODO.md. Specs, implementation details, and task tracking are duplicated/fragmented.

---

## Consolidation Approach

**Key insight from plan review:** 2 of the 7 plans (carousel tasks 06/07/08/10, sync pipeline phases) are *already* tracked in TODO.md. Consolidation should:
1. Not duplicate what's already there
2. Add missing plans (hero bubbles, branded resume, canonical content, analysis) as summary references
3. Clarify which plans are "archived" (done) vs. "active" (in progress)

### Phase 1 — Create "Completed Plans Archive" section in TODO.md

Add a new section after the intro but before TickTick mirror, covering **DONE** plans only:

- **Hero Bubble Animation (2026-05-20)** — Rebuild hero blobs in brand.css with organic morphing + unique float paths. ✅ DONE
- **Branded Resume (2026-05-22)** — Create resume/AveryEmberDay_Resume_2026_Brand.html using brand tokens. ✅ DONE
- **A History of Mistrust — Canonical Content (2026-05-28)** — Transcribe 30 carousel slides as source of truth. ✅ DONE
- **All Plans Cross-Reference Analysis (2026-06-02)** — Analysis of all 5 plans vs. current codebase. ✅ DONE

Each entry includes:
- Short goal + date
- Status (✅ DONE)
- Key files touched
- Any noteworthy specs or verification notes
- Link to original plan file (for deep reference)

**In-progress plans** (carousel, sync pipeline) remain where they are in TODO.md — no duplication.

---

## Sample Archive Entry (Template)

Here's the format each DONE plan should follow in the "Completed Plans Archive" section:

```markdown
### Hero Bubble Animation (2026-05-20)
**Goal:** Rebuild 5 hero blobs in `brand.css` with organic morphing + unique float paths
**Status:** ✅ DONE
**Files:** `brand.css` (hero blob section only)
**Key specs:** 5 unique morphing keyframes + 5 unique float path animations; all brand tokens preserved
**Plan ref:** [docs/plans/2026-05-20-hero-bubbles-nanoagent-plan.md](docs/plans/2026-05-20-hero-bubbles-nanoagent-plan.md)
```

Apply this template to all 4 DONE plans (adjust goal/files/specs for each).

### Phase 2 — Add header notes to plan files

At the top of each plan file (first line, before existing content), add:
- For DONE plans: `> **Status:** Consolidated in TODO.md > Completed Plans Archive`
- For IN-PROGRESS plans: `> **Status:** Tracked in TODO.md > [section name]` (e.g., "A History of Mistrust — cross-target sync")
- For ANALYSIS plans: `> **Status:** Archived in TODO.md > Completed Plans Archive (reference documentation)`

Example (for hero-bubbles plan):
```markdown
> **Status:** Consolidated in TODO.md > Completed Plans Archive

# Nanoagent Plan — Hero Bubble Animation Rebuild
...
```

### Phase 3 — Update LOGBOOK.md

Add an entry documenting the consolidation:
- Task: Consolidated 4 completed plans into TODO.md "Completed Plans Archive"
- Impact: Single source of truth for finished work, cleaner reference structure
- What changed: Added "Completed Plans Archive" section to TODO.md
- Follow-up: Plan file archival decision (delete, keep, or move to docs/archives/)

### Phase 4 — User decision point

After user reviews the consolidated TODO.md, they can decide:
- **Keep plan files** — reference-only, no active maintenance
- **Delete plan files** — consolidation is complete
- **Archive plan files** — move to docs/archives/ or similar

---

## Files to Touch

| File | Change |
|------|--------|
| TODO.md | Add "Completed Plans Archive" section with 4 done plans (hero bubbles, branded resume, canonical content, analysis) |
| 4 completed plan files | Add one-line status note (reference to TODO.md) |
| 3 in-progress plan files (carousel, sync) | Add one-line status note (reference existing TODO.md sections) |
| LOGBOOK.md | Add entry for this consolidation task |

---

## Verification

- [ ] TODO.md has "Completed Plans Archive" section with 4 done plans
- [ ] Each archive entry has goal, date, key files, link to original plan file
- [ ] In-progress plans (carousel, sync) are NOT duplicated — existing TODO.md sections remain primary
- [ ] All 7 plan files have one-line status header pointing to their consolidated location
- [ ] LOGBOOK.md entry documents the scope and user decision point

---

## Risks

- **Low:** Documentation-only, no code changes.
- **User decision needed:** Should individual plan files be deleted or kept as archives?

---

## Implementation Order

1. Read all 7 plan files (done)
2. Synthesize into TODO.md Plan Archive section
3. Add cross-links from individual files
4. Update LOGBOOK.md
5. Present to user with archive decision point
