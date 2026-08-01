'use client';

import { MISTRUST_SLIDES, SLIDE_COUNT } from './mistrustSlides';
import { useMistrustLightbox } from './MistrustLightbox';

/**
 * All 30 slides as a thumbnail grid, replacing the three stitched
 * `sets/set-N.webp` strips that used to fill the "All Slides" section.
 *
 * The strips were 1.37 MB combined and ten slides tall each — awkward on a phone,
 * and no individual slide was addressable. The 30 base webps total ~1.0 MB, so
 * this is lighter than what it replaces even before the `-thumb` variant lands.
 * The strips stay on disk; they are the shareable full-set artefact and the legacy
 * root site still references them.
 *
 * Accessible names are deliberately "Open slide N of 30" rather than the slide's
 * full transcribed text — thirty paragraphs of alt text in a grid is worse for a
 * screen reader, not better. The words live on the lightbox image.
 *
 * MUST stay inside a `.project-section` wrapper (bubble exclusion zone).
 */
export default function SlideGrid() {
  const { open } = useMistrustLightbox();

  return (
    <div className="mistrust-grid">
      {MISTRUST_SLIDES.map((slide, i) => (
        <button
          key={slide.n}
          className="mistrust-grid-cell brand-frame"
          aria-label={`Open slide ${slide.n} of ${SLIDE_COUNT}`}
          onClick={() => open(i)}
        >
          <img src={slide.thumb} alt="" loading="lazy" decoding="async" draggable={false} />
          <span className="mistrust-grid-num" aria-hidden="true">
            {slide.n}
          </span>
        </button>
      ))}
    </div>
  );
}
