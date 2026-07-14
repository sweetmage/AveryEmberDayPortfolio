import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avery Ember Day — Brand & Visual Designer',
  description: 'Avery Ember Day — illustrator, graphic designer, and motion artist.',
  openGraph: {
    title: 'Avery Ember Day — Brand & Visual Designer',
    description: 'Avery Ember Day — illustrator, graphic designer, and motion artist.',
    images: ['/images/og-default.png'],
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
          <img
            src="/images/icons/BubbleLogo/bubbleLogo-white.svg"
            alt="Avery Ember Day"
            className="hero-logo"
            width={160}
            height={160}
            fetchPriority="high"
            decoding="async"
          />
          <h1 className="hero-name brand-text-hero relative z-1 mt-[0.2em] mb-[0.1em] font-display text-[clamp(1.6em,5vw,2.8em)] font-normal text-black dark:text-white">
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
          <h2>About Me</h2>
          <div className="textbox about-box bubble-exclude relative rounded-lg border border-line bg-surface-1 p-6 leading-[1.65] shadow-card [&_p]:text-text-soft [&_p+p]:mt-[0.8em]">
            <p>
              For most of the last decade, I've been building a design practice in
              the margins: freelancing nights and weekends while managing a team of
              20 as a Starbucks shift supervisor. Six years, seven clients, a B.S.
              in Graphic Information Technology from ASU, and a lot of early mornings
              later, I'm making the move to design full-time.
            </p>
            <p>
              I specialize in brand identity and visual systems, with range that
              covers print production, motion graphics, and 3D. My background in
              traditional fine art informs how I think about composition and craft,
              and I work AI tools into my process the same way I work any other
              tool: to make the work better, not to skip the thinking. The projects
              span brand kits for content creators, print campaigns for a San
              Antonio print company, and character and logo design for a
              WGAW-registered animated series pitch.
            </p>
            <p>
              Everything here is my own work, and I'm always looking for new
              opportunities to collaborate. If something here caught your eye, you
              can reach me at the links below.
            </p>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
