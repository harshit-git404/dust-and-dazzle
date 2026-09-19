import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Called outside Next.js request scope (e.g. standalone test/script)
    cookieStore = null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get ? cookieStore.get(name)?.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          if (cookieStore?.set) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // Handled via middleware if needed.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          if (cookieStore?.set) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          }
        } catch {
          // Handled via middleware if needed.
        }
      },
    },
  });
}
