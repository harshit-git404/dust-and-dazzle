'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface StoryShareProps {
  title: string;
  slug: string;
  className?: string;
  variant?: 'inline' | 'button';
}

export function StoryShare({ title, slug, className = '', variant = 'inline' }: StoryShareProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getCanonicalUrl = () => {
    if (typeof window !== 'undefined') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      return `${siteUrl}/story/${slug}`;
    }
    return `/story/${slug}`;
  };

  const handleShare = async () => {
    const url = getCanonicalUrl();
    const shareData = {
      title: `${title} — Dust and Dazzle`,
      text: `Read "${title}" by Ajeet Kumar Singh in Dust and Dazzle`,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowMenu(true);
        }
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const copyToClipboard = async () => {
    const url = getCanonicalUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const getWhatsAppUrl = () => {
    const url = getCanonicalUrl();
    const text = `Read "${title}" from Dust and Dazzle by Ajeet Kumar Singh: ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`relative inline-block font-serif ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share story "${title}"`}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-serif transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)]"
      >
        <Share2 className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
        <span>Share Chapter</span>
      </button>

      {/* Fallback Popover for desktop / unsupported browsers */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 z-40 w-48 p-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm shadow-lg space-y-1">
            <button
              type="button"
              onClick={() => {
                copyToClipboard();
                setTimeout(() => setShowMenu(false), 1200);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] rounded-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </span>
              {copied && <Check className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />}
            </button>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMenu(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] rounded-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
