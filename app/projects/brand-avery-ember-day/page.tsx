import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Avery Ember Day Brand — Avery Ember Day',
  description: 'Brand identity system for Avery Ember Day — logo, typography, color palette, and visual guidelines.',
  openGraph: {
    title: 'Avery Ember Day Brand — Avery Ember Day',
    description: 'Brand identity system for Avery Ember Day — logo, typography, color palette, and visual guidelines.',
    images: ['/images/og-default.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/projects/brand-avery-ember-day/',
  },
};

const logoSwatches = [
  {
    src: '/images/icons/BubbleLogo/bubbleLogo.png',
    alt: 'Blue logo with text',
    bg: '#0A0A0A',
    label: 'Primary — Blue',
    desc: 'Dark backgrounds · #9acdff',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black.svg',
    alt: 'Black logo with text',
    bg: '#F2F0EC',
    label: 'Primary — Black',
    desc: 'Light backgrounds · #000000',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white.svg',
    alt: 'White logo with text',
    bg: '#1a1a1a',
    label: 'Primary — White',
    desc: 'Dark backgrounds · #ffffff',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-blue-notxt.png',
    alt: 'Blue icon mark',
    bg: '#0A0A0A',
    label: 'Icon Mark — Blue',
    desc: 'Favicon · App icon · Small use',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black-notxt.png',
    alt: 'Black icon mark',
    bg: '#F2F0EC',
    label: 'Icon Mark — Black',
    desc: 'Light backgrounds · small use',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white-notxt.png',
    alt: 'White icon mark',
    bg: '#1a1a1a',
    label: 'Icon Mark — White',
    desc: 'Dark backgrounds · small use',
  },
];

const palette = [
  { name: 'Brand Blue', hex: '#9acdff', bg: 'bg-ir-4' },
  { name: 'Accent', hex: '#CC44FF', bg: 'bg-accent' },
  { name: 'Neon', hex: '#00FFFF', bg: 'bg-neon' },
  { name: 'Gold', hex: '#f5b96a', bg: 'bg-gold' },
  { name: 'Dark BG', hex: '#0A0A0A', bg: 'bg-[#0A0A0A]' },
  { name: 'Light BG', hex: '#F2F0EC', bg: 'bg-[#F2F0EC]' },
];

export default function BrandPage() {
  return (
    <main id="main">
      <div className="project-hero mx-auto max-w-(--brand-content-max) px-6 pt-20 pb-12">
        <Link
          href="/"
          className="project-back mb-8 inline-flex items-center gap-1.5 font-body text-sm text-text-muted no-underline transition-colors hover:text-text [&_svg]:h-4 [&_svg]:w-4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back to Work
        </Link>
        <h1 className="project-title mb-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-text">
          Avery Ember Day Brand
        </h1>
        <p className="project-desc m-0 max-w-[560px] font-body text-base leading-[1.7] text-text-soft">
          Complete personal brand identity system logos, color, type, and
          applications. Built to work across dark and light contexts with a
          consistent voice.
        </p>
      </div>

      {/* Logo Variants */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h2 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Logo Variants
        </h2>
        <div className="logo-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {logoSwatches.map((swatch) => (
            <div
              key={swatch.src}
              className="logo-swatch flex flex-col overflow-hidden rounded-lg border border-line [&_img]:h-40 [&_img]:w-40 [&_img]:object-contain"
            >
              <div
                className="logo-swatch-canvas flex flex-1 items-center justify-center p-10"
                style={{ backgroundColor: swatch.bg }}
              >
                <img src={swatch.src} alt={swatch.alt} />
              </div>
              <div className="logo-swatch-label border-t border-line bg-surface-1 px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
                <strong>{swatch.label}</strong>
                <span>{swatch.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color Palette */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h2 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Brand Palette
        </h2>
        <div className="palette-row mb-10 flex flex-wrap gap-3">
          {palette.map((color) => (
            <div key={color.name} className="swatch flex min-w-[100px] flex-1 flex-col gap-2">
              <div className={`swatch-block h-[72px] rounded-md border border-line ${color.bg}`} />
              <span className="swatch-name font-body text-[0.8rem] font-medium text-text">
                {color.name}
              </span>
              <span className="swatch-hex font-mono text-[0.72rem] text-text-muted">
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h2 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Type System
        </h2>
        <div className="type-specimen flex flex-col gap-6 rounded-lg border border-line bg-surface-1 p-8">
          <div className="type-row flex flex-col gap-1 border-b border-line pb-6 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Display — Sriracha
            </span>
            <span className="type-display font-display text-[2.5rem] text-text">
              Avery Ember Day
            </span>
          </div>
          <div className="type-row flex flex-col gap-1 border-b border-line pb-6 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Heading — Outfit 600
            </span>
            <span className="type-heading font-heading text-2xl font-semibold text-text">
              Brand Identity System
            </span>
          </div>
          <div className="type-row flex flex-col gap-1 border-b border-line pb-6 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Body — Inter 400
            </span>
            <span className="type-body font-body text-base leading-relaxed text-text-soft">
              Multi-Media Designer based in Las Vegas. Illustration, brand
              identity, and motion graphics. Design with a focus on character,
              mood, and accessibility.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
