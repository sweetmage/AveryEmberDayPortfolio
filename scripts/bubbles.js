/**
 * Bubble Physics Engine — Interactive floating bubbles with squish physics
 * Two layers: global (fixed, full-page) and hero (absolute, inside #hero)
 * Bubbles bounce off viewport edges, DOM elements, and each other.
 * Mouse pushes bubbles away gently.
 * Soft-body squish on collision — compresses on impact, smoothly rounds back out.
 */

(function () {
  'use strict';

  // ── Reduced motion guard ────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // ── Physics constants ───────────────────────────────────────────
  const REPEL_RADIUS    = 180;
  const REPEL_FORCE     = 0.35;
  const DAMPING         = 0.985;
  const DRIFT_JITTER    = 0.02;
  const SPRING_K        = 0.12;
  const SPRING_DAMP     = 0.82;
  const SQUISH_AMOUNT   = 0.26; // max deformation on impact
  const RESTITUTION     = 0.7;  // bubble-bubble bounce energy retained (1 = fully elastic)
  const MIN_SPEED       = 0.4;
  const MAX_SPEED       = 3.0;  // slower top speed for floatier feel
  const DRIFT_KICK      = 0.12;
  const ZONE_PADDING    = 24;   // px buffer around exclusion zones

  /* ── The picture is the wall ────────────────────────────────────
     User call, 2026-08-08: bubbles bounce off THE IMAGE, at every screen size.

     Two consequences, both load-bearing:

     1. `.gallery-item` is deliberately NOT an exclusion selector any more. A
        card zone is a wall around the picture, so bubbles would rebound off the
        card's outer edge and never reach the artwork — the frame would be doing
        the bouncing, which is the thing this replaces. Bubbles now cross the
        card's border, padding and caption band freely and stop at the picture.
        (The caption's own `h3`/`p` keep their normal padded zones, so text is
        still protected. That is legibility, not layout.)

     2. These zones carry NO padding, so the wall is the visible edge of the
        artwork rather than an invisible boundary 24px outside it. Contact
        therefore shows up as a graze — the resolver stops the circle tangent to
        the rect — which is why these surfaces can never be asserted at a hard
        zero overlap the way the padded zones are. The invariant that means
        "bounced" is that the bubble's CENTRE never crosses the edge.

     This also replaces the 60%-of-the-card core that stood here for a day: the
     picture IS the smaller centred shape that request was reaching for
     (308x411 inside a 342x502 card at 390px), so one rule now serves both and
     there is no breakpoint in the physics at all.

     Everything else — nav, footer, headings, body copy, the Projects rail, the
     Contact form — keeps its full ZONE_PADDING zone at every width. */
  const FRAME_ZONE_SELECTOR = 'img, .mistrust-stage';
  const BLOB_ZONE_PUSH  = 0.06; // hero-blob steering force away from hero content
  const ZONE_THROTTLE   = 250;  // ms between rect queries
  const SCROLL_STIR     = 0.02; // velocity imparted per px of scroll delta
  const SCROLL_STIR_MAX = 40;   // px of scroll delta considered per frame
  const SQUISH_EPSILON  = 0.003; // snap to rest when this close to 1.0

  // ── Viewport scaling ────────────────────────────────────────────
  function getViewportScale() {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(0.6, Math.min(1.4, vmin / 900));
  }

  // ── Color sets (match existing CSS nth-child order) ─────────────
  // CSS nth-child mapping (1-indexed):
  //   child 1 → default purple
  //   child 2 → 3n+2 → gold
  //   child 3 → 3n  → purple
  //   child 4 → 3n+1 → cyan
  //   child 5 → 3n+2 → gold
  //   child 6 → 3n  → purple
  //   etc.
  function getColorSet(i) {
    const c = i + 1; // 1-indexed
    if (c % 3 === 2) return 'gold';
    if (c % 3 === 1 && c > 1) return 'cyan';
    return 'purple';
  }

  // ── Default exclusion selectors ─────────────────────────────────
  const DEFAULT_EXCLUSIONS = [
    '.brand-nav',
    '.brand-footer',
    '#return-to-top',
    '.bubble-exclude',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
    'img',
    'video',
    'iframe',
    '.project-title',
    '.project-desc',
    '.project-hero',
    '.project-section',
    // The Projects rail. These were `.brand-btn` + `.brand-btn-primary`/
    // `-secondary` -- all three of which are excluded below -- until they were
    // restyled to `.project-tab` (2026-07-24, LOGBOOK Entry 085), at which
    // point they silently stopped being exclusion zones and bubbles began
    // crossing the rail. Same trap as the hero logo, one line down: this list
    // is matched by selector, so ANY rename or retag drops an element out of
    // it with no error and nothing red in the suite.
    '.project-tab',
    '.wip-notice',
    /* `.gallery-item` is deliberately absent (2026-08-08). It was here for a
       year; removing it is the point of the "bubbles bounce off the image"
       rule, not an oversight. A card zone is a wall AROUND the picture, so
       bubbles rebounded off the card's outer edge and never reached the
       artwork. The picture is now the wall — see FRAME_ZONE_SELECTOR — and the
       card's frame, padding and caption band are open ground.
       `tests/gallery-expand.spec.js` asserts the ART is registered instead, so
       the retagging trap that rule guarded against is still covered. */
    '.about-box',
    '.hero-name',
    '.hero-sub',
    // `.hero-logo` must be listed explicitly. The `img` selector above used to
    // cover it, but the hero mark was inlined as a React <svg> component so it
    // could follow `currentColor` (2026-07-24, LOGBOOK Entry 083) -- and an
    // inline <svg> is not an <img>, so the logo silently stopped being an
    // exclusion zone and bubbles began drifting across it. Any future
    // <img> -> inline-<svg> swap needs the same treatment.
    '.hero-logo',
    '.brand-card-bubble',
    '.brand-hero-blob',
    '.brand-card',
    '.brand-card-feature',
    '.brand-card-accent',
    '.brand-btn',
    '.brand-btn-primary',
    '.brand-btn-secondary',
    '.icon-link'
  ];
  // ── Hero-content zones (blob layer only) ────────────────────────
  // Deliberately NOT the full exclusion list. The blobs are the hero's
  // ambient colour wash and should keep filling it; only the mark and the
  // actual glyphs are protected, so a blob never parks behind the logo or
  // the name.
  //
  // `.hero-name` / `.hero-sub` are full-width block elements with centred
  // text, so their element boxes span the hero (1104px at 1440px wide).
  // Excluding those boxes would evict blobs from the entire hero band.
  // A Range measures the ink instead of the box.
  function heroContentRects() {
    const rects = [];
    const logo = document.querySelector('#hero .hero-logo');
    if (logo) rects.push(logo.getBoundingClientRect());

    for (const sel of ['#hero .hero-name', '#hero .hero-sub']) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) rects.push(r);
    }

    return rects.map(r => ({
      left:   r.left   - ZONE_PADDING,
      top:    r.top    - ZONE_PADDING,
      right:  r.right  + ZONE_PADDING,
      bottom: r.bottom + ZONE_PADDING
    }));
  }

  const HOME_EXCLUSIONS = [
    '#hero .hero-logo',
    '#hero .hero-name',
    '#hero .hero-sub',
    '#work h2',
    '#about h2',
    '.brand-footer-inner',
    '.brand-footer-connect'
  ];

  // ── Mouse tracker ───────────────────────────────────────────────
  class MouseTracker {
    constructor() {
      this.x = -9999;
      this.y = -9999;
      this._onMove = this._onMove.bind(this);
      this._onTouch = this._onTouch.bind(this);
      window.addEventListener('mousemove', this._onMove, { passive: true });
      window.addEventListener('touchmove', this._onTouch, { passive: true });
    }
    _onMove(e) {
      this.x = e.clientX;
      this.y = e.clientY;
    }
    _onTouch(e) {
      if (e.touches.length) {
        this.x = e.touches[0].clientX;
        this.y = e.touches[0].clientY;
      }
    }
    destroy() {
      window.removeEventListener('mousemove', this._onMove);
      window.removeEventListener('touchmove', this._onTouch);
    }
  }

  // ── Exclusion zone tracker ──────────────────────────────────────
  class ExclusionZoneTracker {
    constructor(selectors) {
      this.selectors = selectors;
      this.rects = [];
      this.version = 0; // bumped on every rebuild so consumers can cache derived data
      this.lastUpdate = 0;
      this._scheduledRAF = null;
      this._update = this._update.bind(this);
      this._schedule();
      window.addEventListener('resize', this._update);
      window.addEventListener('scroll', this._update, { passive: true });
    }
    _schedule() {
      if (this._scheduledRAF) cancelAnimationFrame(this._scheduledRAF);
      this._scheduledRAF = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - this.lastUpdate >= ZONE_THROTTLE) {
          this._update();
        } else {
          this._schedule();
        }
      });
    }
    _update() {
      this.lastUpdate = performance.now();
      this._schedule(); // keep the periodic refresh alive (layout shifts, lazy images, font reflow)
      this.version++;
      this.rects = [];

      // Narrow screens only. Read per rebuild rather than cached, so a rotation
      // or a resize past the breakpoint takes effect on the next refresh.
      /* Deduped BY ELEMENT, which the per-selector loop below used not to be.
         It was harmless while every zone was the element's full rect — the
         duplicates were identical. It stops being harmless the moment one
         element can produce two DIFFERENT rects: an image matches both `img`
         and its own class, and without this a later full-padding pass would put
         the padded rect straight back and silently undo the frame zone. */
      const seen = new Set();

      for (const sel of this.selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);

          const r = el.getBoundingClientRect();

          if (el.matches(FRAME_ZONE_SELECTOR)) {
            // The visible edge of the picture IS the wall, at every width. No
            // padding, so the rebound happens against the artwork itself.
            this.rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, frame: true });
            continue;
          }

          this.rects.push({
            left:   r.left   - ZONE_PADDING,
            top:    r.top    - ZONE_PADDING,
            right:  r.right  + ZONE_PADDING,
            bottom: r.bottom + ZONE_PADDING
          });
        }
      }
    }
    destroy() {
      if (this._scheduledRAF) cancelAnimationFrame(this._scheduledRAF);
      window.removeEventListener('resize', this._update);
      window.removeEventListener('scroll', this._update);
    }
  }

  // ── Bubble class ────────────────────────────────────────────────
  class Bubble {
    constructor(container, radius, colorSet, radiusT) {
      this.el = document.createElement('div');
      this.el.className = 'brand-bubble brand-bubble-physics';
      this.el.setAttribute('data-color', colorSet);
      this.el.style.width  = radius * 2 + 'px';
      this.el.style.height = radius * 2 + 'px';
      container.appendChild(this.el);

      this.radius = radius;
      this.colorSet = colorSet;
      this.radiusT = radiusT;

      // Physics state
      this.x = 0;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.scaleX = 1;
      this.scaleY = 1;
      this.svx = 0;
      this.svy = 0;
    }

    seedPosition(bounds) {
      const margin = this.radius + 40;
      this.x = margin + Math.random() * (bounds.width  - margin * 2);
      this.y = margin + Math.random() * (bounds.height - margin * 2);
      this.render(); // set transform immediately so nothing flashes at (0,0)
    }

    setRadius(radius) {
      this.radius = radius;
      this.el.style.width  = radius * 2 + 'px';
      this.el.style.height = radius * 2 + 'px';
    }

    applyDrift() {
      this.vx += (Math.random() - 0.5) * DRIFT_JITTER;
      this.vy += (Math.random() - 0.5) * DRIFT_JITTER;
      const speed = Math.hypot(this.vx, this.vy);
      if (speed < MIN_SPEED) {
        const angle = Math.random() * Math.PI * 2;
        this.vx += Math.cos(angle) * DRIFT_KICK;
        this.vy += Math.sin(angle) * DRIFT_KICK;
      }
    }

    applyMouseRepulsion(mouse) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 1) {
        const strength = REPEL_FORCE * (1 - dist / REPEL_RADIUS);
        this.vx += (dx / dist) * strength;
        this.vy += (dy / dist) * strength;
      }
    }

    integrate() {
      this.x += this.vx;
      this.y += this.vy;
    }

    clampSpeed() {
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > MAX_SPEED) {
        this.vx = (this.vx / speed) * MAX_SPEED;
        this.vy = (this.vy / speed) * MAX_SPEED;
      }
    }

    applyDamping() {
      this.vx *= DAMPING;
      this.vy *= DAMPING;
    }

    triggerSquish(axisAngle) {
      const c = Math.cos(axisAngle);
      const s = Math.sin(axisAngle);
      // Flatten along collision axis, bulge perpendicular
      this.scaleX = 1 - SQUISH_AMOUNT * Math.abs(c);
      this.scaleY = 1 + SQUISH_AMOUNT * 0.6 * Math.abs(s);
      this.svx = 0;
      this.svy = 0;
    }

    recoverSquish() {
      // Spring toward 1.0 with strong damping (no bounce / no jiggle)
      this.svx += (1 - this.scaleX) * SPRING_K;
      this.svy += (1 - this.scaleY) * SPRING_K;
      this.scaleX += this.svx;
      this.scaleY += this.svy;
      this.svx *= SPRING_DAMP;
      this.svy *= SPRING_DAMP;
      // Snap to perfect rest to avoid endless micro-wobble
      if (Math.abs(this.scaleX - 1) < SQUISH_EPSILON && Math.abs(this.scaleY - 1) < SQUISH_EPSILON) {
        this.scaleX = 1;
        this.scaleY = 1;
        this.svx = 0;
        this.svy = 0;
      }
    }

    render(scrollOffset = 0) {
      const tx = this.x - this.radius;
      const ty = this.y - this.radius - scrollOffset;
      this.el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${this.scaleX.toFixed(3)}, ${this.scaleY.toFixed(3)})`;
    }

    destroy() {
      this.el.remove();
    }
  }

  // ── Bubble layer ────────────────────────────────────────────────
  class BubbleLayer {
    constructor(containerSelector, bubbleCount, radiusRange, isFixed) {
      this.container = document.querySelector(containerSelector);
      if (!this.container) {
        this.bubbles = [];
        this.active = false;
        return;
      }
      this.active = true;
      this.isFixed = isFixed;
      this.baseRadiusRange = radiusRange;
      this.bubbles = [];
      this.cachedBounds = this._queryBounds();
      this._resizeTimer = null;
      this._onResize = this._onResize.bind(this);
      this._onScroll = this._onScroll.bind(this);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('scroll', this._onScroll, { passive: true });

      const scale = getViewportScale();
      for (let i = 0; i < bubbleCount; i++) {
        const t = Math.random();
        const base = this.baseRadiusRange[0] + t * (this.baseRadiusRange[1] - this.baseRadiusRange[0]);
        const radius = base * scale;
        const color = getColorSet(i);
        const b = new Bubble(this.container, radius, color, t);
        b.seedPosition(this.cachedBounds);
        this.bubbles.push(b);
      }
    }

    _queryBounds() {
      if (this.isFixed) {
        return {
          width: window.innerWidth,
          height: Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            window.innerHeight
          )
        };
      }
      const r = this.container.getBoundingClientRect();
      return { width: r.width, height: r.height };
    }

    _onResize() {
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        this.cachedBounds = this._queryBounds();
        const scale = getViewportScale();
        for (const b of this.bubbles) {
          const base = this.baseRadiusRange[0] + b.radiusT * (this.baseRadiusRange[1] - this.baseRadiusRange[0]);
          b.setRadius(base * scale);
        }
      }, 150);
    }

    _onScroll() {
      if (this.isFixed) {
        this.cachedBounds = this._queryBounds();
      }
    }

    getBounds() {
      return this.cachedBounds;
    }

    resolveWallCollisions() {
      const bounds = this.cachedBounds;
      for (const b of this.bubbles) {
        let hit = false;
        let axis = 0;
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx);
          hit = true; axis = 0;
        } else if (b.x + b.radius > bounds.width) {
          b.x = bounds.width - b.radius;
          b.vx = -Math.abs(b.vx);
          hit = true; axis = Math.PI;
        }
        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy);
          hit = true; axis = Math.PI / 2;
        } else if (b.y + b.radius > bounds.height) {
          b.y = bounds.height - b.radius;
          b.vy = -Math.abs(b.vy);
          hit = true; axis = -Math.PI / 2;
        }
        if (hit) b.triggerSquish(axis);
      }
    }

    resolveZoneCollisions(zones) {
      for (const b of this.bubbles) {
        if (b._relocating) continue;
        for (const z of zones) {
          // Closest point on rect to bubble center
          const cx = Math.max(z.left, Math.min(b.x, z.right));
          const cy = Math.max(z.top,  Math.min(b.y, z.bottom));
          const dx = b.x - cx;
          const dy = b.y - cy;
          const dist = Math.hypot(dx, dy);

          if (dist < b.radius && dist > 0.1) {
            // Push bubble outside rect
            const overlap = b.radius - dist;
            b.x += (dx / dist) * overlap;
            b.y += (dy / dist) * overlap;
            // Reflect velocity along normal
            const ndx = dx / dist;
            const ndy = dy / dist;
            const dot = b.vx * ndx + b.vy * ndy;
            b.vx -= 2 * dot * ndx;
            b.vy -= 2 * dot * ndy;
            b.triggerSquish(Math.atan2(ndy, ndx));
          } else if (dist <= 0.1) {
            // Center is inside the zone (e.g. a card scrolled onto a fixed
            // bubble) — glide out through the nearest edge instead of
            // teleporting, so the escape reads as motion, not a pop.
            const dl = b.x - z.left;
            const dr = z.right - b.x;
            const dt = b.y - z.top;
            const db = z.bottom - b.y;
            const m = Math.min(dl, dr, dt, db);
            /* Frame zones eject in ONE step instead of gliding.
               The 8px/frame glide exists so a bubble that a scrolling card
               closes over escapes as motion rather than a pop, and that is
               right for a padded zone: the whole glide happens inside the 24px
               buffer, where nothing is drawn. A frame zone has no buffer — its
               wall IS the visible edge — so the same glide plays out ON TOP OF
               the artwork, and the bubble sits up to 16px inside the card while
               it crawls out (measured 2026-08-07). Ejecting to the near edge
               immediately is what makes contact read as a bounce. */
            const ESCAPE_STEP = z.frame ? m + b.radius : 8; // px/frame toward freedom
            if (m === dl)      { b.x -= ESCAPE_STEP; b.vx = -Math.max(Math.abs(b.vx), MIN_SPEED); }
            else if (m === dr) { b.x += ESCAPE_STEP; b.vx =  Math.max(Math.abs(b.vx), MIN_SPEED); }
            else if (m === dt) { b.y -= ESCAPE_STEP; b.vy = -Math.max(Math.abs(b.vy), MIN_SPEED); }
            else               { b.y += ESCAPE_STEP; b.vy =  Math.max(Math.abs(b.vy), MIN_SPEED); }
          }
        }
        // Deadlock rescue: overlapping zones can squeeze a bubble so each
        // zone's escape push cancels the other's. If a bubble stays trapped
        // for ~1.5s, fade it out and respawn it in genuinely free space.
        const trapped = zones.some(z =>
          b.x > z.left && b.x < z.right && b.y > z.top && b.y < z.bottom);
        if (trapped) {
          b.stuckFrames = (b.stuckFrames || 0) + 1;
          if (b.stuckFrames > 90) {
            this._relocate(b, zones);
            b.stuckFrames = 0;
          }
        } else {
          b.stuckFrames = 0;
        }
      }
    }

    _relocate(b, zones) {
      const bounds = this.cachedBounds;
      const margin = b.radius + 40;
      for (let i = 0; i < 40; i++) {
        const x = margin + Math.random() * (bounds.width - margin * 2);
        const y = margin + Math.random() * (bounds.height - margin * 2);
        const clear = !zones.some(z =>
          x > z.left - b.radius && x < z.right + b.radius &&
          y > z.top - b.radius && y < z.bottom + b.radius);
        if (clear) {
          b._relocating = true;
          const el = b.el;
          el.style.transition = 'opacity 250ms ease';
          el.style.opacity = '0';
          setTimeout(() => {
            b.x = x;
            b.y = y;
            b.vx = (Math.random() - 0.5) * 1.5;
            b.vy = (Math.random() - 0.5) * 1.5;
            el.style.opacity = '';
            setTimeout(() => {
              el.style.transition = '';
              b._relocating = false;
            }, 300);
          }, 260);
          return;
        }
      }
      // No free space found (tiny viewport, dense page) — leave it be;
      // it sits behind content at z-index 0 anyway.
    }

    resolveBubbleCollisions() {
      for (let i = 0; i < this.bubbles.length; i++) {
        for (let j = i + 1; j < this.bubbles.length; j++) {
          const a = this.bubbles[i];
          const b = this.bubbles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.radius + b.radius;
          if (dist < minDist && dist > 0.1) {
            // Resolve overlap
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            // Inelastic collision (equal mass) — exchange normal velocity
            // components with restitution so bubbles slow down on impact
            const v1n = a.vx * nx + a.vy * ny;
            const v2n = b.vx * nx + b.vy * ny;
            const k = (1 + RESTITUTION) / 2;
            a.vx += (v2n - v1n) * k * nx;
            a.vy += (v2n - v1n) * k * ny;
            b.vx += (v1n - v2n) * k * nx;
            b.vy += (v1n - v2n) * k * ny;
            const axis = Math.atan2(ny, nx);
            a.triggerSquish(axis);
            b.triggerSquish(axis + Math.PI);
          }
        }
      }
    }

    step(mouse, zones) {
      if (!this.active) return;
      const scrollY = this.isFixed ? window.scrollY : 0;
      // Scroll stir: scrolling drags the "water" the bubbles float in —
      // they lag behind the scroll and swirl a little, then settle.
      if (this.isFixed) {
        if (this.lastScrollY === undefined) this.lastScrollY = scrollY;
        const dScroll = Math.max(-SCROLL_STIR_MAX,
                        Math.min(SCROLL_STIR_MAX, scrollY - this.lastScrollY));
        this.lastScrollY = scrollY;
        if (dScroll !== 0) {
          for (const b of this.bubbles) {
            b.vy += dScroll * SCROLL_STIR;
            b.vx += (Math.random() - 0.5) * Math.abs(dScroll) * SCROLL_STIR * 0.5;
          }
        }
      }
      // Convert inputs to this layer's coordinate space
      const mouseLocal = this.isFixed
        ? { x: mouse.x, y: mouse.y + scrollY }
        : mouse;
      const zonesLocal = this.isFixed
        ? zones.map(z => ({
            left: z.left,
            top: z.top + scrollY,
            right: z.right,
            bottom: z.bottom + scrollY
          }))
        : zones;

      for (const b of this.bubbles) {
        b.applyDrift();
        b.applyMouseRepulsion(mouseLocal);
        b.integrate();
      }
      this.resolveBubbleCollisions();
      this.resolveWallCollisions();
      this.resolveZoneCollisions(zonesLocal);
      for (const b of this.bubbles) {
        b.clampSpeed();
        b.applyDamping();
        b.recoverSquish();
        b.render(scrollY);
      }
    }

    destroy() {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('scroll', this._onScroll);
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      for (const b of this.bubbles) b.destroy();
      this.bubbles = [];
    }
  }

  // ── Hero blob physics layer ───────────────────────────────────
  class HeroBlobLayer {
    constructor() {
      this.container = document.querySelector('.brand-hero-blobs');
      if (!this.container) {
        this.active = false;
        this.blobs = [];
        return;
      }
      this.active = true;
      this.blobs = [];
      this._resizeTimer = null;
      this._cRect = null; // viewport-relative container rect, cached per scroll position
      this._onResize = this._onResize.bind(this);
      this._invalidateRect = this._invalidateRect.bind(this);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('scroll', this._invalidateRect, { passive: true });

      const els = this.container.querySelectorAll('.brand-hero-blob');
      const cRect = this.container.getBoundingClientRect();

      for (const el of els) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        let x = 0, y = 0;
        const top = style.top;
        const left = style.left;
        const bottom = style.bottom;
        const right = style.right;

        if (top !== 'auto') y = parseFloat(top);
        else if (bottom !== 'auto') y = cRect.height - parseFloat(bottom) - rect.height;

        if (left !== 'auto') x = parseFloat(left);
        else if (right !== 'auto') x = cRect.width - parseFloat(right) - rect.width;

        // Strip CSS float animations; keep border-radius morph.
        // The brand-float-* / brand-blob-morph-* keyframes were removed from
        // brand.css (2026-07-12, dead code) so this is normally a no-op —
        // kept as a guard in case blob animations return.
        const animName = style.animationName;
        if (animName && animName !== 'none') {
          const names = animName.split(',').map(s => s.trim());
          const durations = style.animationDuration.split(',').map(s => s.trim());
          const timings = style.animationTimingFunction.split(',').map(s => s.trim());
          const delays = style.animationDelay.split(',').map(s => s.trim());
          const iterations = style.animationIterationCount.split(',').map(s => s.trim());
          const parts = [];
          for (let i = 0; i < names.length; i++) {
            if (!names[i].startsWith('brand-float')) {
              parts.push(`${names[i]} ${durations[i] || ''} ${timings[i] || ''} ${iterations[i] || ''} ${delays[i] || ''}`.trim().replace(/\s+/g, ' '));
            }
          }
          el.style.animation = parts.join(', ') || 'none';
        }

        // Switch to transform-based positioning
        el.style.left = '0';
        el.style.top = '0';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.classList.add('brand-hero-blob-physics');

        this.blobs.push({
          el, x, y,
          baseW: rect.width,
          baseH: rect.height,
          w: rect.width,
          h: rect.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          scaleX: 1, scaleY: 1,
          svx: 0, svy: 0
        });
      }

      this._syncBoundsAndScale();
    }

    _queryBounds() {
      const r = this.container.getBoundingClientRect();
      return { width: r.width, height: r.height };
    }

    _invalidateRect() {
      this._cRect = null;
    }

    _syncBoundsAndScale() {
      const scale = getViewportScale();
      this._cRect = null;
      this.cachedBounds = this._queryBounds();
      for (const b of this.blobs) {
        b.w = b.baseW * scale;
        b.h = b.baseH * scale;
        b.el.style.width = b.w + 'px';
        b.el.style.height = b.h + 'px';
        // Clamp to new bounds
        b.x = Math.max(0, Math.min(b.x, this.cachedBounds.width - b.w));
        b.y = Math.max(0, Math.min(b.y, this.cachedBounds.height - b.h));
      }
    }

    _onResize() {
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        this._syncBoundsAndScale();
      }, 50);
    }

    step(mouse, heroZones) {
      if (!this.active) return;
      const bounds = this.cachedBounds || this._queryBounds();
      const cRect = this._cRect || (this._cRect = this.container.getBoundingClientRect());

      const mouseLocal = {
        x: mouse.x - cRect.left,
        y: mouse.y - cRect.top
      };

      // Viewport -> container-local, same conversion the hero bubble layer does.
      const zonesLocal = heroZones && heroZones.length
        ? heroZones.map(z => ({
            left:   z.left   - cRect.left,
            top:    z.top    - cRect.top,
            right:  z.right  - cRect.left,
            bottom: z.bottom - cRect.top
          }))
        : null;

      for (const b of this.blobs) {
        // Drift
        b.vx += (Math.random() - 0.5) * 0.015;
        b.vy += (Math.random() - 0.5) * 0.015;

        // Minimum speed
        const speed = Math.hypot(b.vx, b.vy);
        if (speed < 0.2) {
          const angle = Math.random() * Math.PI * 2;
          b.vx += Math.cos(angle) * 0.06;
          b.vy += Math.sin(angle) * 0.06;
        }

        // Mouse repulsion
        const dx = (b.x + b.w / 2) - mouseLocal.x;
        const dy = (b.y + b.h / 2) - mouseLocal.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 240 && dist > 1) {
          const strength = 0.2 * (1 - dist / 240);
          b.vx += (dx / dist) * strength;
          b.vy += (dy / dist) * strength;
        }

        // Hero-content repulsion. Steering, not clamping: a hard ejection
        // would read as a glitch on shapes this large and slow, so the blob
        // is pushed off the logo/name with the same soft force the mouse
        // uses, and settles just clear of it.
        if (zonesLocal) {
          const bcx = b.x + b.w / 2;
          const bcy = b.y + b.h / 2;
          for (const z of zonesLocal) {
            // Nearest point on the zone to the blob centre.
            const nx = Math.max(z.left, Math.min(bcx, z.right));
            const ny = Math.max(z.top,  Math.min(bcy, z.bottom));
            const zdx = bcx - nx;
            const zdy = bcy - ny;
            const zdist = Math.hypot(zdx, zdy);
            const reach = b.w / 2; // clear when the blob no longer covers it

            if (zdist < reach) {
              const falloff = 1 - zdist / reach;
              if (zdist > 1) {
                b.vx += (zdx / zdist) * BLOB_ZONE_PUSH * falloff;
                b.vy += (zdy / zdist) * BLOB_ZONE_PUSH * falloff;
              } else {
                // Centre sits exactly on the zone: push toward the nearer
                // horizontal edge rather than dividing by ~zero.
                const zcx = (z.left + z.right) / 2;
                b.vx += (bcx < zcx ? -1 : 1) * BLOB_ZONE_PUSH;
              }
            }
          }
        }

        // Integrate
        b.x += b.vx;
        b.y += b.vy;

        // Clamp speed
        const s = Math.hypot(b.vx, b.vy);
        if (s > 0.8) {
          b.vx = (b.vx / s) * 0.8;
          b.vy = (b.vy / s) * 0.8;
        }

        // Damping
        b.vx *= 0.994;
        b.vy *= 0.994;

        // Wall collisions with squish
        let hit = false;
        let axis = 0;
        if (b.x < 0) {
          b.x = 0;
          b.vx = Math.abs(b.vx) * 0.8;
          hit = true; axis = 0;
        } else if (b.x + b.w > bounds.width) {
          b.x = bounds.width - b.w;
          b.vx = -Math.abs(b.vx) * 0.8;
          hit = true; axis = Math.PI;
        }
        if (b.y < 0) {
          b.y = 0;
          b.vy = Math.abs(b.vy) * 0.8;
          hit = true; axis = Math.PI / 2;
        } else if (b.y + b.h > bounds.height) {
          b.y = bounds.height - b.h;
          b.vy = -Math.abs(b.vy) * 0.8;
          hit = true; axis = -Math.PI / 2;
        }

        if (hit) {
          const c = Math.cos(axis);
          const s_ = Math.sin(axis);
          b.scaleX = 1 - 0.12 * Math.abs(c);
          b.scaleY = 1 + 0.12 * 0.5 * Math.abs(s_);
        }

        // Recover squish
        b.svx += (1 - b.scaleX) * 0.1;
        b.svy += (1 - b.scaleY) * 0.1;
        b.scaleX += b.svx;
        b.scaleY += b.svy;
        b.svx *= 0.85;
        b.svy *= 0.85;

        if (Math.abs(b.scaleX - 1) < 0.005 && Math.abs(b.scaleY - 1) < 0.005) {
          b.scaleX = 1; b.scaleY = 1; b.svx = 0; b.svy = 0;
        }

        // Render
        b.el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) scale(${b.scaleX.toFixed(3)}, ${b.scaleY.toFixed(3)})`;
      }

      // Blob-blob collisions
      for (let i = 0; i < this.blobs.length; i++) {
        for (let j = i + 1; j < this.blobs.length; j++) {
          const a = this.blobs[i];
          const b = this.blobs[j];
          const cx1 = a.x + a.w / 2;
          const cy1 = a.y + a.h / 2;
          const cx2 = b.x + b.w / 2;
          const cy2 = b.y + b.h / 2;
          const dx = cx2 - cx1;
          const dy = cy2 - cy1;
          const dist = Math.hypot(dx, dy);
          const minDist = (Math.max(a.w, a.h) + Math.max(b.w, b.h)) / 2 * 0.65;

          if (dist < minDist && dist > 0.1) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            const v1n = a.vx * nx + a.vy * ny;
            const v2n = b.vx * nx + b.vy * ny;
            const k = (1 + RESTITUTION) / 2;
            a.vx += (v2n - v1n) * k * nx;
            a.vy += (v2n - v1n) * k * ny;
            b.vx += (v1n - v2n) * k * nx;
            b.vy += (v1n - v2n) * k * ny;

            const axis = Math.atan2(ny, nx);
            const c = Math.cos(axis);
            const s = Math.sin(axis);
            a.scaleX = 1 - 0.14 * Math.abs(c);
            a.scaleY = 1 + 0.14 * 0.5 * Math.abs(s);
            b.scaleX = 1 - 0.14 * Math.abs(c);
            b.scaleY = 1 + 0.14 * 0.5 * Math.abs(s);
          }
        }
      }
    }

    destroy() {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('scroll', this._invalidateRect);
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      for (const b of this.blobs) {
        b.el.classList.remove('brand-hero-blob-physics');
        b.el.style.transform = '';
        b.el.style.left = '';
        b.el.style.top = '';
        b.el.style.right = '';
        b.el.style.bottom = '';
        b.el.style.animation = '';
      }
      this.blobs = [];
    }
  }

  // ── Main engine ─────────────────────────────────────────────────
  class PhysicsEngine {
    constructor() {
      this.mouse = new MouseTracker();
      this.running = false;
      this.rAF = null;

      // Build exclusion selector list
      const extraSel = document.querySelector('.brand-bubbles-global')?.dataset.exclusions || '';
      const extra = extraSel.split(',').map(s => s.trim()).filter(Boolean);
      const hasHero = !!document.querySelector('#hero');
      const selectors = [...DEFAULT_EXCLUSIONS, ...(hasHero ? HOME_EXCLUSIONS : []), ...extra];
      this.zones = new ExclusionZoneTracker(selectors);

      // Create layers
      this.globalLayer = new BubbleLayer('.brand-bubbles-global', 7, [10, 28], true);
      this.heroLayer    = new BubbleLayer('.brand-bubbles-hero',   3, [40, 75], false);
      this.heroBlobLayer = new HeroBlobLayer();

      // Per-frame layout caches — hero rect and derived local zones only
      // change on scroll/resize, not every frame
      this._heroRect = null;
      this._zonesLocal = null;
      this._zonesVersion = -1;
      this._heroContentZones = null; // viewport-relative; see _loop
      this._invalidateBounds = this._invalidateBounds.bind(this);
      window.addEventListener('resize', this._invalidateBounds);
      window.addEventListener('scroll', this._invalidateBounds, { passive: true });

      // Visibility / intersection guards
      this._onVis = this._onVis.bind(this);
      document.addEventListener('visibilitychange', this._onVis);

      this.heroObs = null;
      this._heroVisible = true;
      const heroEl = document.querySelector('#hero');
      if (heroEl && 'IntersectionObserver' in window) {
        this.heroObs = new IntersectionObserver((entries) => {
          this._heroVisible = entries[0].isIntersecting;
          this.heroLayer.active = this.heroLayer.container ? this._heroVisible : false;
        }, { threshold: 0 });
        this.heroObs.observe(heroEl);
      }

      this._loop = this._loop.bind(this);
      this.running = true;
      this._loop();
    }

    _onVis() {
      if (document.visibilityState === 'hidden') {
        this.running = false;
        if (this.rAF) cancelAnimationFrame(this.rAF);
      } else {
        this.running = true;
        this._invalidateBounds(); // layout may have shifted while hidden
        this._loop();
      }
    }

    _invalidateBounds() {
      this._heroRect = null;
      this._heroContentZones = null; // recomputed lazily in _loop
      if (this.heroBlobLayer && this.heroBlobLayer.active) {
        this.heroBlobLayer._invalidateRect();
      }
    }

    _loop() {
      if (!this.running) return;
      // Global layer uses document coordinates — bubbles scroll with the page
      this.globalLayer.step(this.mouse, this.zones.rects);
      // Hero layer uses container-local coordinates — convert mouse and zones
      if (this.heroLayer.active) {
        let heroRect = this._heroRect;
        if (!heroRect) {
          heroRect = this._heroRect = this.heroLayer.container.getBoundingClientRect();
          this._zonesLocal = null; // rect moved, cached local zones are stale
        }
        if (!this._zonesLocal || this._zonesVersion !== this.zones.version) {
          this._zonesVersion = this.zones.version;
          this._zonesLocal = this.zones.rects.map(z => ({
            left:   z.left   - heroRect.left,
            top:    z.top    - heroRect.top,
            right:  z.right  - heroRect.left,
            bottom: z.bottom - heroRect.top
          }));
        }
        const mouseLocal = {
          x: this.mouse.x - heroRect.left,
          y: this.mouse.y - heroRect.top
        };
        this.heroLayer.step(mouseLocal, this._zonesLocal);
      }
      // Hero blobs use container-local coordinates; skip when the hero
      // is scrolled out of view (blobs only live inside #hero)
      if (this._heroVisible) {
        // These zones are viewport-relative, so they go stale on scroll for
        // exactly the same reason the blob container rect does. Invalidate
        // them together, or a fresh rect gets paired with stale zones and the
        // blobs dodge empty space. Cached otherwise: this measures a Range,
        // and the logo/headings only move on reflow.
        if (!this.heroBlobLayer._cRect) this._heroContentZones = null;
        if (!this._heroContentZones) this._heroContentZones = heroContentRects();
        this.heroBlobLayer.step(this.mouse, this._heroContentZones);
      }
      this.rAF = requestAnimationFrame(this._loop);
    }

    destroy() {
      this.running = false;
      if (this.rAF) cancelAnimationFrame(this.rAF);
      window.removeEventListener('resize', this._invalidateBounds);
      window.removeEventListener('scroll', this._invalidateBounds);
      document.removeEventListener('visibilitychange', this._onVis);
      this.mouse.destroy();
      this.zones.destroy();
      this.globalLayer.destroy();
      this.heroLayer.destroy();
      this.heroBlobLayer.destroy();
      if (this.heroObs) this.heroObs.disconnect();
    }
  }

  // ── Init ────────────────────────────────────────────────────────
  let engine = null;
  function init() {
    if (engine) return;
    engine = new PhysicsEngine();
    window.__bubbleEngine = engine; // debug/testing handle
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
