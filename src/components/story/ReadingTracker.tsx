'use client';

import { useEffect } from 'react';

interface ReadingTrackerProps {
  slug: string;
  title: string;
  chapterLabel: string;
}

export function ReadingTracker({ slug, title, chapterLabel }: ReadingTrackerProps) {
  useEffect(() => {
    const handleScroll = () => {
      const proseEl = document.querySelector('.story-prose') as HTMLElement | null;
      if (!proseEl) return;

      const rect = proseEl.getBoundingClientRect();
      const proseTop = rect.top + window.scrollY;
      const proseHeight = proseEl.offsetHeight;
      const viewportHeight = window.innerHeight;

      const start = Math.max(0, proseTop - viewportHeight * 0.25);
      const end = proseTop + proseHeight - viewportHeight * 0.55;
      const totalDistance = end - start;

      if (totalDistance <= 0) return;

      const currentScroll = window.scrollY;
      let progress = 0;
      if (currentScroll <= start) {
        progress = 0;
      } else if (currentScroll >= end) {
        progress = 100;
      } else {
        progress = Math.min(100, Math.max(0, Math.round(((currentScroll - start) / totalDistance) * 100)));
      }

      // Record reading progress in localStorage
      try {
        const lastReadData = {
          slug,
          title,
          chapterLabel,
          progress,
          timestamp: Date.now(),
        };
        localStorage.setItem('dust_last_read', JSON.stringify(lastReadData));

        if (progress >= 90) {
          const completedRaw = localStorage.getItem('dust_completed_stories');
          const completedList: string[] = completedRaw ? JSON.parse(completedRaw) : [];
          if (!completedList.includes(slug)) {
            completedList.push(slug);
            localStorage.setItem('dust_completed_stories', JSON.stringify(completedList));
          }
        }
      } catch {
        // ignore localStorage access errors
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [slug, title, chapterLabel]);

  return null;
}
