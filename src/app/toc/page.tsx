import React from 'react';
import Link from 'next/link';
import { getPublishedStories } from '@/lib/stories';
import { DiyaDivider } from '@/components/DiyaDivider';
import { TocItem } from '@/components/story/TocItem';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contents — Dust and Dazzle',
  description: 'Complete contents of stories in Dust and Dazzle by Ajeet Kumar Singh.',
};

export default async function TableOfContentsPage() {
  const publishedStories = await getPublishedStories();

  return (
    <div className="py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-medium">
            Manuscript Index
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[var(--text-primary)]">
            Contents <span className="font-light text-2xl sm:text-4xl text-[var(--text-muted)]">({publishedStories.length})</span>
          </h1>
          <p className="mt-3 font-serif italic text-sm sm:text-base text-[var(--text-secondary)]">
            A chronological sequence of sixteen tales through village dust and city light
          </p>
          <DiyaDivider variant="flourish" className="my-6 sm:my-8" />
        </div>

        {/* Two-Column Grid on Wide Screens (>= 1200px) */}
        {publishedStories.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
            {publishedStories.map((story, index) => (
              <TocItem key={story.id} story={story} index={index} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm text-center font-serif text-sm text-[var(--text-secondary)] italic space-y-3 max-w-xl mx-auto">
            <p>All 16 manuscript chapters are currently imported in <strong>draft mode</strong>.</p>
            <p className="text-xs text-[var(--text-muted)]">
              Sign in to the <Link href="/login" className="text-[var(--color-terracotta)] underline">Author Studio</Link> to preview and publish chapters to the public Table of Contents.
            </p>
          </div>
        )}

        {/* Bottom Navigation */}
        {publishedStories.length > 0 && (
          <div className="mt-14 lg:mt-18 text-center">
            <Link
              href={`/story/${publishedStories[0].slug}`}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif text-sm sm:text-base font-medium rounded-sm shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Begin Reading Chapter I</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
