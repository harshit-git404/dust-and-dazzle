import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Guard against execution during builds
if (process.env.NEXT_PHASE || process.env.VERCEL || process.env.CI) {
  console.error('⛔ FATAL: Script execution is strictly disabled during builds and production deployment.');
  process.exit(1);
}

interface BackupStory {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  chapter_label: string;
  order_index: number;
  year?: string | null;
  excerpt?: string | null;
  content: string;
  content_json?: Record<string, unknown> | null;
  word_count: number;
  reading_time: string;
  visibility: 'draft' | 'published' | 'private';
  allow_comments?: boolean;
  photos?: Array<{
    url: string;
    caption?: string;
    alt_text: string;
    year?: string;
    frame_style?: string;
    rotation_deg?: number;
  }>;
}

interface BackupFile {
  exportedAt: string;
  totalStories: number;
  stories: BackupStory[];
}

async function restoreFromBackup() {
  console.log('📦 Starting Dust and Dazzle Backup Restoration Script...\n');

  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Usage: npx tsx scripts/restore-from-backup.ts <path-to-backup.json>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Backup file not found at: ${resolvedPath}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(resolvedPath, 'utf8');
  let backupData: BackupFile;

  try {
    backupData = JSON.parse(rawJson);
  } catch (err) {
    console.error('❌ Invalid JSON backup format:', err);
    process.exit(1);
  }

  if (!backupData.stories || !Array.isArray(backupData.stories)) {
    console.error('❌ Backup file does not contain a valid stories array.');
    process.exit(1);
  }

  console.log(`Found ${backupData.stories.length} stories in backup file exported at ${backupData.exportedAt || 'Unknown'}.`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) in .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Restoring stories into Supabase database...\n');

  let restoredCount = 0;
  for (const story of backupData.stories) {
    const payload = {
      slug: story.slug,
      title: story.title,
      subtitle: story.subtitle || null,
      chapter_label: story.chapter_label,
      order_index: story.order_index,
      year: story.year || null,
      excerpt: story.excerpt || null,
      content: story.content,
      content_json: story.content_json || null,
      word_count: story.word_count,
      reading_time: story.reading_time,
      visibility: story.visibility || 'draft',
      allow_comments: story.allow_comments !== false,
      photos: story.photos || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('stories')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to restore story "${story.title}":`, error.message);
    } else {
      console.log(`✅ Restored: [${story.chapter_label}] ${story.title} (${story.slug})`);
      restoredCount++;
    }
  }

  console.log(`\n🎉 Restoration completed: ${restoredCount}/${backupData.stories.length} stories restored successfully!`);
}

restoreFromBackup().catch((err) => {
  console.error('Restore script failed:', err);
  process.exit(1);
});
