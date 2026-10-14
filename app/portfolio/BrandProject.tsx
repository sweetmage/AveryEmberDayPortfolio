const primarySwatches = [
  {
    src: '/images/icons/BubbleLogo/bubbleLogo.png',
    file: 'bubbleLogo',
    alt: 'Blue logo with text',
    bg: '#0A0A0A',
    label: 'Blue',
    desc: 'Dark backgrounds · #7eb8ff',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black.svg',
    file: 'bubbleLogo-black',
    alt: 'Black logo with text',
    bg: '#F2F0EC',
    label: 'Black',
    desc: 'Light backgrounds · #000000',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white.svg',
    file: 'bubbleLogo-white',
    alt: 'White logo with text',
    bg: '#1a1a1a',
    label: 'White',
    desc: 'Dark backgrounds · #ffffff',
  },
];

const iconMarkSwatches = [
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-blue-notxt.png',
    file: 'bubbleLogo-blue-notxt',
    alt: 'Blue icon mark',
    bg: '#0A0A0A',
    label: 'Blue',
    desc: 'Dark backgrounds · Favicon, app icon',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-black-notxt.png',
    file: 'bubbleLogo-black-notxt',
    alt: 'Black icon mark',
    bg: '#F2F0EC',
    label: 'Black',
    desc: 'Light backgrounds · Small use',
  },
  {
    src: '/images/icons/BubbleLogo/bubbleLogo-white-notxt.png',
    file: 'bubbleLogo-white-notxt',
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

/* Logo download kit (2026-10-06, the user's call: "Brand kit downloads").
   Every variant ships as both SVG and PNG under the same stem, which is what
   put the five previously unreferenced format twins to use. The link text is
   the format alone; the accessible name carries the variant, since six cards
   each read "SVG" and "PNG". Links sit in the label strip so the logo canvas
   and its p-10 inset are untouched. */
const DOWNLOAD_FORMATS = ['svg', 'png'] as const;

type Swatch = (typeof primarySwatches)[number];

function LogoSwatch({ swatch }: { swatch: Swatch }) {
  return (
    <div className="logo-swatch brand-frame flex flex-col [&_img]:h-40 [&_img]:w-40 [&_img]:object-contain">
      <div
        className="logo-swatch-canvas flex flex-1 items-center justify-center p-10"
        style={{ backgroundColor: swatch.bg }}
      >
        <img src={swatch.src} alt={swatch.alt} loading="lazy" decoding="async" />
      </div>
      {/* The links share the name's row, not the description's: beside the
          description they squeezed "Favicon, app icon" onto a second line at
          1024px, and that one taller strip shrank its card's canvas. */}
      <div className="logo-swatch-label brand-frame-divider border-t px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
        <div className="flex items-baseline justify-between gap-3">
          <strong>{swatch.label}</strong>
          <div className="flex shrink-0 gap-3">
            {DOWNLOAD_FORMATS.map((fmt) => (
              <a
                key={fmt}
                className="logo-download"
                href={`/images/icons/BubbleLogo/${swatch.file}.${fmt}`}
                download
                aria-label={`Download ${swatch.alt} as ${fmt.toUpperCase()}`}
              >
                {fmt.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
        <span>{swatch.desc}</span>
      </div>
    </div>
  );
}

/* Brand Voice and Tone: the agent's DRAFT for the user to edit (2026-10-13), shown on
   the page so the user can judge it in place. Written to the user's rules, saved in
   .agents/memories/brand-voice.md: plain English, vibe-based adjectives, few "I"
   statements, no "this, not this" comparisons, only what the brand is, only lines that
   are live on the site as examples. The text lives here as data so editing it is a
   one-place change; draft source: docs/plans/2026-10-13-brand-voice-draft.md. */
const voiceIntro =
  'Avery Ember Day sounds friendly, clear, and a little curious. Think of a good conversation over coffee with someone who really listens.';

const voiceTraits = [
  {
    name: 'Clear and down to earth',
    text: 'Say what it is first, then add one detail. Short sentences and everyday words keep things easy to follow.',
    example: 'A 30-slide Instagram series on why some communities struggle to trust doctors.',
  },
  {
    name: 'Warm and attentive',
    text: 'Listening comes first. A friendly welcome, a direct question, and a clear next step make people feel at home.',
    example: "Tell me what you're working on and I'll get back to you as soon as I can.",
  },
  {
    name: 'Quietly playful',
    text: 'A small smile, a touch of curiosity, and one little joke a page at most. Serious topics get a calm, caring voice.',
    example: 'Brewing coffee and conversation alongside my pursuit of my true passions.',
  },
];

const voiceFeel = [
  { where: 'About', feel: 'Friendly, personal, a little playful' },
  { where: 'Project pages', feel: 'Clear, calm, informative' },
  { where: 'Heavy topics, like A History of Mistrust', feel: 'Grounded, careful, kind' },
  { where: 'Contact', feel: 'Welcoming, helpful, brief' },
  { where: 'Gallery titles', feel: 'Bold, simple, a bit cheeky' },
  { where: 'Image descriptions', feel: 'Simple and exact' },
];

const voiceWords = [
  'systems',
  'reusable',
  'built to last',
  'character',
  'mood',
  'craft',
  'clean',
  'clear',
  'accessible',
  'listening',
  'the brief',
];

const voiceWordsNote = 'Everyday words like use, build, make, listen, and reach out.';

const voiceHabits =
  'Speak in the first person, with contractions. Use commas and colons for pauses. Keep exclamation marks to one a page. Use US spelling. Use one title: Brand & Visual Designer.';

function BrandVoice() {
  return (
    <section className="project-section px-6 pb-12">
      <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
        Brand Voice and Tone
      </h4>
      <p className="project-desc mb-8">{voiceIntro}</p>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {voiceTraits.map((trait) => (
          <div key={trait.name} className="brand-frame flex flex-col gap-3 p-5">
            <h5 className="m-0 font-heading text-lg font-semibold text-text">{trait.name}</h5>
            <p className="m-0 font-body text-base leading-relaxed text-text-soft">{trait.text}</p>
            <p className="m-0 mt-auto border-l-2 border-accent pl-3 font-body text-sm italic leading-relaxed text-text-muted">
              &ldquo;{trait.example}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
        How it feels on each page
      </h5>
      <dl className="brand-frame mb-8 grid grid-cols-1 gap-x-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {voiceFeel.map((row) => (
          <div key={row.where} className="contents">
            <dt className="brand-frame-divider border-b py-3 font-body text-sm font-medium text-text md:last-of-type:border-b-0">
              {row.where}
            </dt>
            <dd className="brand-frame-divider m-0 border-b pb-3 font-body text-base text-text-soft md:py-3 md:last-of-type:border-b-0">
              {row.feel}
            </dd>
          </div>
        ))}
      </dl>

      <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
        Words that fit
      </h5>
      <ul className="m-0 mb-3 flex list-none flex-wrap gap-2 p-0">
        {voiceWords.map((word) => (
          <li
            key={word}
            className="rounded-full border border-line bg-surface-2 px-3 py-1 font-body text-sm text-text"
          >
            {word}
          </li>
        ))}
      </ul>
      <p className="m-0 mb-8 font-body text-base text-text-soft">{voiceWordsNote}</p>

      <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
        Writing habits
      </h5>
      <p className="m-0 font-body text-base leading-relaxed text-text-soft">{voiceHabits}</p>
    </section>
  );
}

/* Brand Assets: the business card and the website banner, each shown as the design
   and as a mockup. HIDDEN for now (user, 2026-10-13): the user will make the pieces
   later, so nothing here renders until `SHOW_BRAND_ASSETS` is true. To launch it, fill
   in each piece's `design` and `mockup` (src, alt, width, height), then flip the flag.
   A piece with no image renders no figure, so it can go live one piece at a time. */
const SHOW_BRAND_ASSETS = false;

interface AssetImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface BrandAsset {
  title: string;
  design: AssetImage | null;
  mockup: AssetImage | null;
}

const brandAssets: BrandAsset[] = [
  { title: 'Business Card', design: null, mockup: null },
  { title: 'Website Banner', design: null, mockup: null },
];

function BrandAssets() {
  return (
    <section className="project-section px-6 pb-12">
      <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
        Brand Assets
      </h4>
      {brandAssets.map((asset) => (
        <div key={asset.title} className="mb-8 last:mb-0">
          <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
            {asset.title}
          </h5>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: 'Design', image: asset.design },
              { label: 'Mockup', image: asset.mockup },
            ].map(({ label, image }) =>
              image ? (
                <figure key={label} className="brand-frame m-0 p-3 [&_img]:block [&_img]:h-auto [&_img]:w-full">
                  <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
                  <figcaption className="mt-2 font-body text-xs text-text-muted">{label}</figcaption>
                </figure>
              ) : null,
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

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
          A complete personal brand identity system: logos, color, type, and
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
              <LogoSwatch key={swatch.src} swatch={swatch} />
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-3 font-heading text-sm font-medium uppercase tracking-[0.08em] text-text-muted">
            Icon Mark
          </h5>
          <div className="logo-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {iconMarkSwatches.map((swatch) => (
              <LogoSwatch key={swatch.src} swatch={swatch} />
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

      <BrandVoice />

      {SHOW_BRAND_ASSETS && <BrandAssets />}
    </>
  );
}
