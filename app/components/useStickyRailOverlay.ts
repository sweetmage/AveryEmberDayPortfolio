'use client';

import { useEffect, type RefObject } from 'react';

/* How much of the viewport top is covered by pinned chrome, in px. Used by
   scroll math that has to land content BELOW the pinned chrome rather than
   behind it.

   The nav's contribution is MEASURED, not read from `--brand-nav-overlay`.
   Custom properties are substituted rather than computed, so that token reads
   back as the literal string `clamp(62px,6vw,76px)` and `parseFloat` returns
   NaN — silently zero, which is the exact bug this function exists to prevent.
   (Measured 2026-08-10; CSS `calc()` resolves it correctly, so the token is
   still right for the caps in brand.css.) Its `position` is the honest test of
   whether it covers anything, and it is the same 768px rule that sets the
   token. `--brand-rail-overlay` IS safe to parse: the hook below writes it as a
   plain px string. */
export function topOverlayPx(): number {
  const nav = document.querySelector('.brand-nav');
  const navPx =
    nav && getComputedStyle(nav).position === 'sticky'
      ? nav.getBoundingClientRect().height
      : 0;
  const rail =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--brand-rail-overlay')
    ) || 0;
  return navPx + rail;
}

/**
 * Publishes the pinned tab/filter strip's height to `--brand-rail-overlay`.
 *
 * The strip only covers content in the 768–1023px band, where it spans the full
 * width above the panel. At lg+ the same element is a rail *beside* the panel
 * and covers nothing. That distinction is measured geometrically — do the two
 * boxes share horizontal range? — rather than by re-encoding 1024px in a third
 * place: a breakpoint copied into JS is exactly how `max-[399px]` vs
 * `max-[400px]` produced a 0px-wide divider (see the note in ProjectTabs.tsx).
 *
 * Height is content-dependent (label wrapping, the Gallery result count), so
 * CSS cannot state it and a hardcoded constant would rot the moment a tab is
 * added.
 */
export default function useStickyRailOverlay(
  railRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const rail = railRef.current;
    const content = contentRef.current;
    if (!rail || !content) return;

    const root = document.documentElement;
    let last = '';

    const update = () => {
      const pinned = getComputedStyle(rail).position === 'sticky';
      const r = rail.getBoundingClientRect();
      const c = content.getBoundingClientRect();
      /* 1px of tolerance either side: a rail sitting flush against the panel
         must not read as overlapping it because of subpixel rounding. */
      const covers = r.right > c.left + 1 && r.left < c.right - 1;
      const next = `${pinned && covers ? Math.round(r.height) : 0}px`;

      /* Write only on change. Both caps that read this token affect element
         heights, which the ResizeObserver below is watching — rewriting an
         identical value every callback is how that becomes a loop. */
      if (next === last) return;
      last = next;
      root.style.setProperty('--brand-rail-overlay', next);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(rail);
    ro.observe(content);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      root.style.removeProperty('--brand-rail-overlay');
    };
  }, [railRef, contentRef]);
}
