'use client';

import { useEffect } from 'react';

/* Old links carried the project in the hash: /projects/#history-of-mistrust and
   /projects/#brand. netlify.toml 301s /projects/ here, the browser keeps the
   hash across the redirect, and the server never sees it, so the last hop has
   to happen in the page. `replace`, not `assign`, so Back does not bounce
   through /portfolio/#… and forward again.

   Old gallery links (/gallery/#filter=digital) land here too. GalleryGrid reads
   the filter from the hash on its own; this only scrolls to the gallery, which
   now sits below the project tiles. */
const PROJECT_HASHES: Record<string, string> = {
  '#history-of-mistrust': '/portfolio/history-of-mistrust/',
  '#brand': '/portfolio/brand/',
};

export default function LegacyHashForwarder() {
  useEffect(() => {
    const { hash } = window.location;
    const target = PROJECT_HASHES[hash];
    if (target) {
      window.location.replace(target);
      return;
    }
    if (hash.startsWith('#filter=')) {
      document.getElementById('gallery')?.scrollIntoView({ block: 'start' });
    }
  }, []);
  return null;
}
