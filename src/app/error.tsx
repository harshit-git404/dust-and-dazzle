'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { DiyaDivider } from '@/components/DiyaDivider';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for diagnostics
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <p className="text-xs uppercase font-serif tracking-widest text-[var(--color-terracotta)] mb-2">
          Manuscript Disturbance • Error
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal mb-4">
          An Ink Blot on the Page
        </h1>

        <DiyaDivider variant="flourish" className="my-6" />

        <p className="font-serif italic text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md mx-auto">
          An unforeseen flutter has interrupted the reading of this page. You may turn the leaf once more or return to the frontispiece.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif text-sm transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Turn Page Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 bg-[var(--bg-surface)] text-[var(--text-primary)] font-serif text-sm transition-all"
          >
            <Home className="w-4 h-4 text-[var(--color-terracotta)]" />
            <span>Frontispiece</span>
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)]/60 text-xs text-[var(--text-muted)] font-serif italic">
          Dust and Dazzle — Tales from a Village and a City
        </div>
      </div>
    </div>
  );
}
