'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight } from 'lucide-react';

interface ContinueReadingBannerProps {
  validSlugs: string[];
}

interface LastReadData {
  slug: string;
  title: string;
  chapterLabel: string;
  progress: number;
  timestamp: number;
}

export function ContinueReadingBanner({ validSlugs }: ContinueReadingBannerProps) {
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dust_last_read');
      if (raw) {
        const parsed = JSON.parse(raw) as LastReadData;
        if (
          parsed &&
          parsed.slug &&
          validSlugs.includes(parsed.slug) &&
          parsed.progress >= 5 &&
          parsed.progress <= 90
        ) {
          setLastRead(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [validSlugs]);

  if (!lastRead) return null;

  return (
    <div className="mb-6 w-full max-w-lg animate-fadeIn">
      <Link
        href={`/story/${lastRead.slug}`}
        className="group flex items-center justify-between px-4 py-2.5 rounded-sm bg-[var(--bg-surface-elevated)] border border-[var(--color-terracotta)]/30 hover:border-[var(--color-terracotta)] text-xs font-serif transition-all shadow-xs"
      >
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Bookmark className="w-3.5 h-3.5 text-[var(--color-terracotta)] shrink-0" />
          <span className="text-[var(--text-secondary)]">Continue:</span>
          <span className="font-medium group-hover:text-[var(--color-terracotta)] transition-colors line-clamp-1">
            {lastRead.title}
          </span>
          <span className="text-[var(--text-muted)] text-[11px]">
            ({lastRead.progress}% read)
          </span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-terracotta)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
      </Link>
    </div>
  );
}
