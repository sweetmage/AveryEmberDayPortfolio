import type { Metadata } from 'next';
import BubbleLogo from './components/BubbleLogo';
import { ogImage } from './og';

export const metadata: Metadata = {
  title: 'Avery Ember Day — Brand & Visual Designer',
  description: 'Avery Ember Day — illustrator, graphic designer, and motion artist.',
  openGraph: {
    title: 'Avery Ember Day — Brand & Visual Designer',
    description: 'Avery Ember Day — illustrator, graphic designer, and motion artist.',
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero (full viewport) */}
      <section
        id="hero"
        className="brand-hero relative m-0 flex min-h-screen items-center justify-center px-4 pt-20 pb-12 text-center"
      >
        <div className="brand-bubbles-hero" aria-hidden="true" />
        <div className="brand-hero-blobs" aria-hidden="true">
          <div className="brand-hero-blob brand-hero-blob-1" data-color="purple" />
          <div className="brand-hero-blob brand-hero-blob-2" data-color="cyan" />
          <div className="brand-hero-blob brand-hero-blob-3" data-color="gold" />
          <div className="brand-hero-blob brand-hero-blob-4" data-color="cyan" />
          <div className="brand-hero-blob brand-hero-blob-5" data-color="purple" />
        </div>
        <div className="brand-container brand-hero-content">
          <BubbleLogo label="Avery Ember Day" className="hero-logo" />
          <h1 className="hero-name brand-text-hero relative z-1 mt-[0.2em] mb-[0.1em] font-display text-[clamp(1.6em,5vw,2.8em)] font-normal">
            Avery Ember Day
          </h1>
          <p className="hero-sub relative z-1 mt-[0.6em] bg-transparent p-0 font-heading text-base font-light tracking-[0.08em] uppercase text-text-soft">
            Brand & Visual Designer
          </p>
        </div>
      </section>

      <div className="brand-spectrum-bar">
        <div />
      </div>

      <main id="main">
      {/* About */}
      <section id="about" className="brand-section-raised">
        <div className="brand-container">
          {/* Same title recipe as the Gallery/Projects PageHeader, one size
              step down since this is a section inside a page, not the page
              title. */}
          <h2 className="brand-page-title brand-page-title--section">About Me</h2>
          <div className="brand-spectrum-bar brand-title-bar mb-6" aria-hidden="true">
            <div />
          </div>
          {/* Full container width — no measure cap. The box spans the shared container
              (same edges as every section title), so it reads centered on wide screens
              instead of hugging the left edge. User call 2026-07-31: padding, not
              max-width, is what bounds this prose; the earlier 72ch cap is gone. */}
          <div className="textbox about-box bubble-exclude relative rounded-lg border border-line bg-surface-1 p-6 leading-[1.65] shadow-card [&_p]:text-text-soft [&_p+p]:mt-[0.8em]">
            <p>
              Over the course of earning my B.S. in Graphic Information Technology
              at ASU, I've been building a design practice in the margins. I've been
              a supervisor and a barista for multiple coffee shops, brewing coffee
              and conversation alongside my pursuit of my true passions.
            </p>
            <p>
              Before I became a digital designer, I was a traditional artist. This
              background gives me an eye for composition and quality, and helps shape
              the vision behind my work. Technology and format shape my workflow. This
              philosophy drives the ultimate creation to contain clean, appealing,
              reusable assets that can be built on.
            </p>
            <p>
              I specialize in brand identity and visual systems, with a range that
              covers print production, motion graphics, and 3D. My projects span brand
              kits for content creators, prepress design through print vendors, and
              character and logo designs for a WGAW-registered animated series pitch.
            </p>
            <p>
              I'm always looking for new opportunities to collaborate. If my work
              catches your eye, or you have an opportunity for a project you would
              like my input on, feel free to reach out through my contact page or
              email below!
            </p>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
