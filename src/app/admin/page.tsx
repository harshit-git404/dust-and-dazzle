import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StoryList } from '@/components/admin/StoryList';
import { BackupDownloadButton } from '@/components/admin/BackupDownloadButton';
import { getStoryReadStatsAction } from '@/app/actions/stories';
import { BookOpen, Plus, CheckCircle2, EyeOff, Key, Sparkles } from 'lucide-react';
import { Story } from '@/types/story';

export default async function AdminDashboardPage() {
  let stories: Story[] = [];
  let draftCount = 0;
  let publishedCount = 0;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('stories')
        .select('*')
        .order('order_index', { ascending: true });

      if (data && data.length > 0) {
        stories = data as Story[];
      }
    } catch {
      stories = [];
    }
  }

  const readStats = await getStoryReadStatsAction();

  publishedCount = stories.filter((s) => s.visibility === 'published').length;
  draftCount = stories.filter((s) => s.visibility === 'draft' || s.visibility === 'private').length;

  return (
    <div className="space-y-8 font-serif">
      
      {/* Overview Stats & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs uppercase tracking-wider">
            <span>Total Chapters</span>
            <BookOpen className="w-4 h-4 text-[var(--color-terracotta)]" />
          </div>
          <div className="mt-2 text-3xl font-normal text-[var(--text-primary)]">
            {stories.length}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)] italic">
            Continuous sequential order
          </p>
        </div>

        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs uppercase tracking-wider">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--color-banyan)]" />
          </div>
          <div className="mt-2 text-3xl font-normal text-[var(--color-banyan)]">
            {publishedCount}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)] italic">
            Visible on public website
          </p>
        </div>

        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs uppercase tracking-wider">
            <span>Drafts / Private</span>
            <EyeOff className="w-4 h-4 text-[var(--color-diya)]" />
          </div>
          <div className="mt-2 text-3xl font-normal text-[var(--color-diya)]">
            {draftCount}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)] italic">
            Hidden from public visitors
          </p>
        </div>
      </div>

      {/* Chapters Management Section */}
      <section className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-normal text-[var(--text-primary)]">
              Manuscript Stories &amp; Chapters
            </h2>
            <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
              Drag &amp; drop or use arrow buttons to reorder. Changes sync instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <BackupDownloadButton />

            <Link
              href="/admin/change-password"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm hover:border-[var(--color-terracotta)] transition-colors"
              title="Change author studio password"
            >
              <Key className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
              <span>Password</span>
            </Link>

            <Link
              href="/admin/story/new"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write a New Story</span>
            </Link>
          </div>
        </div>

        {/* Interactive Stories List with Drag and Drop */}
        <div className="mt-6">
          <StoryList initialStories={stories} readStats={readStats} />
        </div>
      </section>

    </div>
  );
}
