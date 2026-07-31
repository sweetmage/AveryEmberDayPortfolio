'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import BrandProject from './BrandProject';
import MistrustProject from './MistrustProject';
import PageHeader from '../PageHeader';

/* `id` is the URL hash and the aria-controls target — deliberately unchanged
   while the labels grew to the full project titles, so existing deep links
   like /projects/#history-of-mistrust keep working. */
const TABS = [
  { id: 'brand', label: 'Avery Ember Day Brand' },
  { id: 'history-of-mistrust', label: 'A History of Mistrust' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function isValidHash(hash: string): hash is TabId {
  return TABS.some((t) => t.id === hash);
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('hidden', '');
  }
  if (document.body.style.overflow === 'hidden') {
    document.body.style.overflow = '';
  }
}

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('brand');
  const [isRail, setIsRail] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

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
    closeLightbox();
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
      <div className="lg:w-[260px] lg:shrink-0">
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
          className="flex flex-wrap gap-0 px-6 pt-6 pb-4 max-[400px]:flex-col lg:sticky lg:top-16 lg:flex-col lg:flex-nowrap lg:pt-8 lg:pb-0"
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

      <div className="lg:min-w-0 lg:flex-1 lg:pt-8">
        <div
          id="panel-brand"
          role="tabpanel"
          aria-labelledby="tab-brand"
          hidden={activeTab !== 'brand'}
        >
          <BrandProject />
        </div>

        <div
          id="panel-history-of-mistrust"
          role="tabpanel"
          aria-labelledby="tab-history-of-mistrust"
          hidden={activeTab !== 'history-of-mistrust'}
        >
          <MistrustProject />
        </div>
      </div>
      </div>
    </>
  );
}
