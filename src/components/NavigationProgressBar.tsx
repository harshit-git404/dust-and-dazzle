'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const initialLoadRef = useRef(true);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress on pathname / searchParams change
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Complete the bar
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setProgress(100);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(hideTimer);
  }, [pathname, searchParams]);

  // Global click listener for internal links to start progress immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');
      const download = anchor.getAttribute('download');

      // Skip non-HTTP / external / new tab / download links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target === '_blank' ||
        download !== null ||
        anchor.dataset.noProgress === 'true'
      ) {
        return;
      }

      // Check if internal navigation to different destination
      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.origin);

        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          // Start progress bar
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }

          setIsVisible(true);
          setProgress(25);

          // Incrementally ease forward to 85%
          progressTimerRef.current = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 85) {
                if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                return 85;
              }
              const step = Math.max(1, (85 - prev) * 0.15);
              return Math.min(85, prev + step);
            });
          }, 120);
        }
      } catch {
        // invalid URL ignore
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed left-0 right-0 z-50 pointer-events-none transition-opacity duration-200"
      style={{
        top: 'env(safe-area-inset-top, 0px)',
        opacity: isVisible || progress > 0 ? 1 : 0,
      }}
    >
      <div
        className="h-[2.5px] bg-[var(--color-diya)] shadow-[0_0_8px_var(--color-diya)] transition-all ease-out motion-reduce:transition-none"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '150ms' : '200ms',
        }}
      />
    </div>
  );
}
