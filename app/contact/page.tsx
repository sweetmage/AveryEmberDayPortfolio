import type { Metadata } from 'next';
import { ogImage } from '../og';

export const metadata: Metadata = {
  title: 'Contact — Avery Ember Day',
  description: 'Get in touch with Avery Ember Day — collaborations, commissions, and inquiries.',
  openGraph: {
    title: 'Contact — Avery Ember Day',
    description: 'Get in touch with Avery Ember Day — collaborations, commissions, and inquiries.',
    images: [ogImage],
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
      {/* Deliberately does NOT repeat the invitation. The About box closes with
          "I'm always looking for new opportunities to collaborate. If my work
          catches your eye...", and this page used to open with almost the same
          sentence — anyone reading About and then clicking through got it twice,
          which reads like filler. The invitation is made once, there; this page
          just says what happens next. */}
      <p className="m-0 max-w-[560px] font-body text-base leading-[1.7] text-text-soft">
        Tell me what you&apos;re working on and I&apos;ll get back to you as soon as I
        can. If email is easier, my address is in the footer.
      </p>

      {/* `bubble-exclude` is the semantic marker in DEFAULT_EXCLUSIONS (scripts/bubbles.js).
          The engine matches exclusions by SELECTOR, and nothing in that list matches form,
          input, textarea or label — so without this one class the physics bubbles drift
          straight across the form fields. Covered by tests/bubbles-exclusion.spec.js; keep the
          class if this element is ever retagged. */}
      <form
        name="contact"
        method="POST"
        action="/contact/thanks/"
        data-netlify="true"
        netlify-honeypot="bot-field"
        /* Full container width — the 720px cap is gone (user call 2026-07-31: the
           form spans the shared container, bounded by padding, not max-width). */
        className="bubble-exclude mt-10 rounded-lg border border-line bg-surface-1 p-6 shadow-card"
      >
        <input type="hidden" name="form-name" value="contact" />
        <div className="hidden">
          <label>
            Don&apos;t fill this out if you&apos;re human:{' '}
            <input name="bot-field" />
          </label>
        </div>

        {/* `pointer-coarse:text-base` on every control below is load-bearing, not
            styling. iOS Safari ZOOMS THE PAGE whenever a control with a computed
            font-size under 16px takes focus, and it does not zoom back out. The
            nav is sticky, so after that zoom the layout is wider than the visible
            screen and the theme toggle at its right edge sits off screen — which
            is exactly how this was reported (2026-08-07): "on mobile, the light
            and dark menu is off screen", found while testing this form on a
            phone. 14px is under the threshold; 16px is not.

            Touch-only rather than a width breakpoint, because the trigger is the
            input method, not the viewport — and so pointer devices keep the 14px
            the design uses. */}
        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="name" className="font-body text-sm font-medium text-text">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors pointer-coarse:text-base focus:border-accent"
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
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors pointer-coarse:text-base focus:border-accent"
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
            className="rounded-md border border-line bg-surface-2 px-3 py-2 font-body text-sm text-text outline-none transition-colors pointer-coarse:text-base focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="brand-btn brand-btn-spectrum w-full"
        >
          Send Message
        </button>
      </form>
    </main>
  );
}
