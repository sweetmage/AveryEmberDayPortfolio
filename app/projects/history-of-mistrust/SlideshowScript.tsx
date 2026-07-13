'use client';

import { useEffect, useRef } from 'react';

export default function SlideshowScript() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/scripts/history-of-mistrust-slideshow.js';
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  return null;
}
