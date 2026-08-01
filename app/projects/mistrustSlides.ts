/**
 * "A History of Mistrust" slide data — the single source of truth for the
 * Projects-page slideshow, the lightbox, and the 30-thumb grid.
 *
 * Moved verbatim from `public/scripts/history-of-mistrust-slideshow.js` on
 * 2026-07-31 when the feature was ported from a vanilla IIFE to React.
 *
 * `SLIDE_ALT` is the exact words written on each slide, used as alt text AND as
 * the lightbox caption source. It was transcribed directly from the artwork on
 * 2026-07-27. Entries 7-18 had been out of order since before that date: the
 * four slides that close Set 1 (7-10) were sitting behind Set 2's opening block
 * (11-18), so screen readers got the wrong words on twelve slides and the
 * lightbox paired wrong captions with wrong images.
 *
 * THE ARTWORK IS THE SOURCE OF TRUTH — `slides.md` is documentation and has
 * been wrong independently. Do not "tidy" these strings. Set title cards must
 * land on 1 / 11 / 21 to match the `Math.ceil(n / 10)` set math below.
 * Verified verbatim against the pre-port array on 2026-07-31; the standing
 * guard for both invariants lands with the test suite (plan Track D).
 */

const BASE = '/images/myart/A History of Mistrust/slides/';

export const SLIDES_PER_SET = 10;
export const SET_COUNT = 3;
export const SLIDE_COUNT = SLIDES_PER_SET * SET_COUNT;

export const SLIDE_ALT: readonly string[] = [
  "A History of Mistrust: Why Some Communities Struggle to Trust Doctors",
  "Fun Fact: Being LGBTQ+ is normal and okay",
  "Un-Fun Fact: Homosexuality was classified as a mental disorder that was treated with harmful conversion therapy or even shock therapy until 1973. Even after guidelines were changed, harmful treatments persisted through the 1980s, and discrimination persists today.",
  "POC & LGBTQ+ individuals often face systemic discrimination when seeking healthcare.",
  "Black, Indigenous, and Latinx women have been sterilized without consent as recently as 2013.",
  "Tuskegee Experiment (1932-1972): American healthcare providers lied to Black men and denied them treatment for syphilis to study the disease, even after a widespread cure was developed.",
  "The US Government's slow response disproportionately harmed LGBTQ+ & POC communities. Current information on the subject has been removed from USA.gov.",
  "Mistrust leads to: Late diagnoses, Poorer mental health, Non-adherence to necessary treatment, Higher mortality rates",
  "“Health is more than the absence of disease. Health is about jobs and employment, education, the environment, and all of those things that go into making us healthy.” -Dr. Joycelyn Elders",
  "The first step to rebuilding trust is understanding why it was broken. Share this series with your community and let's start that conversation together.",
  "AIDS Care in Marginalized Communities",
  "Black people represent only 12% of the population but bear 38% of new diagnoses (which is a >3x disparity ratio), while Hispanic individuals represent 18% of the population but bear 32% of new diagnoses. Why?",
  "Systemic barriers prevent access to life-saving treatments like PrEP",
  "High costs, Lack of access to healthcare, Stigma & discrimination all contribute to these disparities.",
  "LGBTQ+ individuals and POC often receive disproportionately inferior treatment and face dismissal of symptoms.",
  "This discrimination leads to avoidance of crucial treatment.",
  "This directly leads these communities to later diagnoses & worse health outcomes.",
  "The AIDS crisis emerged in the early 1980s, claiming the lives of over 44 million people worldwide.",
  "Do your part: Get yourself tested, End the stigma behind STDs, Educate yourself, Encourage your loved ones to get tested",
  "Awareness is only effective in numbers. Share this post among your community. Let's work towards a better future together.",
  "Rebuilding Trust Between Marginalized Communities & Healthcare Providers",
  "Rebuilding trust is critical to closing the gap in medical care for marginalized communities. Okay sounds cool, but...",
  "How Do We Start?",
  "Support Community-led Clinics. Clinics run by LGBTQ+ & POC often provide safe, affirming care.",
  "Representation Matters. Patients trust providers who reflect their race, culture, & experiences.",
  "Cultural Competency is Essential. Training doctors and nurses to understand diverse experiences is key to changing how marginalized communities receive care.",
  "“We do have the power, if we come together, to make change.” -Dr. Karthik Sivashanker",
  "Advocate for Policy Changes. We need policies that require inclusive care and punish discriminatory practices in healthcare systems.",
  "Community support for policy changes is necessary to ensure inclusive healthcare for all!",
  "Share this to spread awareness so we can secure a future with healthcare that is: inclusive, affordable, accessible, culturally competent."
];

/** Human-facing name for each set, used by the switcher and the live region. */
export const SET_LABELS: readonly string[] = ['Set 1', 'Set 2', 'Set 3'];

export type MistrustSlide = {
  /** 1-based slide number across the whole series, 1..30. */
  n: number;
  /** 1-based set number, 1..3. */
  set: number;
  /** 0-based position within its set, 0..9. */
  indexInSet: number;
  /** Display-size webp used by the stage. */
  src: string;
  /** 2x webp used by the lightbox. */
  full: string;
  /**
   * Small webp for the filmstrip and the 30-thumb grid. Points at `src` until
   * the `-thumb` variant lands (plan Track C) — swap this one line then, and
   * both consumers pick it up.
   */
  thumb: string;
  /** Verbatim words on the slide. Alt text and lightbox caption source. */
  alt: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export const MISTRUST_SLIDES: readonly MistrustSlide[] = Array.from(
  { length: SLIDE_COUNT },
  (_unused, i): MistrustSlide => {
    const n = i + 1;
    return {
      n,
      set: Math.ceil(n / SLIDES_PER_SET),
      indexInSet: i % SLIDES_PER_SET,
      src: `${BASE}slide-${pad(n)}.webp`,
      full: `${BASE}slide-${pad(n)}@2x.webp`,
      thumb: `${BASE}slide-${pad(n)}.webp`,
      alt: SLIDE_ALT[i],
    };
  }
);

/** The 10 slides of a 1-based set number. */
export function slidesForSet(set: number): readonly MistrustSlide[] {
  const start = (set - 1) * SLIDES_PER_SET;
  return MISTRUST_SLIDES.slice(start, start + SLIDES_PER_SET);
}

/** Global 0-based index into MISTRUST_SLIDES for a set + position in set. */
export function globalIndex(set: number, indexInSet: number): number {
  return (set - 1) * SLIDES_PER_SET + indexInSet;
}

/** Lightbox caption, e.g. "Slide 14 of 30 · Set 2". */
export function captionFor(slide: MistrustSlide): string {
  return `Slide ${slide.n} of ${SLIDE_COUNT} · Set ${slide.set}`;
}
