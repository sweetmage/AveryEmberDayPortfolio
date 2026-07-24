'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BrandProject from './BrandProject';
import MistrustProject from './MistrustProject';

const TABS = [
  { id: 'brand', label: 'Brand' },
  { id: 'history-of-mistrust', label: 'History of Mistrust' },
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

  /* The tablist is a vertical rail at lg+ and a horizontal row below;
     aria-orientation has to follow the breakpoint. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
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
    <div className="lg:flex lg:items-start lg:max-w-[1400px] lg:mx-auto">
      <div className="lg:w-[260px] lg:shrink-0">
        <h2 className="px-6 pt-4 pb-2 text-center font-display text-[clamp(2rem,5vw,3rem)] leading-[1.1] normal-case tracking-normal font-normal text-text [text-shadow:0_0_30px_rgba(217,154,255,0.20),0_0_60px_rgba(0,255,255,0.10)] lg:px-0 lg:pt-6 lg:pb-4">
          Projects
        </h2>
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Projects"
          aria-orientation={isRail ? 'vertical' : 'horizontal'}
          className="flex flex-wrap gap-0 px-6 pt-2 pb-4 lg:sticky lg:top-16 lg:flex-col lg:flex-nowrap lg:px-0 lg:pt-2 lg:pb-0"
        >
        {TABS.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`tab-${tab.id}`}
              key={tab.id}
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
          );
        })}
      </div>
      </div>

      <div className="lg:min-w-0 lg:flex-1 lg:pt-[5.5rem]">
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
  );
}
