'use client';

import React, { useState } from 'react';
import { Story, SiteSettings } from '@/types/story';
import { toRomanNumeral } from '@/lib/editor-utils';
import { SITE_CREDIT } from '@/content/credit';
import { PendingButton } from '@/components/ui/PendingButton';
import {
  Printer,
  BookOpen,
  Settings2,
  CheckSquare,
  Square,
  Eye,
  FileDown,
  Info,
  Layers,
} from 'lucide-react';
import Image from 'next/image';

interface PrintBookManagerProps {
  allStories: Story[];
  settings: SiteSettings;
}

type TrimSize = '6x9' | 'A5' | 'A4';

export function PrintBookManager({ allStories, settings }: PrintBookManagerProps) {
  // Config state
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>(
    allStories.filter((s) => s.visibility === 'published').map((s) => s.id)
  );
  const [trimSize, setTrimSize] = useState<TrimSize>('6x9');
  const [isGrayscalePhotos, setIsGrayscalePhotos] = useState(false);
  const [includeCover, setIncludeCover] = useState(true);
  const [includeDedication, setIncludeDedication] = useState(true);
  const [includeAuthorBio, setIncludeAuthorBio] = useState(true);
  const [includeContents, setIncludeContents] = useState(true);
  const [includeAuthorNotes, setIncludeAuthorNotes] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeColophon, setIncludeColophon] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const [previewTab, setPreviewTab] = useState<'config' | 'preview'>('preview');

  const selectedStories = allStories.filter((s) => selectedStoryIds.includes(s.id));

  const toggleStorySelection = (storyId: string) => {
    setSelectedStoryIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  const selectAllPublished = () => {
    setSelectedStoryIds(allStories.filter((s) => s.visibility === 'published').map((s) => s.id));
  };

  const selectAll = () => {
    setSelectedStoryIds(allStories.map((s) => s.id));
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const getPageDimensionsCss = () => {
    switch (trimSize) {
      case '6x9':
        return `
          @page {
            size: 6in 9in;
            margin: 0.8in 0.6in 0.8in 0.85in;
          }
          @page :left {
            margin: 0.8in 0.85in 0.8in 0.6in;
          }
          @page :right {
            margin: 0.8in 0.6in 0.8in 0.85in;
          }
        `;
      case 'A5':
        return `
          @page {
            size: 148mm 210mm;
            margin: 20mm 15mm 20mm 22mm;
          }
          @page :left {
            margin: 20mm 22mm 20mm 15mm;
          }
          @page :right {
            margin: 20mm 15mm 20mm 22mm;
          }
        `;
      case 'A4':
        return `
          @page {
            size: 210mm 297mm;
            margin: 25mm 20mm 25mm 28mm;
          }
          @page :left {
            margin: 25mm 28mm 25mm 20mm;
          }
          @page :right {
            margin: 25mm 20mm 25mm 28mm;
          }
        `;
    }
  };

  return (
    <div className="space-y-6 font-serif">
      
      {/* Dynamic Print Stylesheet */}
      <style jsx global>{`
        ${getPageDimensionsCss()}

        @media print {
          /* Hide all UI elements except printable book container */
          header, nav, .no-print, footer, .admin-controls {
            display: none !important;
          }

          body {
            background: #ffffff !important;
            color: #1a1a1a !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
          }

          .book-print-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .book-page {
            page-break-before: always;
            break-before: page;
            min-height: 100%;
          }

          .book-page-first {
            page-break-before: avoid;
            break-before: avoid;
          }

          .chapter-opener {
            page-break-before: always;
            break-before: page;
            padding-top: 1.5in;
          }

          .book-story-body p:first-of-type::first-letter {
            font-family: var(--font-newsreader, 'Newsreader', serif);
            float: left;
            font-size: 3.2em;
            line-height: 0.8;
            padding-top: 4px;
            padding-right: 8px;
            padding-bottom: 2px;
            color: #8C3A27;
          }

          .book-story-body {
            font-size: 11pt;
            line-height: 1.65;
            text-align: justify;
            hyphens: auto;
            widows: 3;
            orphans: 3;
          }

          .book-story-body blockquote,
          .book-story-body figure,
          .book-author-note {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .print-photo {
            ${isGrayscalePhotos ? 'filter: grayscale(100%) contrast(105%);' : ''}
            border: 1px solid #d4c5b9;
            padding: 4px;
            background: #ffffff;
            max-width: 90%;
            margin: 1.5rem auto;
          }
        }
      `}</style>

      {/* Control Panel (Hidden during Print) */}
      <div className="no-print bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-terracotta)]" />
              <h2 className="text-xl font-normal text-[var(--text-primary)]">
                Print-Ready Keepsake Book
              </h2>
            </div>
            <p className="font-serif italic text-xs text-[var(--text-muted)] mt-1">
              Typeset the manuscript for physical printing or Save as PDF with CSS Paged Media.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PendingButton
              type="button"
              onClick={handlePrint}
              isPending={isPrinting}
              pendingText="Preparing Print Dialog..."
              minWidth="175px"
              className="px-5 py-2.5 rounded-sm bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-white text-xs font-serif font-medium shadow-sm transition-all hover:shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </PendingButton>
          </div>
        </div>

        {/* Print Instructions Box */}
        <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-secondary)] flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--color-terracotta)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-medium text-[var(--text-primary)]">Print Dialog Instructions:</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              In the browser print preview: Set <strong>Destination</strong> to &ldquo;Save as PDF&rdquo;, <strong>Margins</strong> to &ldquo;None / Default&rdquo; (handled by book stylesheet), and ensure <strong>Background graphics</strong> is enabled.
            </div>
          </div>
        </div>

        {/* Configuration Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Column 1: Trim Size & Photo Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[var(--color-terracotta)] font-semibold">
              1. Book Format & Photos
            </h3>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Trim Size:
              </label>
              <select
                value={trimSize}
                onChange={(e) => setTrimSize(e.target.value as TrimSize)}
                className="w-full px-3 py-1.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-primary)]"
              >
                <option value="6x9">Trade Paperback (6 × 9 in) — Recommended</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="A4">A4 (210 × 297 mm)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isGrayscalePhotos}
                onChange={(e) => setIsGrayscalePhotos(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Black & White Photos (Archival B&W)</span>
            </label>
          </div>

          {/* Column 2: Sections & Pages */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--color-terracotta)] font-semibold">
              2. Included Pages
            </h3>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Front Cover Page</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeDedication}
                onChange={(e) => setIncludeDedication(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Dedication Page</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeAuthorBio}
                onChange={(e) => setIncludeAuthorBio(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Author Portrait & Bio</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeContents}
                onChange={(e) => setIncludeContents(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeAuthorNotes}
                onChange={(e) => setIncludeAuthorNotes(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Author&apos;s Notes at Chapter End</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Archival Photo Plates</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeColophon}
                onChange={(e) => setIncludeColophon(e.target.checked)}
                className="accent-[var(--color-terracotta)]"
              />
              <span>Colophon & Keepsake Credit</span>
            </label>
          </div>

          {/* Column 3: Stories to include */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-[var(--color-terracotta)] font-semibold">
                3. Stories ({selectedStoryIds.length}/{allStories.length})
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-terracotta)]">
                <button type="button" onClick={selectAllPublished} className="hover:underline">
                  Published
                </button>
                <span>•</span>
                <button type="button" onClick={selectAll} className="hover:underline">
                  All
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-[var(--border-subtle)]/70 p-2 rounded-sm bg-[var(--bg-canvas)]">
              {allStories.map((story) => {
                const isSelected = selectedStoryIds.includes(story.id);
                return (
                  <label
                    key={story.id}
                    className="flex items-center gap-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)] p-1 rounded-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStorySelection(story.id)}
                      className="accent-[var(--color-terracotta)]"
                    />
                    <span className="line-clamp-1">
                      {story.chapter_label}: {story.title}
                    </span>
                    {story.visibility !== 'published' && (
                      <span className="text-[9px] uppercase px-1 rounded-xs bg-amber-500/15 text-amber-700 ml-auto shrink-0">
                        {story.visibility}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Screen Preview Container (Styled like a bound book) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-6 sm:p-12 shadow-md max-w-4xl mx-auto book-print-container">
        
        {/* Cover Page */}
        {includeCover && (
          <section className="book-page book-page-first min-h-[550px] flex flex-col items-center justify-center text-center p-8 border-b-2 border-dashed border-[var(--border-subtle)] mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-medium mb-6">
              A Short Story Collection
            </div>
            <h1 className="text-4xl sm:text-6xl font-normal text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
              Dust and Dazzle
            </h1>
            <p className="italic text-xl sm:text-2xl text-[var(--text-secondary)] mb-8">
              Tales from a Village and a City
            </p>
            <div className="w-24 h-0.5 bg-[var(--color-terracotta)]/40 mx-auto my-6" />
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
              By Ajeet Kumar Singh
            </p>
          </section>
        )}

        {/* Dedication Page */}
        {includeDedication && settings.dedication && (
          <section className="book-page min-h-[450px] flex flex-col items-center justify-center text-center p-8 border-b-2 border-dashed border-[var(--border-subtle)] mb-12">
            <div className="max-w-md mx-auto space-y-4">
              <p className="font-serif italic text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                &ldquo;{settings.dedication}&rdquo;
              </p>
              <div className="text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
                — Dedication
              </div>
            </div>
          </section>
        )}

        {/* Author Bio & Portrait Page */}
        {includeAuthorBio && (settings.portrait_url || settings.author_bio) && (
          <section className="book-page min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-b-2 border-dashed border-[var(--border-subtle)] mb-12">
            {settings.portrait_url && (
              <div className="mb-6 max-w-xs mx-auto">
                <img
                  src={settings.portrait_url}
                  alt="Author Portrait"
                  className="print-photo rounded-xs max-h-72 object-cover mx-auto"
                />
                {settings.portrait_caption && (
                  <p className="italic text-xs text-[var(--text-muted)] mt-2">
                    {settings.portrait_caption}
                  </p>
                )}
              </div>
            )}
            {settings.author_bio && (
              <p className="max-w-md mx-auto italic text-sm text-[var(--text-secondary)] leading-relaxed">
                {settings.author_bio}
              </p>
            )}
          </section>
        )}

        {/* Table of Contents Page */}
        {includeContents && (
          <section className="book-page min-h-[500px] p-8 border-b-2 border-dashed border-[var(--border-subtle)] mb-12">
            <h2 className="text-2xl text-center text-[var(--text-primary)] font-normal mb-8 pb-3 border-b border-[var(--border-subtle)]">
              Contents
            </h2>
            <div className="max-w-lg mx-auto space-y-3 font-serif text-sm">
              {selectedStories.map((story, idx) => (
                <div key={story.id} className="flex items-baseline justify-between gap-4 border-b border-dotted border-[var(--border-subtle)]/60 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[var(--color-terracotta)]">
                      {toRomanNumeral(idx + 1)}.
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {story.title}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] italic shrink-0">
                    {story.chapter_label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chapters */}
        {selectedStories.map((story, index) => {
          const romanNumeral = toRomanNumeral(index + 1);
          return (
            <article key={story.id} className="chapter-opener py-10 border-b-2 border-dashed border-[var(--border-subtle)] mb-12">
              
              {/* Chapter Header */}
              <header className="text-center mb-8 pb-6 border-b border-[var(--border-subtle)]/70">
                <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-semibold mb-2">
                  Chapter {romanNumeral}
                </div>
                <h2 className="text-3xl font-normal text-[var(--text-primary)] tracking-tight">
                  {story.title}
                </h2>
                {story.subtitle && (
                  <p className="italic text-base text-[var(--text-secondary)] mt-2">
                    {story.subtitle}
                  </p>
                )}
                {story.year && (
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-2">
                    Circa {story.year}
                  </p>
                )}
              </header>

              {/* Photos if enabled */}
              {includePhotos && story.photos && story.photos.length > 0 && (
                <div className="my-6 space-y-4">
                  {story.photos.map((photo, pIdx) => (
                    <div key={photo.url || pIdx} className="text-center">
                      <img
                        src={photo.url}
                        alt={photo.alt_text || story.title}
                        className="print-photo rounded-xs max-h-80 mx-auto"
                      />
                      {photo.caption && (
                        <p className="italic text-xs text-[var(--text-muted)] mt-1">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Story Body */}
              <div
                className="book-story-body font-serif text-[var(--text-primary)] space-y-4"
                dangerouslySetInnerHTML={{ __html: story.content_html }}
              />

              {/* Author's Note */}
              {includeAuthorNotes && story.author_note && (
                <div className="book-author-note mt-8 p-4 border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 rounded-xs">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-terracotta)] font-semibold mb-1">
                    Author&apos;s Note
                  </div>
                  <p className="italic text-xs text-[var(--text-secondary)] leading-relaxed">
                    {story.author_note}
                  </p>
                </div>
              )}

            </article>
          );
        })}

        {/* Colophon Page */}
        {includeColophon && (
          <section className="book-page min-h-[400px] flex flex-col items-center justify-center text-center p-8 text-xs text-[var(--text-muted)] space-y-3">
            <div className="w-12 h-0.5 bg-[var(--border-subtle)] mx-auto mb-4" />
            <p className="italic font-serif text-sm text-[var(--text-secondary)]">
              {SITE_CREDIT}
            </p>
            <p className="uppercase tracking-widest text-[10px] text-[var(--text-muted)]">
              Dust and Dazzle Press • Private Family Edition
            </p>
            <p className="font-mono text-[10px]">
              Set in Newsreader and Playfair Display
            </p>
          </section>
        )}

      </div>

    </div>
  );
}
