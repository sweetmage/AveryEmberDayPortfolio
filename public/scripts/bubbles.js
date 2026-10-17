/**
 * Bubble Physics Engine — soft, jelly-like floating bubbles.
 *
 * Three layers: global (page-space, the whole document), hero (inside #hero) and the large hero
 * blobs. Bubbles drift on smooth currents, cushion against protected content, bounce off pictures,
 * collide softly with each other, react to the pointer with momentum, and squish on impact with an
 * oriented, area-preserving wobble.
 *
 * Rebuilt 2026-10-16 (shxdowloop "fluid squishy bubbles", feel approved by the user in
 * docs/mockups/bubble-feel-lab.html). What changed and why, measured by
 * tests/bubbles-motion.spec.js against the previous engine:
 *
 *   - The global layer used to be `position: fixed` and was moved back by `-scrollY` every frame.
 *     The browser scrolls on its compositor thread before the next animation frame, so bubbles
 *     lagged every scroll by its full distance and then snapped: the jitter. The layer now lives in
 *     page space (absolute, as tall as the document), so the browser scrolls bubbles and content
 *     together. Lag behind a 300px scroll went from 300px to 0.
 *   - Zones were re-measured on every scroll event (~50 layout reads per event). They are now
 *     stored in page coordinates, which do not change when the page scrolls, and refreshed on a
 *     timer and on layout change. Only fixed/sticky chrome is re-read per frame.
 *   - Integration was per frame, so 120Hz displays ran twice as fast. Physics now runs at a fixed
 *     120Hz with interpolated rendering, in px and seconds.
 *   - Squish snapped to a deformed scale and recovered overdamped, axis-aligned only. It is now a
 *     deformation tensor on an underdamped spring, driven by impact speed, rendered as one matrix.
 */

(function () {
  'use strict';

  // ── Reduced motion guard ────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // ── Tuning: the approved feel-lab defaults (2026-10-16) ─────────
  const TUNING = Object.freeze({
    wobbleHz:  3.2,  // deformation spring frequency
    jelly:     0.26, // deformation damping ratio (lower = wobblier)
    squish:    0.20, // peak squash for a 300px/s impact
    stretch:   0.07, // elongation along the path at 300px/s
    maxDeform: 0.22, // cap on deformation magnitude
    cushion:   14,   // px a cruising bubble sinks into a zone's padding before it turns
    bounce:    0.72, // restitution
    push:      1300, // pointer repulsion, px/s^2 at contact
    drag:      5,    // how strongly a moving pointer carries bubbles with it, 1/s
    lean:      0.09, // bubbles flatten on the side facing the pointer
    sway:      0.35, // scroll velocity -> acceleration, so bubbles trail a scroll like water
    drift:     18,   // drift current strength, px/s^2
    cruise:    70    // px/s; faster than this is gently braked
  });

  // ── Physics constants ───────────────────────────────────────────
  const STEP          = 1 / 120; // fixed physics step, seconds
  const MAX_SUBSTEPS  = 12;      // per animation frame; beyond this, time is dropped, not owed
  const MAX_FRAME_DT  = 0.1;     // s; a long stall never integrates as one giant step
  const MAX_SPEED     = 1100;    // px/s hard ceiling (a hard flick)
  const BASE_DRAG     = 0.35;    // 1/s
  const POINTER_RADIUS = 190;    // px
  const ZONE_PADDING  = 24;      // px buffer around protected zones (the cushion lives in here)
  /* The hard guarantee: the deformed bubble's BOX — exactly what getBoundingClientRect reports, and
     what the exclusion specs measure — never comes closer than this to a padded zone's element.
     The 24px padding is a soft cushion, not the guarantee. */
  const HARD_MARGIN   = 4;
  const BULGE_PX      = 14;      // deformation never pushes an edge further than this past the radius
  const PUSH_EPSILON  = 0.5;     // px; smaller position corrections are resting contact, not shoves
  /* Wedge rescue. Zones on this site overlap (Contact @1440: the intro paragraph's zone and the
     form's padded zone leave an 8px band, narrower than any bubble), so a bubble can be caught with
     no legal position. A step whose corrections cannot reach a legal position relocates the bubble
     immediately (zero overlap is the contract, so there is no grace period). Slower wedges show up
     as corrections in OPPOSING directions; a healthy escape always pushes the same way. WEDGE_STEPS
     (200ms) of contested shoves, or SHOVE_STEPS (2s) of any continuous shoving, relocates too. */
  const WEDGE_STEPS   = 24;
  const SHOVE_STEPS   = 240;
  const ZONE_REFRESH_MS = 250;   // periodic zone refresh (layout shifts, lazy images, font reflow)

  /* ── The picture is the wall ────────────────────────────────────
     User call, 2026-08-08: bubbles bounce off THE IMAGE, at every screen size.

     1. `.gallery-item` is deliberately NOT an exclusion selector. A card zone is a wall around the
        picture, so bubbles would rebound off the card's outer edge and never reach the artwork.
        Bubbles cross the card's border, padding and caption band freely and stop at the picture.
        (The caption's own `h3`/`p` keep their normal padded zones, so text is still protected.)
     2. These zones carry NO padding and are hard and tangent: the wall is the visible edge of the
        artwork. Contact shows up as a graze, so these surfaces are asserted on the bubble CENTRE
        never crossing the edge, not on zero overlap.

     Everything else — nav, footer, headings, body copy, the project tiles, the Contact form —
     keeps its full ZONE_PADDING zone at every width. */
  const FRAME_ZONE_SELECTOR = 'img, .mistrust-stage';

  // ── Hero blobs (large, slow; soft steering only) ────────────────
  const BLOB = Object.freeze({
    drift: 6,           // px/s^2
    minSpeed: 12,       // px/s
    minSpeedAccel: 20,  // px/s^2
    cruise: 48,         // px/s; the old 0.8px/frame ceiling, now a soft brake
    maxSpeed: 160,      // px/s
    drag: 0.36,         // 1/s (0.994 per 60Hz frame)
    repelRadius: 240,
    repel: 720,         // px/s^2 (0.2 px/frame^2)
    zonePush: 216,      // px/s^2 (BLOB_ZONE_PUSH 0.06 px/frame^2), soft steering off the hero copy
    bounce: 0.8,
    wobbleHz: 2.2,
    jelly: 0.3,
    squish: 0.10,       // peak squash for a 48px/s impact
    maxDeform: 0.14
  });

  // ── Viewport scaling ────────────────────────────────────────────
  function getViewportScale() {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(0.6, Math.min(1.4, vmin / 900));
  }

  // ── Color sets (match existing CSS nth-child order) ─────────────
  function getColorSet(i) {
    const c = i + 1; // 1-indexed
    if (c % 3 === 2) return 'gold';
    if (c % 3 === 1 && c > 1) return 'cyan';
    return 'purple';
  }

  // ── Default exclusion selectors ─────────────────────────────────
  /* Matched by SELECTOR, so any rename or retag drops an element out of the physics with no error
     and nothing red anywhere. That has happened three times (the hero logo when it was inlined as
     an <svg>, the Projects rail when it was restyled to `.project-tab`, and the gallery card).
     Change a class here in the same commit as the markup, and add a spec case. */
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
    // The Projects rail (restyled from `.brand-btn` 2026-07-24, LOGBOOK Entry 085).
    '.project-tab',
    '.wip-notice',
    /* `.gallery-item` is deliberately absent (2026-08-08): the picture is the wall, see
       FRAME_ZONE_SELECTOR. `tests/gallery-expand.spec.js` asserts the ART is registered instead. */
    '.about-box',
    '.hero-name',
    '.hero-sub',
    // Listed explicitly: the hero mark is an inline <svg>, which `img` does not match (Entry 083).
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

  const HOME_EXCLUSIONS = [
    '#hero .hero-logo',
    '#hero .hero-name',
    '#hero .hero-sub',
    '#work h2',
    '#about h2',
    '.brand-footer-inner',
    '.brand-footer-connect'
  ];

  // ── Hero-content zones (blob layer only) ────────────────────────
  // Deliberately NOT the full exclusion list. The blobs are the hero's ambient colour wash and
  // should keep filling it; only the mark and the actual glyphs are protected. `.hero-name` /
  // `.hero-sub` are full-width blocks, so a Range measures the ink instead of the box.
  // Returns PAGE-space rects.
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

    const sx = window.scrollX, sy = window.scrollY;
    return rects.map(r => ({
      left:   r.left   + sx - ZONE_PADDING,
      top:    r.top    + sy - ZONE_PADDING,
      right:  r.right  + sx + ZONE_PADDING,
      bottom: r.bottom + sy + ZONE_PADDING
    }));
  }

  // ── Small geometry helpers ──────────────────────────────────────
  /* A zone: the outer rect the soft physics uses (padded, or exact for a picture), plus `inner`,
     the element's own rect, which the hard guarantee keeps the deformed box clear of. */
  function makeZone(left, top, right, bottom, frame) {
    const inner = { left, top, right, bottom };
    if (frame) return { left, top, right, bottom, frame: true, inner };
    return {
      left: left - ZONE_PADDING, top: top - ZONE_PADDING,
      right: right + ZONE_PADDING, bottom: bottom + ZONE_PADDING,
      frame: false, inner
    };
  }

  function shiftZone(z, dx, dy) {
    return {
      left: z.left + dx, top: z.top + dy, right: z.right + dx, bottom: z.bottom + dy,
      frame: z.frame,
      inner: { left: z.inner.left + dx, top: z.inner.top + dy, right: z.inner.right + dx, bottom: z.inner.bottom + dy }
    };
  }

  /* Height of the document WITHOUT this engine's own layer. Read from <html>'s box, which an
     absolutely positioned child cannot stretch, never from scrollHeight, which it can: a layer
     sized from scrollHeight would hold the page at its tallest height forever. */
  function documentHeight() {
    return Math.max(window.innerHeight, document.documentElement.getBoundingClientRect().height);
  }

  // ── Pointer tracker ─────────────────────────────────────────────
  /* Position AND velocity. Velocity is what lets a flick carry bubbles with it. Mouse and pen come
     from pointer events (coalesced samples, so a fast flick is not undersampled); touch comes from
     passive touch events, because a touch that becomes a scroll cancels its pointer stream. */
  class PointerTracker {
    constructor() {
      this.active = false;
      this.x = 0; this.y = 0;   // client coordinates
      this.vx = 0; this.vy = 0; // px/s
      this.t = 0;               // s, event timeline (same origin as rAF timestamps)
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onTouch = this._onTouch.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._onOut = this._onOut.bind(this);
      this.clear = this.clear.bind(this);
      window.addEventListener('pointermove', this._onPointerMove, { passive: true });
      window.addEventListener('touchstart', this._onTouch, { passive: true });
      window.addEventListener('touchmove', this._onTouch, { passive: true });
      window.addEventListener('touchend', this._onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', this._onTouchEnd, { passive: true });
      document.addEventListener('pointerout', this._onOut, { passive: true });
      window.addEventListener('blur', this.clear);
    }
    _feed(x, y, timeStamp) {
      const t = timeStamp / 1000;
      const dt = t - this.t;
      if (this.active && dt > 0 && dt < 0.1) {
        const k = Math.min(1, dt * 30);
        this.vx += ((x - this.x) / dt - this.vx) * k;
        this.vy += ((y - this.y) / dt - this.vy) * k;
      } else if (!this.active) {
        this.vx = 0; this.vy = 0;
      }
      this.x = x; this.y = y; this.t = t; this.active = true;
    }
    _onPointerMove(e) {
      if (e.pointerType === 'touch') return; // touch is fed by the touch listeners
      const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (list && list.length) for (const ev of list) this._feed(ev.clientX, ev.clientY, ev.timeStamp);
      else this._feed(e.clientX, e.clientY, e.timeStamp);
    }
    _onTouch(e) {
      if (e.touches.length) this._feed(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp);
    }
    _onTouchEnd(e) {
      // A lifted finger stops pushing. The old tracker kept the last touch point forever.
      if (!e.touches.length) this.clear();
    }
    _onOut(e) {
      if (!e.relatedTarget && e.pointerType !== 'touch') this.clear(); // left the window
    }
    clear() {
      this.active = false;
      this.vx = 0; this.vy = 0;
    }
    /** Called once per animation frame: velocity fades once the pointer stops sending samples. */
    decay(dt, nowSec) {
      if (nowSec - this.t > 0.05) {
        const k = Math.exp(-dt * 12);
        this.vx *= k; this.vy *= k;
      }
    }
    destroy() {
      window.removeEventListener('pointermove', this._onPointerMove);
      window.removeEventListener('touchstart', this._onTouch);
      window.removeEventListener('touchmove', this._onTouch);
      window.removeEventListener('touchend', this._onTouchEnd);
      window.removeEventListener('touchcancel', this._onTouchEnd);
      document.removeEventListener('pointerout', this._onOut);
      window.removeEventListener('blur', this.clear);
    }
  }

  // ── Exclusion zone tracker ──────────────────────────────────────
  /* Zones are stored in PAGE space (viewport rect + scroll at the moment of measuring), which does
     not change when the page scrolls. So nothing here listens to scroll. Elements inside fixed or
     sticky chrome are the exception: they move relative to the page as it scrolls, so they are
     kept as live elements and re-read once per frame (a handful of reads, before any writes).

     `rects` is the VIEWPORT-space view the specs read: padded rects for normal zones, exact rects
     flagged `frame: true` for pictures, same as the previous engine. */
  class ExclusionZoneTracker {
    constructor(selectors, onRefresh) {
      this.selectors = selectors;
      this.onRefresh = onRefresh || null;
      this.page = [];    // page-space zones
      this.pinned = [];  // { el, frame, r } — r is the latest viewport rect
      this.version = 0;
      this.refresh = this.refresh.bind(this);
      this.refresh();
      this._timer = setInterval(this.refresh, ZONE_REFRESH_MS);
    }
    refresh() {
      const sx = window.scrollX, sy = window.scrollY;
      const pinnedCache = new Map();
      const isPinned = (el) => {
        const chain = [];
        let node = el, result = false;
        while (node && node !== document.body && node !== document.documentElement) {
          if (pinnedCache.has(node)) { result = pinnedCache.get(node); break; }
          chain.push(node);
          const pos = getComputedStyle(node).position;
          if (pos === 'fixed' || pos === 'sticky') { result = true; break; }
          node = node.parentElement;
        }
        for (const n of chain) pinnedCache.set(n, result);
        return result;
      };

      /* Deduped BY ELEMENT: an image matches both `img` and its own class, and a later padded pass
         must not put a padded rect back over a frame zone. */
      const seen = new Set();
      const page = [];
      const pinned = [];
      for (const sel of this.selectors) {
        let els;
        try { els = document.querySelectorAll(sel); } catch { continue; } // bad data-exclusions entry
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          const r = el.getBoundingClientRect();
          // A hidden element (display: none, e.g. return-to-top before any scroll) reports a
          // zero box at the viewport corner; registering it would wall off a phantom corner.
          if (r.width === 0 && r.height === 0) continue;
          const frame = el.matches(FRAME_ZONE_SELECTOR);
          if (isPinned(el)) {
            pinned.push({ el, frame, r });
          } else {
            page.push(makeZone(r.left + sx, r.top + sy, r.right + sx, r.bottom + sy, frame));
          }
        }
      }
      this.page = page;
      this.pinned = pinned;
      this.version++;
      if (this.onRefresh) this.onRefresh();
    }
    /** Per frame, before any writes: fresh viewport rects for the fixed/sticky chrome. */
    readPinned() {
      for (const p of this.pinned) p.r = p.el.getBoundingClientRect();
    }
    /** Every zone in page space for the current scroll position. */
    pageZones(sx, sy) {
      if (!this.pinned.length) return this.page;
      const out = this.page.slice();
      for (const p of this.pinned) {
        out.push(makeZone(p.r.left + sx, p.r.top + sy, p.r.right + sx, p.r.bottom + sy, p.frame));
      }
      return out;
    }
    get rects() {
      const sx = window.scrollX, sy = window.scrollY;
      const out = this.page.map(z => (z.frame
        ? { left: z.left - sx, top: z.top - sy, right: z.right - sx, bottom: z.bottom - sy, frame: true }
        : { left: z.left - sx, top: z.top - sy, right: z.right - sx, bottom: z.bottom - sy }));
      for (const p of this.pinned) {
        const r = p.r;
        out.push(p.frame
          ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, frame: true }
          : { left: r.left - ZONE_PADDING, top: r.top - ZONE_PADDING, right: r.right + ZONE_PADDING, bottom: r.bottom + ZONE_PADDING });
      }
      return out;
    }
    destroy() {
      clearInterval(this._timer);
      this.onRefresh = null;
    }
  }

  // ── Deformation (shared by bubbles and blobs) ───────────────────
  /* A traceless symmetric tensor [[a, b], [b, -a]]: stretch along one axis, squash across it, at
     any angle. Magnitude m = hypot(a, b). Rendered as (I + D) / sqrt(det), which keeps the area
     constant, so a squash always bulges sideways like a real soft body. */
  function deformMatrix(a, b) {
    const s = 1 / Math.sqrt(Math.max(1e-3, 1 - (a * a + b * b)));
    return [(1 + a) * s, b * s, b * s, (1 - a) * s]; // m00, m01, m10, m11
  }

  /** Elongation of size e along unit vector (nx, ny), as tensor components [a, b]. */
  function along(nx, ny, e) {
    return [e * (2 * nx * nx - 1), e * (2 * nx * ny)];
  }

  // ── Bubble ──────────────────────────────────────────────────────
  class Bubble {
    constructor(container, radius, colorSet, radiusT) {
      this.el = document.createElement('div');
      this.el.className = 'brand-bubble brand-bubble-physics';
      this.el.setAttribute('data-color', colorSet);
      container.appendChild(this.el);
      this.colorSet = colorSet;
      this.radiusT = radiusT;
      this.setRadius(radius);

      // Physics state, px and px/s, in the layer's own coordinates.
      this.x = 0; this.y = 0;
      this.vx = (Math.random() - 0.5) * 90;
      this.vy = (Math.random() - 0.5) * 90;
      // Deformation, its rate, and its spring target (lean + speed stretch).
      this.a = 0; this.b = 0; this.va = 0; this.vb = 0; this.ta = 0; this.tb = 0;
      // Previous step, for interpolated rendering.
      this.px = 0; this.py = 0; this.pa = 0; this.pb = 0;
      // Drift currents: per-bubble phases and frequencies, deterministic once seeded.
      this.ph = [0, 1, 2, 3].map(() => Math.random() * Math.PI * 2);
      this.w = [0.31, 0.47, 0.37, 0.53].map(w => w * (0.7 + Math.random() * 0.6));

      this._relocating = false;
      this._wedge = 0;
      this._shove = 0;
      this._lastPushX = 0;
      this._lastPushY = 0;
    }

    setRadius(radius) {
      this.radius = radius;
      this.el.style.width  = radius * 2 + 'px';
      this.el.style.height = radius * 2 + 'px';
    }

    /* Seeded CLEAR of the zones. A uniform random point put 2–3 of the 7 global bubbles inside a
       zone on every load (measured 2026-08-10). The attempt cap means a page whose zones tile
       nearly everything (Projects at 768px is ~94% zone by area) falls back to the last candidate
       rather than spinning; the wedge rescue then clears it. */
    seedPosition(bounds, zones = []) {
      const margin = this.radius + 40;
      const pad = this.radius + BULGE_PX;
      const pick = () => ({
        x: margin + Math.random() * Math.max(1, bounds.width  - margin * 2),
        y: margin + Math.random() * Math.max(1, bounds.height - margin * 2)
      });
      let p = pick();
      for (let i = 0; i < 60 && zones.length; i++) {
        const clear = !zones.some(z =>
          p.x > z.left - pad && p.x < z.right + pad && p.y > z.top - pad && p.y < z.bottom + pad);
        if (clear) break;
        p = pick();
      }
      this.x = this.px = p.x;
      this.y = this.py = p.y;
      this.render(1); // set the transform immediately so nothing flashes at (0,0)
    }

    /** Velocity impulse into the deformation spring: squash along n, scaled by impact speed. */
    impact(nx, ny, dv) {
      if (!(dv > 0)) return;
      const omega = 2 * Math.PI * TUNING.wobbleHz;
      const [ia, ib] = along(nx, ny, -TUNING.squish * omega * Math.min(dv, 900) / 300);
      this.va += ia;
      this.vb += ib;
    }

    halfExtents() {
      const m = deformMatrix(this.a, this.b);
      return [this.radius * (Math.abs(m[0]) + Math.abs(m[1])), this.radius * (Math.abs(m[2]) + Math.abs(m[3]))];
    }

    snapshot() {
      this.px = this.x; this.py = this.y; this.pa = this.a; this.pb = this.b;
    }

    render(alpha) {
      const x = this.px + (this.x - this.px) * alpha;
      const y = this.py + (this.y - this.py) * alpha;
      const m = deformMatrix(this.pa + (this.a - this.pa) * alpha, this.pb + (this.b - this.pb) * alpha);
      const r = this.radius;
      this.el.style.transform =
        `translate3d(${(x - r).toFixed(2)}px, ${(y - r).toFixed(2)}px, 0) ` +
        `matrix(${m[0].toFixed(4)}, ${m[2].toFixed(4)}, ${m[1].toFixed(4)}, ${m[3].toFixed(4)}, 0, 0)`;
    }

    destroy() {
      this.el.remove();
    }
  }

  // ── Bubble layer ────────────────────────────────────────────────
  /* Works in its own coordinates. The global layer's origin is the document's top-left, so its
     coordinates ARE page coordinates; the hero layer's origin is the hero container's page
     position. Both scroll with the page natively, so neither ever reads the scroll position. */
  class BubbleLayer {
    constructor(containerSelector, bubbleCount, radiusRange, isGlobal) {
      this.container = document.querySelector(containerSelector);
      this.bubbles = [];
      this.origin = { x: 0, y: 0 };
      this.bounds = { width: 0, height: 0 };
      if (!this.container) {
        this.active = false;
        return;
      }
      this.active = true;
      this.isGlobal = isGlobal;
      this.baseRadiusRange = radiusRange;
      this.origin = { x: 0, y: 0 };
      this.bounds = { width: 0, height: 0 };
      this.t = 0;
      this.measure();

      const scale = getViewportScale();
      for (let i = 0; i < bubbleCount; i++) {
        const t = Math.random();
        const base = radiusRange[0] + t * (radiusRange[1] - radiusRange[0]);
        this.bubbles.push(new Bubble(this.container, base * scale, getColorSet(i), t));
      }
    }

    /** Layout reads: called on zone refresh and resize, never on scroll. */
    measure() {
      // By container, not `active`: the hero layer is inactive while scrolled out of view, and must
      // still have current geometry the moment it comes back.
      if (!this.container) return;
      if (this.isGlobal) {
        const h = documentHeight();
        if (Math.abs(h - this.bounds.height) > 0.5) this.container.style.height = h + 'px';
        this.bounds = { width: this.container.clientWidth || window.innerWidth, height: h };
        this.origin = { x: 0, y: 0 };
      } else {
        const r = this.container.getBoundingClientRect();
        this.bounds = { width: r.width, height: r.height };
        this.origin = { x: r.left + window.scrollX, y: r.top + window.scrollY };
      }
    }

    localZones(pageZones) {
      const ox = this.origin.x, oy = this.origin.y;
      if (!ox && !oy) return pageZones;
      return pageZones.map(z => shiftZone(z, -ox, -oy));
    }

    seed(pageZones) {
      if (!this.container) return; // no hero on this page
      const zones = this.localZones(pageZones);
      for (const b of this.bubbles) b.seedPosition(this.bounds, zones);
    }

    rescale() {
      const scale = getViewportScale();
      const [lo, hi] = this.baseRadiusRange;
      for (const b of this.bubbles) b.setRadius((lo + b.radiusT * (hi - lo)) * scale);
    }

    snapshot() {
      for (const b of this.bubbles) b.snapshot();
    }

    render(alpha) {
      for (const b of this.bubbles) b.render(alpha);
    }

    /**
     * One fixed physics step.
     * @param {number} h       step, seconds
     * @param {object} env     { zones (layer-local), pointer: {x, y, vx, vy} | null, swayA }
     */
    step(h, env) {
      if (!this.active) return;
      this.t += h;
      // Parked bubbles (no legal spot on this page right now) sit out and retry every 0.5s.
      for (const b of this.bubbles) {
        if (b._parked && ++b._hiddenSteps >= 60) this._relocate(b, env.zones);
      }
      const B = this.bubbles.filter(b => !b._parked);
      const t = this.t, P = TUNING;
      const W = this.bounds.width, H = this.bounds.height;
      const zones = env.zones;
      const omega = 2 * Math.PI * P.wobbleHz, zeta = P.jelly;
      const kCush = (180 / P.cushion) * (180 / P.cushion); // stops a cruising bubble within `cushion`
      const cCush = 2 * 0.55 * Math.sqrt(kCush);
      const ptr = env.pointer;

      // Forces, then integrate (semi-implicit Euler).
      for (const b of B) {
        let ax = P.drift * (Math.sin(b.w[0] * t + b.ph[0]) + 0.6 * Math.sin(b.w[1] * t * 1.7 + b.ph[1]));
        let ay = P.drift * (Math.cos(b.w[2] * t + b.ph[2]) + 0.6 * Math.sin(b.w[3] * t * 1.3 + b.ph[3]));
        ay += env.swayA;

        // Speed governor: a gentle push up to a minimum, extra drag above cruise. No random kicks.
        const sp = Math.hypot(b.vx, b.vy);
        if (sp < P.cruise * 0.35) {
          const ux = sp > 1 ? b.vx / sp : Math.cos(b.ph[0]);
          const uy = sp > 1 ? b.vy / sp : Math.sin(b.ph[0]);
          ax += ux * 30; ay += uy * 30;
        }
        const over = Math.max(0, sp - P.cruise) / Math.max(sp, 1);
        ax -= b.vx * over * 2.2; ay -= b.vy * over * 2.2;

        b.ta = 0; b.tb = 0;
        if (ptr) {
          const dx = b.x - ptr.x, dy = b.y - ptr.y, d = Math.hypot(dx, dy);
          if (d < POINTER_RADIUS + b.radius && d > 1) {
            const f = 1 - Math.max(0, d - b.radius * 0.5) / (POINTER_RADIUS + b.radius * 0.5);
            const f2 = f * f, nx = dx / d, ny = dy / d;
            ax += nx * P.push * f2; ay += ny * P.push * f2;               // push away
            ax += (ptr.vx - b.vx) * P.drag * f2;                          // a moving pointer
            ay += (ptr.vy - b.vy) * P.drag * f2;                          // carries bubbles along
            const [la, lb] = along(nx, ny, -P.lean * f2);                 // flatten toward it
            b.ta += la; b.tb += lb;
          }
        }
        if (sp > 1) { // stretch along the path, more when fast
          const [sa, sb] = along(b.vx / sp, b.vy / sp, P.stretch * Math.min(sp / 300, 2));
          b.ta += sa; b.tb += sb;
        }

        b.vx += ax * h; b.vy += ay * h;
        const s2 = Math.hypot(b.vx, b.vy);
        if (s2 > MAX_SPEED) { b.vx *= MAX_SPEED / s2; b.vy *= MAX_SPEED / s2; }
        const damp = Math.exp(-BASE_DRAG * h);
        b.vx *= damp; b.vy *= damp;
        b.x += b.vx * h; b.y += b.vy * h;
      }

      // Bubble pairs: a soft spring contact, so clusters jostle instead of clicking.
      for (let i = 0; i < B.length; i++) {
        for (let j = i + 1; j < B.length; j++) {
          const a = B[i], b = B[j];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), md = a.radius + b.radius;
          if (d < md && d > 0.1) {
            const nx = dx / d, ny = dy / d, o = md - d;
            const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; // < 0: approaching
            const k = 420, c = 2 * (1 - P.bounce) * Math.sqrt(2 * k);
            const dv = (k * o - (vn < 0 ? c * vn : 0)) * h * 0.5;
            a.vx -= nx * dv; a.vy -= ny * dv; b.vx += nx * dv; b.vy += ny * dv;
            const lim = Math.min(a.radius, b.radius) * 0.3;
            if (o > lim) {
              const p = (o - lim) * 0.5;
              a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p;
            }
            if (vn < 0) { a.impact(nx, ny, -vn * h * 14); b.impact(nx, ny, -vn * h * 14); }
          }
        }
      }

      for (const b of B) {
        let pushX = 0, pushY = 0, contested = false;
        const push = (dx, dy) => {
          if (Math.abs(dx) + Math.abs(dy) < PUSH_EPSILON) return;
          if (pushX * dx + pushY * dy < 0) contested = true;
          pushX += dx; pushY += dy;
        };

        // Walls of the layer.
        const r = b.radius;
        if (b.x - r < 0) { const dv = Math.max(0, -b.vx); push(r - b.x, 0); b.x = r; b.vx = dv * P.bounce; b.impact(1, 0, dv); }
        else if (b.x + r > W) { const dv = Math.max(0, b.vx); push(W - r - b.x, 0); b.x = W - r; b.vx = -dv * P.bounce; b.impact(1, 0, dv); }
        if (b.y - r < 0) { const dv = Math.max(0, -b.vy); push(0, r - b.y); b.y = r; b.vy = dv * P.bounce; b.impact(0, 1, dv); }
        else if (b.y + r > H) { const dv = Math.max(0, b.vy); push(0, H - r - b.y); b.y = H - r; b.vy = -dv * P.bounce; b.impact(0, 1, dv); }

        if (!b._relocating) {
          // Soft contact: cushion inside a padded zone's buffer; hard and tangent on a picture.
          for (const z of zones) {
            if (b.x < z.left - r || b.x > z.right + r || b.y < z.top - r || b.y > z.bottom + r) continue;
            const cx = Math.max(z.left, Math.min(b.x, z.right));
            const cy = Math.max(z.top,  Math.min(b.y, z.bottom));
            const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
            let nx, ny, depth;
            if (d > 0.01) {
              if (d >= r) continue;
              nx = dx / d; ny = dy / d; depth = r - d;
            } else { // centre inside the zone: leave through the nearest edge
              const dl = b.x - z.left, dr = z.right - b.x, dt = b.y - z.top, db = z.bottom - b.y;
              const m = Math.min(dl, dr, dt, db);
              if (m === dl) { nx = -1; ny = 0; } else if (m === dr) { nx = 1; ny = 0; }
              else if (m === dt) { nx = 0; ny = -1; } else { nx = 0; ny = 1; }
              depth = r + m;
            }
            const vn = b.vx * nx + b.vy * ny;
            if (z.frame) {
              push(nx * depth, ny * depth);
              b.x += nx * depth; b.y += ny * depth;
              if (vn < 0) {
                b.vx -= (1 + P.bounce) * vn * nx; b.vy -= (1 + P.bounce) * vn * ny;
                b.impact(nx, ny, -vn);
              }
            } else {
              const dv = (kCush * depth - cCush * Math.min(0, vn)) * h;
              b.vx += nx * dv; b.vy += ny * dv;
              if (vn < 0) b.impact(nx, ny, Math.min(dv, -vn));
            }
          }
        }

        // Deformation spring toward its target, capped by size. Runs BEFORE the hard guarantee,
        // so the guarantee checks the shape that will actually be drawn.
        const fa = -omega * omega * (b.a - b.ta) - 2 * zeta * omega * b.va;
        const fb = -omega * omega * (b.b - b.tb) - 2 * zeta * omega * b.vb;
        b.va += fa * h; b.vb += fb * h;
        b.a += b.va * h; b.b += b.vb * h;
        // Edge bulge sqrt((1+m)/(1-m)) - 1 <= BULGE_PX / r  =>  m <= (q^2 - 1) / (q^2 + 1).
        const q = 1 + BULGE_PX / r, mCap = Math.min(P.maxDeform, (q * q - 1) / (q * q + 1));
        const mag = Math.hypot(b.a, b.b);
        if (mag > mCap) { const s = mCap / mag; b.a *= s; b.b *= s; b.va *= 0.5; b.vb *= 0.5; }

        // Hard guarantee: the deformed box stays HARD_MARGIN clear of every padded zone's element.
        let unresolved = false;
        if (!b._relocating) {
          for (let pass = 0; pass < 4; pass++) {
            let any = false;
            const [hx, hy] = b.halfExtents();
            for (const z of zones) {
              if (z.frame) continue;
              const I = z.inner;
              const ox = Math.min(b.x + hx, I.right + HARD_MARGIN) - Math.max(b.x - hx, I.left - HARD_MARGIN);
              if (ox <= 0) continue;
              const oy = Math.min(b.y + hy, I.bottom + HARD_MARGIN) - Math.max(b.y - hy, I.top - HARD_MARGIN);
              if (oy <= 0) continue;
              any = true;
              if (ox < oy) {
                const s = b.x < (I.left + I.right) / 2 ? -1 : 1;
                push(s * ox, 0); b.x += s * ox;
                if (b.vx * s < 0) { b.impact(1, 0, Math.abs(b.vx)); b.vx = -b.vx * 0.4; }
              } else {
                const s = b.y < (I.top + I.bottom) / 2 ? -1 : 1;
                push(0, s * oy); b.y += s * oy;
                if (b.vy * s < 0) { b.impact(0, 1, Math.abs(b.vy)); b.vy = -b.vy * 0.4; }
              }
            }
            if (!any) break;
            if (pass === 3) unresolved = true;
          }
          // The walls win over everything: a bubble shoved off the page would be clipped, and a
          // bubble shoved back on would land on the furniture again. Either way it has no legal
          // spot here, which is exactly what `unresolved` means.
          if (b.x - r < -0.5 || b.x + r > W + 0.5 || b.y - r < -0.5 || b.y + r > H + 0.5) unresolved = true;
        }

        // Wedge rescue. A step that cannot produce a legal position, or a run of contested shoves,
        // relocates at once: zero overlap is the contract, so there is no grace period in which a
        // wedged bubble may sit visibly on the furniture.
        if (pushX || pushY) {
          if (contested || b._lastPushX * pushX + b._lastPushY * pushY < 0) b._wedge++;
          b._shove++;
          b._lastPushX = pushX; b._lastPushY = pushY;
        } else {
          b._wedge = 0; b._shove = 0; b._lastPushX = 0; b._lastPushY = 0;
        }
        if (unresolved || b._wedge > WEDGE_STEPS || b._shove > SHOVE_STEPS) this._relocate(b, zones);
      }
    }

    /**
     * Is (x, y) a legal resting place for b at its worst-case deformation? Uses the same rule as the
     * hard guarantee (the box stays HARD_MARGIN clear of each padded zone's element), plus the walls
     * and a clear circle against pictures. `relaxed` = false also requires staying out of the soft
     * padding, which is preferred but, on pages that are nearly all zone, often impossible.
     */
    _isLegal(b, x, y, zones, relaxed) {
      const r = b.radius, e = r + BULGE_PX;
      if (x - r < 0 || x + r > this.bounds.width || y - r < 0 || y + r > this.bounds.height) return false;
      for (const z of zones) {
        if (z.frame) {
          const cx = Math.max(z.left, Math.min(x, z.right)), cy = Math.max(z.top, Math.min(y, z.bottom));
          if (Math.hypot(x - cx, y - cy) < r) return false;
        } else if (relaxed) {
          const I = z.inner;
          if (x + e > I.left - HARD_MARGIN && x - e < I.right + HARD_MARGIN &&
              y + e > I.top - HARD_MARGIN && y - e < I.bottom + HARD_MARGIN) return false;
        } else if (x + e > z.left && x - e < z.right && y + e > z.top && y - e < z.bottom) {
          return false;
        }
      }
      return true;
    }

    /* Move FIRST, then fade in at the destination. The bubble is invisible while it moves, so it
       never appears to jump, and nothing is ever drawn at the position judged illegal. When the page
       has no legal spot at all (Contact @1440 is almost entirely zone), the bubble stays hidden and
       retries; a hidden bubble covers nothing. */
    _relocate(b, zones) {
      b._wedge = 0; b._shove = 0; b._lastPushX = 0; b._lastPushY = 0;
      const W = this.bounds.width, H = this.bounds.height, r = b.radius;
      let spot = null, fallback = null;
      for (let i = 0; i < 400 && !spot; i++) {
        const x = r + Math.random() * Math.max(1, W - 2 * r);
        const y = r + Math.random() * Math.max(1, H - 2 * r);
        if (this._isLegal(b, x, y, zones, false)) spot = { x, y };
        else if (!fallback && this._isLegal(b, x, y, zones, true)) fallback = { x, y };
      }
      spot = spot || fallback;

      const el = b.el;
      b._relocating = true;
      el.style.transition = 'none';
      el.style.opacity = '0';
      b.a = b.b = b.va = b.vb = b.pa = b.pb = 0;
      if (!spot) {
        b._hiddenSteps = 0; // parked: invisible, skipped by the step, retried periodically
        b._parked = true;
        return;
      }
      b._parked = false;
      b.x = b.px = spot.x; b.y = b.py = spot.y;
      b.vx = (Math.random() - 0.5) * 60; b.vy = (Math.random() - 0.5) * 60;
      void el.offsetWidth; // flush, or re-enabling the transition backdates the fade
      requestAnimationFrame(() => {
        if (b._parked) return;
        b._relocating = false; // legal position: hand it straight back to the resolver
        el.style.transition = 'opacity 250ms ease';
        el.style.opacity = '';
        setTimeout(() => { el.style.transition = ''; }, 300);
      });
    }

    destroy() {
      for (const b of this.bubbles) b.destroy();
      this.bubbles = [];
      if (this.container && this.isGlobal) this.container.style.height = '';
    }
  }

  // ── Hero blob layer ─────────────────────────────────────────────
  /* The blobs keep their own avoidance rule: soft steering off the hero mark and the INK of the
     name/sub (heroContentRects), never the shared hard resolver, so they keep filling the hero band
     (tests/bubbles-exclusion.spec.js asserts the soft "not parked" bar). They share only the clock,
     the drift currents and the jelly squish. */
  class HeroBlobLayer {
    constructor() {
      this.container = document.querySelector('.brand-hero-blobs');
      this.blobs = [];
      this.t = 0;
      this.zones = [];
      this.origin = { x: 0, y: 0 };
      if (!this.container) {
        this.active = false;
        return;
      }
      this.active = true;

      const els = this.container.querySelectorAll('.brand-hero-blob');
      const cRect = this.container.getBoundingClientRect();
      for (const el of els) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        let x = 0, y = 0;
        if (style.top !== 'auto') y = parseFloat(style.top);
        else if (style.bottom !== 'auto') y = cRect.height - parseFloat(style.bottom) - rect.height;
        if (style.left !== 'auto') x = parseFloat(style.left);
        else if (style.right !== 'auto') x = cRect.width - parseFloat(style.right) - rect.width;

        // Strip any CSS float animation (the keyframes were removed 2026-07-12; kept as a guard).
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

        el.style.left = '0';
        el.style.top = '0';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.classList.add('brand-hero-blob-physics');

        this.blobs.push({
          el, x, y, px: x, py: y,
          baseW: rect.width, baseH: rect.height, w: rect.width, h: rect.height,
          vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
          a: 0, b: 0, va: 0, vb: 0, pa: 0, pb: 0,
          ph: [0, 1, 2, 3].map(() => Math.random() * Math.PI * 2),
          fw: [0.21, 0.33, 0.27, 0.39].map(w => w * (0.7 + Math.random() * 0.6))
        });
      }
      this.syncBoundsAndScale();
    }

    measure() {
      if (!this.active) return;
      const r = this.container.getBoundingClientRect();
      this.bounds = { width: r.width, height: r.height };
      this.origin = { x: r.left + window.scrollX, y: r.top + window.scrollY };
      const ox = this.origin.x, oy = this.origin.y;
      this.zones = heroContentRects().map(z => ({
        left: z.left - ox, top: z.top - oy, right: z.right - ox, bottom: z.bottom - oy
      }));
    }

    syncBoundsAndScale() {
      if (!this.active) return;
      const scale = getViewportScale();
      this.measure();
      for (const b of this.blobs) {
        b.w = b.baseW * scale;
        b.h = b.baseH * scale;
        b.el.style.width = b.w + 'px';
        b.el.style.height = b.h + 'px';
        b.x = b.px = Math.max(0, Math.min(b.x, this.bounds.width - b.w));
        b.y = b.py = Math.max(0, Math.min(b.y, this.bounds.height - b.h));
      }
    }

    impact(b, nx, ny, dv) {
      if (!(dv > 0)) return;
      const omega = 2 * Math.PI * BLOB.wobbleHz;
      const [ia, ib] = along(nx, ny, -BLOB.squish * omega * Math.min(dv, 200) / BLOB.cruise);
      b.va += ia; b.vb += ib;
    }

    snapshot() {
      for (const b of this.blobs) { b.px = b.x; b.py = b.y; b.pa = b.a; b.pb = b.b; }
    }

    render(alpha) {
      for (const b of this.blobs) {
        const x = b.px + (b.x - b.px) * alpha, y = b.py + (b.y - b.py) * alpha;
        const m = deformMatrix(b.pa + (b.a - b.pa) * alpha, b.pb + (b.b - b.pb) * alpha);
        b.el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
          `matrix(${m[0].toFixed(4)}, ${m[2].toFixed(4)}, ${m[1].toFixed(4)}, ${m[3].toFixed(4)}, 0, 0)`;
      }
    }

    /** @param {object|null} ptr pointer in PAGE space, or null */
    step(h, ptr) {
      if (!this.active || !this.bounds) return;
      this.t += h;
      const t = this.t, W = this.bounds.width, H = this.bounds.height;
      const local = ptr ? { x: ptr.x - this.origin.x, y: ptr.y - this.origin.y } : null;
      const omega = 2 * Math.PI * BLOB.wobbleHz;

      for (const b of this.blobs) {
        let ax = BLOB.drift * (Math.sin(b.fw[0] * t + b.ph[0]) + 0.6 * Math.sin(b.fw[1] * t * 1.7 + b.ph[1]));
        let ay = BLOB.drift * (Math.cos(b.fw[2] * t + b.ph[2]) + 0.6 * Math.sin(b.fw[3] * t * 1.3 + b.ph[3]));

        const sp = Math.hypot(b.vx, b.vy);
        if (sp < BLOB.minSpeed) {
          const ux = sp > 0.5 ? b.vx / sp : Math.cos(b.ph[0]);
          const uy = sp > 0.5 ? b.vy / sp : Math.sin(b.ph[0]);
          ax += ux * BLOB.minSpeedAccel; ay += uy * BLOB.minSpeedAccel;
        }

        const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
        if (local) {
          const dx = bcx - local.x, dy = bcy - local.y, d = Math.hypot(dx, dy);
          if (d < BLOB.repelRadius && d > 1) {
            const f = BLOB.repel * (1 - d / BLOB.repelRadius);
            ax += (dx / d) * f; ay += (dy / d) * f;
          }
        }

        // Soft steering off the hero copy: pushed with a falloff, settles just clear of it.
        for (const z of this.zones) {
          const nx = Math.max(z.left, Math.min(bcx, z.right));
          const ny = Math.max(z.top,  Math.min(bcy, z.bottom));
          const zdx = bcx - nx, zdy = bcy - ny, zd = Math.hypot(zdx, zdy);
          const reach = b.w / 2;
          if (zd < reach) {
            const falloff = 1 - zd / reach;
            if (zd > 1) {
              ax += (zdx / zd) * BLOB.zonePush * falloff;
              ay += (zdy / zd) * BLOB.zonePush * falloff;
            } else {
              ax += (bcx < (z.left + z.right) / 2 ? -1 : 1) * BLOB.zonePush;
            }
          }
        }

        b.vx += ax * h; b.vy += ay * h;
        const s2 = Math.hypot(b.vx, b.vy);
        if (s2 > BLOB.cruise) { const k = Math.exp(-3 * h * (s2 - BLOB.cruise) / s2); b.vx *= k; b.vy *= k; }
        const s3 = Math.hypot(b.vx, b.vy);
        if (s3 > BLOB.maxSpeed) { b.vx *= BLOB.maxSpeed / s3; b.vy *= BLOB.maxSpeed / s3; }
        const damp = Math.exp(-BLOB.drag * h);
        b.vx *= damp; b.vy *= damp;
        b.x += b.vx * h; b.y += b.vy * h;
      }

      // Blob-blob soft collisions.
      for (let i = 0; i < this.blobs.length; i++) {
        for (let j = i + 1; j < this.blobs.length; j++) {
          const a = this.blobs[i], b = this.blobs[j];
          const dx = (b.x + b.w / 2) - (a.x + a.w / 2), dy = (b.y + b.h / 2) - (a.y + a.h / 2);
          const d = Math.hypot(dx, dy);
          const md = (Math.max(a.w, a.h) + Math.max(b.w, b.h)) / 2 * 0.65;
          if (d < md && d > 0.1) {
            const nx = dx / d, ny = dy / d, o = (md - d) * 0.5;
            a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
            const v1 = a.vx * nx + a.vy * ny, v2 = b.vx * nx + b.vy * ny;
            if (v1 - v2 > 0) {
              const k = (1 + BLOB.bounce) / 2;
              a.vx += (v2 - v1) * k * nx; a.vy += (v2 - v1) * k * ny;
              b.vx += (v1 - v2) * k * nx; b.vy += (v1 - v2) * k * ny;
              this.impact(a, nx, ny, v1 - v2);
              this.impact(b, nx, ny, v1 - v2);
            }
          }
        }
      }

      for (const b of this.blobs) {
        if (b.x < 0) { const dv = Math.max(0, -b.vx); b.x = 0; b.vx = dv * BLOB.bounce; this.impact(b, 1, 0, dv); }
        else if (b.x + b.w > W) { const dv = Math.max(0, b.vx); b.x = W - b.w; b.vx = -dv * BLOB.bounce; this.impact(b, 1, 0, dv); }
        if (b.y < 0) { const dv = Math.max(0, -b.vy); b.y = 0; b.vy = dv * BLOB.bounce; this.impact(b, 0, 1, dv); }
        else if (b.y + b.h > H) { const dv = Math.max(0, b.vy); b.y = H - b.h; b.vy = -dv * BLOB.bounce; this.impact(b, 0, 1, dv); }

        const fa = -omega * omega * b.a - 2 * BLOB.jelly * omega * b.va;
        const fb = -omega * omega * b.b - 2 * BLOB.jelly * omega * b.vb;
        b.va += fa * h; b.vb += fb * h;
        b.a += b.va * h; b.b += b.vb * h;
        const mag = Math.hypot(b.a, b.b);
        if (mag > BLOB.maxDeform) { const s = BLOB.maxDeform / mag; b.a *= s; b.b *= s; b.va *= 0.5; b.vb *= 0.5; }
      }
    }

    destroy() {
      for (const b of this.blobs) {
        b.el.classList.remove('brand-hero-blob-physics');
        b.el.style.transform = '';
        b.el.style.left = '';
        b.el.style.top = '';
        b.el.style.right = '';
        b.el.style.bottom = '';
        b.el.style.width = '';
        b.el.style.height = '';
        b.el.style.animation = '';
      }
      this.blobs = [];
    }
  }

  // ── Main engine ─────────────────────────────────────────────────
  class PhysicsEngine {
    constructor() {
      this.pointer = new PointerTracker();
      this.running = false;
      this.rAF = null;

      const extraSel = document.querySelector('.brand-bubbles-global')?.dataset.exclusions || '';
      const extra = extraSel.split(',').map(s => s.trim()).filter(Boolean);
      const hasHero = !!document.querySelector('#hero');
      const selectors = [...DEFAULT_EXCLUSIONS, ...(hasHero ? HOME_EXCLUSIONS : []), ...extra];

      // Zones first: the layers seed against them.
      this.zones = new ExclusionZoneTracker(selectors);

      this.globalLayer   = new BubbleLayer('.brand-bubbles-global', 7, [10, 28], true);
      this.heroLayer     = new BubbleLayer('.brand-bubbles-hero',   3, [40, 75], false);
      this.heroBlobLayer = new HeroBlobLayer();

      const sx = window.scrollX, sy = window.scrollY;
      this.zones.readPinned();
      const seedZones = this.zones.pageZones(sx, sy);
      this.globalLayer.seed(seedZones);
      this.heroLayer.seed(seedZones);

      // Layer geometry is re-measured with every zone refresh: never on scroll.
      this.zones.onRefresh = () => this._measureLayers();

      this._resizeTimer = null;
      this._onResize = this._onResize.bind(this);
      window.addEventListener('resize', this._onResize);

      // Content growth (lazy images, expanding gallery cards) re-sizes the page layer promptly.
      this._roPending = false;
      this._ro = null;
      if ('ResizeObserver' in window) {
        this._ro = new ResizeObserver(() => {
          if (this._roPending) return;
          this._roPending = true;
          requestAnimationFrame(() => { this._roPending = false; this.zones.refresh(); });
        });
        this._ro.observe(document.documentElement);
      }

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

      this._acc = 0;
      this._last = null;
      this._sv = 0;               // smoothed page scroll velocity, px/s
      this._lastScrollY = sy;

      this._loop = this._loop.bind(this);
      this.running = true;
      this._loop(performance.now());
    }

    _measureLayers() {
      this.globalLayer.measure();
      this.heroLayer.measure();
      this.heroBlobLayer.measure();
    }

    _onResize() {
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        this.globalLayer.rescale();
        this.heroLayer.rescale();
        this.heroBlobLayer.syncBoundsAndScale();
        this.zones.refresh();
      }, 150);
    }

    _onVis() {
      if (document.visibilityState === 'hidden') {
        this.running = false;
        if (this.rAF) cancelAnimationFrame(this.rAF);
      } else if (!this.running) {
        this.running = true;
        this._last = null;  // no catch-up for the time spent hidden
        this.zones.refresh(); // layout may have shifted while hidden
        this._loop(performance.now());
      }
    }

    /** One animation frame. `t` is the rAF timestamp and is the ONLY clock the physics reads. */
    _loop(t) {
      if (!this.running) return;
      if (typeof t !== 'number') t = performance.now();
      const dt = this._last === null ? STEP : Math.min(MAX_FRAME_DT, Math.max(0, (t - this._last) / 1000));
      this._last = t;

      // Reads first, before this frame writes anything.
      const sx = window.scrollX, sy = window.scrollY;
      this.zones.readPinned();
      const zonesPage = this.zones.pageZones(sx, sy);

      // Smoothed scroll speed -> sway, so bubbles trail a scroll like water and settle after.
      const raw = dt > 0 ? (sy - this._lastScrollY) / dt : 0;
      this._lastScrollY = sy;
      this._sv += (raw - this._sv) * (1 - Math.exp(-dt * 8));
      const swayA = Math.max(-500, Math.min(500, this._sv * TUNING.sway));

      const ptr = this.pointer;
      ptr.decay(dt, t / 1000);
      const pagePtr = ptr.active ? { x: ptr.x + sx, y: ptr.y + sy, vx: ptr.vx, vy: ptr.vy } : null;

      const G = this.globalLayer, Hr = this.heroLayer, Bl = this.heroBlobLayer;
      const gEnv = { zones: G.active ? G.localZones(zonesPage) : [], pointer: pagePtr, swayA };
      let hEnv = null;
      if (Hr.active) {
        const ox = Hr.origin.x, oy = Hr.origin.y;
        hEnv = {
          zones: Hr.localZones(zonesPage),
          pointer: pagePtr ? { x: pagePtr.x - ox, y: pagePtr.y - oy, vx: pagePtr.vx, vy: pagePtr.vy } : null,
          swayA
        };
      }
      const blobsOn = this._heroVisible && Bl.active;

      this._acc += dt;
      let n = 0;
      while (this._acc >= STEP && n < MAX_SUBSTEPS) {
        G.snapshot();
        if (hEnv) Hr.snapshot();
        if (blobsOn) Bl.snapshot();
        G.step(STEP, gEnv);
        if (hEnv) Hr.step(STEP, hEnv);
        if (blobsOn) Bl.step(STEP, pagePtr);
        this._acc -= STEP;
        n++;
      }
      if (n === MAX_SUBSTEPS) this._acc = 0;

      const alpha = this._acc / STEP;
      G.render(alpha);
      if (hEnv) Hr.render(alpha);
      if (blobsOn) Bl.render(alpha);

      this.rAF = requestAnimationFrame(this._loop);
    }

    destroy() {
      this.running = false;
      if (this.rAF) cancelAnimationFrame(this.rAF);
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVis);
      if (this._ro) this._ro.disconnect();
      if (this.heroObs) this.heroObs.disconnect();
      this.pointer.destroy();
      this.zones.destroy();
      this.globalLayer.destroy();
      this.heroLayer.destroy();
      this.heroBlobLayer.destroy();
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
