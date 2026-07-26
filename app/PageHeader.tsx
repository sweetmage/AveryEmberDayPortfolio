/* Shared page header for the Projects and Gallery pages: a left-aligned title
   in the 1400px content container with a thin iridescent gradient bar
   (the hero's `.brand-spectrum-bar`) underlining it across the page. Kept in
   one place so the title lands in the exact same spot when switching pages. */
export default function PageHeader({ title }: { title: string }) {
  return (
    /* `max-w-[1400px] px-6` is the shared content geometry: the same container
       width and the same 24px gutter that the Projects tablist and the Gallery
       filter rail use. That is what makes the bar below start exactly at the
       left edge of the tabs and stop the same distance from the right edge,
       at every viewport — the header used to carry a `clamp(16px,4vw,40px)`
       gutter *inside* the container while both rails padded differently, so
       the three left edges never lined up. */
    <header className="mx-auto max-w-[1400px] px-6 pt-8">
      <h2 className="brand-page-title">{title}</h2>
      {/* `.brand-title-bar` trims the hero bar's 6px to 3px here only. */}
      <div className="brand-spectrum-bar brand-title-bar" aria-hidden="true">
        <div />
      </div>
    </header>
  );
}
