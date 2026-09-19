'use client';

import React, { useState, useEffect } from 'react';

export function TextSizeControl() {
  const [fontSize, setFontSize] = useState<number>(20);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dust_and_dazzle_text_size');
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 17 && num <= 26) {
          setFontSize(num);
          document.documentElement.style.setProperty('--story-font-size', `${num}px`);
          document.documentElement.style.setProperty('--story-line-height', `${Math.round(num * 1.8)}px`);
        }
      } else {
        // Default font size on wide screens is 20px
        document.documentElement.style.setProperty('--story-font-size', '20px');
        document.documentElement.style.setProperty('--story-line-height', '36px');
      }
    } catch {
      // ignore
    }
  }, []);

  const changeSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(17, Math.min(26, prev + delta));
      try {
        localStorage.setItem('dust_and_dazzle_text_size', next.toString());
      } catch {
        // ignore
      }
      document.documentElement.style.setProperty('--story-font-size', `${next}px`);
      document.documentElement.style.setProperty('--story-line-height', `${Math.round(next * 1.8)}px`);
      return next;
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm font-serif text-xs">
      <span className="px-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px] font-medium hidden sm:inline">
        Type
      </span>
      <button
        onClick={() => changeSize(-1)}
        disabled={fontSize <= 17}
        className="px-2 py-0.5 rounded-sm hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] disabled:opacity-30 transition-colors font-medium"
        aria-label="Decrease font size"
        title="Smaller text"
      >
        A-
      </button>
      <span className="text-[11px] text-[var(--text-muted)] font-mono px-1">
        {fontSize}px
      </span>
      <button
        onClick={() => changeSize(1)}
        disabled={fontSize >= 26}
        className="px-2 py-0.5 rounded-sm hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] disabled:opacity-30 transition-colors font-medium"
        aria-label="Increase font size"
        title="Larger text"
      >
        A+
      </button>
    </div>
  );
}
