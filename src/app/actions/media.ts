'use server';

import { createClient } from '@/lib/supabase/server';
import { processArchivalPhoto } from '@/lib/image-processor';
import { MediaItem } from '@/types/story';
import { revalidatePath } from 'next/cache';

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
 * Upload and process an archival photograph:
 * - Validates author credentials.
 * - Compresses, strips EXIF/GPS metadata, converts to WebP.
 * - Stores in the public `story-media` storage bucket.
 */
export async function uploadPhotoAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  filename?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  error?: string;
}> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return { success: false, error: 'No image file provided.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Process & strip metadata with sharp
    const processed = await processArchivalPhoto(inputBuffer, file.name, file.type);

    const { error: uploadError } = await supabase.storage
      .from('story-media')
      .upload(processed.filename, processed.buffer, {
        contentType: processed.contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('story-media')
      .getPublicUrl(processed.filename);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      filename: processed.filename,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { success: false, error: message };
  }
}

/**
 * List all media files in the story-media bucket and identify unused/orphan files.
 */
export async function listMediaAction(): Promise<{
  success: boolean;
  media?: MediaItem[];
  error?: string;
}> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    // 1. List files from bucket
    const { data: files, error: listError } = await supabase.storage
      .from('story-media')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError) throw listError;

    // 2. Fetch stories and settings to detect where images are used
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, content_html, cover_image_url');

    const { data: settings } = await supabase.from('site_settings').select('*');

    const settingsJson = JSON.stringify(settings || []);

    const mediaList: MediaItem[] = (files || []).map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from('story-media')
        .getPublicUrl(file.name);

      const url = publicUrlData.publicUrl;
      const usedInStories: { id: string; title: string }[] = [];

      (stories || []).forEach((story) => {
        if (
          story.cover_image_url?.includes(file.name) ||
          story.content_html?.includes(file.name)
        ) {
          usedInStories.push({ id: story.id, title: story.title });
        }
      });

      const isUsedInSettings = settingsJson.includes(file.name);
      const isUsed = usedInStories.length > 0 || isUsedInSettings;

      return {
        id: file.id,
        name: file.name,
        url,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
        is_used: isUsed,
        used_in_stories: usedInStories,
      };
    });

    return { success: true, media: mediaList };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list media';
    return { success: false, error: message };
  }
}

/**
 * Delete a photo from storage.
 */
export async function deletePhotoAction(
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const { error } = await supabase.storage.from('story-media').remove([filename]);
    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/admin/media');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return { success: false, error: message };
  }
}
