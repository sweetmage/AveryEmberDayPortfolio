import type { Metadata } from 'next';
import PageHeader from '../PageHeader';
import ProjectTile from '../components/ProjectTile';
import GalleryGrid from './GalleryGrid';
import { galleryItems } from './gallery-data';
import LegacyHashForwarder from './LegacyHashForwarder';
import { ogImage } from '../og';

export const metadata: Metadata = {
  title: 'Portfolio — Avery Ember Day',
  description:
    'Portfolio of Avery Ember Day, Brand & Visual Designer: projects, digital art, illustration, and mixed media.',
  openGraph: {
    title: 'Portfolio — Avery Ember Day',
    description:
      'Portfolio of Avery Ember Day, Brand & Visual Designer: projects, digital art, illustration, and mixed media.',
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/portfolio/',
  },
};

const MISTRUST_THUMB = '/images/myart/A History of Mistrust/slides/slide-01@2x.webp';

/* Mistrust leads, as it led the old Projects tabs (AGENTS.md).
   TILE-COPY-PENDING: drafted by the agent at the user's request on 2026-10-05
   from each project's own intro; the user approves before push. Remove this
   marker once approved; the release check greps for it. */
const projects = [
  {
    href: '/portfolio/history-of-mistrust/',
    title: 'A History of Mistrust',
    description:
      'A 30-slide Instagram series on why some communities struggle to trust doctors, from the Tuskegee study to community-led care. Includes the full slides, process work and sources.',
    thumb: encodeURI(MISTRUST_THUMB),
    thumbAlt: 'Cover slide of A History of Mistrust',
  },
  {
    href: '/portfolio/brand/',
    title: 'Avery Ember Day Brand',
    description:
      'My personal brand identity: logos, color, type and voice, built to hold up on dark and light backgrounds. See the complete system.',
    thumb: '/images/icons/BubbleLogo/bubbleLogo.png',
    thumbAlt: 'The Avery Ember Day bubble logo',
    fit: 'contain' as const,
    backdrop: '#0A0A0A',
  },
];

/* One page for all the work (user, 2026-10-05): project tiles that each open
   the project's own page, then the gallery. Replaces /projects/ (tabs) and
   /gallery/, which 301 here (netlify.toml).

   `max-w-none mx-0 px-0` opts out of the global 1200px `main` cap in
   src/css/site.css so both sections can reach the shared 1400px container. */
export default function PortfolioPage() {
  return (
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">Portfolio</h1>
      <PageHeader title="Portfolio" />

      <section aria-labelledby="portfolio-projects" className="mx-auto max-w-(--brand-content-max) px-6 pt-8">
        <h2 id="portfolio-projects" className="portfolio-section-title">
          Projects
        </h2>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <ProjectTile key={p.href} {...p} />
          ))}
        </ul>
      </section>

      <section id="gallery" aria-labelledby="portfolio-gallery" className="pt-12">
        <h2 id="portfolio-gallery" className="portfolio-section-title mx-auto max-w-(--brand-content-max) px-6">
          Gallery
        </h2>
        <GalleryGrid items={galleryItems} />
      </section>

      <LegacyHashForwarder />
    </main>
  );
}
