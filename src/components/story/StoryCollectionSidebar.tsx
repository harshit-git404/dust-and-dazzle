'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Story } from '@/types/story';
import { toRomanNumeral } from '@/lib/editor-utils';
import { isFeatureEnabled } from '@/lib/features';
import { StoryShare } from '@/components/story/StoryShare';
import { ListFilter } from 'lucide-react';

interface StoryCollectionSidebarProps {
  stories: Story[];
  currentSlug: string;
}

export function StoryCollectionSidebar({
  stories,
  currentSlug,
}: StoryCollectionSidebarProps) {
  const activeRef = useRef<HTMLAnchorElement | null>(null);
  const readerToolsEnabled = isFeatureEnabled('READER_TOOLS');
  const currentStory = stories.find((s) => s.slug === currentSlug);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSlug]);

  return (
    <aside className="hidden xl:block w-[260px] shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 space-y-4">
        
        {/* Sidebar Header */}
        <div className="pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-serif tracking-[0.2em] font-semibold text-[var(--text-muted)]">
              In this collection
            </h2>
            <span className="text-[11px] font-serif text-[var(--text-muted)]">
              {stories.length} chapters
            </span>
          </div>
        </div>

        {/* Story List */}
        <nav className="space-y-1 font-serif" aria-label="Collection Stories">
          {stories.map((story, index) => {
            const isActive = story.slug === currentSlug;
            const romanNumeral = toRomanNumeral(index + 1);

            return (
              <Link
                key={story.id}
                ref={isActive ? activeRef : null}
                href={`/story/${story.slug}`}
                className={`group flex items-start gap-2.5 px-3 py-2 rounded-sm text-xs transition-all ${
                  isActive
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--color-terracotta)] font-semibold border-l-2 border-[var(--color-terracotta)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <span className={`w-5 shrink-0 text-right ${isActive ? 'text-[var(--color-terracotta)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                  {romanNumeral}.
                </span>
                <span className="line-clamp-2 leading-relaxed">
                  {story.title.replace(/^\[Placeholder\]\s*/, '')}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Contents & Share */}
        <div className="pt-3 border-t border-[var(--border-subtle)]/70 flex flex-col gap-2.5">
          <Link
            href="/toc"
            className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider text-[var(--color-terracotta)] hover:underline"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Table of Contents</span>
          </Link>

          {readerToolsEnabled && (
            <div className="pt-1">
              <StoryShare
                title={currentStory?.title || 'Story'}
                slug={currentSlug}
                className="w-full"
              />
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
