'use client';

import React, { useState, useEffect } from 'react';
import { Story, StoryPhoto } from '@/types/story';
import { PhotoPlate } from '@/components/PhotoPlate';
import { Bookmark, Clock, Sparkles } from 'lucide-react';

interface StoryMarginaliaProps {
  story: Story;
}

export function StoryMarginalia({ story }: StoryMarginaliaProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, Math.round(current))));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const photos = story.photos && story.photos.length > 0 ? story.photos : [];

  return (
    <aside className="hidden xl:block w-[280px] shrink-0">
      <div className="sticky top-24 space-y-6">
        
        {/* If Story has Archival Photos: Display in Right Marginalia */}
        {photos.length > 0 ? (
          <div className="space-y-6">
            <div className="pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-[11px] uppercase font-serif tracking-[0.2em] font-semibold text-[var(--color-terracotta)]">
                Archival Plates ({photos.length})
              </span>
            </div>

            {photos.map((photo, i) => (
              <div key={photo.url || i} className="transform scale-95 origin-top-left">
                <PhotoPlate
                  src={photo.url}
                  alt={photo.alt_text || story.title}
                  caption={photo.caption}
                  year={photo.year}
                  effect={(photo.frame_style as any) || 'tape-corners'}
                  rotation={photo.rotation_deg}
                  width={320}
                  height={220}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Stories Without Photos: Reading Progress Marginalia */
          <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-4 shadow-[0_2px_8px_rgba(43,29,20,0.03)] font-serif">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-medium">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Reading Progress</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[var(--border-subtle)]/50 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--color-terracotta)] h-full transition-all duration-150 rounded-full"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{scrollProgress}% completed</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{story.reading_time}</span>
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)]/70 text-[11px] text-[var(--text-muted)] italic leading-relaxed">
              &ldquo;{story.chapter_label}: {story.title.replace(/^\[Placeholder\]\s*/, '')}&rdquo;
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
