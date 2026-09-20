'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { PendingButton } from '@/components/ui/PendingButton';

interface SearchInputProps {
  initialQuery?: string;
}

export function SearchInput({ initialQuery = '' }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/search');
      return;
    }

    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mb-10 max-w-xl mx-auto"
    >
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-4 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words, places, years, or memories..."
          maxLength={100}
          autoFocus
          className="w-full pl-11 pr-28 py-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm text-sm font-serif text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)] shadow-sm"
        />
        <div className="absolute right-2">
          <PendingButton
            type="submit"
            isPending={isPending}
            pendingText="Searching..."
            className="px-4 py-1.5 rounded-xs bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-white text-xs font-serif font-medium transition-all shadow-xs"
          >
            <span>Search</span>
          </PendingButton>
        </div>
      </div>
    </form>
  );
}
