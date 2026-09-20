'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardNavigationProps {
  prevSlug?: string | null;
  nextSlug?: string | null;
}

export function KeyboardNavigation({ prevSlug, nextSlug }: KeyboardNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user has modifier keys pressed (Ctrl, Alt, Meta, Shift)
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      // Ignore if focused on interactive input fields
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox'
        ) {
          return;
        }
      }

      if (e.key === 'ArrowLeft' && prevSlug) {
        e.preventDefault();
        router.push(`/story/${prevSlug}`);
      } else if (e.key === 'ArrowRight' && nextSlug) {
        e.preventDefault();
        router.push(`/story/${nextSlug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlug, nextSlug, router]);

  return (
    <div
      className="sr-only"
      aria-keyshortcuts="ArrowLeft ArrowRight"
      aria-label="Use Left and Right arrow keys to navigate between collection chapters"
    />
  );
}
