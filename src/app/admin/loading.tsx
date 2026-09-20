import React from 'react';
import { Skeleton } from '@/components/skeletons/SkeletonBase';

export default function AdminLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-8 font-serif">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Story Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs p-4 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]/70 rounded-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
