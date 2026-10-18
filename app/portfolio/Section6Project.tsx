/* SECTION 6 Logo Design: the logos for a WGAW-registered animated series pitch.
   "SECTION 6" is the series title, so it is visible text here and on the tile.

   Approved by the user from mockups 1 and 2 on 2026-10-13. The copy is the
   user's own rewrite request that day: short and informative, the character
   written as "Phoenix" with no article. The alt text below is a first draft and
   waits for the user's review (plan: docs/plans/2026-10-13-logo-design-and-brand-expansion.md).

   Same logo-card pattern as the Brand page (swatch canvas, label strip, SVG and
   PNG links, `.logo-download`). It is a local copy of that card and not an
   import because the Brand page's card hardcodes its folder and its sizes; the
   class names are shared, so the two stay visually identical. */

const BASE = '/images/section-6/';

interface Logo {
  file: string;
  alt: string;
  bg: string;
  label: string;
  desc: string;
}

const phoenix: Logo = {
  file: 'phoenix-logo',
  alt: 'Red stencil-style phoenix with raised wings, a ring of flame-shaped feathers around its head and a long tail flowing down',
  bg: '#0A0A0A',
  label: 'Phoenix',
  desc: 'Dark backgrounds · #E4101E',
};

const roses: Logo[] = [
  {
    file: 'white-rose-1-bw',
    alt: 'Open white rose with black outlines and two white serrated leaves, in black and white',
    bg: '#6a6a66',
    label: 'White Rose 1, black and white',
    desc: 'The open rose · Mid-tone backgrounds',
  },
  {
    file: 'white-rose-1-color',
    alt: 'Open white rose with black outlines and two dark green serrated leaves',
    bg: '#1a1a1a',
    label: 'White Rose 1, color',
    desc: 'The open rose · Dark backgrounds',
  },
  {
    file: 'white-rose-2-bw',
    alt: 'White rose bud with black outlines on a short stem, in black and white',
    bg: '#6a6a66',
    label: 'White Rose 2, black and white',
    desc: 'The bud · Mid-tone backgrounds',
  },
  {
    file: 'white-rose-2-color',
    alt: 'White rose bud with black outlines on a short stem with a dark green leaf',
    bg: '#1a1a1a',
    label: 'White Rose 2, color',
    desc: 'The bud · Dark backgrounds',
  },
];

const tools = ['Procreate', 'Adobe InDesign', 'Adobe Photoshop'];

const DOWNLOAD_FORMATS = ['svg', 'png'] as const;

function LogoCard({ logo }: { logo: Logo }) {
  return (
    <div className="logo-swatch brand-frame flex flex-col [&_img]:h-48 [&_img]:w-48 [&_img]:object-contain">
      <div
        className="logo-swatch-canvas flex flex-1 items-center justify-center p-10"
        style={{ backgroundColor: logo.bg }}
      >
        <img src={`${BASE}${logo.file}.svg`} alt={logo.alt} loading="lazy" decoding="async" />
      </div>
      <div className="logo-swatch-label brand-frame-divider border-t px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
        <div className="flex items-baseline justify-between gap-3">
          <strong>{logo.label}</strong>
          <div className="flex shrink-0 gap-3">
            {DOWNLOAD_FORMATS.map((fmt) => (
              <a
                key={fmt}
                className="logo-download"
                href={`${BASE}${logo.file}.${fmt}`}
                download
                aria-label={`Download ${logo.label} as ${fmt.toUpperCase()}`}
              >
                {fmt.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
        <span>{logo.desc}</span>
      </div>
    </div>
  );
}

/* `minmax(min(280px, 100%), 1fr)`: a bare 280px floor overflows a 320px phone
   (272px of content width). */
const GRID =
  'logo-grid grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4';

/* The four White Rose logos sit two by two from 768px, in reading order: open rose
   black and white, open rose color, bud black and white, bud color (user, 2026-10-14).
   One column below that. `grid-cols-N` is minmax(0, 1fr), so it cannot overflow. */
const ROSE_GRID = 'logo-grid grid grid-cols-1 gap-4 md:grid-cols-2';

export default function Section6Project() {
  return (
    <>
      <div className="project-hero px-6 pt-8 pb-6 lg:pt-0">
        <h3 className="project-title brand-page-title brand-page-title--section mb-3">
          SECTION 6 Logo Design
        </h3>
      </div>

      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Description
        </h4>
        <p className="project-desc">
          Logo design for SECTION 6, an animated series pitch registered with the WGAW.
        </p>
      </section>

      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          Tools
        </h4>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {tools.map((tool) => (
            <li
              key={tool}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 font-body text-sm text-text"
            >
              {tool}
            </li>
          ))}
        </ul>
      </section>

      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          The Phoenix Logo
        </h4>
        <p className="project-desc mb-6">
          A stencil symbol representing a revolutionary movement, ignited by the legendary hero,
          Phoenix.
        </p>
        <div className={GRID}>
          <LogoCard logo={phoenix} />
        </div>
      </section>

      <section className="project-section px-6 pb-12">
        <h4 className="section-title mb-5 border-none p-0 text-left font-heading text-xl font-semibold normal-case tracking-normal text-text">
          White Rose
        </h4>
        <p className="project-desc mb-6">
          The logo of a morally ambiguous, large scientific research corporation.
        </p>
        <div className={ROSE_GRID}>
          {roses.map((logo) => (
            <LogoCard key={logo.file} logo={logo} />
          ))}
        </div>
      </section>
    </>
  );
}
