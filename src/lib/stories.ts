import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types/story';

/**
 * Fetch all published stories in sequential order.
 * Strictly respects visibility = 'published'.
 * Returns an empty array if no stories are published or database is empty.
 */
export async function getPublishedStories(): Promise<Story[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('visibility', 'published')
      .order('order_index', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as Story[];
  } catch {
    return [];
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
    return null;
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
      return null;
    }

    return data as Story;
  } catch {
    return null;
  }
}

