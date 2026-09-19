import { createClient } from '@/lib/supabase/server';
import { sampleStories } from '@/data/sampleStories';
import { Story } from '@/types/story';

/**
 * Fetch all published stories in sequential order.
 * Strictly respects visibility = 'published'.
 */
export async function getPublishedStories(): Promise<Story[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Graceful fallback to sample placeholder dataset when Supabase credentials are pending
    return sampleStories.filter((s) => s.visibility === 'published');
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('visibility', 'published')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return sampleStories.filter((s) => s.visibility === 'published');
    }

    return data as Story[];
  } catch {
    return sampleStories.filter((s) => s.visibility === 'published');
  }
}

/**
 * Fetch a single story by its slug.
 * Public requests only return if visibility = 'published'.
 */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const story = sampleStories.find((s) => s.slug === slug);
    return story && story.visibility === 'published' ? story : null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .eq('visibility', 'published')
      .maybeSingle();

    if (error || !data) {
      const fallback = sampleStories.find((s) => s.slug === slug);
      return fallback && fallback.visibility === 'published' ? fallback : null;
    }

    return data as Story;
  } catch {
    const fallback = sampleStories.find((s) => s.slug === slug);
    return fallback && fallback.visibility === 'published' ? fallback : null;
  }
}
