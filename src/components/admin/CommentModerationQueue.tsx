'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminComment } from '@/app/actions/comments';
import { approveCommentAction, deleteCommentAction } from '@/app/actions/comments';
import {
  Check,
  Trash2,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Mail,
  ShieldCheck,
} from 'lucide-react';

interface CommentModerationQueueProps {
  initialComments: AdminComment[];
}

export function CommentModerationQueue({ initialComments }: CommentModerationQueueProps) {
  const [comments, setComments] = useState<AdminComment[]>(initialComments);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleApprove = async (commentId: string) => {
    setActionLoadingId(commentId);
    try {
      const res = await approveCommentAction(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(res.error || 'Failed to approve reflection');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approval error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Reject and delete this reflection permanently?')) return;

    setActionLoadingId(commentId);
    try {
      const res = await deleteCommentAction(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(res.error || 'Failed to delete reflection');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deletion error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--bg-canvas)] border border-dashed border-[var(--border-subtle)] rounded-sm font-serif">
        <CheckCircle2 className="w-8 h-8 mx-auto text-[var(--color-banyan)] mb-3" />
        <h3 className="text-base font-normal text-[var(--text-primary)]">
          Moderation Queue is Clear
        </h3>
        <p className="text-xs text-[var(--text-secondary)] italic mt-1">
          There are no pending reader reflections awaiting author review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-serif">
      <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-sm">
        {comments.map((comment) => (
          <div key={comment.id} className="p-5 sm:p-6 space-y-3 hover:bg-[var(--bg-canvas)]/50 transition-colors">
            {/* Header: Story Title & Commenter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs uppercase tracking-wider text-[var(--color-terracotta)]">
                  {comment.story_title}
                </span>
                <span className="text-[var(--text-muted)] text-xs">•</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {comment.author_name}
                </span>
                {comment.author_email && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] bg-[var(--bg-canvas)] px-2 py-0.5 rounded-xs border border-[var(--border-subtle)] font-mono">
                    <Mail className="w-3 h-3 text-[var(--color-banyan)]" />
                    <span>{comment.author_email}</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Submitted {new Date(comment.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Reflection Content */}
            <div className="p-3.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] italic leading-relaxed">
              &ldquo;{comment.content}&rdquo;
            </div>

            {/* Moderation Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                disabled={actionLoadingId === comment.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 dark:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-sm transition-colors disabled:opacity-50"
              >
                {actionLoadingId === comment.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Reject / Delete</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(comment.id)}
                disabled={actionLoadingId === comment.id}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-banyan)] hover:opacity-90 text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-all shadow-xs disabled:opacity-50"
              >
                {actionLoadingId === comment.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Approve for Public Page</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
