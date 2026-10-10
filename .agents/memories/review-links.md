# Review links before launch

**Rule (user, 2026-10-09):** whenever the user's review is needed before a launch (a merge into
`portfoliowebsite`, a production push, or any "review this before we ship" gate), give them a
link they can open in their own browser. A screenshot or a description is not a substitute.

How, in order of preference:

1. **Local export server, reachable from their phone.** `preview_start` the `portfolio-export`
   launch config (`.claude/launch.json`: `npm run build:next && npx serve out -l 4400`), then hand
   over both:
   - `http://localhost:4400/<page>/` for this Mac;
   - `http://<this Mac's Tailscale IP>:4400/<page>/` for the phone or another machine on the
     tailnet. The address lives in the private fleet memory (`~/.claude/memory/fleet.md`), never in
     this repo, which is public. `serve` binds every interface, so the unreleased build is also
     reachable from whatever LAN the Mac is on while the server runs: stop it once the review is
     done.
   Prove both return 200 with `curl` before sending, and name the exact page and the interaction to
   try (for example "expand Gross").
2. **A Netlify branch deploy** only with the user's yes: branch deploys are off
   (`allowed_branches` is `["portfoliowebsite"]`, `docs/deploys.md`), and turning them on is an
   account setting change.

Never treat a production deploy as the review link: that is the launch itself, and it costs 15
of 20 monthly credits.

Keep the server running until the user has reviewed, say it is running in the close, and stop it after.
