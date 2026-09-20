import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types/story';

export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  chapter_label: string;
  order_index: number;
  year?: string | null;
  reading_time?: string;
  headline: string;
}

/**
 * Searches published stories.
 * Primary: Calls search_published_stories RPC in database.
 * Fallback: Fails soft if RPC or migration is missing by performing ILIKE search on published stories.
 */
export async function searchStories(query: string): Promise<SearchResultItem[]> {
  const cleanQ = query.trim().slice(0, 100);
  if (!cleanQ) return [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const supabase = await createClient();

    // 1. Attempt RPC search
    const { data: rpcData, error: rpcError } = await supabase.rpc('search_published_stories', {
      q: cleanQ,
    });

    if (!rpcError && rpcData && Array.isArray(rpcData)) {
      return rpcData as SearchResultItem[];
    }

    // 2. Soft-fail fallback: client-side / direct query on published stories
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('id, slug, title, subtitle, chapter_label, order_index, year, reading_time, excerpt, content_html')
      .eq('visibility', 'published')
      .order('order_index', { ascending: true });

    if (storiesError || !storiesData) return [];

    const lowerQ = cleanQ.toLowerCase();
    const matches: SearchResultItem[] = [];

    for (const s of storiesData) {
      const titleMatch = s.title?.toLowerCase().includes(lowerQ);
      const subtitleMatch = s.subtitle?.toLowerCase().includes(lowerQ);
      const excerptMatch = s.excerpt?.toLowerCase().includes(lowerQ);
      const contentMatch = s.content_html?.toLowerCase().includes(lowerQ);

      if (titleMatch || subtitleMatch || excerptMatch || contentMatch) {
        // Build simple headline with markers
        let rawHeadline = s.excerpt || s.title;
        const index = rawHeadline.toLowerCase().indexOf(lowerQ);
        if (index !== -1) {
          const matchWord = rawHeadline.slice(index, index + lowerQ.length);
          rawHeadline = rawHeadline.slice(0, index) + `[[${matchWord}]]` + rawHeadline.slice(index + lowerQ.length);
        }

        matches.push({
          id: s.id,
          slug: s.slug,
          title: s.title,
          subtitle: s.subtitle,
          chapter_label: s.chapter_label,
          order_index: s.order_index,
          year: s.year,
          reading_time: s.reading_time,
          headline: rawHeadline,
        });

        if (matches.length >= 20) break;
      }
    }

    return matches;
  } catch (err) {
    console.warn('Search query failed softly:', err);
    return [];
  }
}

/**
 * Safely parse a headline string with [[ and ]] markers into React elements.
 * STRICTLY avoids dangerouslySetInnerHTML.
 */
export function renderHighlightedSnippet(headline: string): React.ReactNode[] {
  if (!headline) return [];

  const parts: React.ReactNode[] = [];
  const regex = /\[\[(.*?)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(headline)) !== null) {
    const textBefore = headline.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }

    parts.push(
      React.createElement(
        'mark',
        {
          key: `highlight-${match.index}`,
          className:
            'bg-[var(--color-diya)]/30 text-[var(--text-primary)] font-medium px-0.5 rounded-xs underline decoration-[var(--color-terracotta)]/40',
        },
        match[1]
      )
    );

    lastIndex = regex.lastIndex;
  }

  const remaining = headline.slice(lastIndex);
  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}
