import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedStories, getStoryBySlug } from '@/lib/stories';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PhotoPlate } from '@/components/PhotoPlate';
import { ArrowLeft, ArrowRight, ListFilter, Clock, Calendar, MessageSquare, Feather } from 'lucide-react';
import type { Metadata } from 'next';

import { getApprovedComments } from '@/lib/comments';

interface StoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const stories = await getPublishedStories();
  return stories.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: 'Story Not Found — Dust and Dazzle' };
  
  return {
    title: `${story.title.replace(/^\[Placeholder\]\s*/, '')} — Dust and Dazzle`,
    description: story.excerpt,
  };
}

export default async function StoryReadingPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const allPublished = await getPublishedStories();
  const currentIndex = allPublished.findIndex((s) => s.slug === slug);
  const prevStory = currentIndex > 0 ? allPublished[currentIndex - 1] : null;
  const nextStory = currentIndex >= 0 && currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1] : null;
  const approvedComments = await getApprovedComments(story.id);

  return (
    <article className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-[680px] mx-auto">
        
        {/* Top Breadcrumb & Chapter Label */}
        <div className="flex items-center justify-between text-xs font-serif uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
          <Link
            href="/toc"
            className="flex items-center gap-1.5 text-[var(--color-terracotta)] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Table of Contents</span>
          </Link>
          <span className="font-semibold text-[var(--color-terracotta)]">
            {story.chapter_label} of XVI
          </span>
        </div>

        {/* Story Title & Header */}
        <header className="text-center my-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)] leading-tight tracking-tight">
            {story.title.replace(/^\[Placeholder\]\s*/, '')}
          </h1>

          {story.subtitle && (
            <p className="mt-3 font-serif italic text-lg sm:text-xl text-[var(--text-secondary)]">
              {story.subtitle}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[var(--text-muted)] font-serif">
            {story.year && (
              <span className="inline-flex items-center gap-1 text-[var(--color-banyan)] font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Circa {story.year}</span>
              </span>
            )}
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{story.reading_time}</span>
            </span>
          </div>

          <DiyaDivider variant="flourish" className="my-8" />
        </header>

        {/* Story Archival Photo Plate (if available) */}
        {story.cover_image_url && (
          <PhotoPlate
            src={story.cover_image_url}
            alt={story.title}
            caption={story.image_caption || 'Archival plate from the family collection'}
            effect="tape-top"
          />
        )}

        {/* Reading Body Column (Optimized 680px editorial width, 20px / 36px Newsreader typography) */}
        <div 
          className="story-prose font-serif text-[18px] sm:text-[20px] text-[var(--text-primary)] leading-[1.8] tracking-[0.01em] space-y-6 selection:bg-[var(--color-diya)]/25"
          dangerouslySetInnerHTML={{ __html: story.content_html }}
        />

        <DiyaDivider variant="flourish" className="my-14" />

        {/* Continuous Story Flow (Previous / Next Chapter Navigation) */}
        <nav className="mt-12 pt-8 border-t border-[var(--border-subtle)]" aria-label="Story Navigation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Previous Chapter */}
            {prevStory ? (
              <Link
                href={`/story/${prevStory.slug}`}
                className="group p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous Chapter</span>
                </div>
                <div className="font-serif text-sm sm:text-base font-normal text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                  {prevStory.chapter_label}: {prevStory.title.replace(/^\[Placeholder\]\s*/, '')}
                </div>
              </Link>
            ) : (
              <Link
                href="/toc"
                className="p-4 sm:p-5 bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]/50 rounded-sm text-center flex flex-col items-center justify-center"
              >
                <span className="font-serif text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  Beginning of Collection
                </span>
                <span className="font-serif text-xs text-[var(--color-terracotta)] mt-1">
                  Return to Table of Contents
                </span>
              </Link>
            )}

            {/* Next Chapter */}
            {nextStory ? (
              <Link
                href={`/story/${nextStory.slug}`}
                className="group p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm transition-all text-right sm:text-right"
              >
                <div className="flex items-center justify-end gap-1.5 text-xs font-serif uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  <span>Next Chapter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-serif text-sm sm:text-base font-normal text-[var(--text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
                  {nextStory.chapter_label}: {nextStory.title.replace(/^\[Placeholder\]\s*/, '')}
                </div>
              </Link>
            ) : (
              <Link
                href="/toc"
                className="p-4 sm:p-5 bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]/50 rounded-sm text-center flex flex-col items-center justify-center"
              >
                <span className="font-serif text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  End of Collection
                </span>
                <span className="font-serif text-xs text-[var(--color-terracotta)] mt-1">
                  View Full Table of Contents
                </span>
              </Link>
            )}

          </div>
        </nav>

        {/* Reader Comments Section (Served strictly via public approved_comments view) */}
        <section className="mt-16 p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-[var(--color-terracotta)]" />
            <h3 className="font-serif text-lg font-normal text-[var(--text-primary)]">
              Reader Reflections &amp; Thoughts
            </h3>
          </div>

          <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
            Reader comments are quietly reviewed and moderated by the author before appearing on the page.
          </p>

          {approvedComments.length > 0 ? (
            <div className="space-y-4">
              {approvedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-serif">
                    <span className="font-medium text-[var(--text-primary)]">{comment.author_name}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] font-serif italic">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[var(--bg-canvas)]/50 border border-[var(--border-subtle)]/50 rounded-sm text-center">
              <p className="text-xs font-serif italic text-[var(--text-muted)]">
                No reflections shared for this chapter yet.
              </p>
            </div>
          )}
        </section>

      </div>
    </article>
  );
}
