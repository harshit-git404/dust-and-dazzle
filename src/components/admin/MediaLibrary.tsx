'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/story';
import { listMediaAction, uploadPhotoAction, deletePhotoAction } from '@/app/actions/media';
import { preparePhotoForUpload } from '@/lib/client-image-resizer';
import { PendingButton } from '@/components/ui/PendingButton';
import { useFeedback } from '@/context/FeedbackContext';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export function MediaLibrary() {
  const { showSuccess, showError } = useFeedback();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await listMediaAction();
      if (res.success && res.media) {
        setMediaList(res.media);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Downscale and compress in browser to protect Vercel payload limits
      const processed = await preparePhotoForUpload(file);
      const formData = new FormData();
      formData.append('file', processed.file);

      const res = await uploadPhotoAction(formData);
      if (res.success) {
        showSuccess('Photo optimized and uploaded to library.');
        fetchMedia();
      } else {
        const msg = res.error || 'Upload failed';
        setUploadError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
      showError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    const targetItem = mediaList.find((m) => m.name === filename);
    if (!targetItem) return;

    // Optimistic remove
    setMediaList((prev) => prev.filter((m) => m.name !== filename));
    setDeletingId(filename);

    try {
      const res = await deletePhotoAction(filename);
      if (res.success) {
        showSuccess(`Deleted "${filename}".`);
      } else {
        // Rollback
        setMediaList((prev) => [targetItem, ...prev]);
        showError('Failed to delete photo from storage.', () => handleDelete(filename));
      }
    } catch (err) {
      setMediaList((prev) => [targetItem, ...prev]);
      showError('Network error deleting photo.', () => handleDelete(filename));
    } finally {
      setDeletingId(null);
    }
  };

  const unusedCount = mediaList.filter((m) => !m.is_used).length;

  return (
    <div className="space-y-6 font-serif">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--color-terracotta)]" />
            <span>Archival Photo Library</span>
          </h2>
          <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
            {mediaList.length} photos total ({unusedCount} unreferenced / unused files)
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-sm ${uploading ? 'opacity-80 cursor-not-allowed' : ''}`}>
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Preparing & Uploading...' : 'Upload Archival Photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-terracotta)]" />
          <span>Loading archival media...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-canvas)] border border-dashed border-[var(--border-subtle)] rounded-sm">
          <ImageIcon className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-primary)] font-normal">No photographs in storage</p>
          <p className="text-xs text-[var(--text-secondary)] italic mt-1">
            Upload JPEG, PNG, or WebP images. They will be compressed to WebP and stripped of all metadata.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList.map((item) => (
            <div
              key={item.id || item.name}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:border-[var(--color-terracotta)]/40 transition-colors"
            >
              {/* Image Preview */}
              <div className="relative aspect-4/3 bg-[var(--bg-canvas)] overflow-hidden border-b border-[var(--border-subtle)] group">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover sepia-[0.2] transition-transform duration-500 group-hover:scale-105"
                />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View full image"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Details & Status */}
              <div className="p-3.5 space-y-2 text-xs">
                <div className="font-mono text-[11px] text-[var(--text-primary)] truncate" title={item.name}>
                  {item.name}
                </div>

                <div className="flex items-center justify-between text-[var(--text-muted)] text-[11px]">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {/* Usage Status */}
                <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between">
                  {item.is_used ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-banyan)] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>In Use ({item.used_in_stories?.length || 1})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      <span>Unused / Orphan</span>
                    </span>
                  )}

                  <PendingButton
                    type="button"
                    onClick={() => handleDelete(item.name)}
                    isPending={deletingId === item.name}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                    title="Delete photo from storage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </PendingButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
