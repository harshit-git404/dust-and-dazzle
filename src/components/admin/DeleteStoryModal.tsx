'use client';

import React, { useState } from 'react';
import { Story } from '@/types/story';
import { deleteStoryAction } from '@/app/actions/stories';
import { PendingButton } from '@/components/ui/PendingButton';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteStoryModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export function DeleteStoryModal({
  story,
  isOpen,
  onClose,
  onDeleted,
}: DeleteStoryModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !story) return null;

  const isMatching = confirmText.trim().toLowerCase() === story.title.trim().toLowerCase() || confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!isMatching) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await deleteStoryAction(story.id);
      if (res.success) {
        onDeleted(story.id);
        onClose();
      } else {
        setError(res.error || 'Failed to delete story');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-red-500/30 rounded-sm shadow-xl p-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-medium">Delete Chapter Permanently</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story details */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4">
          You are about to delete <strong className="text-[var(--text-primary)]">{story.title}</strong> ({story.chapter_label}). This action is irreversible and removes the story from the table of contents and database.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Confirmation Requirement */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">
            To confirm, type <span className="font-semibold text-[var(--text-primary)] font-mono">delete</span> or the exact title:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-sm"
          >
            Cancel
          </button>

          <PendingButton
            type="button"
            onClick={handleDelete}
            disabled={!isMatching}
            isPending={isDeleting}
            pendingText="Deleting..."
            minWidth="130px"
            className="px-4 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-medium rounded-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Chapter</span>
          </PendingButton>
        </div>

      </div>
    </div>
  );
}
