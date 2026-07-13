'use client';

import { useEffect } from 'react';

export default function ReturnToTop() {
  useEffect(() => {
    const btn = document.getElementById('return-to-top');
    if (!btn) return;

    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      btn.style.display = scrollY > 800 ? 'block' : 'none';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const onClick = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    btn.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      btn.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <button
      id="return-to-top"
      aria-label="Return to top"
      className="fixed bottom-8 right-8 z-50 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2 text-text-muted transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
    >
      <svg viewBox="0 0 20 30" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
        <path d="M11.25 15.688l-7.656 7.656-3.594-3.688 11.063-11.094 11.344 11.344-3.5 3.5z" />
      </svg>
    </button>
  );
}
