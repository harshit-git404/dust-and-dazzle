import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function unpublishAll() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Reverting all stories to draft in database...');
  const { data, error } = await supabase
    .from('stories')
    .update({ visibility: 'draft' })
    .neq('slug', '---nonexistent---')
    .select('order_index, title, visibility');

  if (error) {
    throw new Error(`Failed to unpublish: ${error.message}`);
  }

  console.log(`\n✅ Successfully set ${data?.length} stories to visibility = 'draft'!`);
  data?.forEach((s) => console.log(`  [${s.order_index}] ${s.title} -> ${s.visibility}`));
}

unpublishAll().catch(console.error);
