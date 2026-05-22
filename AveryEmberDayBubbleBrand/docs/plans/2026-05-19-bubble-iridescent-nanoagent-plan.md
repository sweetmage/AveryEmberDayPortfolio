# Nanoagent Plan: Bubble & Iridescent Glow Enhancements — BrandForge-v2.html
Date: 2026-05-19

## Goal
Make BrandForge-v2.html visually more "bubble-like" with circular motifs and iridescent glowing effects throughout — not just the existing hero blobs.

## Existing Foundations to Build On
- `--brand-ir-1` through `--brand-ir-6`: purple → gold → blue → cyan spectrum
- Hero blobs: `border-radius: 50%`, `filter: blur(80px)`, `@keyframes brand-float`
- Animated border ring (`brand-btn-active`, `brand-btn-generating`) using conic/rainbow gradients
- Dark mode token system fully in place

## Nano-Agent Roles (4 parallel)

### Agent 1 — Hero Bubble Enhancements
**Scope:** `.brand-hero`, `.brand-hero-blobs`, `.brand-hero-blob-*`, hero content area
**Task:** Propose CSS to make hero blobs feel like real iridescent bubbles (thin-film shimmer, inner highlight ring, specular dot). Add a JS-driven or CSS-only floating micro-bubble layer in the hero background. Suggest `@keyframes` for wobble/shimmer. Output: CSS snippets + HTML additions.

### Agent 2 — Card & Section Bubble Treatments
**Scope:** `.brand-card`, `.brand-card-feature`, `.brand-card-accent`, `.brand-cta-card`, section dividers
**Task:** Propose circular/bubble design language for cards — iridescent ring borders using conic-gradient, bubble-shaped icon containers, circular accent dots at card corners, pill/bubble shaped tags. Output: CSS class additions/overrides.

### Agent 3 — Iridescent Glow on Text, Borders & UI Elements
**Scope:** headings, `.brand-text-hero`, `.brand-eyebrow`, `.brand-btn`, `.brand-nav`, color swatch section, iridescent spectrum bar
**Task:** Propose glow upgrades — `text-shadow` stacks for iridescent text glow, `box-shadow` layering for glowing borders, `drop-shadow` filters on SVG icons. Suggest upgrading the 4px spectrum bar to something more dramatic. Output: CSS overrides with specific selectors.

### Agent 4 — Floating Bubble Particles Layer
**Scope:** New `.brand-bubbles` layer (fixed, pointer-events: none, z-index between bg and content)
**Task:** Design a pure CSS or lightweight JS floating bubble system — 8-12 translucent circle elements with iridescent gradient borders, varying sizes (20px–120px), staggered float animations with subtle wobble. Must respect `prefers-reduced-motion`. Output: full HTML block + CSS + optional minimal JS.

## Iteration Count / Stop Conditions
- 4 agents, each runs once (read-only suggestion pass)
- Stop if output is < 10 lines or pure boilerplate — retry once with pro model
- Main agent reviews all 4 outputs before producing final suggestion list

## Permissions
- All agents: read-only access to BrandForge-v2.html
- No file writes, no commits

## Verification
- Main agent reviews CSS for: specificity conflicts, animation performance (prefer `transform`/`opacity`), dark mode token usage, reduced-motion compliance
- No implementation yet — output is suggestions only

## Review Owner
Main shxdow-flow agent performs final review of all nano-agent output.

## Risks
- Bubble particles can tank scroll performance if not `will-change: transform` + `transform` only
- Conic-gradient border trick requires `isolation: isolate` + mask pattern already in codebase
- Iridescent text glow on light mode may kill readability — must check contrast
