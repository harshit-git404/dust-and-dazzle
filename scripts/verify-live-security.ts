import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
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
  console.log('🔒 LIVE SUPABASE RLS & COMMENT SECURITY AUDIT');
  console.log('================================================================================');
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Client Role: Anonymous Public Client (NEXT_PUBLIC_SUPABASE_ANON_KEY)\n`);

  const publicClient = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch a published story for testing
  const { data: publishedStories } = await publicClient
    .from('stories')
    .select('id, slug, title')
    .eq('visibility', 'published')
    .limit(1);

  const testStoryId = publishedStories?.[0]?.id || '00000000-0000-0000-0000-000000000000';
  console.log(`Using Published Story for Tests: "${publishedStories?.[0]?.title || 'Fallback'}" (${testStoryId})\n`);

  // ---------------------------------------------------------------------------
  // TEST 1: Direct Anon INSERT into comments with is_approved = false (REJECTED)
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 1: Direct Anonymous INSERT into comments (is_approved = false) [Expect Rejection]');
  console.log('--------------------------------------------------------------------------------');
  const { data: directAnonFalseData, error: directAnonFalseErr, status: status1 } = await publicClient
    .from('comments')
    .insert({
      story_id: testStoryId,
      author_name: 'SECURITY TEST',
      content: 'Direct unapproved insert attempt bypassing server action',
      is_approved: false,
    })
    .select();

  console.log(`HTTP Status: ${status1}`);
  console.log(`Raw Response Error:`, directAnonFalseErr ? `[${directAnonFalseErr.code}] ${directAnonFalseErr.message}` : 'None');
  console.log(`Raw Response Data:`, directAnonFalseData);
  if (directAnonFalseErr) {
    console.log('✅ PASS: Direct anon INSERT (is_approved = false) REJECTED by Postgres RLS policy!');
  } else {
    console.log('❌ FAIL: Direct anon INSERT was permitted!');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Direct Anon INSERT into comments with is_approved = true (REJECTED)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 2: Direct Anonymous INSERT into comments (is_approved = true) [Expect Rejection]');
  console.log('--------------------------------------------------------------------------------');
  const { data: directAnonTrueData, error: directAnonTrueErr, status: status2 } = await publicClient
    .from('comments')
    .insert({
      story_id: testStoryId,
      author_name: 'SECURITY TEST',
      content: 'Malicious direct pre-approved comment attempt',
      is_approved: true,
    })
    .select();

  console.log(`HTTP Status: ${status2}`);
  console.log(`Raw Response Error:`, directAnonTrueErr ? `[${directAnonTrueErr.code}] ${directAnonTrueErr.message}` : 'None');
  console.log(`Raw Response Data:`, directAnonTrueData);
  if (directAnonTrueErr) {
    console.log('✅ PASS: Direct anon INSERT (is_approved = true) REJECTED by Postgres RLS policy!');
  } else {
    console.log('❌ FAIL: Direct anon pre-approved INSERT was permitted!');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Anonymous SELECT on comment_rate_limits (REJECTED / 0 Rows)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 3: Anonymous SELECT on comment_rate_limits [Expect Rejection / 0 Rows]');
  console.log('--------------------------------------------------------------------------------');
  const { data: rateSelectData, error: rateSelectErr, status: status3 } = await publicClient
    .from('comment_rate_limits')
    .select('*');

  console.log(`HTTP Status: ${status3}`);
  console.log(`Raw Response Error:`, rateSelectErr ? `[${rateSelectErr.code}] ${rateSelectErr.message}` : 'None');
  console.log(`Raw Response Data:`, rateSelectData);
  if (rateSelectErr || (rateSelectData && rateSelectData.length === 0)) {
    console.log('✅ PASS: Anonymous client has zero read visibility into comment_rate_limits table.');
  } else {
    console.log('❌ FAIL: Anonymous client was able to read rate limits:', rateSelectData);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Anonymous INSERT on comment_rate_limits (REJECTED)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 4: Anonymous Direct INSERT into comment_rate_limits [Expect Rejection]');
  console.log('--------------------------------------------------------------------------------');
  const { data: rateInsertData, error: rateInsertErr, status: status4 } = await publicClient
    .from('comment_rate_limits')
    .insert({ ip_hash: '0123456789abcdef0123456789abcdef' })
    .select();

  console.log(`HTTP Status: ${status4}`);
  console.log(`Raw Response Error:`, rateInsertErr ? `[${rateInsertErr.code}] ${rateInsertErr.message}` : 'None');
  console.log(`Raw Response Data:`, rateInsertData);
  if (rateInsertErr) {
    console.log('✅ PASS: Direct anonymous INSERT into comment_rate_limits REJECTED by Postgres RLS!');
  } else {
    console.log('❌ FAIL: Direct anonymous INSERT into comment_rate_limits was permitted!');
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Valid RPC call (submit_reader_comment) with "SECURITY TEST" [SUCCEEDS]
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 5: Valid RPC Call (submit_reader_comment) via Anon Key [Expect Success]');
  console.log('--------------------------------------------------------------------------------');
  const validIpHash = crypto.randomBytes(16).toString('hex');
  const { data: rpcValidData, error: rpcValidErr, status: status5 } = await publicClient.rpc(
    'submit_reader_comment',
    {
      p_story_id: testStoryId,
      p_author_name: 'SECURITY TEST',
      p_author_email: 'security.test@example.com',
      p_content: 'A thoughtful verified reflection for live security audit.',
      p_ip_hash: validIpHash,
    }
  );

  console.log(`HTTP Status: ${status5}`);
  console.log(`Raw RPC Error:`, rpcValidErr ? `[${rpcValidErr.code}] ${rpcValidErr.message}` : 'None');
  console.log(`Raw RPC Result:`, rpcValidData);
  if (!rpcValidErr && rpcValidData?.success === true) {
    console.log('✅ PASS: Valid RPC comment submission SUCCEEDED under anon key.');
  } else {
    console.log('❌ FAIL: Valid RPC call failed:', rpcValidErr || rpcValidData);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Overlong Comment (> 2000 chars) [REJECTED by Input Validation]
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 6: Overlong Comment (> 2000 characters) via RPC [Expect Validation Rejection]');
  console.log('--------------------------------------------------------------------------------');
  const overlongText = 'A'.repeat(2050);
  const overlongIpHash = crypto.randomBytes(16).toString('hex');
  const { data: rpcOverlongData, error: rpcOverlongErr, status: status6 } = await publicClient.rpc(
    'submit_reader_comment',
    {
      p_story_id: testStoryId,
      p_author_name: 'SECURITY TEST',
      p_author_email: null,
      p_content: overlongText,
      p_ip_hash: overlongIpHash,
    }
  );

  console.log(`HTTP Status: ${status6}`);
  console.log(`Raw RPC Error:`, rpcOverlongErr ? `[${rpcOverlongErr.code}] ${rpcOverlongErr.message}` : 'None');
  console.log(`Raw RPC Result:`, rpcOverlongData);
  if (rpcOverlongData?.success === false && rpcOverlongData?.error?.includes('2,000')) {
    console.log('✅ PASS: Overlong comment correctly REJECTED by database validation.');
  } else {
    console.log('❌ FAIL: Overlong comment was not properly rejected:', rpcOverlongData);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: 25 Calls with Different Fake IP Hashes [BLOCKED by Global Limit]
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 7: 25 Calls with Distinct IP Hashes [Expect Global Rate Limit Block at <= 20/hr]');
  console.log('--------------------------------------------------------------------------------');
  let successCount = 0;
  let blockedCount = 0;
  let lastBlockedMessage = '';

  for (let i = 1; i <= 25; i++) {
    const fakeIpHash = crypto.randomBytes(16).toString('hex');
    const { data: spamData, error: spamErr } = await publicClient.rpc(
      'submit_reader_comment',
      {
        p_story_id: testStoryId,
        p_author_name: 'SECURITY TEST',
        p_author_email: null,
        p_content: `Security flood test entry #${i}`,
        p_ip_hash: fakeIpHash,
      }
    );

    if (spamData?.success === true) {
      successCount++;
    } else {
      blockedCount++;
      lastBlockedMessage = spamData?.error || spamErr?.message || 'Blocked';
    }
  }

  console.log(`Total Attempts: 25 | Successful: ${successCount} | Blocked: ${blockedCount}`);
  console.log(`Last Blocked Error Message: "${lastBlockedMessage}"`);
  if (blockedCount > 0) {
    console.log('✅ PASS: Global rate limit kicked in and BLOCKED excessive comment volume across distinct IPs!');
  } else {
    console.log('❌ FAIL: Global rate limit did not trigger after 25 rapid submissions.');
  }

  console.log('\n================================================================================');
  console.log('🔒 Live Security Verification Completed');
  console.log('================================================================================\n');
}

verifyLiveSecurity().catch(console.error);
