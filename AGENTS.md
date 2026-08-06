# AGENTS.md — Portfolio Website Agent Guide

This is the canonical agent-facing source of truth for the `portfoliowebsite` repo. If you are Claude, Codex, Kilo, Cursor, Blackbox, Copilot, Gemini, or any other AI agent: **read this file first**.

## Quick Links

| File | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | **Structural map — read this instead of exploring the tree** |
| `TODO.md` | Active tasks, handoffs, completed plans |
| `LOGBOOK.md` | Session history (newest-first) |
| `docs/deploys.md` | Netlify: deploy loop, credit model, pause state, form registration |
| `docs/NOTES.md` | Project notes: branch policy, TickTick, Google Docs, environment constraints |
| `docs/accessibility.md` | WCAG 2.1 / AudioEye compliance reference |
| `docs/plans/*.md` | Active implementation plans |
| `docs/archives/plans.md` | Completed/cancelled plan archive |
| `docs/checkpoints/*.md` | Known-good restore points: deployed SHA, verified state, rollback steps |

## Branch Policy

> ### ⏸ DEPLOY PAUSE IN EFFECT UNTIL 2026-08-07
>
> **Work on `develop`, not `portfoliowebsite`.** At the user's direction (2026-07-26), all updates
> to Netlify and the live URL are paused until the credit cycle resets on **Aug 7, 2026** (LOGBOOK
> Entry 104 — the team is out of credits and production deploys are already refused server-side).
> The date was **Aug 6 everywhere until 2026-08-03**, when the Netlify API was read directly:
> `period_end_date` is `2026-08-07T00:00:00.000-07:00`. A push on Aug 6 would have cleared the
> expiring guard and still been credit-skipped. Corrected in the hook and every doc (Entry 115).
>
> - Commit and push to **`develop`**. It was fast-forwarded to `portfoliowebsite` @ `41005ed`.
> - **Do not push `portfoliowebsite`.** A `.githooks/pre-push` guard blocks it and **expires by
>   itself on 2026-08-07** — no cleanup needed. Override only on explicit user instruction with
>   `git push --no-verify`. (This guard moved from `.git/hooks/` to the tracked `.githooks/` on
>   2026-07-31 — see **Git hooks** below. Verified still blocking after the move.)
> - Preview locally: `npm run dev` → <http://localhost:3000> (hot reload), or the `launchtest`
>   skill. No Netlify involvement.
> - On/after Aug 7: merge `develop` → `portfoliowebsite` and push **once**. One production deploy,
>   15 credits, rather than one per commit.
>
> Full details and the lift-the-pause checklist: [`docs/deploys.md`](docs/deploys.md).

**All changes must be committed to the `portfoliowebsite` branch** *(suspended during the deploy
pause above — use `develop`)*. Do not commit to `main` or `master` without explicit user direction.

**`portfoliowebsite` is the branch Netlify deploys from** (repointed 2026-07-12 via the Netlify API at the user's direction — production branch and allowed-branches both changed from `master` to `portfoliowebsite`, verified with a production deploy from the new branch; see `LOGBOOK.md` Entry 069). Pushing `portfoliowebsite` publishes to production. That makes every push to this branch a production-affecting action: get the user's explicit go-ahead in the moment before pushing, every time — this note is informational, not standing authorization. `master` is retained as a historical branch; do not merge into it without explicit user direction.

## Git hooks

**`core.hooksPath` is set to `.githooks/`** (2026-07-31, by `shxdowmap install-hook`). That setting
makes git ignore `.git/hooks/` **entirely**. All four previously-active hooks were migrated into the
tracked `.githooks/` directory in the same change, because leaving them behind would have silently
disabled them:

| Hook | Contents |
|---|---|
| `pre-push` | **Deploy-pause guard** (blocks `portfoliowebsite` until 2026-08-07) + Git LFS |
| `post-commit` | shxdowmap architecture-doc staleness gate + Git LFS |
| `post-checkout` | Git LFS |
| `post-merge` | Git LFS |

> **If you add a hook, put it in `.githooks/`, not `.git/hooks/`** — the latter is dead while
> `core.hooksPath` is set, and a hook placed there will appear to work (the file is executable, no
> error) while never running. Verify a new hook by invoking the file directly with representative
> stdin/args, not by assuming git ran it.
>
> `.githooks/` is tracked, so these travel with the repo; a fresh clone still needs
> `git config core.hooksPath .githooks` once (or a `shxdowmap install-hook` run).

## Architecture map

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) is the agent-facing structural map — **read it
instead of re-exploring the tree**. It carries the module map, execution model, data/config model,
key entry points per task, and the footgun list. Freshness is enforced by the `post-commit` gate
above, which fingerprints code-file paths, the code-dir set, and manifest blob SHAs.

```bash
shxdowmap status          # fresh / STALE / no baseline
shxdowmap refresh --auto  # deterministic rebuild of the generated blocks
```

Sections wrapped in `<!-- shxdowmap:begin:… -->` / `<!-- shxdowmap:end:… -->` markers are
engine-owned and overwritten wholesale — put prose outside them. Run `refresh --auto` at the end of
any run that changes repo structure, before handoff.

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

`npm test` / `npx playwright test` — smoke tests + a **compare-based** visual regression gate, plus bubble-engine coverage, gallery expand coverage and Mistrust set-strip checks (**90 tests**: 40 visual = 5 pages × 4 breakpoints × 2 themes, plus smoke, 10 bubble-exclusion specs, 17 gallery-expand specs, and the strip-vs-export assertions).

> **When a CSS property needs two states, it stops being a Tailwind utility.** Utilities outrank
> `brand.css`, which is imported into the `components` layer, so a state-dependent rule written there
> is silently inert next to a utility for the same property — no error, nothing red. This has now cost
> two rounds on the gallery: `h-full` outranked `align-self: start` and left an expanded card holding
> ~380px of empty space (Entry 121), and `md:auto-rows-[1fr]` would have done the same to the
> open-state row sizing (Entry 122). The gallery's art cap, row sizing and expanded span all live in
> `brand.css` for this reason. If a rule looks correct and does nothing, check for a utility first.

> **The suite is not reliably green, and that is a known open defect, not your change.**
> `bubbles-exclusion › Contact form @ 1440px` fails roughly 1 run in 3 with a ~1950px² overlap. Measured
> across 7 full runs on 2026-08-05 (Entry 118) and reproducible with unrelated specs excluded. If you
> hit it, check `TODO.md` for the recorded hypothesis before investigating — and **do not raise a
> tolerance to make it pass.** Twice the cause was somewhere else entirely (Entries 090, 115).

> **The two motion-enabled specs are the only coverage for anything that moves.** `bubbles-exclusion.spec.js`
> and `gallery-expand.spec.js` both run `test.describe.configure({ mode: 'serial' })`, and both must keep
> doing so. Neither gets its own Playwright project — that was tried on 2026-08-03 and reverted the same
> day (Entry 115) once contention turned out not to be the root cause.

> **Full reference: [`docs/visual-gate.md`](docs/visual-gate.md)** — coverage matrix, tolerance
> rationale, the four traps, motion-spec rules, and the CI containerization item. Read it before
> changing anything about the gate or re-baselining. The essentials:
>
> - **To accept an intentional visual change:** `npm test -- --update-snapshots`, then *review the
>   regenerated PNGs before committing them*. An unreviewed update defeats the gate. Then run the
>   suite until green **twice in a row** — one green run does not prove stability, and a bulk update
>   can silently skip files.
> - **Never judge a bulk update by snapshot mtimes.** `--update-snapshots` only rewrites snapshots
>   whose pixels changed, so mixed timestamps are normal. Re-running the suite is the only check.
> - **`threshold: 0.02` and `maxDiffPixels: 500` are empirically derived, not defaults.** At
>   Playwright's 0.2 an entire-theme text-colour shift passed undetected; a ratio-based limit let a
>   4px nav shift pass for a week on tall pages. Don't relax either without redoing the
>   injected-regression proof.
> - **The gate is blind to motion** — it captures under `prefers-reduced-motion`, where the bubble
>   engine creates nothing. `tests/bubbles-exclusion.spec.js` is the only motion-enabled spec and the
>   only coverage the engine has. Keep its `mode: 'serial'`, sample per animation frame rather than
>   per millisecond, and keep the `opacity <= 0.05` skip.
> - **One bubble assertion is deliberately not "zero overlap".** At 768px the Contact form leaves
>   24px channels, narrower than a 10-28px bubble, so zero overlap is geometrically impossible; that
>   case asserts no bubble *centre* enters the form. Don't "fix" it by loosening a threshold.
> - **Never raise a tolerance to make a physics assertion green.** Twice now the cause was elsewhere
>   (Entries 090, 115).

`node scripts/generate-mistrust-assets.js [--all]` — rebuild the "A History of Mistrust" webp assets (30 slides × 2 sizes + 3 set strips) into **both** `images/` and `public/`. Run after any Figma re-export of those PNGs.

> Default mode rebuilds only sources whose **content** changed per `git status`, not mtime — a Figma re-export rewrites the mtime of all 30 PNGs even when only a few differ, and rebuilding all of them re-encodes unchanged slides with a different libwebp build, producing 60 files of byte noise that hides the real diff.
>
> The wide `sets/set-N.webp` strips are composed from the individual slide PNGs, **not** from the `sets/A History of Mistrust Set N.png` exports — those were verified defective on 2026-07-27 (Set 1 clipped, Set 3 containing Set 2's slides; Entry 106). Tiles are laid out at native width, not fixed 1080px slots, because slide 21 is 1056px wide.
>
> `SLIDE_ALT` in `app/projects/mistrustSlides.ts` must stay in sync with the artwork — it is the alt text *and* the lightbox caption source. It drifted out of order for twelve slides before Entry 106. **The artwork is the source of truth**; `slides.md` is documentation and has been wrong independently. (Moved 2026-07-31 from `public/scripts/history-of-mistrust-slideshow.js` when the slideshow was ported to React components — that script no longer exists; the array was machine-verified verbatim across the move. `tests/mistrust-slideshow.spec.js` asserts the set title cards still land on slides 1/11/21.)

`node scripts/generate-og-image.js` — regenerate the social share card `images/og-default.png` (+ `public/`) by screenshotting the **live homepage hero**. Needs `npm run dev` running. **Re-run after any hero change** — the card is a capture, so it is only current if regenerated.

> Hides `nextjs-portal` before capturing: the dev-tools overlay is a real DOM element and will otherwise be baked into the card (a red "3 Issues" badge shipped into the first render). Captures under `prefers-reduced-motion` so the hero blobs stop at declared positions and the output is reproducible. Renders at 2x then downsamples to 1200x630 — the raw 2x PNG is ~1.9 MB, the downsample ~150 KB.
>
> All four pages pull the image descriptor from `app/og.ts`; add new pages there rather than re-typing the URL, so the URL/width/height/alt cannot drift apart. `metadataBase` in `app/layout.tsx` is what makes `og:image` absolute — unfurls break without it.

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
  elements. `.brand-btn` was the last holdout on `--brand-border-focus` (a near-invisible
  `rgba(255,255,255,0.24)` in dark) until Entry 107 — if you add a button variant, use the accent. (This line previously named `--brand-border-focus`; that token is
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
- Nav: **Home / Projects / Gallery / Contact** (nav restructure 2026-07-14, Entry 075 — no submenu, Hire Me CTA, or hamburger). Contact was re-enabled in nav + footer 2026-07-27 (Entry 106); the Netlify Forms toggle is still off, so the form renders but does not capture submissions. **The nav has no spare horizontal room at 360px** — fitting the fourth label took the *lower* bound of every nav clamp (link padding 6px, logo 7px, gap 2px) plus a 44px cap on `#theme-toggle` below 480px. A fifth label does not fit without a drawer. Re-measure at 360px before adding one
- Nav buttons (Entry 082) paint **no chrome at rest** — a square fill appears only on hover (`--brand-surface-3`), press, or current page (`--brand-accent-dim`). They run the full bar height via `height: 100%`, which is why `.brand-nav`, `.brand-nav-inner`, and `.brand-nav-actions` all use `align-items: stretch` rather than `center`. **Bar height lives in `--brand-nav-height`; change it only there** — three rules read it, and the theme toggle uses `height: 100%` + `aspect-ratio: 1` to stay square against it. Note the theme toggle carries both `id="theme-toggle"` and `class="brand-theme-toggle"` and **the ID block wins**, so editing only the class is a no-op

## Deploy

> **Full reference: [`docs/deploys.md`](docs/deploys.md)** — deploy loop, site facts, credit model,
> cost control, the current deploy pause, and dashboard operation. Read it before changing anything
> deploy-related. The bullets below are the load-bearing gotchas only.

- Netlify runs `next build` and publishes the static export (`publish = "out"`); the committed `style.css` only serves the undeployed legacy root site
- `netlify.toml` CSP is `script-src 'self' 'unsafe-inline'` — it does **not** pin sha256 hashes (that claim was stale, corrected 2026-07-28). Theme init loads from the external `/scripts/theme-init.js`. Its `<Script strategy="beforeInteractive">` must live **inside `<body>`** in `app/layout.tsx`: as a direct child of `<html>` React throws a hydration error on every load (fixed Entry 107)
- **Credits, not build minutes.** 300/month hard limit, **15 credits per production deploy** = **20 deploys/month**. Build *duration* is not metered, so optimising build speed saves nothing. **Deploy Previews and branch deploys are free** — never disable them to "save money". Batch commits into one push. Out of credits = published site stays live, but pushes return `skipped: true` with **no build log** (Entry 104)
- **A docs-only push does not deploy.** `netlify.toml`'s `[build] ignore` cancels the build when a push touched only `docs/` or the root process docs. This is expected, not a broken deploy. Two invariants when editing it: never glob `*.md` (`public/**/*.md` **is** copied into the export), and any failure to compare must exit 1 (build) — a bare `git diff --quiet` with unset refs exits 0 and would silently skip every build forever (Entry 103)
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"` is set for the Netlify build — the CI never runs Playwright. If a test step is ever added to the build command, drop this or it fails with "browser not found"

## Design Conventions

### Hover contract: one purple for actions, grey for selection

**Every clickable button outside the nav bar hovers to the accent purple** — `--brand-accent-dim`
where the button sits on a page surface (`.brand-btn-secondary`, `.mistrust-nav` carousel arrows,
`#return-to-top`, `#theme-toggle`), or `--brand-hover-tint-inverse` where the button has its own
inverse fill that would swallow a 14–30% alpha (`.brand-btn-primary`, `.brand-btn-spectrum`, i.e.
the Contact submit). The lightbox controls hardcode `rgba(204,68,255,0.35)` because their scrim is
near-black in *both* themes, so the light-theme accent-dim would vanish (2026-08-01, Entry 111).

**Controls that carry a selected state are excluded on purpose** — `.project-tab` (Projects tabs +
Gallery filters), `.mistrust-set-tab`, `.brand-chip`, `.mistrust-thumb`. Their *selected* state is
already `--brand-accent-dim`; a purple hover would render "hovered" and "currently selected"
identically. They keep a `--brand-surface-3` grey hover, which is the thing that tells them apart.
Don't "unify" these without replacing the selected state first.

> `--brand-hover-tint-inverse` is declared once, in the base `:root`, as a `color-mix` over
> `--brand-accent` / `--brand-surface-inverse`. It resolves per theme at use time — do **not** add a
> light-theme override.

### Square images, rounded frames

Images never carry a radius (`img { border-radius: 0 }`); the frames around them do. The two are
reconciled by an **inset**, not by squaring the frame: a framed image is padded off the edge
(gallery cards `p-4`, logo swatches `p-10`, Mistrust supporting cards `p-4`) so a square image sits
inside a rounded frame. A `.brand-frame:has(> img)` square-the-frame rule existed 2026-07-31 →
2026-08-01 and was removed — **if you frame an image, pad the image.** The exception is a surface
where the image *is* the surface, edge to edge with no frame showing (Mistrust stage, filmstrip
thumbs, mosaic grid, lightbox): those set `border-radius: 0` in `slideshow.css`, because there is no
frame there to round and a radius would clip the artwork. Entries 110–111.

### Wide-screen-first layout verification

**Always verify layouts at 2560px and 3440px (ultrawide), not just 1440px.**

Modern desktop monitors commonly exceed 1920px. A layout that looks correct at 1440px can break or look lopsided at 3440px if:
- A single sidebar rail creates an enormous empty right half
- Content is locked to a small max-width while the viewport stretches
- Asymmetric padding (left rail vs. none on right) makes the page feel off-balance

**Rule:** After any layout change, capture or preview at **2560px and 3440px** in both themes. The projects-page rail-and-content pattern (Entry 086) uses a centered container so the whole layout stays centered with equal whitespace on both sides at all widths, rather than hugging one edge.

**Shared content geometry (Entry 100, extended site-wide in Entry 107).** *Every* page uses one container recipe — Home, Projects, Gallery and Contact all share one left edge and one right inset at every viewport. Verify with **`node scripts/measure-content-widths.js [port]`**, which exits non-zero if the section edges diverge. The visual suite cannot catch this: it grades each page against its own past self, so a permanently misaligned page stays green.

- **`--brand-content-max` (1400px) is the single source of truth.** Never hardcode `max-w-[1400px]`; three literals had drifted out of sync with the 1200px token before Entry 107.
- **The container carries the width, children carry the gutter — a flat 24px (`px-6`).** `main` has **no** horizontal padding on purpose: it used to supply `clamp(16px,4vw,40px)`, which *compounded* with any nested `.brand-container` and put the Home About box 164px further in than the Projects title. Do not re-add padding to `main`.
- Prose and form blocks span the **full shared container** — no measure caps. The About box (72ch), Contact form (720px), and `.project-desc` (820px) caps were all removed 2026-07-31 at the user's direction: these blocks are bounded by the shared padding, not a max-width, so they sit centered (equal insets) on wide screens instead of hugging the left edge. Do not reintroduce a cap or `mx-auto` on them.

- Outer container: `mx-auto max-w-(--brand-content-max)` with **no** horizontal padding.
- The 24px gutter is supplied by the *children* — `px-6` on `PageHeader`, on the tablist / filter bar, and on the panel or grid.
- At `lg` the rail column is `lg:w-[260px] lg:shrink-0` and the rail's own `px-6` (kept at `lg`, not reset to `lg:px-0`) is what produces the gutter between the rail and the content, taking it out of the fixed column so the tabs narrow rather than the content shifting.

The failure mode this replaces: the header carried a `clamp(16px,4vw,40px)` gutter *inside* its container while the two rails padded differently, so the title bar, the Projects tabs and the Gallery filters each sat on a different left edge, and the mismatch grew with viewport width. Verify by measuring — the title bar's left must equal the first tab's left, and its right inset must equal its left inset, at 1440/2560/3440.

## File Conventions

- Generated `style.css` is tracked and deployed directly (see Deploy)
- `.gitignore`: `/node_modules/` (lockfile committed), `/tmp/`, `*.log`, `/test-results/`, `docs/sync/google-docs.json`
- All pages use `.brand-nav` + `.brand-footer` from the brand system
- Class names referenced by JS must stay in markup even when styled by utilities: `.project-card`, `.about-box`, `.bubble-exclude`, `.hero-logo`, `.hero-name`, `.hero-sub`, `.project-tab`, `.gallery-item`, `.wip-notice`, `.brand-nav*`, `.brand-footer*`
- **Renaming or retagging an element silently drops it out of the bubble exclusion zones.** `DEFAULT_EXCLUSIONS` is matched by selector, so an element stops being avoided the moment it stops matching — no error, and nothing red in the suite unless `tests/bubbles-exclusion.spec.js` covers it (the visual gate runs under reduced motion, where the engine creates no bubbles at all). **This has now happened twice in one day:** the hero logo when it was inlined from `<img>` to `<svg>` for `currentColor` theming (Entry 090), and the Projects rail when the tabs were restyled from `.brand-btn` to `.project-tab` (Entry 085, found and fixed in Entry 093 — bubbles had been crossing the rail in 30 of 30 sampled frames). When you rename or retag a UI element, check this list in the same change, and add a case to the bubble spec.
