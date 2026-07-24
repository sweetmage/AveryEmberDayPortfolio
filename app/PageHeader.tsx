/* Shared page header for the Projects and Gallery pages: a left-aligned title
   in the 1400px content container with a thin iridescent gradient bar
   (the hero's `.brand-spectrum-bar`) underlining it across the page. Kept in
   one place so the title lands in the exact same spot when switching pages. */
export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="mx-auto max-w-[1400px] px-[clamp(16px,4vw,40px)] pt-8">
      <h2 className="brand-page-title">{title}</h2>
      {/* `.brand-title-bar` trims the hero bar's 6px to 3px here only. */}
      <div className="brand-spectrum-bar brand-title-bar" aria-hidden="true">
        <div />
      </div>
    </header>
  );
}
