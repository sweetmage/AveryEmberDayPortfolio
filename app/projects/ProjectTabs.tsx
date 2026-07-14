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
      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % TABS.length;
      } else if (e.key === 'ArrowLeft') {
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
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Projects"
        className="flex flex-wrap gap-2 px-6 pt-8 pb-4"
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
              className={`brand-btn ${isActive ? 'brand-btn-primary' : 'brand-btn-secondary'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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
    </>
  );
}
