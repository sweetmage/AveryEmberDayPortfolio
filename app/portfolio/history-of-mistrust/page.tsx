import type { Metadata } from 'next';
import Link from 'next/link';
import '../slideshow.css';
import MistrustProject from '../MistrustProject';
import { ogImage } from '../../og';

const description =
  'A History of Mistrust: a 30-slide Instagram series by Avery Ember Day on medical mistrust, from the Tuskegee study to community-led care.';

export const metadata: Metadata = {
  title: 'A History of Mistrust — Avery Ember Day',
  description,
  openGraph: {
    title: 'A History of Mistrust — Avery Ember Day',
    description,
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/portfolio/history-of-mistrust/',
  },
};

/* Its own page since 2026-10-05; it was a tab on /projects/ until then. The
   project component is unchanged and still opens at h3, so the page supplies
   the h1 (screen readers) the old tabbed page had. */
export default function MistrustPage() {
  return (
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">A History of Mistrust</h1>
      <div className="mx-auto max-w-(--brand-content-max)">
        <p className="px-6 pt-8">
          <Link href="/portfolio/" className="project-back-link">
            ← Portfolio
          </Link>
        </p>
        <div className="lg:pt-6">
          <MistrustProject />
        </div>
      </div>
    </main>
  );
}
