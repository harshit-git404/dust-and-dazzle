'use client';

import React, { useRef, ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';
import { FlameSpinner } from './FlameSpinner';

export interface PendingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean;
  pendingText?: string;
  spinnerPlacement?: 'left' | 'right';
  minWidth?: string;
}

export function PendingButton({
  children,
  isPending: explicitPending,
  pendingText,
  spinnerPlacement = 'left',
  minWidth,
  disabled,
  onClick,
  className = '',
  type = 'button',
  ...props
}: PendingButtonProps) {
  // Check form status if inside a form
  const formStatus = useFormStatus();
  const isPending = explicitPending !== undefined ? explicitPending : formStatus.pending;

  // Double click guard ref to prevent fast double submissions
  const isSubmittingRef = useRef(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending || isSubmittingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      isSubmittingRef.current = true;
      try {
        onClick(e);
      } finally {
        // Reset guard after 600ms debounce
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 600);
      }
    }
  };

  const displayText = isPending && pendingText ? pendingText : children;

  return (
    <button
      type={type}
      disabled={disabled || isPending}
      aria-busy={isPending ? 'true' : 'false'}
      onClick={handleClick}
      style={minWidth ? { minWidth } : undefined}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 select-none ${
        isPending ? 'cursor-not-allowed opacity-80' : ''
      } ${className}`}
      {...props}
    >
      {isPending && spinnerPlacement === 'left' && (
        <FlameSpinner size="sm" className="text-current" />
      )}
      <span className="inline-flex items-center gap-1.5">{displayText}</span>
      {isPending && spinnerPlacement === 'right' && (
        <FlameSpinner size="sm" className="text-current" />
      )}
    </button>
  );
}
