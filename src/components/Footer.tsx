import React from 'react';
import Link from 'next/link';
import { DiyaDivider } from './DiyaDivider';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto text-center font-serif">
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

        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-[var(--text-secondary)]">
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

        <p className="text-[11px] text-[var(--text-muted)] mt-8 tracking-wider">
          &copy; {new Date().getFullYear()} Ajeet Kumar Singh. All literary rights reserved.
        </p>
      </div>
    </footer>
  );
}
