'use client';

import { SET_LABELS, SLIDE_COUNT, slidesForSet } from './mistrustSlides';
import { useMistrustLightbox } from './MistrustLightbox';

/**
 * All 30 slides, grouped into three seamless 10-slide mosaics (one per set),
 * replacing the stitched `sets/set-N.webp` strips. Zero gutter and one
 * `.brand-frame` around each set — each block reads like the original strip,
 * but every slide is individually clickable (user call, 2026-07-31: no gutter,
 * no per-cell number badges, grouped in sets of 10).
 *
 * The strips stay on disk; they are the shareable full-set artefact and the
 * legacy root site still references them.
 *
 * Accessible names are "Open slide N of 30" rather than the transcribed slide
 * text — thirty paragraphs of alt in a grid is worse for a screen reader, not
 * better. The words live on the lightbox image.
 *
 * MUST stay inside a `.project-section` wrapper (bubble exclusion zone).
 */
export default function SlideGrid() {
  const { open } = useMistrustLightbox();

  return (
    <div className="mistrust-grid-sets">
      {SET_LABELS.map((label, s) => (
        <div className="mistrust-grid-group" key={label}>
          <p className="mistrust-grid-label">{label}</p>
          <div className="mistrust-grid brand-frame" role="group" aria-label={`${label}, all slides`}>
            {slidesForSet(s + 1).map((slide) => (
              <button
                key={slide.n}
                className="mistrust-grid-cell"
                aria-label={`Open slide ${slide.n} of ${SLIDE_COUNT}`}
                onClick={() => open(slide.n - 1)}
              >
                <img src={slide.thumb} alt="" loading="lazy" decoding="async" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
