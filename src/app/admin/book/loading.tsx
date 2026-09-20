import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function BookLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 font-serif">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-xs space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Book Preview Sheet */}
        <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 sm:p-14 rounded-xs shadow-md space-y-6">
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="w-16 h-0.5 bg-[var(--border-subtle)] mx-auto my-6" />
          <SkeletonText lines={8} lastLineWidth="70%" />
        </div>
      </div>
    </div>
  );
}
