# A History of Mistrust — Cross-Target Sync (Nanoagent Plan)

Date: 2026-05-28
Owner (review): main agent (you, driving kilo)
Status: ready to execute

## Goal

The 30 final PNGs are the source of truth. Bring four targets into agreement with them:

1. **Portfolio website** (`D:\My Stuff\Git\CometGit\portfoliowebsite`) — build the missing case study page + fix the stale card.
2. **TickTick** — audit `history-of-mistrust` tasks, close finished ones, add follow-ups.
3. **Google doc** (private) — read + sync copy to match the PNGs, via agent-browser on the logged-in session.
4. **Local folder** (`D:\My Stuff\creations\Best\A History of Mistrust`) — reorganize / renumber, group finals vs supporting material.

Project is a 30-slide Instagram carousel infographic about medical mistrust in marginalized communities (HIV/AIDS, Tuskegee-era distrust, LGBTQ+ health, community-led clinics, policy advocacy). NOT an "illustrated narrative."

## Source assets

Local source: `D:\My Stuff\creations\Best\A History of Mistrust\`
- `A History of Mistrust.png` — full horizontal master infographic (all copy in one image)
- `Instagram post - 1.png` … `Instagram post - 30.png` — carousel slides (1 = title cover)
- `supporting material\` — `A History of Mistrust Process.pdf`, `HistoryofMistrustMoodboard.png`, `aHistoryOfMistrustStoryboard.jpg`

Repo already has: `images/myart/A History of Mistrust/` with cover PNG + supporting material. **Missing: the 30 carousel slides** — must be copied in.

## Roles / iteration plan (nano-agents)

> Max two concurrent tracks. Sequential by default. Don't fan out all 30 at once.

| # | Role | Type/Model | Scope | Writes? |
|---|------|-----------|-------|---------|
| 1 | Image transcription | `--type image`, **Kimi K2.6** (`kilo/moonshotai/kimi-k2.6`); fallback DeepSeek v4 Pro | Transcribe text + describe layout of slides in batches of ~6, attach via `--file`. Output structured per-slide JSON/markdown. | no (readonly) |
| 2 | Plan review | native or `--readonly` | Review this plan | no |
| 3 | Final diff review | native or `--readonly` | Review portfolio working tree | no |

**Vision check first:** before batching, run ONE slide through the chosen model and confirm it actually reads the pixels (returns real slide text, not a hallucination). If Kimi K2.6 lacks usable vision, fall back to DeepSeek v4 Pro, then to the default image model. Main agent verifies transcription against 3-4 slides read directly before trusting it (subagent output is not truth).

## Steps

### Phase 0 — Extract (source of truth)
- [ ] Vision smoke test on `Instagram post - 2.png`.
- [ ] Transcribe all 30 slides in 5 batches of 6. Capture: slide number, heading, body copy, any stats/citations, visual motif.
- [ ] Main agent spot-checks slides 1, 7, 15, 30 directly. Assemble canonical content doc.

### Phase 1 — Portfolio website
- [ ] Copy `Instagram post - 1..30.png` into `images/myart/A History of Mistrust/slides/` (consistent zero-padded names, e.g. `slide-01.png`).
- [ ] Create `projects/a-history-of-mistrust.html` from `projects/brand-avery-ember-day.html` template (header/nav/footer, theme toggle, return-to-top, `../brand.css` + `../style.css`). Sections: hero (correct tag = "Editorial / Infographic" or "Social Campaign", real description), carousel/slide grid (all 30), Moodboard, Storyboard, Process (link the PDF).
- [ ] Fix `index.html` card: replace `placeholder-img` with the cover image, correct the tag + description (currently wrongly "Narrative Illustration" / "multi-page illustrated narrative").
- [ ] Verify: open page in headed agent-browser, check all 30 slides load, links resolve, light/dark both look right, no clipped layout. Check gallery if mistrust belongs there too.

### Phase 2 — TickTick
- [ ] List tasks in Portfolio Website list (project id `69c8addc8f0823c509e1979f`) tagged `history-of-mistrust`.
- [ ] Complete tasks the finished PNGs satisfy.
- [ ] Add follow-ups (e.g. "publish case study page", "post carousel to IG", "sync doc"), tagged `history-of-mistrust`. Do NOT create new lists/groups.

### Phase 3 — Google doc
- [ ] agent-browser (headed) to the doc URL on logged-in Google session. Read current content.
- [ ] Diff against canonical content. Sync copy to match the final PNGs (title, framing, slide copy/order). Confirm edits with user before destructive rewrites.

### Phase 4 — Local folder
- [ ] Renumber/group: finals zero-padded (`slide-01.png`…`slide-30.png` or keep "Instagram post" naming consistently), keep `supporting material/` grouped. Add a README/manifest summarizing project + where it's published.

### Phase 5 — Document + review
- [ ] Update portfolio `LOGBOOK.md` (newest-first, format per conventions).
- [ ] Final review pass (native or readonly nano-agent) on the portfolio working tree.
- [ ] Main agent reviews full diff. No commits without explicit user go-ahead.

## Verification
- Portfolio: headed browser, all 30 slides + supporting assets render, links work, both themes, responsive (wide + narrow), no clipping.
- TickTick: re-list tasks, confirm states.
- Doc: re-read after edit, confirm matches canonical content.
- Folder: `ls` confirms consistent naming + grouping.

## Risks / notes
- Free/flash image models may attach files without real pixel vision — verify before trusting (per user feedback).
- Google doc is private; agent-browser session must be logged in. Confirm before overwriting doc content.
- No commits, pushes, or doc destructive rewrites without explicit user approval.
- Keep CDP/agent-browser commands strictly sequential (memory blowup risk on overlap).
