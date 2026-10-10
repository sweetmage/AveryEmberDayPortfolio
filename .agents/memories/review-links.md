# Review links before launch

**Rule (user, 2026-10-09):** whenever the user's review is needed before a launch (a merge into
`portfoliowebsite`, a production push, or any "review this before we ship" gate), give them a
link they can open in their own browser. A screenshot or a description is not a substitute.

How, in order of preference:

1. **Local export server, reachable from their phone.** `preview_start` the `portfolio-export`
   launch config (`.claude/launch.json`: `npm run build:next && npx serve out -l 4400`), then hand
   over both:
   - `http://localhost:4400/<page>/` for this Mac;
   - `http://<VOID tailscale IP>:4400/<page>/` for the phone or another machine on the tailnet
     (VOID is `100.100.164.59`; `serve` binds every interface, so no extra flag is needed).
   Prove both return 200 with `curl` before sending, and name the exact page and the interaction to
   try (for example "expand Gross").
2. **A Netlify branch deploy** only with the user's yes: branch deploys are off
   (`allowed_branches` is `["portfoliowebsite"]`, `docs/deploys.md`), and turning them on is an
   account setting change.

Never treat a production deploy as the review link: that is the launch itself, and it costs 15
of 20 monthly credits.

Keep the server running until the user has reviewed, and say it is running in the close.
