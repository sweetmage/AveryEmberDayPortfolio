'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SET_COUNT,
  SET_LABELS,
  SLIDES_PER_SET,
  globalIndex,
  slidesForSet,
} from './mistrustSlides';
import { useMistrustLightbox } from './MistrustLightbox';
import { useReducedMotion, useSwipeDeck } from './useSwipeDeck';

/**
 * The slide stage: one viewer for all three sets, with a set switcher above and a
 * thumbnail filmstrip below.
 *
 * Replaces the three stacked 1:1 viewers that used to be hand-written markup in
 * `MistrustProject.tsx` and populated at runtime by
 * `public/scripts/history-of-mistrust-slideshow.js`. One stage instead of three
 * means it can be 860px rather than 720px, and the section costs about one screen
 * of scroll instead of ~2200px.
 *
 * MUST stay inside a `.project-section` wrapper — that selector is the bubble
 * engine's exclusion zone (`scripts/bubbles.js:72`), and these classes are not.
 */
export default function MistrustSlideshow() {
  const [set, setSet] = useState(1);
  const [index, setIndex] = useState(0);
  /* Which input moved us last, so a drag release eases out while a button press
     gets the site's spring curve. */
  const [source, setSource] = useState<'pointer' | 'step'>('step');

  const reduced = useReducedMotion();
  const { open } = useMistrustLightbox();
  const slides = slidesForSet(set);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);

  const commit = useCallback((next: number, from: 'pointer' | 'key') => {
    setSource(from === 'pointer' ? 'pointer' : 'step');
    setIndex(next);
  }, []);

  const { dragPx, isDragging, bind } = useSwipeDeck({
    count: SLIDES_PER_SET,
    index,
    onCommit: commit,
    onTap: () => open(globalIndex(set, index)),
  });

  const step = useCallback((next: number) => {
    if (next < 0 || next >= SLIDES_PER_SET) return;
    setSource('step');
    setIndex(next);
  }, []);

  const switchSet = useCallback((next: number) => {
    setSet(next);
    setIndex(0);
    setSource('step');
  }, []);

  /* Keep the active thumb centred. Deliberately NOT scrollIntoView: that scrolls
     every scrollable ancestor, so it drags the whole page around on mobile. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    if (!thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [index, reduced, set]);

  const onSetKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      let nextIndex = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (i + 1) % SET_COUNT;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (i - 1 + SET_COUNT) % SET_COUNT;
      else if (e.key === 'Home') nextIndex = 0;
      else if (e.key === 'End') nextIndex = SET_COUNT - 1;
      else return;

      e.preventDefault();
      const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
      switchSet(nextIndex + 1);
    },
    [switchSet]
  );

  const transition =
    isDragging || reduced
      ? 'none'
      : source === 'pointer'
        ? /* Ease-out after direct manipulation — overshoot on a drag release reads
             as a bug rather than as polish. */
          'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)'
        : /* The site's existing spring, for button/filmstrip/key moves. */
          'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <div className="mistrust-slideshow">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Carousel set"
        className="mistrust-sets"
      >
        {SET_LABELS.map((label, i) => (
          <button
            key={label}
            role="tab"
            id={`mistrust-set-${i + 1}`}
            aria-selected={set === i + 1}
            aria-controls="mistrust-stage"
            tabIndex={set === i + 1 ? 0 : -1}
            className={`mistrust-set-tab${set === i + 1 ? ' is-active' : ''}`}
            onClick={() => switchSet(i + 1)}
            onKeyDown={(e) => onSetKeyDown(e, i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mistrust-stage-row">
        <button
          className="mistrust-nav mistrust-nav-prev"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => step(index - 1)}
        >
          &#8249;
        </button>

        <div
          id="mistrust-stage"
          className={`mistrust-stage${isDragging ? ' is-dragging' : ''}`}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${SET_LABELS[set - 1]} slide viewer`}
          tabIndex={0}
          {...bind}
        >
          {/* Keyed on `set` so a set change cross-fades rather than sliding ten
              slides past, which is disorienting. */}
          <div className="mistrust-track" key={set} style={{ transition, transform: `translateX(calc(${-index * 100}% + ${dragPx}px))` }}>
            {slides.map((slide, i) => (
              <div className="mistrust-slide" key={slide.n} aria-hidden={i !== index}>
                <img
                  src={slide.src}
                  alt={i === index ? slide.alt : ''}
                  loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
            ))}
          </div>
          <span className="mistrust-stage-hint" aria-hidden="true">
            Swipe or tap to enlarge
          </span>
        </div>

        <button
          className="mistrust-nav mistrust-nav-next"
          aria-label="Next slide"
          disabled={index === SLIDES_PER_SET - 1}
          onClick={() => step(index + 1)}
        >
          &#8250;
        </button>
      </div>

      <div className="mistrust-filmstrip" ref={stripRef}>
        {slides.map((slide, i) => (
          <button
            key={slide.n}
            data-thumb={i}
            className={`mistrust-thumb${i === index ? ' is-active' : ''}`}
            aria-label={`Go to slide ${i + 1} of ${SLIDES_PER_SET}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => step(i)}
          >
            <img src={slide.thumb} alt="" loading="lazy" decoding="async" draggable={false} />
          </button>
        ))}
      </div>

      <p className="mistrust-counter">
        Slide {index + 1} of {SLIDES_PER_SET}
      </p>
      {/* Announced only on a committed move — a live region wired to the drag
          offset would fire on every frame. */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {SLIDES_PER_SET}, {SET_LABELS[set - 1]}
      </p>
    </div>
  );
}
