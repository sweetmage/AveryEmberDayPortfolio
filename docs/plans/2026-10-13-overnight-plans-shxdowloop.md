# Overnight plans: the whole to-do list, drafted for morning (shxdowloop)

**Written:** 2026-10-13, overnight, for Avery to read tomorrow.
**Branch:** `shxdowloop/2026-10-13/overnight-plans`, cut from `origin/portfoliowebsite` (`8bf209f`). Pushed to its own branch only (first push is the Stage 1 checkpoint). `portfoliowebsite` is never touched by this loop, so nothing here deploys.
**Orchestrator:** Claude Sonnet 5.5 (ember-quill, VOID).
**Mockups:** [`2026-10-13-overnight-plans/mockups/index.html`](2026-10-13-overnight-plans/mockups/index.html). How to open them is in *Morning checklist*.

## The pitch, in my own words

The site already looks like me. What is left is the stuff that makes it look like I finish things.

There is a series pitch with a phoenix in it, and a rose that belongs to someone you should not trust. There is a business card that has to say who I am in about two square inches and still scan when somebody points a phone at it. There are two projects that have never once admitted what they were made with. And there is a brand page that explains my colors and my type and has never said a word about how I actually sound.

None of it needs a rewrite. All of it needs me to say yes, hand over the last few files, and then get out of the way. So tonight the loop does the part that does not need me: it organizes the pile, draws every unfinished surface so I can judge it by looking instead of imagining, and lists the exact questions that are still holding each one up. Tomorrow I answer, I upload, I approve with my eyes, and the real build starts.

## Goal

Get every open item on `TODO.md` to one of two states by tomorrow: **drawn and waiting on my yes**, or **named, with the single missing thing written next to it**. Build no real UI before its mockup is approved. Write none of my words for me.

## Preflight results and degraded paths

- Workspace read-write, tree clean, `docs/plans` writable, remote reachable (`origin` = GitHub `sweetmage/AveryEmberDayPortfolio`).
- The worktree I started in was **3 commits behind** `origin/portfoliowebsite` (docs only). The reconcile branch it was named for already shipped on Oct 13. The loop branched from origin instead.
- npm 11.19.1 ok. shxdowTracker 1.16.0 ok: Claude 35% session, 18% weekly, so native helpers are allowed. Codex token expired and Cursor has no credentials, so **no nano or Codex review route**; review is a native `oracle` agent only.
- No GitHub Actions. Netlify's `allowed_branches` is `["portfoliowebsite"]` (`docs/deploys.md`, Entry 115), so pushing any other branch produces no deploy. `netlify.toml` also skips docs-only diffs. The Oct 9 print-mockups plan recorded the same reading. The new branch's upstream was unset on purpose, because `git switch -c ... origin/portfoliowebsite` had made it track production. Git's default would have refused a bare push to a differently named branch, but every push here is explicit (`git push -u origin HEAD`), so none relies on that.
- SOL (baselines, Adobe) is reachable but **unused tonight**: baselines wait until copy and layout are final.

## UI and UX mockup record

Offer answered 2026-10-13, verbatim: "Yes, mockups overnight, approve tomorrow (Recommended)". Tools row scope answered, verbatim: "Yes, list the site stack too (Recommended)".

| # | Mockup | Status | Your answer (record verbatim) |
|---|---|---|---|
| 1 | The SECTION 6 tile on `/portfolio/` | **Pending** | |
| 2 | The SECTION 6 project page | **Pending** | |
| 3 | Tools rows on both project pages | **Pending** | |
| 4 | Business card, front and back, real QR | **Pending** | |
| 5 | Brand voice and tone, plus the one more section | **Pending** | |

**2026-10-13, after the four logo changes, the tile fixes and the small-screen check, the user said, verbatim: "looks goo. finish with the loop".** That is a general thumbs-up, not a yes to each page, so all five stay **Pending** until each gets its own answer. Only a yes from me approves a page. The loop never approves one. Every page stays pending until I answer.

## Helper routing

Native `oracle` for the one plan review. The main agent did the writing and the mockups: the scope is a few small disjoint files, so fanning out would have cost more than it saved. No nano-agents (no qualified route). Routing ledger in the handoff.

## The tracks, one at a time

### A. SECTION 6 Logo Design (paused on me)

Five SVGs exist and are provisional: the Phoenix and four White Rose files (open rose and bud, each in color and black and white). I looked at them and they are almost perfect. There is a mistake in the linework of the **art**, not the trace. I said I would re-upload.

- **Waiting on me:** the corrected art. Which logo and which lines I have not said, and the agent will not guess. It asks when the art lands.
- **When it lands:** rerun `scripts/logo-traces.py`, trace on SOL, render every file on a dark and a light backdrop and look, save over the provisional files in `ArtBridge/SECTION 6 Logo Design/`, show me. The fix goes in the source art. No hand-edited paths.
- **Site, after I approve mockups 1 and 2:** third project tile after Brand, titled exactly **SECTION 6 Logo Design**, the Phoenix (top-of-art close-up) as the title card, description "Logo design for SECTION 6, an animated series pitch registered with the WGAW." The per-logo descriptions are the short rewrites you asked for. Real alt text is written with me.
- **Your four changes (later on Oct 13):** the Phoenix is now vivid red (`#E4101E`) and reads fine on the dark tile; the tile picture is a close-up of the top of the Phoenix; the open rose's leaf green now sits under the black linework (fixed in the source layers before tracing); the descriptions are rewritten short, with Procreate, InDesign and Photoshop listed as tools. Details: the logo plan's *Update 2026-10-13 (later)*. The black and white roses have white petals and dark outlines, so each needs a mid-tone backdrop where both read.
- **Copy:** rewritten short at your request, with the typos gone. Tools row: Procreate, InDesign, Photoshop.

### B. Tools used, per project (decided, waiting on a look)

A History of Mistrust is Figma, made entirely in it. The Brand row lists InDesign for the logo plus the site's own stack: Next.js 15 static export, React 19, TypeScript, Tailwind v4 with `brand.css`, sharp, Playwright, Netlify. That part is decided. Mockup 3 shows the layout.

- **Waiting on me:** whether Photoshop, Illustrator and JavaScript stay on the Brand row (the old table listed them and the Oct 13 brief says InDesign), and my edits to the site write-up paragraph. The paragraph in the mockup is the agent's first draft of the site write-up, because the Oct 13 brief asked the agent to write that one. I edit it freely.

### C. Brand page: the business card, voice and tone, and one more

- **Card.** Logo, a real QR to `averyemberday.com` (made and checked as a QR, then scanned on a phone before I sign off), email, Google Voice number, built from the live tokens. Built in InDesign on SOL after I approve mockup 4. The mockup uses a real QR and placeholder contact fields.
- **Waiting on me:** the email, the Google Voice number, card size (3.5 x 2 in assumed), print or digital, whether the QR can be fancier than "dark modules on white".
- **Voice and tone.** I draft it, the agent proofreads, and nothing gets written for me. Mockup 5 holds the slot.
- **One more section with a header.** Still has no topic. Candidates in the mockup: logo usage and clear space, the card as its own section, or the brand in the wild. **Waiting on me:** pick one or tell it a better one.

### D. The copy pass (waiting on my first draft)

12 gallery descriptions (Moonlight made it 12) and both project summaries. I write the first draft, the agent proofreads and nothing else. `alt` becomes a real description of each image. The render path exists, so this is pure data once I write. **Waiting on me:** the drafts.

### E. Housekeeping the loop does tonight

- Reconcile `TODO.md` and `docs/plans/README.md` with this plan and with origin's current state.
- Local `portfoliowebsite` was fast-forwarded to `origin/portfoliowebsite` (`8bf209f`) at 01:52 tonight by something that is **not this loop** (the reflog line has no message; the main checkout is on `shxdowloop/2026-10-10/portfolio-reconcile` at `a8036ab`). It is no longer stale. This loop never resets or deletes branches, and that one is mine to approve. `TODO.md` carried the stale wording, and it is corrected in Stage 1.6.

## Stages

Fewest stages the real gates allow. The user gate is the only forcing reason, and nothing else is a boundary.

### Stage 1: Draft and mockups (this run)

**Status:** Complete (loop closed 2026-10-13)
**Goal:** The plan and every mockup, ready to judge.
**Forcing reason for the boundary after it:** my approval of each page, tomorrow. That is a human gate.
**Phases:**
- [x] 1.1 Read `TODO.md`, the three plans, the live `brand.css` tokens, the Portfolio page and tile components
- [x] 1.2 Write this plan
- [x] 1.3 Build 5 mockup pages plus an index, linked to the real `brand.css`, with light and dark toggles
- [x] 1.4 Look at every page in the browser, then re-measure the card fix at 1440 and 390 (see the matrix)
- [x] 1.5 Fresh-context plan review (`oracle`, one round): FAIL on three findings (index URL under `serve`'s clean-URL redirect, card box-sizing, branch-housekeeping claim), all fixed without a second round, plus the nits
- [x] 1.6 Reconcile `TODO.md`, `docs/plans/README.md`, `LOGBOOK.md`

**Parallel tracks:** three files or fewer per concern, scopes disjoint (plan, mockups, bookkeeping). Done by the main agent in sequence. They are small enough that dispatch would have cost more than it saved.
**Verification:** each mockup loaded over HTTP and screenshotted; `git add -A` first, then `git diff --cached --check` and `git diff --cached --stat` (plain `git diff` cannot see untracked files); no real app file touched (the stat lists only `docs/`, `TODO.md`, `LOGBOOK.md`).
**Checkpoint:** see *Checkpoint log*.

### Stage 2: Build, after approval (tomorrow, with me)

**Status:** Pending
**Goal:** Build each page I approved, and only those.
**Forcing reason:** each page needs my yes first, and the corrected art needs my upload.
**Phases:**
- [ ] 2.1 SECTION 6 tile and page: needs the corrected art, mockups 1 and 2, my alt text
- [ ] 2.2 Tools rows: needs mockup 3 and my paragraph
- [ ] 2.3 Business card in InDesign: needs mockup 4, email, number, size
- [ ] 2.4 Brand voice and the extra section: needs mockup 5, my draft, a topic
- [ ] 2.5 Copy pass data: needs my drafts
- [ ] 2.6 Regenerate the 40 baselines on SOL **once**, last, with `--update-snapshots=all`
- [ ] 2.7 One batched push to `portfoliowebsite`, only with my go-ahead in the moment (one production deploy: 15 of the 300 monthly credits, 1 of the 20 deploys they buy)

## Morning checklist

**Look at the mockups (do this first).** From this worktree (it has no `.env`; do not run this from the main checkout, because `serve` hands out dotfiles and `.git`):

```bash
cd /Users/comet/Repos/AveryEmberDayPortfolio/.claude/worktrees/reconcile-branches-main-e85f39 && npx serve . -c docs/plans/2026-10-13-overnight-plans/serve.json -l tcp://127.0.0.1:3478
```

then open <http://localhost:3478/docs/plans/2026-10-13-overnight-plans/mockups/index.html>. The `serve.json` turns off clean URLs, which otherwise redirect `index.html` to a slash-less path and break every relative link, and it adds a rewrite so the pages also open without `.html` (the in-app browser pane strips it). That command binds to this Mac only. For the phone, swap `127.0.0.1` for `0.0.0.0` and use this Mac's Tailscale address (in `~/.claude/memory/fleet.md`) with the same path, then stop the server when you are done, because it is then reachable from the LAN.

**Answer, one line each:**
1. Mockup 1 to 5: approve, approve with changes, or reject.
2. Phoenix tile on the dark backdrop (default now) or the light one?
3. Rose card labels: what do you want them called?
4. Brand row tools: which of Photoshop, Illustrator, JavaScript stay?
5. Card: email, Google Voice number, size, print or digital, QR style.
6. The extra Brand section: topic and title.

**Upload or tell the agent where it is:**
- The corrected Phoenix PNG and the rose PSD (iCloud `ArtBridge/`, PSD in `Procreate to PSD/`). Say which logo and which lines were wrong.
- My drafts: 12 gallery descriptions, both project summaries, brand voice and tone, the site write-up paragraph.

## Helper roles and stop conditions

One native `oracle`, one round, on this plan and the mockups. A FAIL's findings are fixed without a second review. Hard stops: anything that would push `portfoliowebsite`, spend credits, write my copy, or touch SOL baselines.

## Checkpoint log

| Stage | Commit | Push |
|---|---|---|
| 1 | `c864f0e` | pushed to `origin/shxdowloop/2026-10-13/overnight-plans` only |
| 1, user's changes (Phoenix red and crop, rose leaf order, short copy, three-across tiles, no side scroll) | `795fbaf`, `260b98c`, `3d14205` and the commits before them | same branch only |

## Verification matrix

| Claim | Evidence |
|---|---|
| Mockups use the real tokens | `<link>` to `brand.css`, rendered in the browser pane in dark and light |
| QR is real and points to the site | `segno`, version 4, error level H, 4-module quiet zone, decodes to `https://averyemberday.com/` (reviewer, Chromium BarcodeDetector). **Not yet scanned by a phone.** Scanning is a gate in Stage 2.3 |
| Nothing deployable changed | `git diff --cached --stat origin/portfoliowebsite` after staging shows only `docs/`, `TODO.md`, `LOGBOOK.md` |
| Card front and back share one ratio | Measured in the browser at 1440 and 390 after `box-sizing: border-box` |
| Provisional logos are provisional | Copied into `mockups/assets/` and labelled provisional |

## Open risks

- The logo SVGs in the mockups are the trace of **art that has a mistake in it**. They are for layout judgment only.
- The `mockups/assets/` copies of the five SVGs add about 280 KB of tracked files. They are replaced or deleted when the corrected art lands.
- The mockup pages pull Google Fonts from the network, as the real site does. Offline, they fall back to system fonts.
- The Tools write-up paragraph is the agent's draft, and the card labels, section labels and the three voice-card headings are placeholder wording. Each is marked as such on its mockup.

## Merge readiness

Not for merge. This branch is a plan and a set of drafts. It merges into `portfoliowebsite` only with Stage 2 done, my approvals recorded above, baselines regenerated, and my explicit go-ahead.
