import React from 'react';
import Link from 'next/link';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PhotoPlate } from '@/components/PhotoPlate';
import { sampleStories } from '@/data/sampleStories';
import { BookOpen, ArrowRight, Sparkles, Feather } from 'lucide-react';

export default function HomePage() {
  const firstStory = sampleStories[0];

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        
        {/* Overline Colophon */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--color-banyan)] text-xs uppercase tracking-[0.2em]">
          <Feather className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
          <span>A Short Story Collection</span>
        </div>

        {/* Book Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[var(--text-primary)] leading-[1.15]">
          Dust <span className="italic font-light text-[var(--color-diya)]">&amp;</span> Dazzle
        </h1>

        {/* Subtitle */}
        <p className="mt-4 font-serif italic text-xl sm:text-2xl text-[var(--text-secondary)] tracking-wide">
          Tales from a Village and a City
        </p>

        {/* Author Byline */}
        <p className="mt-4 font-serif text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
          By Ajeet Kumar Singh
        </p>

        <DiyaDivider variant="flourish" className="my-8 sm:my-10" />

        {/* Frontispiece Archival Photograph Plate */}
        <div className="my-8 sm:my-12">
          <PhotoPlate
            src="/images/sample-grandfather.png"
            alt="Frontispiece: Vintage sepia portrait under the banyan tree"
            caption="Frontispiece: Beneath the ancestral banyan canopy at twilight, c. 1970s Awadh"
            effect="tape-corners"
            width={720}
            height={500}
          />
        </div>

        {/* Dedication / Epigraph Inset Card */}
        <div className="my-10 p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm max-w-xl mx-auto shadow-[0_2px_12px_rgba(43,29,20,0.04)]">
          <p className="font-serif italic text-base sm:text-lg text-[var(--text-primary)] leading-relaxed">
            &ldquo;For the red earth of the village paths that gave us our first steps, and the shimmering city towers where our dreams took flight.&rdquo;
          </p>
          <div className="mt-4 text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
            — Dedication
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href={`/story/${firstStory.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-sm bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif text-base font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.99]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Begin Reading Chapter I</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/toc"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm border border-[var(--border-strong)] bg-transparent hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-serif text-base transition-all"
          >
            <span>Table of Contents</span>
          </Link>
        </div>

        <DiyaDivider variant="asterisk" className="my-14" />

        {/* Continuous Chapter Sequence Preview */}
        <div className="text-left mt-12">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border-subtle)]">
            <h2 className="font-serif text-xl sm:text-2xl text-[var(--text-primary)] font-normal">
              Collected Stories in Sequence
            </h2>
            <Link
              href="/toc"
              className="text-xs uppercase tracking-wider text-[var(--color-terracotta)] hover:underline flex items-center gap-1 font-serif"
            >
              <span>View All 16</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {sampleStories.slice(0, 4).map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group block p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm transition-all hover:shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
                      {story.chapter_label}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                      {story.title.replace(/^\[Placeholder\]\s*/, '')}
                    </h3>
                  </div>
                  {story.year && (
                    <span className="text-xs text-[var(--color-banyan)] font-serif italic shrink-0">
                      {story.year}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-secondary)] font-serif line-clamp-2">
                  {story.excerpt.replace(/^\[Placeholder Excerpt:\s*/, '').replace(/\]$/, '')}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
