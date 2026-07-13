'use client';

import { useEffect, useRef } from 'react';

interface BubblePhysicsProps {
  exclusions?: string;
}

export default function BubblePhysics({ exclusions }: BubblePhysicsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Dynamically load bubbles.js after hydration so React doesn't
    // wipe the DOM elements the engine creates. Deferred to idle time
    // so engine init doesn't compete with LCP paint on cold loads.
    const start = () => {
      const script = document.createElement('script');
      script.src = '/scripts/bubbles.js';
      script.async = true;
      script.dataset.priority = 'low';
      document.body.appendChild(script);
      scriptRef.current = script;
    };
    const ric = (window as any).requestIdleCallback;
    const handle: number = ric ? ric(start, { timeout: 1500 }) : window.setTimeout(start, 0);

    return () => {
      if (ric) (window as any).cancelIdleCallback?.(handle);
      else window.clearTimeout(handle);
      // Teardown: destroy the engine and remove the script tag.
      // Only destroy if the script has actually loaded and initialized.
      if ((window as any).__bubbleEngine) {
        (window as any).__bubbleEngine.destroy();
        delete (window as any).__bubbleEngine;
      }
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="brand-bubbles-global"
      aria-hidden="true"
      data-exclusions={exclusions}
    />
  );
}
