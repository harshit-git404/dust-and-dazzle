import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(`Checking connection to ${supabaseUrl}...`);
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '20260919000000_initial_schema.sql'),
    'utf8'
  );

  // Try standard Supabase SQL execution endpoint
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey!,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  console.log(`RPC status: ${res.status} ${res.statusText}`);
  const text = await res.text();
  console.log('RPC response:', text);
}

runMigration().catch(console.error);
