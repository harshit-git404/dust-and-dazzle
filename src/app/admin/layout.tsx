import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { Feather, BookOpen, LogOut, FileEdit, Settings, Sparkles } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection fallback inside layout
  if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect('/login');
  }

  if (user) {
    const { data: isAuthor } = await supabase.rpc('is_author');
    if (isAuthor === false) {
      const { data: authorRecord } = await supabase
        .from('authors')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!authorRecord) {
        await supabase.auth.signOut();
        redirect('/login');
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Admin Header Bar */}
        <header className="mb-8 p-4 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-terracotta)]/15 text-[var(--color-terracotta)] flex items-center justify-center">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-primary)]">
                  Author Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-banyan)]/15 text-[var(--color-banyan)] text-[10px] font-sans font-semibold uppercase tracking-wider">
                  Author
                </span>
              </div>
              <p className="font-serif italic text-xs text-[var(--text-muted)]">
                Logged in as {user?.email || 'Author'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-[var(--text-secondary)] hover:text-[var(--color-terracotta)] border border-[var(--border-subtle)] rounded-sm hover:bg-[var(--bg-surface-elevated)] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-red-700 dark:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-sm transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content Area */}
        <main>{children}</main>

      </div>
    </div>
  );
}
