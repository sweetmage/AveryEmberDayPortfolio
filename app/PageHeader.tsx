/* Shared page header for the Projects and Gallery pages: a left-aligned title
   in the 1400px content container with a thin iridescent gradient bar
   (the hero's `.brand-spectrum-bar`) underlining it across the page. Kept in
   one place so the title lands in the exact same spot when switching pages. */
export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="mx-auto max-w-[1400px] px-[clamp(16px,4vw,40px)] pt-8">
      <h2 className="m-0 border-none p-0 text-left font-display text-[clamp(2rem,5vw,3rem)] leading-[1.1] normal-case tracking-normal font-normal text-text [text-shadow:0_0_30px_rgba(217,154,255,0.20),0_0_60px_rgba(0,255,255,0.10)]">
        {title}
      </h2>
      {/* h-[1.5px] overrides the hero bar's 6px only here (utilities layer wins
          over brand.css components layer), leaving the hero bar untouched. */}
      <div className="brand-spectrum-bar mt-3 h-[3px]" aria-hidden="true">
        <div />
      </div>
    </header>
  );
}
