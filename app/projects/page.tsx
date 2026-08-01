import type { Metadata } from 'next';
import './slideshow.css';
import ProjectTabs from './ProjectTabs';
import { ogImage } from '../og';

export const metadata: Metadata = {
  title: 'Projects — Avery Ember Day',
  description: 'Selected projects by Avery Ember Day — brand identity, visual design, and narrative work.',
  openGraph: {
    title: 'Projects — Avery Ember Day',
    description: 'Selected projects by Avery Ember Day — brand identity, visual design, and narrative work.',
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/projects/',
  },
};

/* The lightbox used to live here as a static `<div id="lightbox">` driven by
   `public/scripts/history-of-mistrust-slideshow.js`. Both are gone as of
   2026-07-31 — `MistrustLightboxProvider` renders it inside the Mistrust panel
   and unmounts it with the panel, which is what let `ProjectTabs` drop its
   manual `closeLightbox()` DOM surgery. */
export default function ProjectsPage() {
  return (
    <main id="main" className="max-w-none mx-0 px-0">
      <h1 className="sr-only">Projects</h1>
      <ProjectTabs />
    </main>
  );
}
