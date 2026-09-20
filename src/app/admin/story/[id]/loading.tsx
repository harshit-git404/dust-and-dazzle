import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function StoryEditorLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] font-serif">
      {/* Editor Top Bar */}
      <div className="sticky top-0 z-30 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Editor Body Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 rounded-xs space-y-6">
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-1/2" />
          
          {/* Formatting Toolbar */}
          <div className="flex gap-2 p-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xs">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-6" />
            ))}
          </div>

          <SkeletonText lines={6} lastLineWidth="85%" />
          <SkeletonText lines={5} lastLineWidth="50%" />
        </div>

        {/* Sidebar Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-xs space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-xs space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>

      </div>
    </div>
  );
}
