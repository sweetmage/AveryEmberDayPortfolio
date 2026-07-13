import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Art Gallery — Avery Ember Day',
  description: 'Art gallery — selected works by Avery Ember Day, including digital art, illustration, and mixed media.',
  openGraph: {
    title: 'Art Gallery — Avery Ember Day',
    description: 'Art gallery — selected works by Avery Ember Day, including digital art, illustration, and mixed media.',
    images: ['/images/og-default.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/gallery/',
  },
};

const galleryItems = [
  { src: '/images/myart/Gallery/SelfPortraitSeries/Self Portrait Series - In Danger - Final.webp', alt: 'In Danger', caption: 'In Danger' },
  { src: '/images/myart/Gallery/chillFinal.webp', alt: 'Chill', caption: 'Chill' },
  { src: '/images/myart/Gallery/grossFinal.webp', alt: 'Gross', caption: 'Gross' },
  { src: '/images/myart/Gallery/EmergenceFinal.webp', alt: 'Emergence', caption: 'Emergence' },
  { src: '/images/myart/Gallery/FacesFinal.webp', alt: 'Faces', caption: 'Faces' },
  { src: '/images/myart/Gallery/lollypopFinal.webp', alt: 'Lollipop', caption: 'Lollipop' },
  { src: '/images/myart/Gallery/overflowFinal.webp', alt: 'Overflow', caption: 'Overflow' },
  { src: '/images/myart/Gallery/stairsFinal.webp', alt: 'Stairs', caption: 'Stairs' },
  { src: '/images/myart/Gallery/beheadedFinal.webp', alt: 'Beheaded', caption: 'Beheaded' },
  { src: '/images/myart/Gallery/ShadowFinal.webp', alt: 'Shadow', caption: 'Shadow' },
  { src: '/images/myart/Gallery/txlakelandscapeFinal.webp', alt: 'TX Lake Landscape', caption: 'TX Lake Landscape' },
];

export default function GalleryPage() {
  return (
    <main id="main">
      <Link
        href="/"
        className="back-link mb-6 inline-block border-b border-line-mid py-[0.3em] text-[0.85em] font-medium tracking-[0.04em] text-text-muted no-underline transition-colors hover:border-gold hover:text-gold"
      >
        &larr; Back to work
      </Link>

      <section className="gallery-header py-8 pb-6">
        <h1 className="mt-1 text-left font-display text-[clamp(1.6em,4vw,2.2em)] text-text [text-shadow:0_0_30px_rgba(217,154,255,0.20),0_0_60px_rgba(0,255,255,0.10)]">
          Art Gallery
        </h1>
      </section>

      <section
        className="gallery-grid mx-auto mb-12 grid max-w-[900px] grid-cols-1 gap-6 md:grid-cols-2"
        aria-label="Art gallery"
      >
        {galleryItems.map((item) => (
          <figure
            key={item.src}
            className="gallery-item m-0 [&_figcaption]:py-1 [&_figcaption]:text-center [&_figcaption]:text-[0.85em] [&_figcaption]:text-text-muted [&_img]:mx-auto [&_img]:block [&_img]:max-h-[70vh] [&_img]:w-full [&_img]:rounded-sm [&_img]:object-contain [&_img]:object-center [&_img]:transition-shadow [&_img:hover]:shadow-[0_0_0_1px_var(--brand-accent),var(--brand-shadow-lg)]"
          >
            <img src={item.src} alt={item.alt} loading="lazy" />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
