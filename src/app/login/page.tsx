'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DiyaDivider } from '@/components/DiyaDivider';
import { Feather, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AuthorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[var(--color-terracotta)] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Frontispiece</span>
        </Link>

        {/* Login Card */}
        <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-[0_4px_16px_rgba(43,29,20,0.06)]">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] flex items-center justify-center mb-3">
              <Feather className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
              Author Studio
            </h1>
            <p className="font-serif italic text-xs text-[var(--text-muted)] mt-1">
              Private access for Ajeet Kumar Singh
            </p>
          </div>

          <DiyaDivider variant="flourish" className="my-6" />

          <div className="mb-4 p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-secondary)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-terracotta)] shrink-0 mt-0.5" />
            <span>
              Author credentials and Supabase database authentication will be activated in <strong>Phase 2</strong>.
            </span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 font-serif">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Author Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@dustanddazzle.com"
                disabled
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)] disabled:opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)] disabled:opacity-60 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full mt-2 py-3 rounded-sm bg-[var(--color-terracotta)] text-[#FFF8F5] font-serif text-sm font-medium opacity-60 cursor-not-allowed"
            >
              Sign In to Studio (Phase 2)
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
