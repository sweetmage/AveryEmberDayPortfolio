'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import BrandProject from './BrandProject';
import MistrustProject from './MistrustProject';
import PageHeader from '../PageHeader';
import useStickyRailOverlay from '../components/useStickyRailOverlay';

/* `id` is the URL hash and the aria-controls target — deliberately unchanged
   while the labels grew to the full project titles, so existing deep links
   like /projects/#history-of-mistrust keep working. */
/* Mistrust leads (user call, 2026-08-07). Three things have to agree or the
   page contradicts itself: this array (tab order), the `useState` default
   below, and the DOM order of the panels — a tabpanel that precedes its own
   tab in the DOM reverses the reading and tab-through order for anyone not
   using a mouse. */
const TABS = [
  { id: 'history-of-mistrust', label: 'A History of Mistrust' },
  { id: 'brand', label: 'Avery Ember Day Brand' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function isValidHash(hash: string): hash is TabId {
  return TABS.some((t) => t.id === hash);
}

/* There used to be a `closeLightbox()` here that reached into
   `document.getElementById('lightbox')` and mutated classes by hand on every tab
   switch, because the lightbox was global DOM owned by a vanilla script.

   The lightbox is React-owned now, but `hidden` alone would NOT have retired that
   hack: a hidden panel is still mounted, so an open lightbox would keep
   `document.body.style.overflow = 'hidden'` set and leave the page unscrollable
   behind the other tab. The panels below therefore render their contents
   conditionally as well as setting `hidden` — that is what actually unmounts the
   lightbox and runs its scroll-lock and focus-restore cleanup. */
export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('history-of-mistrust');
  const [isRail, setIsRail] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useStickyRailOverlay(railRef, panelsRef);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const hash = window.location.hash.replace('#', '');
    if (isValidHash(hash)) {
      setActiveTab(hash);
    }
  }, []);

  /* aria-orientation has to follow the layout, which is vertical at BOTH ends
     of the range: a stacked column below 400px and the sticky rail at lg+,
     with a horizontal row in between. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px), (max-width: 399px)');
    const update = () => setIsRail(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const switchTab = useCallback((id: TabId) => {
    setActiveTab(id);
    try {
      history.replaceState(null, '', `#${id}`);
    } catch {
      // ignore
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex = index;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % TABS.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + TABS.length) % TABS.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = TABS.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
      switchTab(TABS[nextIndex].id);
    },
    [switchTab]
  );

  return (
    <>
      <PageHeader title="Projects" />

      <div className="mx-auto max-w-(--brand-content-max) lg:flex lg:items-start">
      {/* The sticky element is THIS column, not the tablist inside it. The
          tablist's containing block is this div, whose height is the tablist's
          own height — a sticky child of a box exactly its own size has zero
          travel and behaves as static. That is why `lg:sticky` on the tablist
          did nothing from Entry 079 until 2026-08-10: measured travel 0px, rail
          top -570px after a 1000px scroll at 1024. The visual gate could not
          see it, because it captures at scroll 0 where both look identical.
          Sticky from `md` (768px) up, because that is where the gallery stops
          being one column — the same threshold that pins the nav.

          `lg:items-start` on the flex parent above is LOAD-BEARING for this,
          in the opposite direction to the intuition: a sticky flex item's
          containing block is the flex container's content box, which the tall
          panel makes tall, while `items-start` keeps this column short. Travel
          is the difference. Change that to `stretch` and the column becomes
          exactly as tall as the container, travel returns to 0, and the rail
          silently stops sticking again with nothing to see at scroll 0. */}
      <div
        ref={railRef}
        /* Background AND z-index are scoped to the strip band ONLY. At 768–1023
           the strip spans the content width and things scroll underneath it, so
           it has to be solid and it has to outrank them. At lg+ nothing passes
           under a rail that sits beside the panel: the background painted a
           visible lighter rectangle against the page gradient (caught in the
           1024 capture, 2026-08-10), and the z-index put the rail in front of
           the global bubble layer, which AGENTS.md requires to stay in FRONT on
           desktop. `z-40` stays under the nav's `z-50`. */
        className="md:sticky md:top-(--brand-nav-height) md:max-lg:z-40 md:max-lg:bg-bg lg:w-[260px] lg:shrink-0"
      >
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Projects"
          aria-orientation={isRail ? 'vertical' : 'horizontal'}
          /* max-[400px]:flex-col — below 400px the two tabs (321px) exceed the
             row (312px) and wrap anyway; making that an explicit stack keeps
             the divider a clean full-width rule instead of a dangling sliver.
             Deliberately `400`, not `399`: Tailwind compiles `max-[N]` to
             `not all and (min-width: N)`, which EXCLUDES exactly N — with
             `max-[399px]` the column never applied at a 399px viewport while
             the divider's own `(max-width: 399px)` rule did, producing a
             0px-wide bar. Measured. */
          /* `px-6` at EVERY breakpoint, including lg: the left 24px puts the
             tabs on the same edge as the page title and its bar, and at lg the
             right 24px is the gutter between the rail and the panel — taken out
             of the fixed 260px column, so the tabs get narrower rather than the
             panel moving. The Gallery filter rail is identical, which is what
             keeps the tab shape the same across the two pages. */
          /* No `sticky` here — it lives on the column above, which is the only
             element with room to travel. `top-16` went with it: 64px was a
             hardcoded guess at `--brand-nav-height`, which is
             `clamp(62px, 6vw, 76px)` and measures 76px from 1267px up, so the
             pinned rail's first 12px sat behind the nav at 1440 and wider. */
          className="flex flex-wrap gap-0 px-6 pt-6 pb-4 max-[400px]:flex-col lg:flex-col lg:flex-nowrap lg:pt-8 lg:pb-0"
        >
        {TABS.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <Fragment key={tab.id}>
              {/* Spectrum divider BETWEEN tabs only — `i > 0` keeps it off the
                  outer edges of the group. `aria-hidden` keeps the tablist's
                  a11y children pure tabs, and the roving-focus handler indexes
                  by [role="tab"], so this div can't disturb arrow-key nav.
                  `.brand-tab-divider` flips it vertical/horizontal to match the
                  tablist's axis at each breakpoint. */}
              {i > 0 && (
                <div className="brand-spectrum-bar brand-tab-divider" aria-hidden="true">
                  <div />
                </div>
              )}
              <button
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => switchTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`project-tab ${isActive ? 'is-active' : ''}`}
              >
                {tab.label}
              </button>
            </Fragment>
          );
        })}
      </div>
      </div>

      <div ref={panelsRef} className="lg:min-w-0 lg:flex-1 lg:pt-8">
        {/* Panel order follows TABS, so DOM order matches the visible order. */}
        <div
          id="panel-history-of-mistrust"
          role="tabpanel"
          aria-labelledby="tab-history-of-mistrust"
          hidden={activeTab !== 'history-of-mistrust'}
        >
          {activeTab === 'history-of-mistrust' && <MistrustProject />}
        </div>

        <div
          id="panel-brand"
          role="tabpanel"
          aria-labelledby="tab-brand"
          hidden={activeTab !== 'brand'}
        >
          {activeTab === 'brand' && <BrandProject />}
        </div>
      </div>
      </div>
    </>
  );
}
