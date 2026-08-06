import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import SkipLink from './components/SkipLink';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ReturnToTop from './components/ReturnToTop';
import BubblePhysics from './components/BubblePhysics';

export const metadata: Metadata = {
  metadataBase: new URL('https://averyemberday.com'),
  /* One role descriptor site-wide: "Brand & Visual Designer" (user call
     2026-08-06). Three were live before that — this fallback said "designer,
     artist, and creative technologist", the home description said "illustrator,
     graphic designer, and motion artist", and the titles said "Brand & Visual
     Designer" — so search results and unfurls disagreed with each other and with
     the hero. Every page overrides this title, so it is a fallback only. */
  title: 'Avery Ember Day — Brand & Visual Designer',
  description: 'Portfolio of Avery Ember Day — Brand & Visual Designer.',
  icons: {
    icon: '/images/icons/BubbleLogo/bubbleLogo-white-notxt.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Must live inside <body>, not as a sibling of it. React rejects a <script> rendered as
            a direct child of <html> ("Cannot render a sync or defer <script> outside the main
            document") and the page threw a hydration error on every load until 2026-07-28.
            `beforeInteractive` still hoists this into <head> at build time, so it keeps running
            before first paint and there is no theme flash. */}
        <Script
          src="/scripts/theme-init.js"
          strategy="beforeInteractive"
        />
        <SkipLink />
        <div className="brand-page-bg" aria-hidden="true" />
        <div className="brand-page-noise" aria-hidden="true" />
        <Nav />
        {children}
        <Footer />
        <ReturnToTop />
        <BubblePhysics />
      </body>
    </html>
  );
}
