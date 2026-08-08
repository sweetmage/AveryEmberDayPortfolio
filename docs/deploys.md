# Deploys — Netlify

How this site gets from a git push to `averyemberday.com`, what it costs, and the workflow
currently in force.

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
> blocked** until its domain is added to the CSP in `netlify.toml`.
>
> **It does *not* pin sha256 hashes.** This paragraph claimed it did until 2026-08-06, which would
> have sent someone hunting for hashes to recompute that do not exist. `'unsafe-inline'` is what
> allows the theme script; theme init also loads from the external `/scripts/theme-init.js` rather
> than an inline block. `AGENTS.md` corrected the same claim on 2026-07-28 and this copy was missed.

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
| Billing period | **7th → 7th** of each month |

> **The billing period ends on the 7th, not the 6th.** Read from the API on 2026-08-03:
> `period_start_date` `2026-07-07T00:00:00-07:00`, `period_end_date` **`2026-08-07T00:00:00-07:00`**.
> This doc, `AGENTS.md`, `TODO.md`, `docs/NOTES.md` and `PAUSE_UNTIL` in the `pre-push` guard all
> said the 6th until then — which would have un-blocked pushes a full day before credits reset
> (LOGBOOK Entry 115). Verify with:
> ```bash
> curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
>   https://api.netlify.com/api/v1/aday6471/builds/status
> ```

Sources: the team billing page and
[Netlify's credits docs](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)
— *"each successful production deploy consumes 15 credits … you have free deployments for
previewing, experimenting, and creating versions"*.

**Consequences that are easy to get backwards:**

- Optimising build *speed* saves nothing. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` is kept for faster
  builds, not as a cost control.
- **Do not disable Deploy Previews or branch deploys.** They are free, and they are the correct
  place to iterate.
- **But branch deploys are not currently usable on this site, and "free" does not mean "works while
  credits are out."** Two facts established 2026-08-03 (Entry 115), both easy to get wrong:
  1. `allowed_branches` is `["portfoliowebsite"]`. Pushing any other branch produces **no deploy at
     all** — not a free one, none. Enabling branch deploys means changing that list in Site
     configuration → Build & deploy → Branches.
  2. The credit exhaustion block is **account-level**. Deploys are refused with
     `Skipped due to account credit usage exceeded` regardless of branch, so a branch deploy is
     skipped exactly like a production one. Plan around the reset date, not around branch choice.
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

Checked from the CLI without opening the dashboard:

```bash
curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/dd16abce-b0e7-433f-b694-19b427949485/deploys?per_page=5" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>JSON.parse(d).forEach(x=>console.log(x.created_at,x.branch,x.state,x.skipped,x.error_message||'')))"
```

As of 2026-08-03 that returns `error / true / Skipped due to account credit usage exceeded` for
every deploy since 2026-07-26, against a last-good published deploy of `da4b4be`.

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

## Current workflow

Normal service, as of 2026-08-08. Commit to `portfoliowebsite`; pushing it publishes to production.
Every push is therefore production-affecting — **get the user's explicit go-ahead in the moment**.

Batch commits into one push: Netlify builds per *push*, not per commit, so 19 commits pushed
together cost 15 credits and pushed separately cost 285.

Preview before publishing, free, either way:

```bash
npm run dev     # → http://localhost:3000, hot reload
```

For a shareable preview on real Netlify infrastructure, add the branch to `allowed_branches` (Site
configuration → Build & deploy → Branches, or the API) and push it. Branch deploys and Deploy
Previews cost **no credits**. That is how the Aug 7 release was staged and tested — including the
contact form — before production changed. Remove the branch again afterwards so it stops rebuilding.

## The 2026-07-26 → 08-07 deploy pause (closed)

Netlify credits ran out on 2026-07-26 and all production deploys were paused until the cycle reset.
Work happened on `develop`; a self-expiring `.githooks/pre-push` guard blocked `portfoliowebsite`.

**Released 2026-08-08:** `develop` merged fast-forward into `portfoliowebsite` and pushed once —
48 commits, deploy `bc3e278`, `state: ready` and not skipped, 15 credits. Live checks passed on
averyemberday.com. `allowed_branches` was returned to `["portfoliowebsite"]`.

Two things this episode established, both worth keeping:

- **The billing period ends on the 7th, not the 6th.** Read from the API: `period_end_date` is
  `2026-08-07T00:00:00.000-07:00`. Docs and the push guard said the 6th until 2026-08-03, which
  would have unblocked pushes a full day before credits reset (Entry 115).
- **A branch deploy CAN register a Netlify form.** This document previously said not to try, and
  that was right at the time but for a reason that expired: `develop` was not in `allowed_branches`,
  and the credit block is account-level so every deploy was skipped regardless of branch. Once
  credits reset, a free branch deploy registered the form and captured a real test submission —
  no production deploy required. See the section below.

## Operating the dashboard

- **Deploys tab** — every deploy with `Building` / `Published` / `Failed`, and the full build log.
- **A failed deploy never breaks the site.** Netlify keeps serving the last successful version.
- **Rollback:** Deploys → pick an older successful deploy → *Publish deploy*. Instant, no git
  required. The best safety net available here.
- **Deploy Previews** post a preview URL on each PR automatically.
- **Usage & billing** → credit balance, usage breakdown, and billing period.

## The contact form is registered and proven

Confirmed 2026-08-08. `GET /sites/:id/forms` lists form `contact` (`6a76439ee6fac40008881b68`) with
fields `bot-field` / `name` / `email` / `message` and a real submission recorded 2026-08-07 22:25Z.
`/contact/thanks/` therefore tells the truth when it says "Your message has been sent."

**Detection and registration are two different things**, and conflating them cost a cycle. The
dashboard toggle (enabled 2026-08-01) only tells Netlify to *look*. Registration happens when the
build-time parser reads deployed HTML containing the form — which is why the form stayed unregistered
while the published deploy predated the toggle.

Notification email: site-wide `submission_created` → `averyemberday@gmail.com`, id
`6a6e6f4bbb69572bfbd54227`. **Delivery confirmed by the user on 2026-08-08** — the API cannot show
this, so it is recorded here instead. The whole chain is proven: submit → `/contact/thanks/` →
recorded submission → email received.

Check state from the CLI:

```bash
curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN"   https://api.netlify.com/api/v1/sites/dd16abce-b0e7-433f-b694-19b427949485/forms
```

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
