/**
 * How much of the viewport top is actually covered by pinned chrome, measured
 * in the page.
 *
 * The "one screen" assertions used to subtract `.brand-nav`'s height
 * unconditionally, which stopped being true on 2026-08-10: below 768px the nav
 * is no longer sticky and covers nothing, and in the 768–1023px band the
 * tab/filter strip is pinned under it and covers more. Subtracting a bar that
 * has scrolled away makes the assertion stricter than the contract (it would
 * fail a correct 100dvh element); subtracting only the nav where a strip is
 * also pinned makes it looser than the contract (it would pass an element whose
 * head is hidden behind the strip).
 *
 * Mirrors `topOverlayPx()` in app/components/useStickyRailOverlay.ts — measure
 * `position`, do not read `--brand-nav-overlay`, which reads back as the
 * literal `clamp(...)` string and parses to NaN.
 *
 * See docs/plans/2026-08-10-sticky-rail-one-column-rule.md.
 */
export async function pinnedChromeHeight(page) {
  return page.evaluate(() => {
    const covers = (el) =>
      el && getComputedStyle(el).position === 'sticky'
        ? el.getBoundingClientRect().height
        : 0;

    const nav = covers(document.querySelector('.brand-nav'));
    const rail =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--brand-rail-overlay')
      ) || 0;

    return nav + rail;
  });
}
