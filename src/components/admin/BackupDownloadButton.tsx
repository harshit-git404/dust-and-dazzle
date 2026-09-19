'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { exportAllStoriesData } from '@/app/actions/stories';
import { Download, Loader2, FileJson, Archive } from 'lucide-react';

export function BackupDownloadButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDownload = async (type: 'json' | 'zip') => {
    setIsExporting(true);
    setMenuOpen(false);

    try {
      const res = await exportAllStoriesData();
      if (!res.success || !res.stories) {
        alert(`Backup failed: ${res.error || 'Unknown error'}`);
        return;
      }

      const dateStr = new Date().toISOString().split('T')[0];

      if (type === 'json') {
        const jsonContent = JSON.stringify(res.stories, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dust-and-dazzle-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const zip = new JSZip();

        res.stories.forEach((story) => {
          const frontmatter = [
            '---',
            `title: "${story.title.replace(/"/g, '\\"')}"`,
            `chapter_label: "${story.chapter_label}"`,
            `order_index: ${story.order_index}`,
            `slug: "${story.slug}"`,
            `visibility: "${story.visibility}"`,
            story.year ? `year: "${story.year}"` : null,
            `reading_time: "${story.reading_time}"`,
            `excerpt: "${story.excerpt.replace(/"/g, '\\"')}"`,
            '---',
            '',
            `# ${story.title}`,
            '',
            story.content_html
              .replace(/<p>/gi, '')
              .replace(/<\/p>/gi, '\n\n')
              .replace(/<h3>/gi, '### ')
              .replace(/<\/h3>/gi, '\n\n')
              .replace(/<blockquote>/gi, '> ')
              .replace(/<\/blockquote>/gi, '\n\n')
              .replace(/<hr\s*\/?>/gi, '\n---\n\n')
              .replace(/<em>/gi, '*')
              .replace(/<\/em>/gi, '*')
              .replace(/<strong>/gi, '**')
              .replace(/<\/strong>/gi, '**')
              .replace(/<br\s*\/?>/gi, '\n')
              .trim(),
          ]
            .filter((line) => line !== null)
            .join('\n');

          const filename = `${String(story.order_index).padStart(2, '0')}-${story.slug}.md`;
          zip.file(filename, frontmatter);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dust-and-dazzle-manuscript-markdown-${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      alert(`Export error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm hover:border-[var(--color-terracotta)] transition-colors disabled:opacity-50"
        title="Download full database backup"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
        )}
        <span>Download Backup</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-sm shadow-lg z-50 py-1 font-serif text-xs">
          <button
            onClick={() => handleDownload('json')}
            className="w-full text-left px-3 py-2 hover:bg-[var(--bg-canvas)] flex items-center gap-2 text-[var(--text-primary)]"
          >
            <FileJson className="w-4 h-4 text-[var(--color-terracotta)]" />
            <div>
              <div className="font-medium">JSON Database Backup</div>
              <div className="text-[10px] text-[var(--text-muted)]">Complete records with metadata</div>
            </div>
          </button>

          <button
            onClick={() => handleDownload('zip')}
            className="w-full text-left px-3 py-2 hover:bg-[var(--bg-canvas)] flex items-center gap-2 text-[var(--text-primary)] border-t border-[var(--border-subtle)]/50"
          >
            <Archive className="w-4 h-4 text-[var(--color-banyan)]" />
            <div>
              <div className="font-medium">Markdown ZIP Archive</div>
              <div className="text-[10px] text-[var(--text-muted)]">16 formatted .md story files</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
