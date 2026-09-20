import React from 'react';
import { Skeleton } from '@/components/skeletons/SkeletonBase';

export default function MediaLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-8 font-serif">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs overflow-hidden p-3 space-y-2"
          >
            <Skeleton className="w-full aspect-[4/3]" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
