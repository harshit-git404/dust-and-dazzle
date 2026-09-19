'use server';

import { createClient } from '@/lib/supabase/server';
import { SiteSettings } from '@/types/story';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS: SiteSettings = {
  dedication:
    'Dedicated to the memory of those who lived the stories before they were written, and to the quiet soil of the village that cradled them.',
  author_bio:
    'Ajeet Kumar Singh writes from the threshold between the rural heartland of eastern India and the modern city. His stories explore the quiet shifts of time, familial duty, and the invisible threads connecting memories to places.',
  portrait_url: null,
  portrait_caption: 'Ajeet Kumar Singh, Author & Chronicler',
};

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
 * Fetch public site settings (dedication, bio, portrait).
 */
export async function getSiteSettingsAction(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'about_collection')
      .maybeSingle();

    if (error || !data || !data.value) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...(data.value as Partial<SiteSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update site settings (Author only).
 */
export async function updateSiteSettingsAction(
  settings: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAuthorOrThrow();

    const current = await getSiteSettingsAction();
    const updated: SiteSettings = {
      ...current,
      ...settings,
    };

    const { error } = await supabase.from('site_settings').upsert({
      key: 'about_collection',
      value: updated,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/admin');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Settings update failed';
    return { success: false, error: message };
  }
}
