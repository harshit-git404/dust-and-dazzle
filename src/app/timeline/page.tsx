import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedStories } from '@/lib/stories';
import { isFeatureEnabled } from '@/lib/features';
import { DiyaDivider } from '@/components/DiyaDivider';
import { truncateAtWord, toRomanNumeral } from '@/lib/editor-utils';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Story } from '@/types/story';

export const metadata: Metadata = {
  title: 'Chronological Timeline — Dust and Dazzle',
  description: 'A chronological timeline of memories, village life, and urban migration by Ajeet Kumar Singh.',
};

function extractYear(yearStr?: string | null): number {
  if (!yearStr) return 9999;
  const match = yearStr.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : 9999;
}

function getDecade(year: number): string {
  if (year >= 9999) return 'Other Memories';
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

export default async function TimelinePage() {
  if (!isFeatureEnabled('TIMELINE')) {
    notFound();
  }

  const publishedStories = await getPublishedStories();
  const storiesWithYear = publishedStories.filter(
    (s) => s.year && s.year.trim().length > 0 && extractYear(s.year) < 9999
  );

  // Require at least 3 stories with a year set
  if (storiesWithYear.length < 3) {
    notFound();
  }

  // Sort stories chronologically by year, then by order_index
  const sortedStories = [...storiesWithYear].sort((a, b) => {
    const yearA = extractYear(a.year);
    const yearB = extractYear(b.year);
    if (yearA !== yearB) return yearA - yearB;
    return a.order_index - b.order_index;
  });

  // Group by decade
  const decadeGroups: { [decade: string]: Story[] } = {};
  for (const story of sortedStories) {
    const dec = getDecade(extractYear(story.year));
    if (!decadeGroups[dec]) {
      decadeGroups[dec] = [];
    }
    decadeGroups[dec].push(story);
  }

  return (
    <div className="py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto font-serif">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Collection</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--color-banyan)] text-xs uppercase tracking-[0.2em]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
            <span>Chronological Arc</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal text-[var(--text-primary)] tracking-tight">
            Timeline of Tales
          </h1>
          <p className="mt-3 font-serif italic text-sm sm:text-base text-[var(--text-secondary)]">
            A journey across the years from the ancestral village through the burgeoning city.
          </p>
          <DiyaDivider variant="flourish" className="my-6 sm:my-8" />
        </div>

        {/* Timeline Layout */}
        <div className="relative pl-6 sm:pl-10 space-y-12 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-2 sm:before:left-4 before:w-0.5 before:bg-[var(--border-subtle)]">
          
          {Object.entries(decadeGroups).map(([decade, storiesInDecade]) => (
            <div key={decade} className="space-y-6 relative">
              
              {/* Decade Marker Dot & Heading */}
              <div className="flex items-center gap-3 -ml-6 sm:-ml-10">
                <div className="w-4 h-4 rounded-full bg-[var(--color-terracotta)] border-4 border-[var(--bg-canvas)] shadow-xs shrink-0" />
                <h2 className="text-xl sm:text-2xl font-normal text-[var(--color-terracotta)] uppercase tracking-wider font-serif">
                  {decade}
                </h2>
              </div>

              {/* Stories in this decade */}
              <div className="space-y-4">
                {storiesInDecade.map((story) => (
                  <Link
                    key={story.id}
                    href={`/story/${story.slug}`}
                    className="group block p-5 sm:p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all hover:shadow-[0_4px_16px_rgba(43,29,20,0.06)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 mb-2 border-b border-[var(--border-subtle)]/60">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-xs font-semibold text-[var(--color-terracotta)] uppercase tracking-wider">
                          {story.chapter_label}
                        </span>
                        <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                          {story.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] shrink-0">
                        <span className="inline-flex items-center gap-1 font-mono font-medium text-[var(--color-banyan)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{story.year}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{story.reading_time}</span>
                        </span>
                      </div>
                    </div>

                    {story.subtitle && (
                      <p className="italic text-xs text-[var(--text-secondary)] mb-2">
                        {story.subtitle}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-serif leading-relaxed line-clamp-2">
                      {truncateAtWord(story.excerpt || '', 160)}
                    </p>

                    <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-terracotta)] font-medium">
                      <span>Read Chapter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
