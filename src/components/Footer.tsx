import React from 'react';
import Link from 'next/link';
import { DiyaDivider } from './DiyaDivider';
import { SITE_CREDIT } from '@/content/credit';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto font-serif">
        <div className="text-center">
          <DiyaDivider variant="flourish" className="my-6 max-w-md mx-auto" />

          <h3 className="text-xl font-normal tracking-wide text-[var(--text-primary)]">
            Dust and Dazzle
          </h3>
          <p className="text-sm italic text-[var(--text-secondary)] mt-1">
            Tales from a Village and a City
          </p>

          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mt-4">
            By Ajeet Kumar Singh
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--color-terracotta)] transition-colors">
              Frontispiece
            </Link>
            <span className="text-[var(--border-subtle)]">✦</span>
            <Link href="/toc" className="hover:text-[var(--color-terracotta)] transition-colors">
              Contents
            </Link>
            <span className="text-[var(--border-subtle)]">✦</span>
            <Link href="/story/the-forgotten-pillar" className="hover:text-[var(--color-terracotta)] transition-colors">
              Chapter I
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Copyright on Left, Credit Line on Right Corner */}
        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-[var(--text-muted)] tracking-wider">
            &copy; {new Date().getFullYear()} Ajeet Kumar Singh. All literary rights reserved.
          </p>
          <p className="text-[13px] italic text-[var(--text-muted)] font-serif sm:text-right">
            {SITE_CREDIT}
          </p>
        </div>
      </div>
    </footer>
  );
}
