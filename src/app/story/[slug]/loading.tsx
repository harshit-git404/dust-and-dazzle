import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function StoryLoading() {
  return (
    <div className="py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 font-serif">
      <div className="max-w-[680px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Story Header */}
        <div className="text-center space-y-4 pt-4">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-9 sm:h-12 w-4/5 mx-auto" />
          <Skeleton className="h-5 w-3/5 mx-auto" />
          <div className="flex items-center justify-center gap-3 pt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="w-16 h-0.5 bg-[var(--border-subtle)] mx-auto my-6" />
        </div>

        {/* Story Body Reading Flow */}
        <div className="space-y-6 pt-2 leading-relaxed">
          {/* First paragraph with drop-cap placeholder */}
          <div className="flex gap-3 items-start">
            <Skeleton className="w-12 h-14 shrink-0" />
            <div className="space-y-2.5 flex-1 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <SkeletonText lines={4} lastLineWidth="80%" />
          <SkeletonText lines={5} lastLineWidth="65%" />
          
          {/* Photo placeholder */}
          <div className="my-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs">
            <Skeleton className="w-full aspect-[16/10]" />
            <Skeleton className="h-3 w-1/2 mx-auto mt-3" />
          </div>

          <SkeletonText lines={4} lastLineWidth="90%" />
          <SkeletonText lines={3} lastLineWidth="40%" />
        </div>

      </div>
    </div>
  );
}
