# Deploys — Netlify

How this site gets from a git push to `averyemberday.com`, what it costs, and the workflow
currently in force.

> ## ⏸ Deploy pause until 2026-08-07
>
> **Work on `develop`. Do not push `portfoliowebsite`.** Netlify credits are exhausted and the user
> has paused all updates to the live URL. Preview locally with `npm run dev`. Full details in
> [Current workflow](#current-workflow-until-2026-08-07).

---

## The deploy loop

Netlify hosts static files and watches the GitHub repo. There is no server to manage, no upload
step, and no CI configuration — Netlify *is* the CI. There is no `.github/workflows` in this repo.

```
edit locally
  → git push to GitHub (branch: portfoliowebsite)
    → Netlify sees the push
      → rents a temporary Linux box
        → runs `next build`
          → Next.js writes the static export to out/
            → Netlify copies out/ onto its global CDN
              → averyemberday.com serves the new version
```

Everything after the push is automatic, and takes a couple of minutes.

## Site facts

| | |
|---|---|
| Site name | `averyemberdayportfolio` |
| Site ID | `dd16abce-b0e7-433f-b694-19b427949485` |
| Team | `aday6471` (Free plan) |
| Deploys from | **`portfoliowebsite`** |
| Build command | `next build` |
| Published dir | `out/` |
| Node | 20 |
| Custom domain | `averyemberday.com` |
| API token | `NETLIFY_AUTH_TOKEN` in `.env` (gitignored) — site-scoped; reads deploys, **401s on `/accounts` and `/user`** |

The deploy branch was repointed from `master` to `portfoliowebsite` on 2026-07-12 via the Netlify
API (LOGBOOK Entry 069). Before that, pushes to `portfoliowebsite` appeared to do nothing because
the live site was tracking `master` — see Entry 063.

## Where the config lives

**[`netlify.toml`](../netlify.toml)** is the instruction sheet Netlify reads:

- `[build] command` / `publish` — `next build`, publish `out/`.
- `[build] ignore` — cancels the build (and its cost) when a push touched only process docs. See
  [Cost control](#cost-control).
- `[build.environment]` — `NODE_VERSION`, and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.
- `[[redirects]]` — old project URLs → new anchors, 301.
- `[[headers]]` — CSP and security headers for production.

**[`next.config.ts`](../next.config.ts)** sets `output: 'export'` and `distDir: 'out'`, which is
what makes the site a pile of static files with nothing to crash.

> **Two places define headers.** The `headers()` block in `next.config.ts` only ever affects
> `next dev` on your machine — the static export ignores it. **Production headers come from
> `netlify.toml`.** Editing one does not change the other.

> **The CSP is strict.** `script-src` is `'self' 'unsafe-inline'`; styles and fonts allow Google
> Fonts only. Adding an embedded video, analytics, or any third-party script will be **silently
> blocked** until its domain is added to the CSP in `netlify.toml`. The CSP also pins sha256 hashes
> of the inline theme script — if that inline `<script>` changes, recompute the hashes or theme
> init breaks in production.

`CNAME` (containing `averyemberday.com`) is a GitHub Pages convention. **Netlify ignores it.** The
real domain wiring is in the Netlify dashboard and at the registrar.

## Cost model — credits, not build minutes

This account is on Netlify's **credit** plan. There is no build-minutes meter, so **build duration
is irrelevant to cost**.

| | |
|---|---|
| Free plan allotment | **300 credits/month — hard limit** |
| Successful production deploy | **15 credits** |
| **Effective budget** | **20 production deploys per month** |
| Deploy Previews & branch deploys | **Free** |
| Failed deploys, rollbacks | **Free** |
| Bandwidth / web requests | Small credit cost (5 credits total in Jul 2026) |
| Billing period | 7th → 6th of each month |

Sources: the team billing page and
[Netlify's credits docs](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)
— *"each successful production deploy consumes 15 credits … you have free deployments for
previewing, experimenting, and creating versions"*.

**Consequences that are easy to get backwards:**

- Optimising build *speed* saves nothing. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` is kept for faster
  builds, not as a cost control.
- **Do not disable Deploy Previews or branch deploys.** They are free, and they are the correct
  place to iterate.
- The only lever that matters is **the number of production deploys**. 20/month ≈ one every 36
  hours.

### When credits run out

Published sites stay live, but production deploys pause. Pushes then produce a deploy record with:

```
state: "error"   skipped: true   error_message: null
log_access_attributes: null      deploy_time: null
```

**No build log is produced at all** — that absence is the tell. An ignore-command skip still writes
a log. The dashboard banner reads *"running on operational credits … production deploys and Agent
Runners are paused."*

## Cost control

### 1. The `ignore` rule (the lever that matters)

`netlify.toml`'s `[build] ignore` cancels the build when a push touched only process docs
(`docs/`, `LOGBOOK.md`, `TODO.md`, `AGENTS.md`, the per-agent pointers). Measured over 30 days:
**16 of 74 commits (22%) would skip** — roughly 4 deploys, 60 credits per month.

Two rules when editing it:

- **Never glob `*.md`.** `public/**/*.md` **is** copied into the static export, so a blanket
  markdown exclusion would skip a build that genuinely changes the site. Add new doc paths to the
  explicit exclude list instead.
- **Any failure to compare must exit 1 (build).** With `$CACHED_COMMIT_REF` unset, a bare
  `git diff --quiet` collapses to working-tree-vs-index on a clean checkout, which always exits 0
  — and exit 0 means skip. That would silently skip *every* build forever. The empty-ref guard is
  load-bearing. See LOGBOOK Entry 103.

A skipped build shows a `netlify-ignore:` line in the deploy log stating the decision.

### 2. Batch pushes

Netlify builds per **push**, not per commit. 19 commits pushed together cost 15 credits; pushed
separately they cost 285. Recent history ran ~74 commits/month against a 20-deploy budget, so
batching is not optional.

### 3. Use free previews

Iterate on a branch, review it on its free Deploy Preview URL (or locally), and spend a production
deploy only on a finished merge.

### 4. `[skip ci]`

Putting `[skip ci]` in a commit message skips that build entirely — the manual escape hatch.

## Current workflow (until 2026-08-07)

All updates to Netlify and the live URL are paused at the user's direction (LOGBOOK Entry 105).

- **Commit and push to `develop`**, which was fast-forwarded to `portfoliowebsite` @ `41005ed`.
- **Do not push `portfoliowebsite`.** `.git/hooks/pre-push` blocks it and **expires by itself on
  2026-08-07** — nothing to uninstall. Deliberate override, on explicit user instruction only:
  `git push --no-verify`.
- **Preview locally**, with no Netlify involvement:

  ```bash
  npm run dev     # → http://localhost:3000, hot reload
  ```

  The `launchtest` skill does the same and opens Chrome. For a production-accurate check,
  `npm run build:next` then serve `out/` — note that headers and redirects come from `netlify.toml`
  and are **not** applied to a local static export.

`averyemberday.com` stays live on `da4b4be` throughout.

### Lifting the pause on 2026-08-07

1. `git checkout portfoliowebsite && git merge develop`
2. `git push origin portfoliowebsite` — **once**. One production deploy, 15 credits, regardless of
   how many commits accumulated.
3. Remove the pause banners from `AGENTS.md` and `docs/NOTES.md` Branch Policy, and the `[Aug 7]`
   item from `TODO.md`.
4. The `pre-push` guard needs no action — it is date-bounded.

## Operating the dashboard

- **Deploys tab** — every deploy with `Building` / `Published` / `Failed`, and the full build log.
- **A failed deploy never breaks the site.** Netlify keeps serving the last successful version.
- **Rollback:** Deploys → pick an older successful deploy → *Publish deploy*. Instant, no git
  required. The best safety net available here.
- **Deploy Previews** post a preview URL on each PR automatically.
- **Usage & billing** → credit balance, usage breakdown, and billing period.

## Known open item

**Netlify Forms detection is still off.** The contact form markup is live
(`data-netlify="true"`, `netlify-honeypot="bot-field"`, hidden `form-name`), but submissions 404
until form detection is enabled in **Site configuration → Forms**. Dashboard toggle, no code
change. Contact links stay commented out in `Nav.tsx` / `Footer.tsx` until then. Tracked in
`TODO.md`; LOGBOOK Entries 075/078.

## Nothing tests the site before it deploys

Netlify runs only `next build`. The Playwright suite and the visual regression gate are opt-in and
local, so a change that compiles but looks broken deploys anyway. Accepted gap — LOGBOOK Entry 081.
Adding the suite to the build command would make deploys block on failures, at the cost of longer
builds (which is free under the credit model).

## Related

- `AGENTS.md` → Branch Policy, Deploy
- `docs/NOTES.md` → Branch Policy
- LOGBOOK Entries **063** (branch mismatch), **069** (branch repoint), **102** (cost changes),
  **103** (ignore-rule guard), **104** (credit model), **105** (deploy pause)
