const primarySwatches = [
  {
    src: '/images/icons/BubbleLogo/bubbleLogo.png',
    alt: 'Blue logo with text',
    bg: '#0A0A0A',
    label: 'Blue',
    desc: 'Dark backgrounds · #9acdff',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black.svg',
    alt: 'Black logo with text',
    bg: '#F2F0EC',
    label: 'Black',
    desc: 'Light backgrounds · #000000',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white.svg',
    alt: 'White logo with text',
    bg: '#1a1a1a',
    label: 'White',
    desc: 'Dark backgrounds · #ffffff',
  },
];

const iconMarkSwatches = [
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-blue-notxt.png',
    alt: 'Blue icon mark',
    bg: '#0A0A0A',
    label: 'Blue',
    desc: 'Dark backgrounds · Favicon, app icon',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black-notxt.png',
    alt: 'Black icon mark',
    bg: '#F2F0EC',
    label: 'Black',
    desc: 'Light backgrounds · Small use',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white-notxt.png',
    alt: 'White icon mark',
    bg: '#1a1a1a',
    label: 'White',
    desc: 'Dark backgrounds · Small use',
  },
];

/* Chips are pinned to literal hexes, NOT the `bg-accent` / `bg-ir-4` / `bg-neon`
   / `bg-gold` token utilities they used before. Those tokens re-theme, while the
   printed hex is fixed, so in light mode 4 of these 6 chips rendered a colour
   that contradicted the label under it (measured: Accent painted #8B22E0 beside
   a "#CC44FF" caption). A brand palette documents absolute colours, so the chip
   must not follow the viewer's theme. Values are the `:root` dark base, which
   brand.css treats as canonical; the light theme's variants are derived. */
const palette = [
  { name: 'Brand Blue', hex: '#9acdff', bg: 'bg-[#9acdff]' },
  { name: 'Accent', hex: '#CC44FF', bg: 'bg-[#CC44FF]' },
  { name: 'Neon', hex: '#00FFFF', bg: 'bg-[#00FFFF]' },
  { name: 'Gold', hex: '#f5b96a', bg: 'bg-[#f5b96a]' },
  { name: 'Dark BG', hex: '#0A0A0A', bg: 'bg-[#0A0A0A]' },
  { name: 'Light BG', hex: '#F2F0EC', bg: 'bg-[#F2F0EC]' },
];

export default function BrandProject() {
  return (
    <>
      <div className="project-hero px-6 pt-8 pb-6 lg:pt-0">
        <h3 className="project-title brand-page-title brand-page-title--section mb-3">
          Avery Ember Day Brand
        </h3>
      </div>

      {/* Description — same hero/section split the Mistrust panel uses, so the
          intro paragraph sits under a labelled section on both projects. */}
      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Description
        </h4>
        <p className="project-desc">
          Complete personal brand identity system logos, color, type, and
          applications. Built to work across dark and light contexts with a
          consistent voice.
        </p>
      </section>

      {/* Logo Variants */}
      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Logo Variants
        </h4>

        <div className="mb-8">
          <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
            Primary
          </h5>
          <div className="logo-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {primarySwatches.map((swatch) => (
              <div
                key={swatch.src}
                className="logo-swatch brand-frame flex flex-col [&_img]:h-40 [&_img]:w-40 [&_img]:object-contain"
              >
                <div
                  className="logo-swatch-canvas flex flex-1 items-center justify-center p-10"
                  style={{ backgroundColor: swatch.bg }}
                >
                  <img src={swatch.src} alt={swatch.alt} loading="lazy" decoding="async" />
                </div>
                <div className="logo-swatch-label brand-frame-divider border-t px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
                  <strong>{swatch.label}</strong>
                  <span>{swatch.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
            Icon Mark
          </h5>
          <div className="logo-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {iconMarkSwatches.map((swatch) => (
              <div
                key={swatch.src}
                className="logo-swatch brand-frame flex flex-col [&_img]:h-40 [&_img]:w-40 [&_img]:object-contain"
              >
                <div
                  className="logo-swatch-canvas flex flex-1 items-center justify-center p-10"
                  style={{ backgroundColor: swatch.bg }}
                >
                  <img src={swatch.src} alt={swatch.alt} loading="lazy" decoding="async" />
                </div>
                <div className="logo-swatch-label brand-frame-divider border-t px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
                  <strong>{swatch.label}</strong>
                  <span>{swatch.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Brand Palette
        </h4>
        <div className="palette-row flex flex-wrap gap-3">
          {palette.map((color) => (
            <div key={color.name} className="swatch flex min-w-[100px] max-w-[170px] flex-1 flex-col gap-2">
              {/* `brand-frame-line`, not `brand-frame`: the chip IS the color
                  specimen, so it must carry no frame tint of its own. */}
              <div className={`swatch-block brand-frame-line h-[72px] rounded-md ${color.bg}`} />
              <span className="swatch-name font-body text-[0.8rem] font-medium text-text">
                {color.name}
              </span>
              <span className="swatch-hex font-mono text-[0.72rem] text-text-muted">
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Type System
        </h4>
        <div className="type-specimen brand-frame flex flex-col gap-5 p-6">
          <div className="type-row brand-frame-divider flex flex-col gap-1 border-b pb-5 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Display — Sriracha
            </span>
            <span className="type-display font-display text-[2.5rem] text-text">
              Avery Ember Day
            </span>
          </div>
          <div className="type-row brand-frame-divider flex flex-col gap-1 border-b pb-5 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Heading — Outfit 600
            </span>
            <span className="type-heading font-heading text-2xl font-semibold text-text">
              Brand Identity System
            </span>
          </div>
          <div className="type-row brand-frame-divider flex flex-col gap-1 border-b pb-5 last:border-b-0 last:pb-0">
            <span className="type-label font-body text-[0.72rem] tracking-[0.08em] uppercase text-text-muted">
              Body — Inter 400
            </span>
            <span className="type-body font-body text-base leading-relaxed text-text-soft">
              Designer based in Las Vegas. Illustration, brand
              identity, and motion graphics. Design with a focus on character,
              mood, and accessibility.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
