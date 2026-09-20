import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedStories, getStoryBySlug } from '@/lib/stories';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PhotoPlate } from '@/components/PhotoPlate';
import { StoryCollectionSidebar } from '@/components/story/StoryCollectionSidebar';
import { StoryMarginalia } from '@/components/story/StoryMarginalia';
import { TextSizeControl } from '@/components/story/TextSizeControl';
import { ArrowLeft, ArrowRight, Clock, Calendar, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

import { getApprovedComments } from '@/lib/comments';
import { CommentForm } from '@/components/CommentForm';
import { SITE_CREDIT } from '@/content/credit';
import { StoryPhoto } from '@/types/story';

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
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cleanTitle = story.title.replace(/^\[Placeholder\]\s*/, '');
  const url = `${siteUrl}/story/${story.slug}`;

  // Extract first image from story photos if available
  const firstPhoto = story.photos && story.photos.length > 0 ? story.photos[0].url : undefined;

  return {
    title: cleanTitle,
    description: story.excerpt || `Read "${cleanTitle}", a story from Dust and Dazzle by Ajeet Kumar Singh.`,
    authors: [{ name: 'Ajeet Kumar Singh' }],
    openGraph: {
      type: 'article',
      url,
      title: `${cleanTitle} — Dust and Dazzle`,
      description: story.excerpt || `Read "${cleanTitle}" by Ajeet Kumar Singh.`,
      siteName: 'Dust and Dazzle',
      authors: ['Ajeet Kumar Singh'],
      images: firstPhoto
        ? [
            {
              url: firstPhoto,
              alt: story.photos?.[0]?.alt_text || cleanTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanTitle} — Dust and Dazzle`,
      description: story.excerpt || `Read "${cleanTitle}" by Ajeet Kumar Singh.`,
      images: firstPhoto ? [firstPhoto] : undefined,
    },
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

  const storyPhotos: StoryPhoto[] =
    story.photos && story.photos.length > 0
      ? story.photos
      : story.cover_image_url
      ? [
          {
            url: story.cover_image_url,
            caption: story.image_caption || undefined,
            alt_text: story.title.replace(/^\[Placeholder\]\s*/, ''),
            year: story.year || undefined,
            frame_style: 'tape-top',
            rotation_deg: 0,
          },
        ]
      : [];

  return (
    <div className="py-8 sm:py-14 lg:py-18 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex justify-center gap-8 xl:gap-12">
        
        {/* Sticky Left Sidebar: Collection Index (Visible on wide screens >= 1280px) */}
        <StoryCollectionSidebar stories={allPublished} currentSlug={slug} />

        {/* Central Reading Column (Standard 680px Width) */}
        <article className="max-w-[680px] w-full shrink-0">
          
          {/* Top Control Bar: Breadcrumb, Chapter Label, and Text Size Control */}
          <div className="flex items-center justify-between text-xs font-serif text-[var(--text-muted)] mb-8 pb-3 border-b border-[var(--border-subtle)]/70">
            <Link
              href="/toc"
              className="flex items-center gap-1.5 text-[var(--color-terracotta)] hover:underline font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Contents</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-[var(--color-terracotta)] uppercase tracking-wider text-[11px]">
                {story.chapter_label} of XVI
              </span>
              <TextSizeControl />
            </div>
          </div>

          {/* Story Title & Header */}
          <header className="text-center my-6 sm:my-8">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] leading-[1.18] tracking-tight">
              {story.title.replace(/^\[Placeholder\]\s*/, '')}
            </h1>

            {story.subtitle && (
              <p className="mt-3 font-serif italic text-base sm:text-lg text-[var(--text-secondary)]">
                {story.subtitle}
              </p>
            )}

            {/* Metadata Row */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-[var(--text-muted)] font-serif">
              {story.year && (
                <span className="inline-flex items-center gap-1 text-[var(--color-banyan)] font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{story.year}</span>
                </span>
              )}
              {story.year && <span>•</span>}
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{story.reading_time}</span>
              </span>
            </div>

            <DiyaDivider variant="flourish" className="my-6 sm:my-8" />
          </header>

          {/* Inline Photo Display for Screens Under 1280px (or single cover photo) */}
          {storyPhotos.length > 0 && (
            <div className="xl:hidden my-8 space-y-6">
              {storyPhotos.map((photo, idx) => (
                <PhotoPlate
                  key={photo.url || idx}
                  src={photo.url}
                  alt={photo.alt_text || story.title}
                  caption={photo.caption}
                  year={photo.year}
                  effect={(photo.frame_style as any) || 'tape-top'}
                  rotation={photo.rotation_deg}
                  width={680}
                  height={420}
                />
              ))}
            </div>
          )}

          {/* Reading Body Column (Optimized 680px editorial width with dynamic text sizing) */}
          <div 
            className="story-prose font-serif text-[var(--text-primary)] tracking-[0.01em] space-y-6 selection:bg-[var(--color-diya)]/25"
            style={{
              fontSize: 'var(--story-font-size, 20px)',
              lineHeight: 'var(--story-line-height, 36px)',
            }}
            dangerouslySetInnerHTML={{ __html: story.content_html }}
          />

          {/* Author's Note (Optional reflection from author) */}
          {story.author_note && story.author_note.trim().length > 0 && (
            <div className="my-10 p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-[0_2px_8px_rgba(43,29,20,0.03)]">
              <div className="text-[11px] uppercase tracking-widest text-[var(--color-terracotta)] font-semibold mb-2.5">
                Author&apos;s Note
              </div>
              <div className="font-serif italic text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed space-y-2">
                {story.author_note.split(/\n\s*\n/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </div>
          )}

          <DiyaDivider variant="flourish" className="my-12 sm:my-16" />
 
          {/* Print-only Story End Credit */}
          <div className="hidden print-credit">
            {SITE_CREDIT}
          </div>

          {/* Continuous Story Flow (Previous / Next Chapter Navigation) */}
          <nav className="mt-10 pt-6 border-t border-[var(--border-subtle)]" aria-label="Story Navigation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Previous Chapter */}
              {prevStory ? (
                <Link
                  href={`/story/${prevStory.slug}`}
                  className="group p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all"
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
                  className="group p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)]/40 rounded-sm transition-all text-right sm:text-left"
                >
                  <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs font-serif uppercase tracking-widest text-[var(--text-muted)] mb-1">
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
                    Return to Table of Contents
                  </span>
                </Link>
              )}

            </div>
          </nav>

          {/* Reader Reflections Section */}
          <section className="mt-14 sm:mt-16 p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[var(--color-terracotta)]" />
              <h3 className="font-serif text-lg font-normal text-[var(--text-primary)]">
                Reader Reflections
              </h3>
            </div>

            <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
              Reader comments are quietly reviewed and moderated by the author before appearing on the page.
            </p>

            {/* List of Approved Comments */}
            {approvedComments.length > 0 ? (
              <div className="space-y-4 mb-8">
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
              <div className="p-4 bg-[var(--bg-canvas)]/50 border border-[var(--border-subtle)]/50 rounded-sm text-center mb-8">
                <p className="text-xs font-serif italic text-[var(--text-muted)]">
                  No reflections shared for this chapter yet. Be the first to share your thoughts below.
                </p>
              </div>
            )}

            {/* Comment Submission Form */}
            {story.allow_comments !== false ? (
              <div className="pt-6 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-serif uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Leave a Reflection
                </h4>
                <CommentForm storyId={story.id} />
              </div>
            ) : (
              <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] italic font-serif">
                Reflections are closed for this chapter.
              </div>
            )}
          </section>

        </article>

        {/* Right Marginalia: Archival Photos or Reading Progress (Visible on wide screens >= 1280px) */}
        <StoryMarginalia story={story} />

      </div>
    </div>
  );
}
