import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/features';
import { searchStories, renderHighlightedSnippet } from '@/lib/search';
import { SearchInput } from '@/components/search/SearchInput';
import { DiyaDivider } from '@/components/DiyaDivider';
import { Search as SearchIcon, ArrowRight, BookOpen, Clock, Calendar, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search the Collection — Dust and Dazzle',
  description: 'Search stories, memories, and chapters in Dust and Dazzle by Ajeet Kumar Singh.',
  robots: {
    index: false,
    follow: false,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  if (!isFeatureEnabled('SEARCH')) {
    notFound();
  }

  const { q } = await searchParams;
  const query = (q || '').trim();
  const results = query ? await searchStories(query) : [];

  return (
    <div className="py-8 sm:py-14 lg:py-18 px-4 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto font-serif">
        
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

        {/* Search Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--color-banyan)] text-xs uppercase tracking-[0.2em]">
            <SearchIcon className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
            <span>Manuscript Search</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[var(--text-primary)]">
            Search the Collection
          </h1>
          <p className="mt-2 font-serif italic text-xs sm:text-sm text-[var(--text-secondary)]">
            Explore sixteenth chapters of village soil, migration, and city light.
          </p>
        </div>

        {/* Client-Side Search Form (Smooth SPA Navigation, No Flash) */}
        <SearchInput initialQuery={query} />

        <DiyaDivider variant="flourish" className="my-8" />

        {/* Search Results / States */}
        {query ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)]">
              <span>
                Found {results.length} {results.length === 1 ? 'passage' : 'passages'} for &ldquo;{query}&rdquo;
              </span>
            </div>

            {results.length > 0 ? (
              <div className="space-y-5">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/story/${item.slug}`}
                    className="group block p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all hover:shadow-[0_4px_16px_rgba(43,29,20,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-[var(--color-terracotta)] font-semibold mb-0.5">
                          {item.chapter_label}
                        </div>
                        <h2 className="text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                          {item.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] shrink-0">
                        {item.year && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-banyan)]">
                            <Calendar className="w-3 h-3" />
                            <span>{item.year}</span>
                          </span>
                        )}
                        {item.reading_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.reading_time}</span>
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-terracotta)] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      </div>
                    </div>

                    {/* Highlighted Snippet */}
                    <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      &ldquo;{renderHighlightedSnippet(item.headline)}&rdquo;
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm text-center space-y-3">
                <p className="italic text-sm text-[var(--text-secondary)]">
                  No passages found matching &ldquo;{query}&rdquo;.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Try searching for broader keywords like village names, family memories, or seasons.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm text-center space-y-4">
            <BookOpen className="w-6 h-6 text-[var(--color-terracotta)]/60 mx-auto" />
            <p className="italic text-sm text-[var(--text-secondary)]">
              Enter a search word above to search across all published chapters and reflections.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[var(--text-muted)] pt-2">
              <span>Try searching:</span>
              {['Pillar', 'Village', 'Rain', 'Courtyard', 'Father', 'Tea'].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-2.5 py-1 bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-[var(--color-terracotta)] hover:underline"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
