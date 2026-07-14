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
  { src: '/images/myart/Gallery/SelfPortraitSeries/Self Portrait Series - In Danger - Final.webp', alt: 'In Danger', caption: 'In Danger', width: 1200, height: 1600 },
  { src: '/images/myart/Gallery/chillFinal.webp', alt: 'Chill', caption: 'Chill', width: 1200, height: 1970 },
  { src: '/images/myart/Gallery/grossFinal.webp', alt: 'Gross', caption: 'Gross', width: 1200, height: 1481 },
  { src: '/images/myart/Gallery/EmergenceFinal.webp', alt: 'Emergence', caption: 'Emergence', width: 1200, height: 1600 },
  { src: '/images/myart/Gallery/FacesFinal.webp', alt: 'Faces', caption: 'Faces', width: 1200, height: 1556 },
  { src: '/images/myart/Gallery/lollypopFinal.webp', alt: 'Lollipop', caption: 'Lollipop', width: 1200, height: 1559 },
  { src: '/images/myart/Gallery/overflowFinal.webp', alt: 'Overflow', caption: 'Overflow', width: 1200, height: 1643 },
  { src: '/images/myart/Gallery/stairsFinal.webp', alt: 'Stairs', caption: 'Stairs', width: 1200, height: 1953 },
  { src: '/images/myart/Gallery/beheadedFinal.webp', alt: 'Beheaded', caption: 'Beheaded', width: 1200, height: 1571 },
  { src: '/images/myart/Gallery/ShadowFinal.webp', alt: 'Shadow', caption: 'Shadow', width: 1200, height: 1440 },
  { src: '/images/myart/Gallery/txlakelandscapeFinal.webp', alt: 'TX Lake Landscape', caption: 'TX Lake Landscape', width: 1200, height: 1011 },
];

/* srcset URLs must not contain raw spaces (the parser splits on them), so
   every rung is encodeURI'd — the SelfPortraitSeries filename has spaces. */
function buildSrcSet(src: string, width: number, variants: number[]): string {
  const dot = src.lastIndexOf('.');
  const rungs = variants.map(
    (w) => `${encodeURI(`${src.slice(0, dot)}-${w}w${src.slice(dot)}`)} ${w}w`,
  );
  rungs.push(`${encodeURI(src)} ${width}w`);
  return rungs.join(', ');
}

const gallerySizes = '(min-width: 1000px) 438px, (min-width: 768px) 46vw, 92vw';

export default function GalleryPage() {
  return (
    <main id="main">
      <Link
        href="/"
        className="back-link mb-6 inline-block border-b border-line-mid py-[0.3em] text-[0.85em] font-medium tracking-[0.04em] text-text-muted no-underline transition-colors hover:border-gold hover:text-gold"
      >
        &larr; Home
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
            <img
              src={item.src}
              srcSet={buildSrcSet(item.src, item.width, [480, 900])}
              sizes={gallerySizes}
              width={item.width}
              height={item.height}
              alt={item.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
