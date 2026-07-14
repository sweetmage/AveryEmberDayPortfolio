import type { Metadata } from 'next';
import './slideshow.css';
import SlideshowScript from './SlideshowScript';
import ProjectTabs from './ProjectTabs';

export const metadata: Metadata = {
  title: 'Projects — Avery Ember Day',
  description: 'Selected projects by Avery Ember Day — brand identity, visual design, and narrative work.',
  openGraph: {
    title: 'Projects — Avery Ember Day',
    description: 'Selected projects by Avery Ember Day — brand identity, visual design, and narrative work.',
    images: ['/images/og-default.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/projects/',
  },
};

export default function ProjectsPage() {
  return (
    <>
      <SlideshowScript />

      <main id="main">
        <h1 className="sr-only">Projects</h1>
        <ProjectTabs />
      </main>

      {/* Lightbox */}
      <div
        id="lightbox"
        className="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        hidden
      >
        <button className="lightbox-close" aria-label="Close image viewer">
          &times;
        </button>
        <button className="lightbox-arrow lightbox-prev" aria-label="Previous image">
          &#8249;
        </button>
        <div className="lightbox-frame" tabIndex={0}>
          <div className="lightbox-track" />
        </div>
        <button className="lightbox-arrow lightbox-next" aria-label="Next image">
          &#8250;
        </button>
        <p id="lightbox-caption" className="lightbox-caption" aria-live="polite" />
      </div>
    </>
  );
}
