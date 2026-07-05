'use client';

import { useEffect, useRef } from 'react';
import { ADSTERRA } from '@/lib/site-config';

/**
 * Adsterra native ad unit.
 *
 * Loads invoke.js on mount (and re-loads on route change so the ad repopulates
 * when the user navigates between pages). Renders the container div that
 * Adsterra's script populates with native ads.
 *
 * Usage: <AdsterraAd className="my-8" />
 * Place ONCE per page in a strategic position (between sections, mid-article, etc).
 */
export function AdsterraAd({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any previously-loaded invoke.js so we can re-trigger it
    const existing = document.querySelector(`script[data-adsterra="invoke"]`);
    if (existing) existing.remove();

    // Reset the container in case it had leftover ad markup
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Load the script fresh
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.setAttribute('data-adsterra', 'invoke');
    s.src = ADSTERRA.scriptSrc;
    document.body.appendChild(s);

    return () => {
      // Cleanup on unmount
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div className={`adsterra-ad ${className}`}>
      <div id={ADSTERRA.containerId} ref={containerRef} />
      <noscript>
        {/* Fallback for no-JS browsers — Adsterra recommends this */}
        <a href="https://pl30223379.effectivecpmnetwork.com/7a25ed031852608cea88f1b07d4e7d5d/" target="_blank" rel="noopener noreferrer sponsored">
          Sponsored content
        </a>
      </noscript>
    </div>
  );
}
