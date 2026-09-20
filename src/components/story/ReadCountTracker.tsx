'use client';

import { useEffect, useRef } from 'react';
import { recordStoryReadAction } from '@/app/actions/stories';

interface ReadCountTrackerProps {
  storyId: string;
  slug: string;
}

export function ReadCountTracker({ storyId, slug }: ReadCountTrackerProps) {
  const hasRecordedRef = useRef(false);
  const timeEligibleRef = useRef(false);
  const scrollEligibleRef = useRef(false);

  useEffect(() => {
    // Respect Do Not Track
    if (typeof window !== 'undefined') {
      const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        return;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `dust_read_rec_${storyId}_${todayStr}`;

    // Skip if already counted today in this browser
    try {
      if (localStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // ignore
    }

    const checkAndTrigger = () => {
      if (hasRecordedRef.current) return;
      if (timeEligibleRef.current && scrollEligibleRef.current) {
        hasRecordedRef.current = true;
        try {
          localStorage.setItem(storageKey, '1');
        } catch {
          // ignore
        }
        recordStoryReadAction(storyId);
      }
    };

    // 1. Time requirement: 30 seconds
    const timer = setTimeout(() => {
      timeEligibleRef.current = true;
      checkAndTrigger();
    }, 30000);

    // 2. Scroll requirement: 40% of story prose
    const handleScroll = () => {
      if (scrollEligibleRef.current) return;

      const proseEl = document.querySelector('.story-prose') as HTMLElement | null;
      if (!proseEl) return;

      const rect = proseEl.getBoundingClientRect();
      const proseTop = rect.top + window.scrollY;
      const proseHeight = proseEl.offsetHeight;
      const viewportHeight = window.innerHeight;

      const start = Math.max(0, proseTop - viewportHeight * 0.25);
      const end = proseTop + proseHeight - viewportHeight * 0.55;
      const totalDistance = end - start;

      if (totalDistance <= 0) {
        scrollEligibleRef.current = true;
        checkAndTrigger();
        return;
      }

      const progress = ((window.scrollY - start) / totalDistance) * 100;
      if (progress >= 40) {
        scrollEligibleRef.current = true;
        checkAndTrigger();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [storyId, slug]);

  return null;
}
