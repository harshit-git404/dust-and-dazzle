'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubmitCommentInput {
  storyId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  honeypot?: string; // Hidden anti-spam field (must remain empty)
  renderTimeToken?: string; // Form render timestamp token for minimum time check
}

export interface AdminComment {
  id: string;
  story_id: string;
  story_title?: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

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
 * Public Reader Comment Submission Server Action:
 * - Validates story comments allowed status.
 * - Anti-spam: Honeypot check.
 * - Anti-spam: Minimum submission time threshold (≥ 3 seconds).
 * - Anti-spam: Database-backed IP rate-limiting (max 5 comments per 10 mins).
 * - Limits length and strips dangerous characters.
 * - Strictly inserts with is_approved = false.
 */
export async function submitCommentAction(input: SubmitCommentInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. Honeypot check
    if (input.honeypot && input.honeypot.trim().length > 0) {
      // Silently drop bot submission
      return { success: true };
    }

    // 2. Minimum time-to-submit check (bots fill forms in < 1-2 seconds)
    if (input.renderTimeToken) {
      try {
        const renderTime = parseInt(input.renderTimeToken, 10);
        const elapsedMs = Date.now() - renderTime;
        if (elapsedMs < 3000) {
          return {
            success: false,
            error: 'Submission was too fast. Please take a moment to reflect before submitting.',
          };
        }
      } catch {
        // Invalid token
      }
    }

    // 3. Input validation & length limits
    const name = input.authorName?.trim();
    const content = input.content?.trim();
    const email = input.authorEmail?.trim() || null;

    if (!name || name.length < 1 || name.length > 80) {
      return { success: false, error: 'Please enter a valid name (1 to 80 characters).' };
    }

    if (!content || content.length < 1 || content.length > 2000) {
      return { success: false, error: 'Reflection must be between 1 and 2,000 characters.' };
    }

    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return { success: false, error: 'Please enter a valid email address or leave it blank.' };
    }

    // 4. IP Extraction and Hashing for rate limiting
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for') || '';
    const realIp = forwardedFor.split(',')[0].trim() || headerList.get('x-real-ip') || '127.0.0.1';
    const salt = process.env.IP_HASH_SALT || 'dust-and-dazzle-archival-salt-2026';
    const ipHash = crypto
      .createHash('sha256')
      .update(`${realIp}:${salt}`)
      .digest('hex')
      .substring(0, 32);

    const supabase = await createClient();

    // 5. Submit via secure RPC function (runs as SECURITY DEFINER using anon key)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_reader_comment', {
      p_story_id: input.storyId,
      p_author_name: name,
      p_author_email: email,
      p_content: content,
      p_ip_hash: ipHash,
    });

    if (!rpcErr && rpcData) {
      if (rpcData.success === false) {
        return { success: false, error: rpcData.error || 'Submission failed.' };
      }
      return { success: true };
    }

    // 6. Direct Table Fallback (if RPC is not installed)
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, allow_comments, visibility')
      .eq('id', input.storyId)
      .single();

    if (storyErr || !story || story.visibility !== 'published') {
      return { success: false, error: 'Story not found or unavailable.' };
    }

    if (story.allow_comments === false) {
      return { success: false, error: 'Reflections are closed for this chapter.' };
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from('comment_rate_limits')
      .select('id')
      .eq('ip_hash', ipHash)
      .gte('created_at', tenMinutesAgo);

    if (recentAttempts && recentAttempts.length >= 5) {
      return {
        success: false,
        error: 'Too many reflections submitted recently. Please try again later.',
      };
    }

    await supabase.from('comment_rate_limits').insert({ ip_hash: ipHash });

    const { error: insertErr } = await supabase.from('comments').insert({
      story_id: input.storyId,
      author_name: name,
      author_email: email,
      content: content,
      is_approved: false,
    });

    if (insertErr) {
      throw insertErr;
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return { success: false, error: message };
  }
}

/**
 * Author Action: Fetch pending / unapproved comments for moderation queue.
 */
export async function getPendingCommentsAction(): Promise<{
  success: boolean;
  comments?: AdminComment[];
  error?: string;
}> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { data, error } = await supabase
      .from('comments')
      .select('id, story_id, author_name, author_email, content, is_approved, created_at, stories(title)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted: AdminComment[] = (data || []).map((row: any) => ({
      id: row.id,
      story_id: row.story_id,
      story_title: row.stories?.title || 'Unknown Story',
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      is_approved: row.is_approved,
      created_at: row.created_at,
    }));

    return { success: true, comments: formatted };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load comments' };
  }
}

/**
 * Author Action: Approve a comment.
 */
export async function approveCommentAction(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { error } = await supabase
      .from('comments')
      .update({ is_approved: true })
      .eq('id', commentId);

    if (error) throw error;

    revalidatePath('/admin/comments');
    revalidatePath('/admin');
    revalidatePath('/story/[slug]', 'page');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Approval failed' };
  }
}

/**
 * Author Action: Delete / Reject a comment.
 */
export async function deleteCommentAction(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) throw error;

    revalidatePath('/admin/comments');
    revalidatePath('/admin');
    revalidatePath('/story/[slug]', 'page');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Deletion failed' };
  }
}

/**
 * Author Action: Get pending comments count for dashboard badge.
 */
export async function getPendingCommentsCountAction(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
