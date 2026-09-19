import React from 'react';
import Link from 'next/link';
import { getPendingCommentsAction } from '@/app/actions/comments';
import { CommentModerationQueue } from '@/components/admin/CommentModerationQueue';
import { ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';

export default async function AdminCommentsPage() {
  const res = await getPendingCommentsAction();
  const pendingComments = res.success && res.comments ? res.comments : [];

  return (
    <div className="space-y-6 font-serif">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Author Studio</span>
          </Link>
          <h2 className="text-xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-terracotta)]" />
            <span>Reader Reflections Moderation Queue</span>
          </h2>
          <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
            Approve thoughtful reflections or permanently remove spam.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-muted)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-banyan)]" />
          <span>{pendingComments.length} pending moderation</span>
        </div>
      </div>

      {/* Moderation Queue List */}
      <CommentModerationQueue initialComments={pendingComments} />

    </div>
  );
}
