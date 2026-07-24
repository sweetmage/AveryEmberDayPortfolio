import type { Metadata } from 'next';
import PageHeader from '../PageHeader';

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

const gallerySizes =
  '(min-width: 1280px) 424px, (min-width: 1000px) 398px, (min-width: 768px) 46vw, 92vw';

export default function GalleryPage() {
  return (
    /* `max-w-none mx-0 px-0` opts out of the global 1200px `main` cap in
       src/css/site.css so the grid can reach 1400px, matching the Projects
       page. Both sections below re-supply the gutters `main` used to give. */
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">Art Gallery</h1>
      <PageHeader title="Art Gallery" />

      <section
        /* auto-rows-[1fr] equalizes every row to the tallest, so all cells are
           the same size and every caption sits on the same baseline. The 70vh
           image cap bounds what "tallest" can be. Deliberately md+ only: at
           one column every item is its own row, so equalizing there buys no
           alignment and costs ~1000px of dead scroll under the landscape
           pieces (measured at 360px). */
        className="gallery-grid mx-auto mt-8 mb-12 grid max-w-[900px] grid-cols-1 gap-6 px-[clamp(16px,4vw,40px)] md:auto-rows-[1fr] md:grid-cols-2 xl:max-w-[1400px] xl:grid-cols-3"
        aria-label="Art gallery"
      >
        {galleryItems.map((item) => (
          <figure
            key={item.src}
            className="gallery-item m-0 flex h-full flex-col rounded-sm bg-[#1c1c20]/80 p-4 [&_figcaption]:mt-auto [&_figcaption]:pt-3 [&_figcaption]:text-center [&_figcaption]:text-[0.95em] [&_figcaption]:font-medium [&_figcaption]:tracking-wide [&_figcaption]:text-white [&_img]:mx-auto [&_img]:block [&_img]:min-h-0 [&_img]:w-full [&_img]:flex-1 [&_img]:object-contain [&_img]:object-center [&_img]:max-h-[70vh]"
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
