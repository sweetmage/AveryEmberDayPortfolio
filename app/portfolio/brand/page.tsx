import type { Metadata } from 'next';
import Link from 'next/link';
import BrandProject from '../BrandProject';
import { ogImage } from '../../og';

const description =
  'The Avery Ember Day brand: a personal identity system of logos, color, type and voice for dark and light backgrounds.';

export const metadata: Metadata = {
  title: 'Avery Ember Day Brand — Avery Ember Day',
  description,
  openGraph: {
    title: 'Avery Ember Day Brand — Avery Ember Day',
    description,
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/portfolio/brand/',
  },
};

/* Its own page since 2026-10-05; it was a tab on /projects/ until then. */
export default function BrandPage() {
  return (
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">Avery Ember Day Brand</h1>
      <div className="mx-auto max-w-(--brand-content-max)">
        <p className="px-6 pt-8">
          <Link href="/portfolio/" className="project-back-link">
            ← Portfolio
          </Link>
        </p>
        <div className="lg:pt-6">
          <BrandProject />
        </div>
      </div>
    </main>
  );
}
