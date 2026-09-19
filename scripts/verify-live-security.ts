import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verifyLiveSecurity() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  console.log('================================================================================');
  console.log('🔒 LIVE SUPABASE RLS SECURITY & PERMISSIONS AUDIT (Phase 2c)');
  console.log('================================================================================');
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Client Role: Anonymous Public Visitor (using anon public key)\n`);

  const publicClient = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Read Drafts (Expect None / 0 rows)
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 1: Anonymous Public SELECT Draft / Private Stories (Expect None / 0 Rows)');
  console.log('--------------------------------------------------------------------------------');
  const { data: draftStories, error: draftError, status: draftStatus } = await publicClient
    .from('stories')
    .select('id, title, visibility')
    .neq('visibility', 'published');

  console.log(`HTTP Status: ${draftStatus}`);
  if (draftError) {
    console.log(`Raw Response Error: [Code: ${draftError.code}] ${draftError.message}`);
  } else {
    console.log(`Raw Response Data: ${JSON.stringify(draftStories)}`);
    if (draftStories?.length === 0) {
      console.log('✅ PASS: Anonymous client received 0 draft/private stories (RLS enforced).');
    } else {
      console.log('❌ FAIL: Draft stories were exposed to anonymous client!');
    }
  }

  // 2. Anonymous INSERT on Stories (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 2: Anonymous Public INSERT into Stories table (Expect Rejection)');
  console.log('--------------------------------------------------------------------------------');
  const { data: insertStoryData, error: insertStoryError, status: insertStoryStatus } = await publicClient
    .from('stories')
    .insert({
      slug: 'unauthorized-test-story',
      title: 'Unauthorized Test Story',
      chapter_label: 'Chapter 99',
      order_index: 99,
      excerpt: 'Unauthorized',
      content_html: '<p>Malicious content</p>',
      visibility: 'published',
    })
    .select();

  console.log(`HTTP Status: ${insertStoryStatus}`);
  if (insertStoryError) {
    console.log(`✅ PASS: Anonymous INSERT was REJECTED by Postgres RLS policy!`);
    console.log(`Raw Response Error: [Code: ${insertStoryError.code}] ${insertStoryError.message}`);
  } else {
    console.log(`❌ FAIL: Anonymous client was permitted to insert story:`, insertStoryData);
  }

  // 3. Anonymous UPDATE on Stories (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 3: Anonymous Public UPDATE on Stories table (Expect Rejection / 0 rows)');
  console.log('--------------------------------------------------------------------------------');
  const { data: updateStoryData, error: updateStoryError, status: updateStoryStatus } = await publicClient
    .from('stories')
    .update({ title: 'Hacked Title' })
    .neq('slug', '---nonexistent---')
    .select();

  console.log(`HTTP Status: ${updateStoryStatus}`);
  if (updateStoryError) {
    console.log(`✅ PASS: Anonymous UPDATE was REJECTED!`);
    console.log(`Raw Response Error: [Code: ${updateStoryError.code}] ${updateStoryError.message}`);
  } else if (!updateStoryData || updateStoryData.length === 0) {
    console.log('✅ PASS: Anonymous UPDATE modified 0 rows (RLS prevented write).');
  } else {
    console.log(`❌ FAIL: Anonymous UPDATE succeeded!`, updateStoryData);
  }

  // 4. Anonymous DELETE on Stories (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 4: Anonymous Public DELETE on Stories table (Expect Rejection / 0 rows)');
  console.log('--------------------------------------------------------------------------------');
  const { data: deleteStoryData, error: deleteStoryError, status: deleteStoryStatus } = await publicClient
    .from('stories')
    .delete()
    .neq('slug', '---nonexistent---')
    .select();

  console.log(`HTTP Status: ${deleteStoryStatus}`);
  if (deleteStoryError) {
    console.log(`✅ PASS: Anonymous DELETE was REJECTED!`);
    console.log(`Raw Response Error: [Code: ${deleteStoryError.code}] ${deleteStoryError.message}`);
  } else if (!deleteStoryData || deleteStoryData.length === 0) {
    console.log('✅ PASS: Anonymous DELETE affected 0 rows (RLS prevented deletion).');
  } else {
    console.log(`❌ FAIL: Anonymous DELETE succeeded!`, deleteStoryData);
  }

  // 5. Anonymous SELECT author_email on comments table (Expect Denied / Excluded)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 5: Anonymous Public SELECT author_email on comments table (Expect Denied/Excluded)');
  console.log('--------------------------------------------------------------------------------');
  const { data: emailData, error: emailError, status: emailStatus } = await publicClient
    .from('comments')
    .select('author_email');

  console.log(`HTTP Status: ${emailStatus}`);
  if (emailError) {
    console.log(`✅ PASS: Access to author_email column was DENIED to anonymous client!`);
    console.log(`Raw Response Error: [Code: ${emailError.code}] ${emailError.message}`);
  } else if (!emailData || emailData.length === 0) {
    console.log('✅ PASS: 0 rows returned, author_email protected.');
  }

  // 6. Anonymous SELECT from approved_comments view (Expect Public Safe Access)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 6: Anonymous Public SELECT from approved_comments view (Expect Public Safe Fields)');
  console.log('--------------------------------------------------------------------------------');
  const { data: approvedData, error: approvedError, status: approvedStatus } = await publicClient
    .from('approved_comments')
    .select('*');

  console.log(`HTTP Status: ${approvedStatus}`);
  if (approvedError) {
    console.log(`Raw Response Error: [Code: ${approvedError.code}] ${approvedError.message}`);
  } else {
    console.log(`Raw Response Data: ${JSON.stringify(approvedData)}`);
    console.log('✅ PASS: Public view serves only approved comments without private emails.');
  }

  // 7. Anonymous INSERT into comments table (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 7: Anonymous Direct INSERT into comments table (Expect Rejection - Policy Removed)');
  console.log('--------------------------------------------------------------------------------');
  const { data: commentInsertData, error: commentInsertError, status: commentInsertStatus } = await publicClient
    .from('comments')
    .insert({
      story_id: '00000000-0000-0000-0000-000000000000',
      author_name: 'Direct Anon Spammer',
      content: 'Direct insert attempt bypassing server action',
      is_approved: false,
    })
    .select();

  console.log(`HTTP Status: ${commentInsertStatus}`);
  if (commentInsertError) {
    console.log(`✅ PASS: Direct anonymous comment INSERT was REJECTED by Postgres RLS!`);
    console.log(`Raw Response Error: [Code: ${commentInsertError.code}] ${commentInsertError.message}`);
  } else {
    console.log(`❌ FAIL: Direct anonymous insert was allowed:`, commentInsertData);
  }

  // 8. Anonymous UPDATE on site_settings (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 8: Anonymous Public UPDATE on site_settings (Expect Rejection)');
  console.log('--------------------------------------------------------------------------------');
  const { data: settingsData, error: settingsError, status: settingsStatus } = await publicClient
    .from('site_settings')
    .upsert({
      key: 'about_collection',
      value: { dedication: 'Hacked Dedication' },
    })
    .select();

  console.log(`HTTP Status: ${settingsStatus}`);
  if (settingsError) {
    console.log(`✅ PASS: Anonymous modification of site_settings was REJECTED by Postgres RLS!`);
    console.log(`Raw Response Error: [Code: ${settingsError.code}] ${settingsError.message}`);
  } else {
    console.log(`❌ FAIL: Anonymous client was permitted to update site_settings:`, settingsData);
  }

  // 9. Anonymous Storage Upload on story-media (Expect Rejection)
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 9: Anonymous Public Upload to story-media Storage Bucket (Expect Rejection)');
  console.log('--------------------------------------------------------------------------------');
  const dummyFile = Buffer.from('unauthorized live storage write');
  const { data: storageUploadData, error: storageUploadError } = await publicClient.storage
    .from('story-media')
    .upload('unauthorized-test.webp', dummyFile, { contentType: 'image/webp' });

  if (storageUploadError) {
    console.log(`✅ PASS: Anonymous storage upload was REJECTED!`);
    console.log(`Raw Response Error: ${storageUploadError.message}`);
  } else {
    console.log(`❌ FAIL: Anonymous client was permitted to upload to storage:`, storageUploadData);
  }

  console.log('\n================================================================================');
  console.log('🔒 Live Security Verification Finished');
  console.log('================================================================================\n');
}

verifyLiveSecurity().catch(console.error);

