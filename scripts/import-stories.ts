import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// 1. Guard against running during build, CI, or production deployments
if (process.env.NEXT_PHASE || process.env.VERCEL || process.env.CI) {
  console.error('⛔ FATAL: Import script is strictly disabled during builds and production deployment.');
  process.exit(1);
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

function computeReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 225));
  return `${minutes} min read`;
}

function extractExcerpt(html: string): string {
  const pMatches = html.match(/<p>([\s\S]*?)<\/p>/gi) || [];
  if (pMatches.length === 0) return '';

  const plainText = pMatches
    .slice(0, 2)
    .map((p) => p.replace(/<[^>]+>/g, '').trim())
    .join(' ');

  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
  const excerpt = sentences.slice(0, 2).join(' ').trim();
  return excerpt.length > 220 ? excerpt.substring(0, 217) + '...' : excerpt;
}

export interface ImportStoryRecord {
  order_index: number;
  chapter_label: string;
  title: string;
  slug: string;
  subtitle: string | null;
  year: string | null;
  visibility: 'draft' | 'published' | 'private';
  reading_time: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  image_caption: string | null;
  word_count: number;
  paragraph_count: number;
  modifications: string[];
}

const ROMAN_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'
];

export async function parseDocxStories(): Promise<ImportStoryRecord[]> {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  if (!fs.existsSync(docPath)) {
    throw new Error(`File not found: ${docPath}`);
  }

  const result = await mammoth.convertToHtml(
    { path: docPath },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
      ]
    }
  );

  const rawHtml = result.value;
  const h1Regex = /<h1>(?:<a id="[^"]*"><\/a>)?([\s\S]*?)<\/h1>/gi;
  const h1Matches = [...rawHtml.matchAll(h1Regex)];

  const stories: ImportStoryRecord[] = [];

  for (let idx = 0; idx < h1Matches.length; idx++) {
    const match = h1Matches[idx];
    const rawTitle = match[1].replace(/<[^>]+>/g, '').trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = idx < h1Matches.length - 1 ? h1Matches[idx + 1].index! : rawHtml.length;
    const storyRawHtml = rawHtml.substring(startIndex, endIndex);

    const modifications: string[] = [];

    // Extract all <p> tags
    let rawParagraphs = (storyRawHtml.match(/<p>[\s\S]*?<\/p>/g) || []).map((p) => p.trim());

    // 1. In "The Forgotten Pillar", drop first shorter duplicate
    if (rawTitle.includes('The Forgotten Pillar')) {
      const duplicateMatches: number[] = [];
      rawParagraphs.forEach((p, pIdx) => {
        if (p.includes('He rarely thought about himself')) {
          duplicateMatches.push(pIdx);
        }
      });

      if (duplicateMatches.length >= 2) {
        const firstIndex = duplicateMatches[0];
        const removedSnippet = rawParagraphs[firstIndex].replace(/<[^>]+>/g, '').substring(0, 60);
        rawParagraphs.splice(firstIndex, 1);
        modifications.push(`Removed duplicate shorter paragraph: "${removedSnippet}..." (kept 2nd longer version)`);
      }
    }

    // 2. Subheadings in "At Fifty: Sandwich Generation"
    if (rawTitle.includes('At Fifty')) {
      const updatedParagraphs: string[] = [];
      rawParagraphs.forEach((p) => {
        let text = p.replace(/<[^>]+>/g, '').trim();

        if (text.includes('We came from a different world') && text.startsWith('I feel somewhere in the middle.')) {
          updatedParagraphs.push('<p>I feel somewhere in the middle.</p>');
          updatedParagraphs.push('<h3>We came from a different world</h3>');
          modifications.push('Subheading: <h3>We came from a different world</h3>');
        } else if (text === 'We became the generation in the middle') {
          updatedParagraphs.push('<h3>We became the generation in the middle</h3>');
          modifications.push('Subheading: <h3>We became the generation in the middle</h3>');
        } else if (text.includes('And somewhere in between is us') && text.includes('Whenever you need us, we are here.')) {
          updatedParagraphs.push('<p>“Whenever you need us, we are here.”</p>');
          updatedParagraphs.push('<h3>And somewhere in between is us</h3>');
          modifications.push('Subheading: <h3>And somewhere in between is us</h3>');
        } else if (text === 'When I look back') {
          updatedParagraphs.push('<h3>When I look back</h3>');
          modifications.push('Subheading: <h3>When I look back</h3>');
        } else {
          updatedParagraphs.push(p);
        }
      });
      rawParagraphs = updatedParagraphs;
    }

    // 3. Rejoin paragraphs split mid-sentence by page breaks
    const rejoinedParagraphs: string[] = [];
    let i = 0;
    while (i < rawParagraphs.length) {
      let currentP = rawParagraphs[i];

      while (i < rawParagraphs.length - 1) {
        const nextP = rawParagraphs[i + 1];

        if (currentP.startsWith('<h') || nextP.startsWith('<h')) {
          break;
        }

        const text1 = currentP.replace(/<[^>]+>/g, '').trim();
        const text2 = nextP.replace(/<[^>]+>/g, '').trim();

        const lastChar = text1.slice(-1);
        const firstChar = text2.charAt(0);

        const hasSentenceEnding = /[.!?…"”’']/.test(lastChar);
        const isNextLowercase = /[a-z]/.test(firstChar);

        if (!hasSentenceEnding && isNextLowercase) {
          const inner1 = currentP.replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
          const inner2 = nextP.replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
          currentP = `<p>${inner1} ${inner2}</p>`;
          modifications.push(`Rejoined split paragraph: "...${text1.slice(-30)}" + "${text2.slice(0, 30)}..."`);
          i++;
        } else {
          break;
        }
      }

      rejoinedParagraphs.push(currentP);
      i++;
    }

    // Wrap opening paragraph in drop-cap
    let finalHtml = '';
    let dropCapApplied = false;

    rejoinedParagraphs.forEach((block) => {
      if (!dropCapApplied && block.startsWith('<p>')) {
        const innerText = block.replace(/^<p>/i, '').replace(/<\/p>$/i, '');
        const firstLetter = innerText.charAt(0);
        const restOfText = innerText.slice(1);
        finalHtml += `<p class="drop-cap-paragraph"><span class="drop-cap">${firstLetter}</span>${restOfText}</p>\n`;
        dropCapApplied = true;
      } else {
        finalHtml += `${block}\n`;
      }
    });

    const plainText = rejoinedParagraphs.map((p) => p.replace(/<[^>]+>/g, '')).join(' ');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const paragraphCount = rejoinedParagraphs.filter((p) => p.startsWith('<p>')).length;
    const readingTime = computeReadingTime(wordCount);
    const excerpt = extractExcerpt(finalHtml);

    stories.push({
      order_index: idx + 1,
      chapter_label: `Chapter ${ROMAN_NUMERALS[idx] || idx + 1}`,
      title: rawTitle,
      slug: slugify(rawTitle),
      subtitle: null,
      year: null,
      visibility: 'draft',
      reading_time: readingTime,
      excerpt,
      content_html: finalHtml.trim(),
      cover_image_url: idx === 0 ? '/images/sample-banyan.png' : null,
      image_caption: null,
      word_count: wordCount,
      paragraph_count: paragraphCount,
      modifications,
    });
  }

  return stories;
}

async function run() {
  const stories = await parseDocxStories();

  console.log('================================================================================');
  console.log('📖 DUST & DAZZLE — DOCX IMPORT & AUDIT REPORT (16 Stories Parsed)');
  console.log('================================================================================\n');

  stories.forEach((s) => {
    console.log(`[${s.order_index}] ${s.title}`);
    console.log(`    • Slug: /story/${s.slug}`);
    console.log(`    • Word Count: ${s.word_count} words (${s.reading_time})`);
    console.log(`    • Paragraphs: ${s.paragraph_count} paragraphs`);
    console.log(`    • Excerpt: "${s.excerpt.substring(0, 85)}..."`);
    if (s.modifications.length > 0) {
      console.log(`    • Modifications (${s.modifications.length}):`);
      s.modifications.forEach((m) => console.log(`        - ${m}`));
    } else {
      console.log(`    • Modifications: None (Exact match to docx)`);
    }
    console.log('');
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // 2. Check if database already has curated / published content
      const { data: existingStories } = await supabase
        .from('stories')
        .select('id, title, visibility, updated_at, created_at');

      const isForce = process.argv.includes('--force');
      if (existingStories && existingStories.length > 0 && !isForce) {
        const hasPublished = existingStories.some((s) => s.visibility === 'published');
        const hasEdits = existingStories.some((s) => s.updated_at !== s.created_at);

        if (hasPublished || hasEdits) {
          console.warn('⚠️  WARNING: Database contains existing curated or published stories!');
          console.warn('    To prevent overwriting live edits, re-importing requires the --force flag:');
          console.warn('    npx tsx scripts/import-stories.ts --force\n');
          process.exit(0);
        }
      }

      console.log('Syncing stories into Supabase stories table...');
      const { data, error } = await supabase
        .from('stories')
        .upsert(
          stories.map((s) => ({
            slug: s.slug,
            title: s.title,
            subtitle: s.subtitle,
            chapter_label: s.chapter_label,
            order_index: s.order_index,
            year: s.year,
            visibility: s.visibility,
            reading_time: s.reading_time,
            excerpt: s.excerpt,
            content_html: s.content_html,
            cover_image_url: s.cover_image_url,
            image_caption: s.image_caption,
          })),
          { onConflict: 'slug' }
        )
        .select('order_index, title, slug, visibility');

      if (!error && data) {
        console.log(`\n✅ Database Sync Success: ${data.length} stories synced in Supabase!`);
        data.forEach((r) => console.log(`  [${r.order_index}] ${r.title} (${r.visibility})`));
      } else if (error) {
        console.log(`\nℹ️ Database Insert Note: ${error.message}`);
      }
    } catch (e: any) {
      console.log(`\nℹ️ DB connection note: ${e.message}`);
    }
  }
}

run().catch(console.error);
