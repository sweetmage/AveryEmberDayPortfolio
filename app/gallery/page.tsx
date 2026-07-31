import type { Metadata } from 'next';
import PageHeader from '../PageHeader';
import GalleryGrid from './GalleryGrid';
import { galleryItems } from './gallery-data';
import { ogImage } from '../og';

export const metadata: Metadata = {
  title: 'Gallery — Avery Ember Day',
  description: 'Art gallery — selected works by Avery Ember Day, including digital art, illustration, and mixed media.',
  openGraph: {
    title: 'Gallery — Avery Ember Day',
    description: 'Art gallery — selected works by Avery Ember Day, including digital art, illustration, and mixed media.',
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/gallery/',
  },
};

export default function GalleryPage() {
  return (
    /* `max-w-none mx-0 px-0` opts out of the global 1200px `main` cap in
       src/css/site.css so the grid can reach 1400px, matching the Projects
       page. Both sections below re-supply the gutters `main` used to give. */
    <main id="main" className="mx-0 max-w-none px-0">
      <h1 className="sr-only">Gallery</h1>
      <PageHeader title="Gallery" />
      <GalleryGrid items={galleryItems} />
    </main>
  );
}
