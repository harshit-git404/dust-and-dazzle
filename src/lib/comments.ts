import { createClient } from '@/lib/supabase/server';

export interface PublicComment {
  id: string;
  story_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

/**
 * Fetch approved reader comments for a story.
 * Strictly queries the public `approved_comments` view which completely omits author_email.
 */
export async function getApprovedComments(storyId: string): Promise<PublicComment[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('approved_comments')
      .select('id, story_id, author_name, content, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as PublicComment[];
  } catch {
    return [];
  }
}
