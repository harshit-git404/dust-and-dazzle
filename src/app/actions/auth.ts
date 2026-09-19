'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Invalid login credentials.' };
  }

  // Verify that the user is an authorized author in the database (public.is_author() / authors table)
  const { data: isAuthor, error: authorError } = await supabase.rpc('is_author');

  if (authorError || !isAuthor) {
    const { data: authorRecord } = await supabase
      .from('authors')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!authorRecord) {
      await supabase.auth.signOut();
      return { error: 'Not authorised.' };
    }
  }

  redirect('/admin');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

