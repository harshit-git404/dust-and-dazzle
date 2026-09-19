'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { SiteSettings } from '@/types/story';
import { updateSiteSettingsAction } from '@/app/actions/settings';
import { uploadPhotoAction } from '@/app/actions/media';
import { DiyaDivider } from '@/components/DiyaDivider';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  User,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

interface SiteSettingsFormProps {
  initialSettings: SiteSettings;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [dedication, setDedication] = useState(initialSettings.dedication || '');
  const [authorBio, setAuthorBio] = useState(initialSettings.author_bio || '');
  const [portraitUrl, setPortraitUrl] = useState(initialSettings.portrait_url || '');
  const [portraitCaption, setPortraitCaption] = useState(initialSettings.portrait_caption || '');

  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPortrait(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadPhotoAction(formData);
      if (res.success && res.url) {
        setPortraitUrl(res.url);
      } else {
        setError(res.error || 'Portrait upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingPortrait(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await updateSiteSettingsAction({
        dedication,
        author_bio: authorBio,
        portrait_url: portraitUrl || null,
        portrait_caption: portraitCaption || null,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to update settings');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-serif max-w-2xl">
      {success && (
        <div className="p-4 bg-emerald-950/10 border border-emerald-500/30 rounded-sm text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Site settings and homepage frontispiece updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dedication Card */}
      <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-3">
        <div className="flex items-center gap-2 text-[var(--color-terracotta)] font-medium text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Book Dedication &amp; Inscription</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] italic">
          Displayed prominently on the homepage frontispiece.
        </p>
        <textarea
          rows={3}
          value={dedication}
          onChange={(e) => setDedication(e.target.value)}
          placeholder="Enter book dedication..."
          className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
        />
      </div>

      {/* Author Bio Card */}
      <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-3">
        <div className="flex items-center gap-2 text-[var(--color-terracotta)] font-medium text-sm">
          <User className="w-4 h-4" />
          <span>Author Biographical Note</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] italic">
          Short note about Ajeet Kumar Singh displayed on the frontispiece and about section.
        </p>
        <textarea
          rows={4}
          value={authorBio}
          onChange={(e) => setAuthorBio(e.target.value)}
          placeholder="Enter author biography..."
          className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
        />
      </div>

      {/* Author Portrait Photo Card */}
      <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-4">
        <div className="flex items-center gap-2 text-[var(--color-terracotta)] font-medium text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>Author Portrait Photograph</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] italic">
          Archival portrait displayed with vintage paper plate frame on the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {portraitUrl ? (
            <div className="relative w-32 h-40 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm overflow-hidden shrink-0 shadow-xs">
              <Image
                src={portraitUrl}
                alt="Author portrait"
                fill
                unoptimized
                className="object-cover sepia-[0.25]"
              />
            </div>
          ) : (
            <div className="w-32 h-40 bg-[var(--bg-canvas)] border border-dashed border-[var(--border-subtle)] rounded-sm flex flex-col items-center justify-center text-[var(--text-muted)] shrink-0 text-center p-2">
              <User className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] italic">No portrait selected</span>
            </div>
          )}

          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--color-terracotta)] text-xs text-[var(--text-primary)] rounded-sm cursor-pointer transition-colors">
                {uploadingPortrait ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-terracotta)]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                )}
                <span>Upload New Portrait Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePortraitUpload}
                  disabled={uploadingPortrait}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Portrait Caption
              </label>
              <input
                type="text"
                value={portraitCaption}
                onChange={(e) => setPortraitCaption(e.target.value)}
                placeholder="e.g. Ajeet Kumar Singh, Author & Chronicler"
                className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending || uploadingPortrait}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Settings...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Site Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
