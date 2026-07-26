'use client';

import { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import type { GalleryItem } from './gallery-data';

/* srcset URLs must not contain raw spaces (the parser splits on them), so
   every rung is encodeURI'd — the SelfPortraitSeries filename has spaces. */
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

type FilterKey = 'all' | 'digital' | 'traditional' | 'both';

const FILTER_BUTTONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'digital', label: 'Digital' },
  { key: 'traditional', label: 'Traditional' },
  { key: 'both', label: 'Both' },
];

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

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Read hash on mount
  useEffect(() => {
    setActiveFilter(readHash());
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => matchesFilter(item, activeFilter));
  }, [items, activeFilter]);

  const resultCountText = `Showing ${filteredItems.length} of ${items.length} works`;

  const handleFilterClick = useCallback(
    (key: FilterKey) => {
      setActiveFilter(key);
      writeHash(key);
    },
    [],
  );

  return (
    <section className="mt-8 mb-12" aria-label="Art gallery">
      {/* Same container geometry as PageHeader and the Projects tablist:
          `max-w-[1400px]` with the 24px gutter supplied by the children, so
          the rail, the title and the title bar all share one left edge. */}
      <div className="mx-auto max-w-[1400px] lg:flex lg:items-start">
        <div className="lg:w-[260px] lg:shrink-0">
          {/* Filter bar — a filter group, not a tablist, so no role="tab"/
              aria-selected: aria-pressed on each button is the correct
              pattern here. Below lg it's a horizontal row with the same
              spectrum dividers and zero gap as the Projects tablist; at lg it
              becomes the sticky rail, mirroring ProjectTabs. */}
          {/* `max-[400px]:flex-col` mirrors ProjectTabs for the same reason:
              `.brand-tab-divider` flips horizontal below 400px, so the group
              has to actually be a column there or the rules dangle as slivers
              inside a row. See the note on that rule in brand.css. */}
          <div className="gallery-filter-bar bubble-exclude flex flex-wrap gap-0 px-6 pt-6 pb-4 max-[400px]:flex-col lg:sticky lg:top-16 lg:flex-col lg:flex-nowrap lg:pt-8 lg:pb-0">
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

          {/* Result count (visible) */}
          <div className="px-6 pb-6 text-center text-sm text-text-muted lg:pb-0 lg:pt-4">
            {resultCountText}
          </div>
        </div>

        <div className="lg:min-w-0 lg:flex-1">
          <div className="gallery-grid mx-auto grid max-w-[900px] grid-cols-1 gap-6 px-6 md:auto-rows-[1fr] md:grid-cols-2 lg:mx-0 lg:max-w-none xl:grid-cols-3">
            {/* Grid items */}
            {filteredItems.map((item) => (
              <figure
                key={item.src}
                className="gallery-item brand-frame m-0 flex h-full flex-col p-4 shadow-card"
              >
                <img
                  src={item.src}
                  srcSet={buildSrcSet(item.src, item.width, [480, 900])}
                  sizes={gallerySizes}
                  width={item.width}
                  height={item.height}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto block min-h-0 w-full flex-1 object-contain object-center max-h-[70vh]"
                />
                <figcaption className="mt-auto pt-3 text-center">
                  <div className="font-heading text-[1.05em] font-semibold tracking-normal text-text">
                    {item.caption}
                  </div>
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
                </figcaption>
              </figure>
            ))}

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
