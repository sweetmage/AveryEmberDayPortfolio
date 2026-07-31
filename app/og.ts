/**
 * The shared social share card, used by every page's `openGraph.images`.
 *
 * Declaring width/height/alt rather than a bare URL string matters in practice: Discord, Slack,
 * and Twitter size the unfurl from `og:image:width`/`og:image:height` and will otherwise fetch
 * the image before they can lay the card out, which is what makes an unfurl pop in late or fall
 * back to a small thumbnail.
 *
 * The file itself is generated from the live homepage hero by `scripts/generate-og-image.js` —
 * re-run that after any hero change so the card cannot drift from the site.
 */
export const ogImage = {
  url: '/images/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Avery Ember Day — Brand & Visual Designer',
} as const;
