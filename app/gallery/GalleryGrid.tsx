'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
    <section
      className="gallery-grid mx-auto mt-8 mb-12 grid max-w-[900px] grid-cols-1 gap-6 px-[clamp(16px,4vw,40px)] md:auto-rows-[1fr] md:grid-cols-2 xl:max-w-[1400px] xl:grid-cols-3"
      aria-label="Art gallery"
    >
      {/* Filter bar */}
      <div className="gallery-filter-bar bubble-exclude col-span-full flex flex-wrap gap-2">
        <span className="sr-only">Filter by production type</span>
        {FILTER_BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="brand-chip"
            aria-pressed={activeFilter === key}
            data-pressed={activeFilter === key}
            onClick={() => handleFilterClick(key)}
          >
            {label}
          </button>
        ))}
        {/* Live region for result count */}
        <span className="sr-only" aria-live="polite">
          {resultCountText}
        </span>
      </div>

      {/* Result count (visible) */}
      <div className="col-span-full text-center text-sm text-text-muted">
        {resultCountText}
      </div>

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
            <div className="brand-chip-group mt-2 justify-center">
              {item.tags.map((tag) => (
                <span key={tag} className="brand-chip">
                  {tag}
                </span>
              ))}
            </div>
          </figcaption>
        </figure>
      ))}

      {/* 0-results state */}
      {filteredItems.length === 0 && (
        <div className="col-span-full py-12 text-center text-text-muted">
          No works match the selected filters.
        </div>
      )}
    </section>
  );
}
