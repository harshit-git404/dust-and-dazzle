import React from 'react';
import Link from 'next/link';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PhotoPlate } from '@/components/PhotoPlate';
import { ContinueReadingBanner } from '@/components/story/ContinueReadingBanner';
import { getPublishedStories } from '@/lib/stories';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { isFeatureEnabled } from '@/lib/features';
import { truncateAtWord, toRomanNumeral } from '@/lib/editor-utils';
import { BookOpen, ArrowRight, Feather, Clock, Calendar } from 'lucide-react';

export default async function HomePage() {
  const publishedStories = await getPublishedStories();
  const settings = await getSiteSettingsAction();
  const firstStory = publishedStories[0] || { slug: 'the-forgotten-pillar' };
  const validSlugs = publishedStories.map((s) => s.slug);
  const readerToolsEnabled = isFeatureEnabled('READER_TOOLS');

  return (
    <div className="pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Above the Fold: Two-Page Spread on Wide Screens */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left Spread: Book Title Page */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start justify-start pt-1 lg:pt-2">
            
            {/* Overline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--color-banyan)] text-xs uppercase tracking-[0.2em]">
              <Feather className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
              <span>A Short Story Collection</span>
            </div>

            {/* Main Book Title */}
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl font-normal tracking-tight text-[var(--text-primary)] leading-[1.12]">
              Dust and Dazzle
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 font-serif italic text-lg sm:text-xl xl:text-2xl text-[var(--text-secondary)] tracking-wide">
              Tales from a Village and a City
            </p>

            {/* Author Byline */}
            <p className="mt-2 font-serif text-xs sm:text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
              By Ajeet Kumar Singh
            </p>

            <DiyaDivider variant="flourish" className="my-4 sm:my-5 w-full max-w-md" />

            {/* Continue Reading Bookmark Link (If reader was mid-story) */}
            {readerToolsEnabled && <ContinueReadingBanner validSlugs={validSlugs} />}

            {/* Dedication Card (Only if present in settings) */}
            {settings.dedication && (
              <div className="my-1.5 p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm max-w-lg shadow-[0_2px_8px_rgba(43,29,20,0.04)] text-center lg:text-left">
                <p className="font-serif italic text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  &ldquo;{settings.dedication}&rdquo;
                </p>
                <div className="mt-2.5 text-[11px] uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
                  — Dedication
                </div>
              </div>
            )}

            {/* Primary Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-5 sm:mt-6 w-full sm:w-auto">
              <Link
                href={`/story/${firstStory.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-sm bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif text-sm sm:text-base font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.99]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Begin Reading</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/toc"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm border border-[var(--border-strong)] bg-transparent hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-serif text-sm sm:text-base transition-all"
              >
                <span>Table of Contents</span>
              </Link>
            </div>

          </div>

          {/* Right Spread: Frontispiece Archival Portrait Plate */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md lg:max-w-lg">
              <PhotoPlate
                src={settings.portrait_url || '/images/sample-grandfather.png'}
                alt={settings.portrait_caption || 'Ajeet Kumar Singh, Author'}
                caption={settings.portrait_caption || 'Ajeet Kumar Singh, Author & Chronicler'}
                effect="tape-corners"
                width={800}
                height={550}
                className="!my-0"
              />
            </div>

            {/* Author Bio (if configured in settings) */}
            {settings.author_bio && (
              <div className="mt-4 p-4 bg-[var(--bg-surface)]/60 border border-[var(--border-subtle)]/60 rounded-sm max-w-md text-center">
                <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {settings.author_bio}
                </p>
              </div>
            )}
          </div>

        </section>

        <DiyaDivider variant="asterisk" className="my-16 lg:my-20" />

        {/* Below the Fold: Collected Stories in Sequence (Two Columns on Wide Screens) */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-normal">
                Collected Stories in Sequence
              </h2>
              <p className="font-serif italic text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                A continuous journey through sixteen chapters of memory, landscape, and time.
              </p>
            </div>
            {publishedStories.length > 0 && (
              <Link
                href="/toc"
                className="text-xs uppercase tracking-wider text-[var(--color-terracotta)] hover:underline flex items-center gap-1 font-serif shrink-0 font-medium"
              >
                <span>View Full Contents ({publishedStories.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {publishedStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              {publishedStories.map((story, index) => {
                const romanIndex = toRomanNumeral(index + 1);
                return (
                  <Link
                    key={story.id}
                    href={`/story/${story.slug}`}
                    className="group block p-5 sm:p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all hover:shadow-[0_4px_16px_rgba(43,29,20,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <span className="font-serif text-xs font-semibold text-[var(--color-terracotta)] uppercase tracking-wider shrink-0 w-8">
                          {romanIndex}
                        </span>
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors font-medium">
                            {story.title}
                          </h3>
                          {story.subtitle && (
                            <p className="font-serif italic text-xs text-[var(--text-muted)] mt-0.5">
                              {story.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-serif shrink-0">
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
                      </div>
                    </div>

                    {/* Excerpt with word-boundary clamp */}
                    <p className="mt-3 pl-11 text-xs sm:text-sm text-[var(--text-secondary)] font-serif leading-relaxed line-clamp-2">
                      {truncateAtWord(story.excerpt || '', 150)}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm text-center font-serif text-sm text-[var(--text-secondary)] italic">
              All 16 manuscript chapters are currently preserved in <strong>draft mode</strong> in the Author Studio. Publish chapters from the Studio to display them here.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
