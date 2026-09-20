import React from 'react';
import { Skeleton, SkeletonText } from '@/components/skeletons/SkeletonBase';

export default function RootLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-8 lg:px-12 font-serif">
      <div className="w-full max-w-5xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs shadow-md p-6 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column (Title & Dedication) */}
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-10 sm:h-12 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <div className="w-12 h-0.5 bg-[var(--border-subtle)] my-6" />
            <Skeleton className="h-4 w-48" />
            <SkeletonText lines={3} lastLineWidth="60%" className="pt-2" />
            <div className="pt-4 flex gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          {/* Right Column (Frontispiece Photo Plate) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[4/5] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 shadow-sm flex flex-col justify-between">
              <Skeleton className="w-full h-4/5" />
              <Skeleton className="h-3 w-1/2 mx-auto mt-2" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
