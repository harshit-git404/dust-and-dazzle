import React from 'react';
import { Skeleton } from '@/components/skeletons/SkeletonBase';

export default function ChangePasswordLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-md mx-auto space-y-6 font-serif">
      <div className="space-y-1 pb-4 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-48" />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 rounded-xs space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  );
}
