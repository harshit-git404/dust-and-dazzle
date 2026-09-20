import React from 'react';
import { Skeleton } from '@/components/skeletons/SkeletonBase';

export default function SettingsLoading() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto space-y-8 font-serif">
      <div className="space-y-1 pb-4 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 rounded-xs space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-36 w-48 rounded-xs" />
        </div>

        <Skeleton className="h-10 w-36 mt-4" />
      </div>
    </div>
  );
}
