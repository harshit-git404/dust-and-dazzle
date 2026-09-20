import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function CommentsLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-5xl mx-auto space-y-8 font-serif">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
            <SkeletonText lines={2} lastLineWidth="80%" />
          </div>
        ))}
      </div>
    </div>
  );
}
