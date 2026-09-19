import React from 'react';

interface DiyaDividerProps {
  className?: string;
  variant?: 'flourish' | 'simple' | 'asterisk';
}

export function DiyaDivider({ className = '', variant = 'flourish' }: DiyaDividerProps) {
  return (
    <div className={`flex items-center justify-center my-10 ${className}`} aria-hidden="true">
      <div className="h-[1px] flex-1 max-w-[120px] bg-[var(--border-subtle)]" />
      
      {variant === 'flourish' && (
        <div className="mx-4 flex items-center gap-1.5 text-[var(--color-diya)]">
          <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[var(--color-diya)] opacity-70" />
          <svg className="w-4 h-4 text-[var(--color-diya)] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C12 2 8 8 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 8 12 2 12 2Z" />
            <path d="M5 19C5 18.4477 5.44772 18 6 18H18C18.5523 18 19 18.4477 19 19C19 20.6569 15.866 22 12 22C8.13401 22 5 20.6569 5 19Z" opacity="0.8" />
          </svg>
          <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[var(--color-diya)] opacity-70" />
        </div>
      )}

      {variant === 'asterisk' && (
        <div className="mx-4 text-xs tracking-widest text-[var(--color-diya)] font-serif">
          ✦ ✦ ✦
        </div>
      )}

      {variant === 'simple' && (
        <div className="mx-3 w-1.5 h-1.5 rotate-45 bg-[var(--color-diya)]" />
      )}

      <div className="h-[1px] flex-1 max-w-[120px] bg-[var(--border-subtle)]" />
    </div>
  );
}
