'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { changePasswordAction } from '@/app/actions/stories';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PendingButton } from '@/components/ui/PendingButton';
import { ArrowLeft, Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction(password);
      if (res.success) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to change password');
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto font-serif py-6">
      
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Studio</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-normal text-[var(--text-primary)]">
            Change Studio Password
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] italic">
          Update the security credentials for your author account.
        </p>

        <DiyaDivider variant="simple" className="my-6" />

        {success && (
          <div className="mb-6 p-4 bg-emerald-950/10 border border-emerald-500/30 rounded-sm text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your author password has been successfully updated!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
            />
          </div>

          <div className="pt-2">
            <PendingButton
              type="submit"
              isPending={isPending}
              pendingText="Updating Password..."
              className="w-full py-2.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </PendingButton>
          </div>
        </form>
      </div>

    </div>
  );
}
