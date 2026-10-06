import Link from 'next/link';

export interface ProjectTileProps {
  href: string;
  title: string;
  description: string;
  thumb: string;
  /** The thumbnail's alt text. The tile's link text is the title, so this describes the picture. */
  thumbAlt: string;
  /** `cover` fills the square (artwork); `contain` letterboxes it (a logo on its own backdrop). */
  fit?: 'cover' | 'contain';
  /** A fixed backdrop behind a `contain` thumbnail, for art drawn for one theme (the blue logo). */
  backdrop?: string;
}

/**
 * One project on the Portfolio page: the whole tile is a single link to that
 * project's own page (the gallery's one-interactive-element-per-card rule).
 *
 * It has to read as "this opens another page" at rest, not only on hover (user,
 * 2026-10-05): a visible outline (`.project-tile`, brand.css), a description
 * under the picture, and an explicit "View project →" label.
 *
 * The thumbnail is a plain <img> on purpose: `FRAME_ZONE_SELECTOR` in
 * scripts/bubbles.js registers every img as a bubble wall, which is the
 * picture-is-the-wall rule, while the card itself stays permeable. Never swap it
 * for the inline-SVG `BubbleLogo` component, which is not an img and would drop
 * out of the zone list (the Entry 090 hero-logo trap).
 */
export default function ProjectTile({
  href,
  title,
  description,
  thumb,
  thumbAlt,
  fit = 'cover',
  backdrop,
}: ProjectTileProps) {
  return (
    <li className="list-none">
      <Link href={href} className="project-tile group">
        <div className="project-tile-thumb" style={backdrop ? { background: backdrop } : undefined}>
          <img
            src={thumb}
            alt={thumbAlt}
            loading="lazy"
            decoding="async"
            className={fit === 'contain' ? 'project-tile-img is-contain' : 'project-tile-img'}
          />
        </div>
        <div className="project-tile-body">
          <h3 className="project-tile-title">{title}</h3>
          <p className="project-tile-desc">{description}</p>
          <span className="project-tile-cta" aria-hidden="true">
            View project <span className="project-tile-arrow">→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
