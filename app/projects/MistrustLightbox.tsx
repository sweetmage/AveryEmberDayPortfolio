'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MISTRUST_SLIDES, SLIDE_COUNT, captionFor } from './mistrustSlides';
import { useReducedMotion, useSwipeDeck } from './useSwipeDeck';

/**
 * React-owned lightbox for the Mistrust slides.
 *
 * Replaces the global `<div id="lightbox">` that used to sit in `page.tsx` and be
 * driven by `public/scripts/history-of-mistrust-slideshow.js`. That arrangement is
 * why `ProjectTabs.tsx` had to reach into `document.getElementById('lightbox')` and
 * mutate classes by hand when you switched project tabs — unmounting the provider's
 * child does that for free now.
 */

type LightboxApi = {
  /** Open at a 0-based index into MISTRUST_SLIDES. Out-of-range is ignored. */
  open: (index: number) => void;
};

const LightboxContext = createContext<LightboxApi | null>(null);

export function useMistrustLightbox(): LightboxApi {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error('useMistrustLightbox must be used inside <MistrustLightboxProvider>');
  }
  return ctx;
}

/**
 * Wraps the whole Mistrust panel, so the lightbox mounts and unmounts with it.
 * `ProjectTabs` renders that panel's contents conditionally, which is what makes
 * the unmount — and therefore the scroll-lock and focus-restore cleanup — actually
 * happen when you switch project tabs.
 */
export function MistrustLightboxProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => {
    if (i >= 0 && i < SLIDE_COUNT) setIndex(i);
  }, []);

  const api = useMemo<LightboxApi>(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={api}>
      {children}
      {index !== null && (
        <Lightbox index={index} onNavigate={setIndex} onClose={() => setIndex(null)} />
      )}
    </LightboxContext.Provider>
  );
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 200;

function Lightbox({
  index,
  onNavigate,
  onClose,
}: {
  index: number;
  onNavigate: (next: number) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [source, setSource] = useState<'pointer' | 'step'>('step');

  const commit = useCallback((next: number, from: 'pointer' | 'key') => {
    setSource(from === 'pointer' ? 'pointer' : 'step');
    onNavigate(next);
  }, [onNavigate]);

  const { dragPx, isDragging, bind } = useSwipeDeck({
    count: SLIDE_COUNT,
    index,
    onCommit: commit,
  });

  const step = useCallback(
    (next: number) => {
      if (next < 0 || next >= SLIDE_COUNT) return;
      setSource('step');
      onNavigate(next);
    },
    [onNavigate]
  );

  /* Fade in on mount, and out before the parent unmounts us — the old
     implementation's 200ms exit is worth keeping. */
  const requestClose = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, reduced ? 0 : EXIT_MS);
  }, [onClose, reduced]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Scroll lock + focus restore, both undone on unmount however we got there. */
  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusTo.current?.focus?.();
    };
  }, []);

  /* Focus the frame only once `.active` has made the overlay visible. On mount
     the overlay is still `visibility: hidden` (the class lands one rAF later for
     the fade), and `focus()` inside a hidden subtree is a silent no-op — focus
     then stays on the stage, which is not a descendant of the overlay, so Escape
     never reaches the dialog's handler. Found by test, 2026-07-31. */
  useEffect(() => {
    if (shown) bind.ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(index - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(index + 1);
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [index, requestClose, step]
  );

  const transition =
    isDragging || reduced
      ? 'none'
      : source === 'pointer'
        ? 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)'
        : 'transform 240ms ease';

  return (
    <div
      ref={overlayRef}
      className={`lightbox-overlay${shown ? ' active' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <button className="lightbox-close" aria-label="Close image viewer" onClick={requestClose}>
        &times;
      </button>
      <button
        className="lightbox-arrow lightbox-prev"
        aria-label="Previous image"
        disabled={index === 0}
        onClick={() => step(index - 1)}
      >
        &#8249;
      </button>

      <div className={`lightbox-frame${isDragging ? ' dragging' : ''}`} tabIndex={0} {...bind}>
        <div
          className="lightbox-track"
          style={{
            transition,
            transform: `translateX(calc(${-index * 100}% + ${dragPx}px))`,
          }}
        >
          {MISTRUST_SLIDES.map((slide, i) => {
            const near = Math.abs(i - index) <= 1;
            return (
              <div className="lightbox-slide" key={slide.n} aria-hidden={i !== index}>
                {/* Only the current slide and its neighbours load eagerly. The old
                    script assigned all 30 @2x sources up front — ~1.1 MB before the
                    visitor had moved. */}
                <img
                  src={slide.full}
                  alt={i === index ? slide.alt : ''}
                  loading={near ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="lightbox-arrow lightbox-next"
        aria-label="Next image"
        disabled={index === SLIDE_COUNT - 1}
        onClick={() => step(index + 1)}
      >
        &#8250;
      </button>
      <p className="lightbox-caption" aria-live="polite">
        {captionFor(MISTRUST_SLIDES[index])}
      </p>
    </div>
  );
}
