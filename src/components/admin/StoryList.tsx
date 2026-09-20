'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Story, StoryVisibility } from '@/types/story';
import {
  reorderStoriesAction,
  updateStoryVisibilityAction,
  StoryReadStats,
} from '@/app/actions/stories';
import { DeleteStoryModal } from '@/components/admin/DeleteStoryModal';
import { ReadSparkline } from '@/components/admin/ReadSparkline';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Edit3,
  Trash2,
  Clock,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  FileEdit,
  Loader2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface StoryListProps {
  initialStories: Story[];
  readStats?: StoryReadStats;
}

export function StoryList({ initialStories, readStats = {} }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeStoryToDelete, setActiveStoryToDelete] = useState<Story | null>(null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<string | null>(null);

  // Helper to persist order
  const saveNewOrder = async (updatedStories: Story[]) => {
    setIsReordering(true);
    setStories(updatedStories);
    try {
      const storyIds = updatedStories.map((s) => s.id);
      await reorderStoriesAction(storyIds);
    } catch (err) {
      console.error('Failed to save reordered stories', err);
    } finally {
      setIsReordering(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const nextList = [...stories];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(index - 1, 0, item);
    saveNewOrder(nextList);
  };

  const moveDown = (index: number) => {
    if (index === stories.length - 1) return;
    const nextList = [...stories];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(index + 1, 0, item);
    saveNewOrder(nextList);
  };

  // HTML5 Drag and Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const nextList = [...stories];
    const draggedItem = nextList.splice(draggedIndex, 1)[0];
    nextList.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setStories(nextList);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveNewOrder(stories);
  };

  // Quick visibility change
  const handleVisibilityChange = async (storyId: string, newVisibility: StoryVisibility) => {
    setUpdatingVisibilityId(storyId);
    try {
      const res = await updateStoryVisibilityAction(storyId, newVisibility);
      if (res.success) {
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, visibility: newVisibility } : s))
        );
      }
    } catch (err) {
      console.error('Visibility update error', err);
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  const handleDeleted = (deletedId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== deletedId));
  };

  if (stories.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--bg-canvas)] border border-dashed border-[var(--border-subtle)] rounded-sm font-serif">
        <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-3" />
        <h3 className="text-base font-normal text-[var(--text-primary)]">
          No stories in the manuscript yet
        </h3>
        <p className="text-xs text-[var(--text-secondary)] italic mt-1 mb-4">
          Begin writing your first chapter to populate the collection.
        </p>
        <Link
          href="/admin/story/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-terracotta)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm hover:bg-[var(--color-terracotta-hover)] transition-colors"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Write Chapter I</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-serif">
      {isReordering && (
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--color-terracotta)]/30 rounded-sm text-xs text-center text-[var(--color-terracotta)] flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating sequential order...</span>
        </div>
      )}

      <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-sm">
        {stories.map((story, index) => {
          const wordCount = story.content_html
            ? story.content_html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
            : 0;

          const isPublished = story.visibility === 'published';
          const isDraft = story.visibility === 'draft';
          const isPrivate = story.visibility === 'private';

          return (
            <div
              key={story.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                draggedIndex === index
                  ? 'bg-[var(--color-terracotta)]/5 border border-dashed border-[var(--color-terracotta)]'
                  : 'hover:bg-[var(--bg-canvas)]/60'
              }`}
            >
              {/* Drag Handle & Order Number */}
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 hidden sm:block shrink-0"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Mobile / Keyboard Reorder Arrows */}
                <div className="flex flex-col sm:hidden shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || isReordering}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === stories.length - 1 || isReordering}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-7 h-7 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs flex items-center justify-center font-mono font-medium shrink-0">
                  {index + 1}
                </div>

                {/* Story Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/story/${story.id}`}
                      className="font-serif text-base sm:text-lg font-normal text-[var(--text-primary)] hover:text-[var(--color-terracotta)] transition-colors line-clamp-1"
                    >
                      {story.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)] flex-wrap">
                    <span className="font-semibold text-[var(--color-terracotta)] uppercase tracking-wider text-[11px]">
                      {story.chapter_label}
                    </span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{story.reading_time}</span>
                    </span>
                    {story.year && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{story.year}</span>
                        </span>
                      </>
                    )}
                    {story.updated_at && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline italic">
                          Edited {new Date(story.updated_at).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {readStats[story.id] && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] font-medium" title="Reads in last 30 days / All-time approximate">
                          <TrendingUp className="w-3 h-3 text-[var(--color-terracotta)]" />
                          <span>Reads (approx): {readStats[story.id].totalReads}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">({readStats[story.id].last30DaysReads} in 30d)</span>
                          <ReadSparkline data={readStats[story.id].dailySparkline} />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                {/* Desktop Up/Down for Keyboard Accessibility */}
                <div className="hidden sm:flex items-center border border-[var(--border-subtle)] rounded-sm bg-[var(--bg-canvas)]">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || isReordering}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 border-r border-[var(--border-subtle)]"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === stories.length - 1 || isReordering}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Visibility Selector */}
                <div className="relative">
                  {updatingVisibilityId === story.id ? (
                    <div className="px-2.5 py-1 text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  ) : (
                    <select
                      value={story.visibility}
                      onChange={(e) =>
                        handleVisibilityChange(story.id, e.target.value as StoryVisibility)
                      }
                      className={`text-xs font-serif px-2.5 py-1 rounded-sm border focus:outline-none transition-colors cursor-pointer ${
                        isPublished
                          ? 'bg-[var(--color-banyan)]/10 text-[var(--color-banyan)] border-[var(--color-banyan)]/30 font-medium'
                          : isDraft
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  )}
                </div>

                {/* Edit Button */}
                <Link
                  href={`/admin/story/${story.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--color-terracotta)] border border-[var(--border-subtle)] rounded-sm hover:bg-[var(--bg-canvas)] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setActiveStoryToDelete(story)}
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 p-1.5 border border-red-500/20 hover:border-red-500/40 rounded-sm hover:bg-red-500/10 transition-colors"
                  title="Delete chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliberate Deletion Modal */}
      <DeleteStoryModal
        story={activeStoryToDelete}
        isOpen={!!activeStoryToDelete}
        onClose={() => setActiveStoryToDelete(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
