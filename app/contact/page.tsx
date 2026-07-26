import type { Metadata } from 'next';
import ConnectLinks from '../components/ConnectLinks';

export const metadata: Metadata = {
  title: 'Contact — Avery Ember Day',
  description: 'Get in touch with Avery Ember Day — collaborations, commissions, and inquiries.',
  openGraph: {
    title: 'Contact — Avery Ember Day',
    description: 'Get in touch with Avery Ember Day — collaborations, commissions, and inquiries.',
    images: ['/images/og-default.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/contact/',
  },
};

export default function ContactPage() {
  return (
    <main id="main" className="mx-auto max-w-(--brand-content-max) px-6 pt-20 pb-12">
      <h1 className="mb-4 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-text">
        Contact
      </h1>
      <p className="m-0 max-w-[560px] font-body text-base leading-[1.7] text-text-soft">
        If something here caught your eye, I&apos;m always looking for new opportunities
        to collaborate. Reach me through the form below or at the links.
      </p>

      <div className="my-10">
        <ConnectLinks />
      </div>

      <form
        name="contact"
        method="POST"
        action="/contact/thanks/"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="mx-auto max-w-[600px] rounded-lg border border-line bg-surface-1 p-6 shadow-card"
      >
        <input type="hidden" name="form-name" value="contact" />
        <div className="hidden">
          <label>
            Don&apos;t fill this out if you&apos;re human:{' '}
            <input name="bot-field" />
          </label>
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="name" className="font-body text-sm font-medium text-text">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="email" className="font-body text-sm font-medium text-text">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="mb-6 flex flex-col gap-1">
          <label htmlFor="message" className="font-body text-sm font-medium text-text">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="brand-btn brand-btn-primary w-full"
        >
          Send Message
        </button>
      </form>
    </main>
  );
}
