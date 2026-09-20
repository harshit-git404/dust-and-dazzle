'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { WRITING_PROMPTS, getRandomPrompt, WritingPrompt } from '@/content/writing-prompts';

export function WritingPromptPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize or fetch a prompt when opened
  const handleOpen = () => {
    if (!currentPrompt) {
      setCurrentPrompt(getRandomPrompt());
    }
    setIsOpen(true);
  };

  const handleNext = () => {
    setCurrentPrompt((prev) => getRandomPrompt(prev?.id));
  };

  const handleClose = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block font-serif">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--color-terracotta)] hover:bg-[var(--bg-surface-elevated)] hover:border-[var(--color-terracotta)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-diya)] transition-all shadow-xs"
        title="Get an inspiring story memory prompt"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--color-diya)]" />
        <span className="font-medium">Need a spark?</span>
      </button>

      {isOpen && currentPrompt && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Story Writing Prompt"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-subtle)]/70">
            <div className="flex items-center gap-1.5 text-[var(--color-terracotta)] text-xs uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-diya)]" />
              <span>A Spark of Memory</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm hover:bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-diya)]"
              aria-label="Close spark prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Tag */}
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] border border-[var(--color-terracotta)]/20">
              {currentPrompt.category}
            </span>
          </div>

          {/* Prompt Text */}
          <p className="font-serif italic text-sm text-[var(--text-primary)] leading-relaxed my-3 select-text">
            &ldquo;{currentPrompt.text}&rdquo;
          </p>

          {/* Action Footer */}
          <div className="pt-3 mt-3 border-t border-[var(--border-subtle)]/60 flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)] font-serif italic">
              {currentPrompt.id} of {WRITING_PROMPTS.length} prompts
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm font-medium bg-[var(--color-terracotta)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-diya)] transition-all shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Another spark</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
