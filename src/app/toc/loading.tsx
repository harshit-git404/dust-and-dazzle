import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function TocLoading() {
  return (
    <div className="py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 font-serif">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 pb-6 border-b border-[var(--border-subtle)]">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-9 sm:h-11 w-64 mx-auto" />
          <Skeleton className="h-4 w-80 max-w-full mx-auto" />
        </div>

        {/* Chapter Rows */}
        <div className="space-y-4 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-3"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
