import type { Metadata } from 'next';
import Link from 'next/link';
import Section6Project from '../Section6Project';
import { ogImage } from '../../og';

const description =
  'SECTION 6 Logo Design: the Phoenix and White Rose logos for a WGAW-registered animated series pitch, by Avery Ember Day.';

export const metadata: Metadata = {
  title: 'SECTION 6 Logo Design — Avery Ember Day',
  description,
  openGraph: {
    title: 'SECTION 6 Logo Design — Avery Ember Day',
    description,
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/portfolio/section-6-logo-design/',
  },
};

/* Added 2026-10-13 as the third project page, approved by the user from the
   overnight mockups. Same shell as the Brand and Mistrust pages: the page
   supplies the h1, the project component opens at h3. */
export default function Section6Page() {
  return (
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">SECTION 6 Logo Design</h1>
      <div className="mx-auto max-w-(--brand-content-max)">
        <p className="px-6 pt-8">
          <Link href="/portfolio/" className="project-back-link">
            ← Portfolio
          </Link>
        </p>
        <div className="lg:pt-6">
          <Section6Project />
        </div>
      </div>
    </main>
  );
}
