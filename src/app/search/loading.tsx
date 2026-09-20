import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function SearchLoading() {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-8 font-serif">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Search Input Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-xs" />
          <Skeleton className="h-3 w-48" />
        </div>

        {/* Results List */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-3 w-20" />
              </div>
              <SkeletonText lines={2} lastLineWidth="75%" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
