import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You — Avery Ember Day',
  description: 'Your message has been sent.',
  alternates: {
    canonical: '/contact/thanks/',
  },
};

export default function ThanksPage() {
  return (
    <main id="main" className="mx-auto flex max-w-(--brand-content-max) flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
      <h1 className="mb-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-text">
        Thank You
      </h1>
      <p className="m-0 max-w-[480px] font-body text-base leading-[1.7] text-text-soft">
        Your message has been sent. I&apos;ll get back to you as soon as I can.
      </p>
      <Link
        href="/"
        className="brand-btn brand-btn-secondary mt-8"
      >
        Back to Home
      </Link>
    </main>
  );
}
