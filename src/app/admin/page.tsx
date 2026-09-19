import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DiyaDivider } from '@/components/DiyaDivider';
import { BookOpen, Plus, FileText, CheckCircle2, EyeOff, MessageSquare, Clock, ArrowRight } from 'lucide-react';
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

  publishedCount = stories.filter((s) => s.visibility === 'published').length;
  draftCount = stories.filter((s) => s.visibility === 'draft' || s.visibility === 'private').length;

  return (
    <div className="space-y-8 font-serif">
      
      {/* Overview Stats Cards */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-normal text-[var(--text-primary)]">
              Manuscript Stories &amp; Chapters
            </h2>
            <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
              Manage chapters, draft status, and narrative content
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-terracotta)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm opacity-70 cursor-not-allowed"
              title="Tiptap Story Editor arrives in Phase 3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chapter (Phase 3)</span>
            </button>
          </div>
        </div>

        {/* Stories List */}
        <div className="mt-6 space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[var(--color-terracotta)]/40 transition-colors"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold shrink-0 w-24">
                  {story.chapter_label}
                </span>
                <div>
                  <h3 className="font-serif text-base text-[var(--text-primary)] font-medium">
                    {story.title.replace(/^\[Placeholder\]\s*/, '')}
                  </h3>
                  {story.subtitle && (
                    <p className="font-serif italic text-xs text-[var(--text-muted)] mt-0.5">
                      {story.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-serif shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-sans uppercase tracking-wider font-semibold ${
                  story.visibility === 'published'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                }`}>
                  {story.visibility}
                </span>

                <Link
                  href={`/story/${story.slug}`}
                  target="_blank"
                  className="text-[var(--color-terracotta)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
