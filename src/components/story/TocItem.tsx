'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Story } from '@/types/story';
import { truncateAtWord, toRomanNumeral } from '@/lib/editor-utils';
import { isFeatureEnabled } from '@/lib/features';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, ArrowRight, Check } from 'lucide-react';

interface TocItemProps {
  story: Story;
  index: number;
}

export function TocItem({ story, index }: TocItemProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const readerToolsEnabled = isFeatureEnabled('READER_TOOLS');

  useEffect(() => {
    if (!readerToolsEnabled) return;
    try {
      const completedRaw = localStorage.getItem('dust_completed_stories');
      if (completedRaw) {
        const list: string[] = JSON.parse(completedRaw);
        if (Array.isArray(list) && list.includes(story.slug)) {
          setIsCompleted(true);
        }
      }
    } catch {
      // ignore
    }
  }, [story.slug, readerToolsEnabled]);

  const handlePrefetch = () => {
    router.prefetch(`/story/${story.slug}`);
  };

  const romanNumeral = toRomanNumeral(index + 1);

  return (
    <Link
      href={`/story/${story.slug}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="group block p-5 sm:p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all duration-200 hover:shadow-[0_4px_16px_rgba(43,29,20,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Compact Numeral & Title */}
        <div className="flex items-baseline gap-3.5">
          <div className="shrink-0 w-8 flex items-center gap-1">
            <span className="font-serif text-xs sm:text-sm font-semibold text-[var(--color-terracotta)] uppercase tracking-wider">
              {romanNumeral}
            </span>
            {isCompleted && (
              <span
                title="Chapter completed"
                aria-label="Chapter completed"
                className="inline-flex items-center text-[var(--color-banyan)]"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            )}
          </div>
          <div>
            <h2 className="font-serif text-base sm:text-lg lg:text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
              {story.title}
            </h2>
            {story.subtitle && (
              <p className="font-serif italic text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                {story.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Metadata: Year & Read Time */}
        <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] font-serif shrink-0 mt-0.5">
          {story.year && (
            <span className="inline-flex items-center gap-1 text-[var(--color-banyan)]">
              <Calendar className="w-3 h-3" />
              <span>{story.year}</span>
            </span>
          )}
          {story.year && <span>•</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{story.reading_time}</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-terracotta)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block ml-1" />
        </div>
      </div>

      {/* Excerpt clamped at word boundary */}
      <p className="mt-3 pl-11 text-xs sm:text-sm text-[var(--text-secondary)] font-serif leading-relaxed line-clamp-2">
        {truncateAtWord(story.excerpt || '', 160)}
      </p>
    </Link>
  );
}
