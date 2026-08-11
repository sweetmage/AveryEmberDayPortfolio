'use client';

import { Fragment, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { GalleryItem } from './gallery-data';
import useStickyRailOverlay, { topOverlayPx } from '../components/useStickyRailOverlay';

/* srcset URLs must not contain raw spaces (the parser splits on them), so
   every rung is encodeURI'd — the SelfPortraitSeries filename has spaces. */
const SRCSET_VARIANTS = [480, 900];

function buildSrcSet(src: string, width: number, variants: number[]): string {
  const dot = src.lastIndexOf('.');
  const rungs = variants.map(
    (w) => `${encodeURI(`${src.slice(0, dot)}-${w}w${src.slice(dot)}`)} ${w}w`,
  );
  rungs.push(`${encodeURI(src)} ${width}w`);
  return rungs.join(', ');
}

const gallerySizes =
  '(min-width: 1280px) 424px, (min-width: 1000px) 398px, (min-width: 768px) 46vw, 92vw';

/* An expanded card spans two columns, so the collapsed `sizes` — which tops out
   at 46vw — would have the browser pick a rung for half the width it is about to
   be drawn at, and the art would render soft. Over-requesting slightly at `xl`
   is the safe direction of that error. */
const expandedSizes = '92vw';

/* Expanding flips `sizes` from ~46vw to 92vw, so the browser re-runs srcset
   selection and begins fetching a LARGER rung at the exact moment the view
   transition takes its "after" snapshot. The <img> then paints stale-or-blank
   for the first frames of the animation, which reads as a flicker in the middle
   of the expand — the artwork changing resolution, not the layout tweening.

   Warming it first puts the decoded bitmap in cache before the transition
   starts. The probe carries the SAME srcset and the SAME expanded `sizes` as
   the real image, so the browser resolves the identical rung and this code
   never has to predict which one that is (it varies by viewport and DPR).

   Budgeted, not awaited outright: on a slow connection a click has to stay
   responsive, and an image that arrives a beat late is a smaller problem than a
   button that appears dead. Past the budget the transition runs anyway and the
   old behaviour is what you get — this can only make the swap earlier. */
const DECODE_BUDGET_MS = 200;

function warmExpandedArt(item: GalleryItem): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve();

  const probe = new window.Image();
  // `sizes` before `srcset`/`src`: selection runs when the source is set.
  probe.sizes = expandedSizes;
  probe.srcset = buildSrcSet(item.src, item.width, SRCSET_VARIANTS);
  probe.src = encodeURI(item.src);

  return Promise.race([
    probe.decode().catch(() => undefined),
    new Promise((resolve) => window.setTimeout(resolve, DECODE_BUDGET_MS)),
  ]);
}

type FilterKey = 'all' | 'digital' | 'traditional' | 'both';

const FILTER_BUTTONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'digital', label: 'Digital' },
  { key: 'traditional', label: 'Traditional' },
  { key: 'both', label: 'Both' },
];

/* `startViewTransition` is Baseline (Chrome 111+, Safari 18+, Firefox 144+) but
   is not in every TypeScript lib.dom yet, so it is declared structurally rather
   than asserted away with `any`. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply a state change, animating the layout difference where that is wanted.
 *
 * CSS Grid animates neither a span change nor its siblings' new positions —
 * `span 1` to `span 2` teleports every affected card. View Transitions snapshot
 * the grid before and after and tween the difference, siblings included.
 *
 * Reduced motion bypasses the API entirely rather than trying to tame it: a view
 * transition animates by default, so honouring the preference is opt-OUT. Where
 * the API is missing the change simply applies instantly, which is a working
 * feature without an animation and needs no second code path.
 *
 * `update` must be idempotent — the catch path runs it a second time if the
 * browser refuses the transition (one is already running), so callers compute
 * the next state up front and set it absolutely instead of toggling.
 */
function applyWithViewTransition(update: () => void): void {
  const doc = typeof document === 'undefined' ? null : (document as ViewTransitionDocument);

  if (!doc || typeof doc.startViewTransition !== 'function' || prefersReducedMotion()) {
    update();
    return;
  }

  try {
    // flushSync so React has committed before the post-snapshot is taken.
    // Batched, the transition captures two identical frames: no animation, no error.
    doc.startViewTransition(() => flushSync(update));
  } catch {
    update();
  }
}

function readHash(): FilterKey {
  if (typeof window === 'undefined') return 'all';
  const hash = window.location.hash.replace('#', '');
  if (hash === 'filter=digital') return 'digital';
  if (hash === 'filter=traditional') return 'traditional';
  if (hash === 'filter=both') return 'both';
  return 'all';
}

function writeHash(filter: FilterKey) {
  if (typeof window === 'undefined') return;
  const hash = filter === 'all' ? '' : `filter=${filter}`;
  window.history.replaceState(null, '', `${window.location.pathname}${hash ? `#${hash}` : ''}`);
}

function matchesFilter(item: GalleryItem, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'digital') return item.tags.includes('Digital');
  if (filter === 'traditional') return item.tags.includes('Traditional');
  if (filter === 'both') return item.tags.includes('Digital') && item.tags.includes('Traditional');
  return true;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

/** A card and, rarely, the grid column it must start in. See `placedItems`. */
interface PlacedItem {
  item: GalleryItem;
  columnStart?: number;
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const gridRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useStickyRailOverlay(railRef, gridRef);
  const [columnCount, setColumnCount] = useState(1);

  /* Read the column count off the grid's resolved template rather than mirroring
     the `md:`/`xl:` breakpoints in JS. Two sources of truth for the same number
     drift the moment someone retunes the grid classes, and the failure would be
     silent — the row maths would simply be wrong at one width. Counting resolved
     tracks cannot disagree with the CSS because it IS the CSS.

     A span does not alter the template, so this reads the same number whether or
     not a card is open. Starts at 1 so the pre-measurement render is the
     single-column case, which is the one layout that needs no row maths. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === 'undefined') return;

    const readColumns = () => {
      const tracks = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
      setColumnCount(tracks || 1);
    };

    readColumns();
    const observer = new ResizeObserver(readColumns);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  // Read hash on mount
  useEffect(() => {
    setActiveFilter(readHash());
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => matchesFilter(item, activeFilter));
  }, [items, activeFilter]);

  /* Keyed to the FULL list, not the filtered one. A position-derived name would
     make a card that moves from slot 5 to slot 2 during a filter read as two
     different elements and cross-fade instead of travelling — and travelling is
     the whole reason the filter goes through a view transition. */
  const indexBySrc = useMemo(
    () => new Map(items.map((item, i) => [item.src, i])),
    [items],
  );

  /* An expanded card stays on its own row.
   *
   * Left to auto-placement it does the opposite: a card that is LAST in its row
   * has only one free column to its right, a `span 2` cannot fit there, and the
   * whole card wraps to the next row — leaving a hole where it used to be and
   * reading as "the card I clicked jumped away from where I clicked it".
   *
   * EVERY CARD MOVES ORTHOGONALLY, ONE SPACE. No diagonals — user rule,
   * 2026-08-07. Plain auto-placement cannot honour that: it reflows the whole
   * list, so the card at the end of each row wraps to the START of the next and
   * sweeps diagonally across the entire grid. Only the row containing the
   * expanded card and ONE column may move.
   *
   *   Within the row: the expanded card grows into the column beside it —
   *   rightwards normally, leftwards when it is last in the row (there is no
   *   column to its right, and wrapping it down would take it off the row it
   *   was clicked on). Cards between it and the far edge shift one column
   *   sideways. Purely horizontal.
   *
   *   Down one column: the card pushed off the row falls straight down into
   *   its OWN column in the next row, which pushes that column's occupant down
   *   one, and so on to the bottom. Purely vertical, and every other column is
   *   untouched.
   *
   * Rows of 3 [A,B,C]: expanding A gives [A A, B] with C dropping into column 3
   * of the next row; expanding C gives [B, C C] with A dropping into column 1.
   *
   * The array is reordered rather than the layout being overridden with `order`
   * or explicit column lines. Both of those leave the DOM sequence saying one
   * thing and the page showing another, which is a WCAG 1.3.2 / 2.4.3 defect
   * (tab order would visibly jump backwards through the row). Moving the items
   * keeps DOM order and visual order identical, so focus order stays honest and
   * the transition still tweens — the names are keyed to `src` via the FULL
   * list, so a card that changes position is still recognised as itself.
   *
   * `columnStart` is the one exception, and it is unavoidable: when the falling
   * card runs off the bottom it needs a new row in ITS column, and appending to
   * the array would place it in column 1 — the diagonal, back again. It applies
   * to the LAST item only, so DOM order and visual order still agree.
   */
  const placedItems = useMemo<PlacedItem[]>(() => {
    const plain: PlacedItem[] = filteredItems.map((item) => ({ item }));
    if (!expandedSrc || columnCount < 2) return plain;

    const expandedIndex = filteredItems.findIndex((item) => item.src === expandedSrc);
    if (expandedIndex === -1) return plain;

    const cols = columnCount;
    const rowIndex = Math.floor(expandedIndex / cols);
    const positionInRow = expandedIndex % cols;

    const rows: GalleryItem[][] = [];
    for (let i = 0; i < filteredItems.length; i += cols) rows.push(filteredItems.slice(i, i + cols));

    const row = rows[rowIndex];
    let falling: GalleryItem | null;
    let column: number;

    if (positionInRow < cols - 1) {
      // Grows rightwards; the row's last card is pushed out of its far end.
      column = cols - 1;
      falling = row.length === cols ? row[cols - 1] : null;
      rows[rowIndex] = [...row.slice(0, positionInRow), row[positionInRow], ...row.slice(positionInRow + 1, cols - 1)];
    } else {
      // Last in the row: grows leftwards, so the row's FIRST card is pushed out.
      column = 0;
      falling = row[0];
      rows[rowIndex] = [...row.slice(1, cols - 1), row[positionInRow]];
    }

    // Straight down one column, one row at a time.
    let carried = falling;
    for (let j = rowIndex + 1; j < rows.length && carried; j += 1) {
      if (rows[j].length > column) {
        const bumped = rows[j][column];
        rows[j][column] = carried;
        carried = bumped;
      } else if (rows[j].length === column) {
        // Partial row that stops exactly at this column: it simply lands there.
        rows[j].push(carried);
        carried = null;
      } else {
        break; // Lands in a gap further along a short row — handled below.
      }
    }

    const placed: PlacedItem[] = rows.flat().map((item) => ({ item }));
    if (carried) placed.push({ item: carried, columnStart: column + 1 });
    return placed;
  }, [filteredItems, expandedSrc, columnCount]);

  const resultCountText = `Showing ${filteredItems.length} of ${items.length} works`;

  const handleFilterClick = useCallback(
    (key: FilterKey) => {
      applyWithViewTransition(() => {
        setActiveFilter(key);
        /* Collapse inside the SAME transition, not before it, so the browser
           captures one before/after pair and animates the collapse and the
           reflow together instead of running two overlapping transitions. A card
           that still matches the new filter stays open and travels. */
        setExpandedSrc((current) => {
          if (!current) return null;
          const openItem = items.find((item) => item.src === current);
          return openItem && matchesFilter(openItem, key) ? current : null;
        });
      });
      writeHash(key);
    },
    [items],
  );

  const handleToggle = useCallback(
    (src: string) => {
      /* Collapsing needs no warm-up: it selects a SMALLER rung, and the larger
         one is already decoded and stays on screen while that resolves. Under
         reduced motion there is no transition for a swap to interrupt, so that
         path keeps its immediacy rather than paying the decode budget. */
      const item = expandedSrc === src ? undefined : items.find((i) => i.src === src);
      if (!item || prefersReducedMotion()) {
        applyWithViewTransition(() => setExpandedSrc(expandedSrc === src ? null : src));
        return;
      }

      void warmExpandedArt(item).then(() => applyWithViewTransition(() => setExpandedSrc(src)));
    },
    [expandedSrc, items],
  );

  /* Document-level, not a handler on the button: after clicking a card the user
     usually moves the mouse away, and a button-scoped listener would leave
     Escape doing nothing in exactly that case. Bound only while a card is open. */
  useEffect(() => {
    if (!expandedSrc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      applyWithViewTransition(() => setExpandedSrc(null));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expandedSrc]);

  /* Expanding a card low on the page pushes content down and can shove the card
     itself off-screen, so it gets scrolled back into view — but only when that
     actually happened.

     `scrollIntoView({ block: 'nearest' })` is the obvious way to express this and
     is wrong here: by the time this runs the card is often TALLER than the
     viewport, and 'nearest' on an oversized element scrolls to an edge, landing
     the user in the middle of the artwork with the card's head cut off above the
     nav. Observed at 1440 and 2560 on the first capture pass.

     So the condition is explicit instead: leave the scroll alone while the card's
     top sits in the comfortable band below the sticky nav and above the halfway
     line, and otherwise bring that top to just under the nav. */
  useEffect(() => {
    if (!expandedSrc) return;
    const card = cardRefs.current.get(expandedSrc);
    if (!card) return;

    /* The pinned chrome, not the nav's height. Two ways those differ: below
       768px the nav is static and covers nothing, so reserving room for it left
       a 62px gap above the card; and in the 768–1023px band the filter strip is
       pinned under the nav as well, so clearing only the nav would land the
       card's head behind the strip. */
    const overlay = topOverlayPx();
    const top = card.getBoundingClientRect().top;

    if (top >= overlay && top <= window.innerHeight * 0.5) return;

    window.scrollTo({
      top: window.scrollY + top - overlay - 12,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [expandedSrc]);

  return (
    <section className="mt-8 mb-12" aria-label="Art gallery">
      {/* Same container geometry as PageHeader and the Projects tablist:
          `max-w-(--brand-content-max)` with the 24px gutter supplied by the children, so
          the rail, the title and the title bar all share one left edge. */}
      <div className="mx-auto max-w-(--brand-content-max) lg:flex lg:items-start">
        {/* Sticky on THIS column, not on the filter bar inside it, and
            `lg:items-start` on the parent is load-bearing for that — see the
            long note on the same element in ProjectTabs.tsx. The wrapper class
            list is deliberately identical to that one; the bar inside carries
            two extra classes of its own. */}
        <div
          ref={railRef}
          className="md:sticky md:top-(--brand-nav-height) md:max-lg:z-40 md:max-lg:bg-bg lg:w-[260px] lg:shrink-0"
        >
          {/* Filter bar — a filter group, not a tablist, so no role="tab"/
              aria-selected: aria-pressed on each button is the correct
              pattern here. Below lg it's a horizontal row with the same
              spectrum dividers and zero gap as the Projects tablist; at lg it
              becomes the sticky rail, mirroring ProjectTabs. */}
          {/* `max-[400px]:flex-col` mirrors ProjectTabs for the same reason:
              `.brand-tab-divider` flips horizontal below 400px, so the group
              has to actually be a column there or the rules dangle as slivers
              inside a row. See the note on that rule in brand.css. */}
          {/* `sticky`/`top-16` removed here and replaced on the column above,
              for the reasons documented at the same edit in ProjectTabs.tsx. */}
          <div className="gallery-filter-bar bubble-exclude flex flex-wrap gap-0 px-6 pt-6 pb-4 max-[400px]:flex-col lg:flex-col lg:flex-nowrap lg:pt-8 lg:pb-0">
            <span className="sr-only">Filter by production type</span>
            {FILTER_BUTTONS.map(({ key, label }, i) => (
              <Fragment key={key}>
                {/* Spectrum divider between buttons at every breakpoint, same
                    as the Projects tablist. `.brand-tab-divider` flips it
                    vertical/horizontal to match the group's axis. */}
                {i > 0 && (
                  <div className="brand-spectrum-bar brand-tab-divider" aria-hidden="true">
                    <div />
                  </div>
                )}
                <button
                  type="button"
                  className={`project-tab ${activeFilter === key ? 'is-active' : ''}`}
                  aria-pressed={activeFilter === key}
                  data-pressed={activeFilter === key}
                  onClick={() => handleFilterClick(key)}
                >
                  {label}
                </button>
              </Fragment>
            ))}
            {/* Live region for result count */}
            <span className="sr-only" aria-live="polite">
              {resultCountText}
            </span>
          </div>

          {/* Result count (visible). `bubble-exclude` for the same reason the
              filter bar above carries it, and it became load-bearing once the
              rail stopped scrolling away: a bubble parked over this line used
              to leave with the rail, and now would sit on the text for the
              whole page. */}
          <div className="bubble-exclude px-6 pb-6 text-center text-sm text-text-muted lg:pb-0 lg:pt-4">
            {resultCountText}
          </div>
        </div>

        <div className="lg:min-w-0 lg:flex-1">
          {/* Row sizing is NOT a utility here. It has two states — uniform `1fr`
              tracks normally, content-sized `auto` tracks while a card is open —
              and `md:auto-rows-[1fr]` would silently outrank the open-state rule
              from the components layer, which is the same trap that left an
              `align-self` rule inert for a day (Entry 121). Both states live
              together in brand.css, keyed off this attribute. */}
          <div
            ref={gridRef}
            className="gallery-grid mx-auto grid max-w-[900px] grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:mx-0 lg:max-w-none xl:grid-cols-3"
            data-has-expanded={expandedSrc !== null}
          >
            {/* Grid items — `placedItems`, not `filteredItems`: the expanded
                card's row and one column are rearranged so every card moves
                orthogonally by one space. See the note on that memo. */}
            {placedItems.map(({ item, columnStart }) => {
              const isExpanded = expandedSrc === item.src;
              const hasDescription = item.description.trim().length > 0;
              const panelId = `gallery-desc-${indexBySrc.get(item.src)}`;

              return (
                /* `.gallery-item` stays on this <figure>, unmoved and unrenamed.
                   It is a bubble exclusion selector (DEFAULT_EXCLUSIONS in
                   bubbles.js), matched by selector, so retagging the card would
                   silently drop it out of the physics zones with no error and
                   nothing red in the visual gate — which runs under reduced
                   motion, where the engine creates no bubbles at all. That has
                   happened three times in this repo. */
                <figure
                  key={item.src}
                  ref={(el) => {
                    if (el) cardRefs.current.set(item.src, el);
                    else cardRefs.current.delete(item.src);
                  }}
                  data-expanded={isExpanded}
                  style={{
                    viewTransitionName: `vt-gal-${indexBySrc.get(item.src)}`,
                    /* Only ever set on the last item, and only when the falling
                       card needs a new row in its own column — see the memo. */
                    gridColumnStart: columnStart,
                  }}
                  /* No `h-full`. A grid item already stretches to fill its area by
                     default, so it was redundant for collapsed cards — but as a
                     utility it beat `align-self: start` from the components layer,
                     pinning an expanded card to the full height of its two row
                     tracks. With the art capped at one screen and no description
                     to fill the rest, that left ~380px of empty card under the
                     artwork. Removing it lets an expanded card hug its content;
                     collapsed cards are unchanged because stretch is the default. */
                  className="gallery-item brand-frame m-0 flex flex-col p-4 shadow-card"
                >
                  {/* One transparent button over the whole card. A real button
                      gives keyboard operation and the announced state for free;
                      covering the card is what makes "click anywhere" true
                      without a click handler on the <figure>. It comes first in
                      DOM order so the description it reveals follows it and
                      needs no focus jump. */}
                  <button
                    type="button"
                    className="gallery-item-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={hasDescription ? panelId : undefined}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.caption}`}
                    onClick={() => handleToggle(item.src)}
                  />
                  {/* The wrapper takes the `flex-1` the <img> used to carry, so
                      the art area still absorbs the card's free space and the
                      caption still sits at the bottom. The image inside is now
                      sized to the artwork itself and centred here, which is what
                      makes its transition box equal the picture. Collapsed
                      rendering is unchanged — same picture, same place; only the
                      element boundary moved. */}
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                  <img
                    src={item.src}
                    srcSet={buildSrcSet(item.src, item.width, SRCSET_VARIANTS)}
                    sizes={isExpanded ? expandedSizes : gallerySizes}
                    width={item.width}
                    height={item.height}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    /* Its own transition name, so the artwork is captured and
                       tweened as its own element instead of riding along inside
                       the card's snapshot. Without this the card cross-fades as
                       one flat image and the art is resampled with it; with it,
                       the browser tweens the art's own box and the picture
                       genuinely grows. Must not collide with the card's
                       `vt-gal-${i}` — the shared index keeps the pair readable
                       and the `-art` segment keeps them distinct. */
                    style={
                      {
                        viewTransitionName: `vt-gal-art-${indexBySrc.get(item.src)}`,
                        /* The artwork's real ratio, so its box can BE the
                           picture instead of a larger box with the picture
                           letterboxed inside it. brand.css explains why that
                           distinction is the whole fix for the shrink-then-grow.
                           Sourced from the item's own dimensions — the same
                           numbers already feeding the width/height attributes,
                           so they cannot disagree. */
                        '--art-aspect': `${item.width} / ${item.height}`,
                      } as React.CSSProperties
                    }
                    className="gallery-item-art block object-contain object-center"
                  />
                  </div>
                  <figcaption className="mt-auto pt-3 text-center">
                    <h3 className="font-heading text-[1.05em] font-semibold tracking-normal text-text">
                      {item.caption}
                    </h3>
                    {/* Production tags (Digital/Traditional) drive the filter but
                        are not displayed; the visible line is the tools used,
                        middot-separated. Tags stay reachable to screen readers so
                        the filtered result still describes itself. */}
                    <span className="sr-only">{item.tags.join(', ')}</span>
                    {item.tools.length > 0 && (
                      <div className="gallery-tools mt-2">
                        {item.tools.map((tool, i) => (
                          <Fragment key={tool}>
                            {i > 0 && <span aria-hidden="true"> · </span>}
                            <span className="gallery-tool">{tool}</span>
                          </Fragment>
                        ))}
                      </div>
                    )}
                    {/* Rendered only when there is copy to show. All 11
                        descriptions are '' until the user's copy pass lands, and
                        shipping placeholder prose into gallery-data.ts would put
                        a lie in the file someone eventually publishes. Until
                        then, expanding grows the art; when the copy arrives the
                        text appears with no code change. */}
                    {hasDescription && (
                      <p id={panelId} className="gallery-desc">
                        {item.description}
                      </p>
                    )}
                  </figcaption>
                </figure>
              );
            })}

            {/* 0-results state */}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-muted">
                No works match the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
