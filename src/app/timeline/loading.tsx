import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function TimelineLoading() {
  return (
    <div className="py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 font-serif">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 pb-4">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-9 sm:h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 max-w-full mx-auto" />
        </div>

        {/* Timeline track */}
        <div className="relative pl-6 sm:pl-10 space-y-12 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-2 sm:before:left-4 before:w-0.5 before:bg-[var(--border-subtle)]">
          {Array.from({ length: 3 }).map((_, dIdx) => (
            <div key={dIdx} className="space-y-4 relative">
              <div className="flex items-center gap-3 -ml-6 sm:-ml-10">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs space-y-2.5"
                  >
                    <div className="flex justify-between items-baseline">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <SkeletonText lines={2} lastLineWidth="60%" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
