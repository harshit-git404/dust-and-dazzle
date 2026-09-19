'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DiyaDivider } from '@/components/DiyaDivider';
import { Feather, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const unauthorizedParam = searchParams.get('error') === 'unauthorized';
  const [error, setError] = useState<string | null>(unauthorizedParam ? 'Not authorised.' : null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-[0_4px_16px_rgba(43,29,20,0.06)]">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] flex items-center justify-center mb-3">
          <Feather className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
          Author Studio
        </h1>
        <p className="font-serif italic text-xs text-[var(--text-muted)] mt-1">
          Private access for collection author
        </p>
      </div>

      <DiyaDivider variant="flourish" className="my-6" />

      {error && (
        <div className="mb-4 p-3 bg-red-950/10 border border-red-500/30 rounded-sm text-xs font-serif text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-serif">
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Author Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="author@example.com"
            className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 rounded-sm bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] font-serif text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <span>Enter Studio</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]/60 text-center">
        <p className="text-[11px] text-[var(--text-muted)] font-serif italic">
          Public registration is disabled. Only the designated author account is granted entry.
        </p>
      </div>

    </div>
  );
}

export default function AuthorLoginPage() {
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

        {/* Login Card inside Suspense */}
        <Suspense fallback={
          <div className="p-8 text-center font-serif text-xs text-[var(--text-muted)]">
            Loading Studio login...
          </div>
        }>
          <LoginForm />
        </Suspense>

      </div>
    </div>
  );
}
