import React from 'react';

interface FlameSpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function FlameSpinner({ className = '', size = 'sm' }: FlameSpinnerProps) {
  const sizeClass = sizeMap[size] || sizeMap.sm;

  return (
    <svg
      className={`animate-spin motion-reduce:animate-none shrink-0 ${sizeClass} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading..."
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2C12 2 15 6 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 6 12 2 12 2ZM12 14C9.79 14 8 15.79 8 18C8 20.21 9.79 22 12 22C14.21 22 16 20.21 16 18C16 15.79 14.21 14 12 14Z"
      />
    </svg>
  );
}
