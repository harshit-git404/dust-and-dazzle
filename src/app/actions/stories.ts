'use server';

import { createClient } from '@/lib/supabase/server';
import { sanitizeStoryHtml } from '@/lib/sanitizer';
import { calculateReadingTime, generateExcerpt, slugify } from '@/lib/editor-utils';
import { Story, StoryVisibility } from '@/types/story';
import { revalidatePath } from 'next/cache';

export interface SaveStoryInput {
  id?: string;
  title: string;
  subtitle?: string | null;
  chapter_label?: string;
  year?: string | null;
  excerpt?: string;
  content_html: string;
  content_json?: Record<string, unknown> | null;
  visibility: StoryVisibility;
  allow_comments?: boolean;
  lastKnownUpdatedAt?: string | null;
}

export interface SaveStoryResult {
  success: boolean;
  story?: Story;
  error?: string;
  conflict?: boolean;
}

/**
 * Verify author authorization via supabase server client and database RLS.
 */
async function verifyAuthorOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated.');
  }

  const { data: isAuthor } = await supabase.rpc('is_author');
  if (isAuthor === false) {
    const { data: authorRecord } = await supabase
      .from('authors')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!authorRecord) {
      throw new Error('Not authorised.');
    }
  }

  return { supabase, user };
}

/**
 * Save / Autosave a story:
 * - Sanitizes HTML.
 * - Computes reading time and auto-generates excerpt if blank.
 * - Enforces concurrency check against lastKnownUpdatedAt.
 * - Preserves existing slug for published/saved stories.
 */
export async function saveStoryAction(input: SaveStoryInput): Promise<SaveStoryResult> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const title = input.title?.trim() || 'Untitled Chapter';
    const sanitizedHtml = sanitizeStoryHtml(input.content_html || '');
    const { readingTime } = calculateReadingTime(sanitizedHtml);
    const excerpt = input.excerpt?.trim() || generateExcerpt(sanitizedHtml);

    // 1. Concurrency check & Slug stability for existing story
    let slug = '';
    let chapterLabel = input.chapter_label;
    let orderIndex = 1;

    if (input.id) {
      const { data: existing, error: fetchErr } = await supabase
        .from('stories')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchErr || !existing) {
        return { success: false, error: 'Story not found.' };
      }

      // Concurrency guard: check if database record was modified since editor opened
      if (
        input.lastKnownUpdatedAt &&
        existing.updated_at &&
        new Date(existing.updated_at).getTime() > new Date(input.lastKnownUpdatedAt).getTime() + 1000
      ) {
        return {
          success: false,
          conflict: true,
          error:
            'This story was modified elsewhere (e.g. in another tab or device) since you loaded it. Please review to avoid losing edits.',
        };
      }

      // Preserve stable slug
      slug = existing.slug;
      chapterLabel = input.chapter_label || existing.chapter_label;
      orderIndex = existing.order_index;
    } else {
      // New story: compute next order_index and unique slug
      const { data: allStories } = await supabase
        .from('stories')
        .select('order_index, slug')
        .order('order_index', { ascending: false });

      const maxOrder = allStories && allStories.length > 0 ? allStories[0].order_index : 0;
      orderIndex = maxOrder + 1;

      const baseSlug = slugify(title) || `chapter-${orderIndex}`;
      let candidateSlug = baseSlug;
      let counter = 1;

      const existingSlugs = new Set((allStories || []).map((s) => s.slug));
      while (existingSlugs.has(candidateSlug)) {
        candidateSlug = `${baseSlug}-${counter++}`;
      }
      slug = candidateSlug;

      if (!chapterLabel) {
        chapterLabel = `Chapter ${orderIndex}`;
      }
    }

    const payload: Partial<Story> = {
      title,
      subtitle: input.subtitle?.trim() || null,
      chapter_label: chapterLabel,
      order_index: orderIndex,
      slug,
      year: input.year?.trim() || null,
      excerpt,
      content_html: sanitizedHtml,
      content_json: input.content_json || null,
      visibility: input.visibility,
      allow_comments: input.allow_comments !== undefined ? input.allow_comments : true,
    };

    let resultStory: Story;

    if (input.id) {
      const { data, error } = await supabase
        .from('stories')
        .update(payload)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) throw error;
      resultStory = data as Story;
    } else {
      const { data, error } = await supabase
        .from('stories')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      resultStory = data as Story;
    }

    revalidatePath('/admin');
    revalidatePath('/toc');
    revalidatePath(`/story/${slug}`);
    revalidatePath('/');

    return {
      success: true,
      story: resultStory,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save story';
    return { success: false, error: message };
  }
}

/**
 * Quick toggle story visibility (Draft / Published / Private).
 */
export async function updateStoryVisibilityAction(
  storyId: string,
  visibility: StoryVisibility
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { error } = await supabase
      .from('stories')
      .update({ visibility })
      .eq('id', storyId);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/toc');
    revalidatePath('/');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

/**
 * Reorder stories sequentially.
 */
export async function reorderStoriesAction(
  orderedStoryIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    // Update each story with its new order_index
    for (let i = 0; i < orderedStoryIds.length; i++) {
      const id = orderedStoryIds[i];
      const { error } = await supabase
        .from('stories')
        .update({ order_index: i + 1 })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/admin');
    revalidatePath('/toc');
    revalidatePath('/');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Reorder failed' };
  }
}

/**
 * Delete a story deliberately.
 */
export async function deleteStoryAction(
  storyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { error } = await supabase.from('stories').delete().eq('id', storyId);

    if (error) throw error;

    // Resequence remaining stories
    const { data: remaining } = await supabase
      .from('stories')
      .select('id')
      .order('order_index', { ascending: true });

    if (remaining) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase
          .from('stories')
          .update({ order_index: i + 1 })
          .eq('id', remaining[i].id);
      }
    }

    revalidatePath('/admin');
    revalidatePath('/toc');
    revalidatePath('/');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

/**
 * Change Author Password.
 */
export async function changePasswordAction(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Password update failed' };
  }
}

/**
 * Export all stories as JSON and Markdown files for backup.
 */
export async function exportAllStoriesData(): Promise<{
  success: boolean;
  stories?: Story[];
  error?: string;
}> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    return { success: true, stories: (data as Story[]) || [] };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Export failed' };
  }
}
