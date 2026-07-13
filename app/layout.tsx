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
  title: 'Avery Ember Day — Portfolio',
  description: 'Portfolio of Avery Ember Day — designer, artist, and creative technologist.',
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
      <Script
        src="/scripts/theme-init.js"
        strategy="beforeInteractive"
      />
      <body>
        <SkipLink />
        <div className="brand-page-bg" aria-hidden="true" />
        <div className="brand-page-noise" aria-hidden="true" />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ReturnToTop />
        <BubblePhysics />
      </body>
    </html>
  );
}
