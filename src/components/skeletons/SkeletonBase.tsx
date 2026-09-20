import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

export function Skeleton({
  className = '',
  rounded = 'sm',
  ...props
}: SkeletonProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-xs',
    md: 'rounded-sm',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none bg-[var(--border-subtle)]/50 dark:bg-[var(--border-subtle)]/30 ${roundedClass} ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = '',
  lastLineWidth = '70%',
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div aria-hidden="true" className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}
