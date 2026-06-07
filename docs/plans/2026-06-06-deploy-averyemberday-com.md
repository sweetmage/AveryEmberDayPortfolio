# Deploy averyemberday.com → sweetmage/AveryEmberDayPortfolio

**Date:** 2026-06-06  
**Goal:** Point averyemberday.com at this project via a continuous-deploy host, replacing whatever currently lives there.  
**Branch source:** `master`  
**Estimated human time:** ~20 minutes (mostly DNS propagation wait)

---

## Recommended host: Netlify (Free tier)

Netlify is the right call here over GitHub Pages because:
- Custom domain + auto HTTPS in one UI step (no separate cert management)
- Deploy previews for branches automatically
- No build step needed — serves static HTML/CSS/JS as-is
- Rollback to any prior deploy in one click
- Already the industry standard for this class of portfolio site

GitHub Pages is a viable fallback if Netlify is unavailable or the account already has a Pages site tied to a conflicting domain.

---

## Pre-flight checklist (verify before starting)

- [x] You have access to averyemberday.com DNS — log in to DreamHost panel → **Manage Domains** and confirm you can edit DNS/nameserver records for averyemberday.com
- [x] The `master` branch is the branch you want live (currently `shxdowloop/2026-06-04/phase-1-structural-fixes` has un-merged work — merge or PR first if you want those fixes included)
- [ ] Run through the Pre-launch QA checklist in `TODO.md` — all boxes must be checked before going live

---

## Step 1 — Merge current work to master

The Phase 1 Structural Fixes branch has staged changes not yet in `master`. Before deploying:

```bash
# On the feature branch, open a PR or merge directly:
git checkout master
git merge shxdowloop/2026-06-04/phase-1-structural-fixes
git push origin master
```

Or open a GitHub PR from the branch → master and merge it there.

**Human action required:** You decide whether to merge now or deploy from the feature branch first for staging.

---

## Step 2 — Add a `netlify.toml` to the repo root

This file is already prepared below. Add it once — Netlify reads it on every deploy.

**File:** `netlify.toml` (repo root)

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}
```

Wait — this is a multi-page static site (not an SPA), so no catch-all redirect is needed. Simpler config:

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

The headers block adds basic security without affecting routing.

---

## Step 3 — Connect repo to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Choose **GitHub** → authorize Netlify if not already
3. Select **sweetmage / AveryEmberDayPortfolio**
4. Settings:
   - **Branch to deploy:** `master`
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.`
5. Click **Deploy site**

Netlify assigns a random `*.netlify.app` URL. Test it before touching DNS.

---

## Step 4 — Add CNAME file (optional but good practice)

Adding a `CNAME` file at the repo root is a GitHub Pages convention, but also serves as self-documentation. Netlify ignores it; it doesn't hurt.

**File:** `CNAME` (repo root, one line, no extension)

```
averyemberday.com
```

---

## Step 5 — Configure custom domain in Netlify

1. In the Netlify site dashboard → **Domain management → Add custom domain**
2. Enter `averyemberday.com` → click **Verify** → **Add domain**
3. Netlify will show you the DNS records to set. There are two options:

**Option A — Netlify DNS (simplest, recommended):**  
Transfer nameservers to Netlify. They manage everything including the SSL cert automatically.  
Netlify gives you 4 nameserver hostnames (e.g. `dns1.p06.nsone.net`).

In **DreamHost panel → Manage Domains → Edit** (next to averyemberday.com) → scroll to **Nameservers** → select **Use custom nameservers** → enter the 4 Netlify nameserver hostnames → Save. DreamHost will warn that this removes their DNS control — that is expected.

**Option B — Keep DreamHost DNS, add records manually:**  
In **DreamHost panel → Manage Domains → DNS** tab for averyemberday.com:

```
Type: A     Name: @    Value: 75.2.60.5       TTL: 14400
Type: CNAME Name: www  Value: <your-site>.netlify.app  TTL: 14400
```

> **DreamHost gotcha:** Delete any existing `A` or `CNAME` record for `@` (bare domain) first — DreamHost may have a parking page or default A record that will conflict. The new record will not take effect until the old one is removed.

**Human action required:** Log in to DreamHost and apply the DNS changes above.

---

## Step 6 — Wait for DNS propagation

- Typical: 5–30 minutes with Netlify DNS
- Worst case: up to 48 hours with external DNS (usually much faster)
- Check propagation at [dnschecker.org](https://dnschecker.org) for `averyemberday.com`

---

## Step 7 — Verify HTTPS

Once DNS resolves:
1. Visit `https://averyemberday.com` — Netlify auto-provisions a Let's Encrypt cert
2. Check that `http://averyemberday.com` redirects to `https://` (Netlify does this by default)
3. In Netlify dashboard → **Domain management → HTTPS** — confirm cert is active (green)

---

## Step 8 — Smoke test live site

Run through the full site at the live URL:
- [ ] Index page loads, hero renders, theme toggle works
- [ ] All project cards link correctly
- [ ] `projects/history-of-mistrust.html` — carousel + lightbox work
- [ ] `projects/brand-avery-ember-day.html` — loads correctly
- [ ] `gallery/gallery.html` — images load
- [ ] `resume/AveryEmberDay_Resume_2026_Brand.html` — loads + print layout ok
- [ ] Both light and dark themes render correctly
- [ ] No broken image `src` or `href` 404s (open DevTools Network tab, filter 4xx)
- [ ] Check on mobile viewport (375px)

---

## Risks & notes

| Risk | Mitigation |
|------|------------|
| Current averyemberday.com has live traffic | Deploy to `*.netlify.app` URL and test fully before cutting DNS |
| Phase 1 fixes not yet merged to master | Merge the branch before deploying, or deploy the feature branch temporarily |
| Large image assets slow initial load | Already web-optimized (webp); Netlify CDN will cache globally |
| Future framework migration (pending decision) | Netlify handles build steps natively — no re-deploy config change needed when a build step is added |
| `GOOGLE_REFRESH_TOKEN` / `.env` in repo | Confirm `.gitignore` covers `.env` before pushing — secrets must NOT be in the repo |

---

## Files to create/modify

| File | Action | Notes |
|------|--------|-------|
| `netlify.toml` | **Create** | Security headers; no build config needed |
| `CNAME` | **Create** | Self-documentation; one line: `averyemberday.com` |
| DNS records | **Human action** | At registrar — see Step 5 |
| `master` branch | **Merge** | Phase 1 fixes must land before going live |

---

## Human decision points

1. **Merge strategy** — merge feature branch to master now, or deploy feature branch as staging first?
2. **DNS method** — Netlify nameservers (Option A, simplest) or keep registrar + A record (Option B)?
3. **Go/no-go** — run the Pre-launch QA checklist in `TODO.md` before flipping DNS

---

## After go-live

Update `TODO.md` Launch checklist:
- [x] Confirm full site passes Pre-launch QA
- [x] Confirm deploy target (Netlify) wired to sweetmage/AveryEmberDayPortfolio
- [x] Update DNS — point averyemberday.com to deploy target
- [x] Test averyemberday.com after DNS propagates
- [x] Check HTTPS certificate is active
