'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, ListFilter, Moon, Sun, Feather } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-canvas)]/90 border-b border-[var(--border-subtle)]/70 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand / Book Title */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[var(--color-terracotta)]/15 text-[var(--color-terracotta)] group-hover:bg-[var(--color-terracotta)] group-hover:text-[var(--bg-canvas)] transition-all">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
              Dust and Dazzle
            </span>
            <span className="hidden sm:inline font-serif text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              Ajeet Kumar Singh
            </span>
          </div>
        </Link>

        {/* Center & Right Navigation Actions (Only existing pages) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/toc"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm font-serif text-sm transition-all ${
              pathname === '/toc'
                ? 'bg-[var(--bg-surface-elevated)] text-[var(--color-terracotta)] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Contents</span>
          </Link>

          {/* Reading Mode Toggle (Daylight / Candlelight) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm font-serif text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all"
            title={theme === 'daylight' ? 'Switch to Candlelight reading mode' : 'Switch to Daylight reading mode'}
            aria-label="Toggle Reading Mode"
          >
            {theme === 'daylight' ? (
              <>
                <Moon className="w-4 h-4 text-[var(--color-diya)]" />
                <span className="hidden sm:inline">Candlelight</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[var(--color-diya)]" />
                <span className="hidden sm:inline">Daylight</span>
              </>
            )}
          </button>

          {/* Author Studio Login */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--color-terracotta)] hover:bg-[var(--bg-surface)] rounded-sm transition-all"
            title="Author Studio"
          >
            <Feather className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Author</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
