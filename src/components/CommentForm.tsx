'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { submitCommentAction } from '@/app/actions/comments';
import { Feather, Send, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

interface CommentFormProps {
  storyId: string;
}

export function CommentForm({ storyId }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [renderTimeToken, setRenderTimeToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRenderTimeToken(Date.now().toString());
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await submitCommentAction({
        storyId,
        authorName: name,
        authorEmail: email || undefined,
        content,
        honeypot,
        renderTimeToken,
      });

      if (res.success) {
        setIsSuccess(true);
        setName('');
        setEmail('');
        setContent('');
      } else {
        setError(res.error || 'Failed to submit reflection.');
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="p-6 bg-[var(--bg-canvas)] border border-[var(--color-banyan)]/30 rounded-sm text-center font-serif space-y-2">
        <CheckCircle2 className="w-6 h-6 mx-auto text-[var(--color-banyan)]" />
        <h4 className="text-base font-normal text-[var(--text-primary)]">
          Reflection Received
        </h4>
        <p className="text-xs text-[var(--text-secondary)] italic max-w-md mx-auto">
          Thank you for sharing your thoughts. Your reflection will be quietly reviewed by the author before appearing on the page.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-3 text-xs text-[var(--color-terracotta)] hover:underline"
        >
          Leave another reflection
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-serif">
      {error && (
        <div className="p-3 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden Honeypot Field for anti-bot defense */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp">Leave this field blank</label>
        <input
          id="website-hp"
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reader-name" className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Your Name / Pen Name <span className="text-[var(--color-terracotta)]">*</span>
          </label>
          <input
            id="reader-name"
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anand S."
            className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
          />
        </div>

        <div>
          <label htmlFor="reader-email" className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Email <span className="text-[10px] text-[var(--text-muted)] italic">(Optional &amp; Private)</span>
          </label>
          <input
            id="reader-email"
            type="email"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Never shared or published"
            className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reader-reflection" className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Your Thoughts &amp; Reflections <span className="text-[var(--color-terracotta)]">*</span>
        </label>
        <textarea
          id="reader-reflection"
          required
          rows={3}
          maxLength={1000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a memory, reaction, or reflection inspired by this story..."
          className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[var(--color-banyan)]" />
            <span>Moderated gently by the author before display.</span>
          </span>
          <span>{content.length}/1000</span>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors shadow-xs disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending Reflection...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Reflection</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
