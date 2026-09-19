import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testCommentSubmissionWithAnonKey() {
  console.log('Testing Comment Submission with Anon Public Client...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Get a published story id
  const { data: stories } = await anonClient
    .from('stories')
    .select('id, title')
    .eq('visibility', 'published')
    .limit(1);

  if (!stories || stories.length === 0) {
    console.log('No published stories found to test.');
    return;
  }

  const storyId = stories[0].id;
  console.log(`Using story: ${stories[0].title} (${storyId})`);

  // 2. Try inserting rate limit record
  console.log('Testing comment_rate_limits insert with anon key:');
  const { error: rateLimitErr } = await anonClient
    .from('comment_rate_limits')
    .insert({ ip_hash: 'test-ip-hash-123' });

  if (rateLimitErr) {
    console.log('❌ Rate limit insert error:', rateLimitErr);
  } else {
    console.log('✅ Rate limit insert succeeded with anon key!');
  }

  // 3. Try inserting comment
  console.log('Testing comments insert with is_approved=false with anon key:');
  const { error: commentErr } = await anonClient
    .from('comments')
    .insert({
      story_id: storyId,
      author_name: 'Reader Test',
      content: 'A wonderful reflection on this chapter.',
      is_approved: false,
    });

  if (commentErr) {
    console.log('❌ Comment insert error:', commentErr);
  } else {
    console.log('✅ Comment insert succeeded with anon key!');
  }
}

testCommentSubmissionWithAnonKey().catch(console.error);
