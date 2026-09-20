import React from 'react';
import { Skeleton } from '@/components/skeletons/SkeletonBase';

export default function LoginLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 sm:p-10 rounded-xs shadow-md space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
