import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Guard against execution during builds/production runtime
// Exception: Explicitly allowed in CI only when ALLOW_READONLY_EXPORT_IN_CI=1
const isCi = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
const allowCiExport = process.env.ALLOW_READONLY_EXPORT_IN_CI === '1';

if ((process.env.NEXT_PHASE || process.env.VERCEL) || (isCi && !allowCiExport)) {
  console.error('⛔ FATAL: Backup export script is disabled during builds and unapproved CI runs.');
  process.exit(1);
}

interface StoryRecord {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  chapter_label: string;
  order_index: number;
  year?: string | null;
  excerpt?: string | null;
  content_html?: string;
  content?: string;
  content_json?: Record<string, unknown> | null;
  word_count?: number;
  reading_time?: string;
  visibility: 'draft' | 'published' | 'private';
  allow_comments?: boolean;
  author_note?: string | null;
  audio_url?: string | null;
  audio_duration_seconds?: number | null;
  audio_mime?: string | null;
  photos?: Array<{
    url: string;
    caption?: string | null;
    alt_text?: string | null;
    year?: string | null;
    frame_style?: string | null;
    rotation_deg?: number | null;
  }>;
  created_at?: string;
  updated_at?: string;
}

interface CommentRecord {
  id: string;
  story_id: string;
  author_name: string;
  author_email?: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
}

interface SettingsRecord {
  dedication?: string | null;
  author_bio?: string | null;
  portrait_url?: string | null;
  portrait_caption?: string | null;
}

function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function exportBackup() {
  console.log('🏛️ Dust and Dazzle — Automated Heirloom Backup Exporter\n');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('📥 Fetching all stories (published, draft, private)...');
  const { data: storiesData, error: storiesErr } = await supabase
    .from('stories')
    .select('*')
    .order('order_index', { ascending: true });

  if (storiesErr) {
    console.error('❌ Error fetching stories:', storiesErr.message);
    process.exit(1);
  }

  const stories: StoryRecord[] = storiesData || [];
  if (stories.length === 0) {
    console.error('❌ FATAL: Zero stories found in database! Aborting backup.');
    process.exit(1);
  }
  console.log(`✅ Retrieved ${stories.length} stories.`);

  console.log('📥 Fetching all comments (including pending moderation)...');
  const { data: commentsData, error: commentsErr } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: true });

  if (commentsErr) {
    console.warn('⚠️ Warning fetching comments (non-fatal):', commentsErr.message);
  }
  const comments: CommentRecord[] = commentsData || [];
  console.log(`✅ Retrieved ${comments.length} comments.`);

  console.log('📥 Fetching site settings...');
  const { data: settingsData, error: settingsErr } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (settingsErr) {
    console.warn('⚠️ Warning fetching site settings (non-fatal):', settingsErr.message);
  }
  const settings: SettingsRecord = settingsData || {};
  console.log('✅ Retrieved site settings.');

  const zip = new JSZip();
  const manifestLines: string[] = [];
  const exportDate = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  manifestLines.push('================================================================');
  manifestLines.push(`DUST AND DAZZLE — ARCHIVAL HEIRLOOM BACKUP MANIFEST`);
  manifestLines.push(`Exported At : ${timestamp}`);
  manifestLines.push(`Total Stories : ${stories.length}`);
  manifestLines.push(`Total Comments: ${comments.length}`);
  manifestLines.push('================================================================\n');

  // 1. JSON Backup file compatible with restore-from-backup.ts
  const backupJsonContent = {
    exportedAt: timestamp,
    totalStories: stories.length,
    totalComments: comments.length,
    siteSettings: settings,
    stories: stories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle || null,
      chapter_label: s.chapter_label,
      order_index: s.order_index,
      year: s.year || null,
      excerpt: s.excerpt || null,
      content: s.content_html || s.content || '',
      content_json: s.content_json || null,
      word_count: s.word_count || 0,
      reading_time: s.reading_time || '1 min read',
      visibility: s.visibility,
      allow_comments: s.allow_comments !== false,
      author_note: s.author_note || null,
      audio_url: s.audio_url || null,
      audio_duration_seconds: s.audio_duration_seconds || null,
      audio_mime: s.audio_mime || null,
      photos: s.photos || [],
      created_at: s.created_at,
      updated_at: s.updated_at,
    })),
    comments: comments,
  };

  const backupJsonBuffer = Buffer.from(JSON.stringify(backupJsonContent, null, 2), 'utf8');
  zip.file('backup.json', backupJsonBuffer);
  manifestLines.push(`FILE: backup.json (Size: ${backupJsonBuffer.length} bytes, SHA-256: ${computeSha256(backupJsonBuffer)})`);

  // 2. Stories Markdown Folder
  const storiesFolder = zip.folder('stories');
  for (const story of stories) {
    const rawContent = story.content_html || story.content || '';
    const markdownBody = htmlToMarkdown(rawContent);

    const frontmatter = [
      '---',
      `id: "${story.id}"`,
      `slug: "${story.slug}"`,
      `title: "${story.title.replace(/"/g, '\\"')}"`,
      `subtitle: "${(story.subtitle || '').replace(/"/g, '\\"')}"`,
      `chapter_label: "${story.chapter_label}"`,
      `order_index: ${story.order_index}`,
      `year: "${story.year || ''}"`,
      `visibility: "${story.visibility}"`,
      `reading_time: "${story.reading_time || ''}"`,
      `allow_comments: ${story.allow_comments !== false}`,
      story.author_note ? `author_note: "${story.author_note.replace(/"/g, '\\"')}"` : null,
      story.audio_url ? `audio_url: "${story.audio_url}"` : null,
      '---',
      '',
      markdownBody,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const mdBuffer = Buffer.from(frontmatter, 'utf8');
    const filename = `${String(story.order_index).padStart(2, '0')}-${story.slug}.md`;
    storiesFolder?.file(filename, mdBuffer);
    manifestLines.push(`STORY: stories/${filename} (Size: ${mdBuffer.length} bytes, SHA-256: ${computeSha256(mdBuffer)})`);
  }

  // 3. Download referenced media files
  const mediaFolder = zip.folder('media');
  const referencedMediaUrls = new Set<string>();

  if (settings.portrait_url) referencedMediaUrls.add(settings.portrait_url);
  for (const s of stories) {
    if (s.audio_url) referencedMediaUrls.add(s.audio_url);
    if (s.photos && Array.isArray(s.photos)) {
      for (const p of s.photos) {
        if (p.url) referencedMediaUrls.add(p.url);
      }
    }
  }

  console.log(`📥 Downloading ${referencedMediaUrls.size} referenced media items...`);
  let downloadedMediaCount = 0;

  for (const mediaUrl of referencedMediaUrls) {
    try {
      if (mediaUrl.startsWith('http')) {
        const res = await fetch(mediaUrl);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          const urlObj = new URL(mediaUrl);
          const rawFilename = path.basename(urlObj.pathname) || `media_${Date.now()}`;
          const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

          mediaFolder?.file(safeFilename, buf);
          manifestLines.push(`MEDIA: media/${safeFilename} (${mediaUrl}) - Size: ${buf.length} bytes, SHA-256: ${computeSha256(buf)}`);
          downloadedMediaCount++;
        } else {
          manifestLines.push(`MEDIA_FAILED: ${mediaUrl} (HTTP ${res.status})`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not download media ${mediaUrl}:`, err);
      manifestLines.push(`MEDIA_ERROR: ${mediaUrl} (${err instanceof Error ? err.message : 'Failed'})`);
    }
  }
  console.log(`✅ Downloaded ${downloadedMediaCount} media assets.`);

  // 4. Add Manifest to Zip
  const manifestBuffer = Buffer.from(manifestLines.join('\n'), 'utf8');
  zip.file('MANIFEST.txt', manifestBuffer);

  // 5. Generate Zip
  const zipFilename = `backup-${exportDate}.zip`;
  console.log(`\n📦 Packing ${zipFilename}...`);
  const zipData = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(zipFilename, zipData);
  const zipSizeMb = (zipData.length / (1024 * 1024)).toFixed(2);
  console.log(`🎉 Heirloom backup archive created: ${zipFilename} (${zipSizeMb} MB)`);
  console.log(`Archive SHA-256: ${computeSha256(zipData)}`);
}

exportBackup().catch((err) => {
  console.error('❌ Backup exporter failed:', err);
  process.exit(1);
});
