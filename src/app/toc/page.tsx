import React from 'react';
import Link from 'next/link';
import { getPublishedStories } from '@/lib/stories';
import { DiyaDivider } from '@/components/DiyaDivider';
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Table of Contents — Dust and Dazzle',
  description: 'Continuous index of short stories in Dust and Dazzle by Ajeet Kumar Singh.',
};

export default async function TableOfContentsPage() {
  const publishedStories = await getPublishedStories();

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-medium">
            Memoir Index
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Table of Contents
          </h1>
          <p className="mt-3 font-serif italic text-base sm:text-lg text-[var(--text-secondary)]">
            Sixteen tales traversed across fifty seasons of memory
          </p>
          <DiyaDivider variant="flourish" className="my-8" />
        </div>

        {/* Continuous Story List (No tags, categories, or filters) */}
        <div className="space-y-4 sm:space-y-5">
          {publishedStories.map((story, index) => (
            <Link
              key={story.id}
              href={`/story/${story.slug}`}
              className="group block p-5 sm:p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm transition-all duration-200 hover:shadow-[0_4px_12px_rgba(43,29,20,0.06)] hover:border-[var(--color-terracotta)]/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
                
                {/* Chapter & Title */}
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="font-serif text-xs sm:text-sm font-semibold text-[var(--color-terracotta)] uppercase tracking-wider shrink-0 w-24">
                    {story.chapter_label}
                  </span>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                      {story.title.replace(/^\[Placeholder\]\s*/, '')}
                    </h2>
                    {story.subtitle && (
                      <p className="font-serif italic text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                        {story.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata: Year & Read Time */}
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-serif shrink-0 mt-2 sm:mt-0 pl-27 sm:pl-0">
                  {story.year && (
                    <span className="inline-flex items-center gap-1 text-[var(--color-banyan)]">
                      <Calendar className="w-3 h-3" />
                      <span>{story.year}</span>
                    </span>
                  )}
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{story.reading_time}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-terracotta)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block ml-1" />
                </div>

              </div>

              {/* Excerpt */}
              <p className="mt-3 pl-0 sm:pl-28 text-xs sm:text-sm text-[var(--text-secondary)] font-serif leading-relaxed line-clamp-2">
                {story.excerpt.replace(/^\[Placeholder Excerpt:\s*/, '').replace(/\]$/, '')}
              </p>
            </Link>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link
            href={`/story/${publishedStories[0]?.slug || 'chapter-1-the-ancestral-soil'}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif rounded-sm shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start from Chapter I</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
