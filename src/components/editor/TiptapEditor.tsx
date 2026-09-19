'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import ImageExtension from '@tiptap/extension-image';
import { Story, StoryVisibility } from '@/types/story';
import { saveStoryAction } from '@/app/actions/stories';
import { uploadPhotoAction } from '@/app/actions/media';
import { cleanPastedText, calculateReadingTime, generateExcerpt } from '@/lib/editor-utils';
import { DiyaDivider } from '@/components/DiyaDivider';
import { PhotoPlate } from '@/components/PhotoPlate';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Italic,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Sparkles,
  Calendar,
  Save,
  ArrowLeft,
  RotateCcw,
  Image as ImageIcon,
  MessageSquare,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface TiptapEditorProps {
  story?: Story | null;
}

export function TiptapEditor({ story }: TiptapEditorProps) {
  const router = useRouter();

  const [storyId, setStoryId] = useState<string | undefined>(story?.id);
  const [title, setTitle] = useState(story?.title || '');
  const [subtitle, setSubtitle] = useState(story?.subtitle || '');
  const [year, setYear] = useState(story?.year || '');
  const [chapterLabel, setChapterLabel] = useState(story?.chapter_label || '');
  const [excerpt, setExcerpt] = useState(story?.excerpt || '');
  const [visibility, setVisibility] = useState<StoryVisibility>(story?.visibility || 'draft');
  const [allowComments, setAllowComments] = useState<boolean>(
    story?.allow_comments !== undefined ? story.allow_comments : true
  );

  // Optimistic concurrency tracking
  const [lastKnownUpdatedAt, setLastKnownUpdatedAt] = useState<string | null>(
    story?.updated_at || null
  );
  const [concurrencyConflict, setConcurrencyConflict] = useState<string | null>(null);

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'unsaved' | 'error' | 'offline_saved'
  >('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(
    story?.updated_at ? new Date(story.updated_at) : new Date()
  );
  const [timeAgoText, setTimeAgoText] = useState('just now');

  // Preview Mode Toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Paste Cleanup Banner state
  const [pasteNotice, setPasteNotice] = useState<{
    show: boolean;
    changesCount: number;
    rawSnapshot: string | null;
  }>({ show: false, changesCount: 0, rawSnapshot: null });

  // Local draft restored banner
  const [restoredNotice, setRestoredNotice] = useState<boolean>(false);

  // Photo insert modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoAlt, setPhotoAlt] = useState('');
  const [photoYear, setPhotoYear] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // References for debounced autosave
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
        bulletList: false,
        orderedList: false,
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder:
          'Begin writing your chapter here... Keep the quiet rhythm of the village and the city.',
      }),
      CharacterCount,
    ],
    content: story?.content_json || story?.content_html || '',
    editorProps: {
      attributes: {
        class:
          'story-prose font-serif text-[18px] sm:text-[20px] text-[var(--text-primary)] leading-[1.8] tracking-[0.01em] min-h-[400px] sm:min-h-[550px] outline-none focus:outline-none p-4 sm:p-8',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        const { cleanedText, modified, changesCount } = cleanPastedText(text);

        if (modified && changesCount > 0) {
          event.preventDefault();
          view.dispatch(view.state.tr.insertText(cleanedText));

          setPasteNotice({
            show: true,
            changesCount,
            rawSnapshot: text,
          });

          setTimeout(() => {
            setPasteNotice((prev) => ({ ...prev, show: false }));
          }, 8000);

          return true;
        }

        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleDirectImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: () => {
      isDirtyRef.current = true;
      setSaveStatus('unsaved');
      triggerDebouncedAutosave();
    },
  });

  // Check for local storage recovery on initial load
  useEffect(() => {
    try {
      const storageKey = `story_backup_${storyId || 'new'}`;
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        const draftDate = new Date(parsed.timestamp).getTime();
        const serverDate = story?.updated_at ? new Date(story.updated_at).getTime() : 0;

        if (draftDate > serverDate + 5000 && parsed.contentHtml && parsed.contentHtml.length > 50) {
          setRestoredNotice(true);
        }
      }
    } catch {
      // ignore
    }
  }, [storyId, story?.updated_at]);

  const loadSavedLocalDraft = () => {
    try {
      const storageKey = `story_backup_${storyId || 'new'}`;
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft && editor) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.year) setYear(parsed.year);
        if (parsed.excerpt) setExcerpt(parsed.excerpt);
        if (parsed.visibility) setVisibility(parsed.visibility);
        if (parsed.contentJson) {
          editor.commands.setContent(parsed.contentJson);
        } else if (parsed.contentHtml) {
          editor.commands.setContent(parsed.contentHtml);
        }
        setRestoredNotice(false);
      }
    } catch {
      // ignore
    }
  };

  const discardLocalDraft = () => {
    try {
      const storageKey = `story_backup_${storyId || 'new'}`;
      localStorage.removeItem(storageKey);
      setRestoredNotice(false);
    } catch {
      // ignore
    }
  };

  // Direct drop upload handler
  const handleDirectImageUpload = async (file: File) => {
    setUploadingPhoto(true);
    setPhotoUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadPhotoAction(formData);
      if (res.success && res.url && editor) {
        editor
          .chain()
          .focus()
          .setImage({
            src: res.url,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            title: file.name,
          })
          .run();
      } else {
        alert(res.error || 'Photo upload failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Photo modal submit handler
  const handlePhotoModalUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      setPhotoUploadError('Please select a photo file.');
      return;
    }

    setUploadingPhoto(true);
    setPhotoUploadError(null);

    try {
      const res = await uploadPhotoAction(formData);
      if (res.success && res.url && editor) {
        editor
          .chain()
          .focus()
          .setImage({
            src: res.url,
            alt: photoAlt.trim() || file.name,
            title: photoCaption.trim() || undefined,
          })
          .run();

        setIsPhotoModalOpen(false);
        setPhotoCaption('');
        setPhotoAlt('');
        setPhotoYear('');
      } else {
        setPhotoUploadError(res.error || 'Photo upload failed');
      }
    } catch (err) {
      setPhotoUploadError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Calculate live word count and reading time
  const plainText = editor?.getText() || '';
  const { wordCount, readingTime } = calculateReadingTime(plainText);

  // Perform Save
  const performSave = useCallback(
    async (isManual = false) => {
      if (!editor) return;

      setSaveStatus('saving');
      const contentHtml = editor.getHTML();
      const contentJson = editor.getJSON();

      // Local storage backup first
      const storageKey = `story_backup_${storyId || 'new'}`;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            title,
            subtitle,
            year,
            excerpt,
            visibility,
            allowComments,
            contentHtml,
            contentJson,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.warn('LocalStorage backup error', err);
      }

      try {
        const res = await saveStoryAction({
          id: storyId,
          title: title.trim() || 'Untitled Story',
          subtitle: subtitle.trim() || null,
          chapter_label: chapterLabel.trim() || undefined,
          year: year.trim() || null,
          excerpt: excerpt.trim() || undefined,
          content_html: contentHtml,
          content_json: contentJson as Record<string, unknown>,
          visibility,
          allow_comments: allowComments,
          lastKnownUpdatedAt,
        });

        if (res.conflict) {
          setConcurrencyConflict(res.error || 'Conflict detected');
          setSaveStatus('error');
          return;
        }

        if (res.success && res.story) {
          isDirtyRef.current = false;
          setSaveStatus('saved');
          setLastSavedTime(new Date());
          setLastKnownUpdatedAt(res.story.updated_at || new Date().toISOString());

          if (!storyId && res.story.id) {
            setStoryId(res.story.id);
            window.history.replaceState(null, '', `/admin/story/${res.story.id}`);
          }
        } else {
          setSaveStatus('offline_saved');
        }
      } catch (err) {
        console.error('Save error', err);
        setSaveStatus('offline_saved');
      }
    },
    [
      editor,
      storyId,
      title,
      subtitle,
      chapterLabel,
      year,
      excerpt,
      visibility,
      allowComments,
      lastKnownUpdatedAt,
    ]
  );

  // Trigger Debounced Autosave (2.5s)
  const triggerDebouncedAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      performSave(false);
    }, 2500);
  }, [performSave]);

  // Update time-ago string every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatus === 'saved') {
        const diffSeconds = Math.floor((new Date().getTime() - lastSavedTime.getTime()) / 1000);
        if (diffSeconds < 10) {
          setTimeAgoText('just now');
        } else if (diffSeconds < 60) {
          setTimeAgoText(`${diffSeconds}s ago`);
        } else {
          const diffMinutes = Math.floor(diffSeconds / 60);
          setTimeAgoText(`${diffMinutes}m ago`);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [lastSavedTime, saveStatus]);

  // Warn before closing/leaving if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleUndoPaste = () => {
    if (editor && pasteNotice.rawSnapshot) {
      editor.commands.undo();
      setPasteNotice({ show: false, changesCount: 0, rawSnapshot: null });
    }
  };

  return (
    <div className="space-y-6 font-serif pb-20">
      
      {/* Top Navigation & Autosave Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Studio</span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Autosave Status Badge */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-sm border border-[var(--border-subtle)]">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-terracotta)]" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Saved {timeAgoText}</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved edits</span>
              </>
            )}
            {saveStatus === 'offline_saved' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Local copy preserved (Offline)</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Save failed</span>
              </>
            )}
          </div>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border transition-colors ${
              isPreviewMode
                ? 'bg-[var(--color-terracotta)] text-[#FFF8F5] border-[var(--color-terracotta)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Return to Editor</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                <span>Reader Preview</span>
              </>
            )}
          </button>

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={() => performSave(true)}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-[#FFF8F5] text-xs font-serif uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Restored Draft Notice */}
      {restoredNotice && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>A newer unsaved draft was found in your browser storage.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSavedLocalDraft}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-xs font-medium hover:bg-amber-700"
            >
              Restore Draft
            </button>
            <button
              onClick={discardLocalDraft}
              className="px-2 py-1 text-amber-700 dark:text-amber-300 hover:underline"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Concurrency Conflict Warning Banner */}
      {concurrencyConflict && (
        <div className="p-4 bg-red-950/15 border border-red-500/40 rounded-sm text-xs text-red-800 dark:text-red-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Simultaneous Modification Guard</p>
              <p className="mt-0.5">{concurrencyConflict}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-sm shrink-0"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Paste Cleanup Notice */}
      {pasteNotice.show && (
        <div className="p-3 bg-[var(--color-diya)]/15 border border-[var(--color-diya)]/30 rounded-sm text-xs flex items-center justify-between gap-3 text-[var(--text-primary)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-terracotta)]" />
            <span>
              Cleaned pasted text (rejoined broken lines &amp; removed page artifacts).
            </span>
          </div>
          <button
            onClick={handleUndoPaste}
            className="inline-flex items-center gap-1 text-[var(--color-terracotta)] hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* PREVIEW MODE */}
      {isPreviewMode ? (
        <div className="p-6 sm:p-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-sm max-w-[680px] mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
              {chapterLabel || 'Chapter'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text-primary)] mt-2 leading-tight">
              {title || 'Untitled Chapter'}
            </h1>
            {subtitle && (
              <p className="font-serif italic text-base text-[var(--text-secondary)] mt-2">
                {subtitle}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 mt-4 text-xs text-[var(--text-muted)] font-serif">
              {year && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Circa {year}</span>
                </span>
              )}
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime}</span>
              </span>
            </div>

            <DiyaDivider variant="flourish" className="my-6" />
          </div>

          <div
            className="story-prose font-serif text-[18px] sm:text-[20px] text-[var(--text-primary)] leading-[1.8] tracking-[0.01em] space-y-6"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
          />

          <DiyaDivider variant="flourish" className="my-10" />
        </div>
      ) : (
        /* EDITOR MODE */
        <div className="space-y-6">
          
          {/* Metadata Controls Card */}
          <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Title Field */}
              <div className="sm:col-span-8">
                <label
                  htmlFor="story-title"
                  className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
                >
                  Story Title
                </label>
                <input
                  id="story-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    isDirtyRef.current = true;
                    setSaveStatus('unsaved');
                    triggerDebouncedAutosave();
                  }}
                  placeholder="e.g. The Forgotten Pillar"
                  className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-base font-serif text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
                />
              </div>

              {/* Visibility Selector */}
              <div className="sm:col-span-4">
                <label
                  htmlFor="story-visibility"
                  className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
                >
                  Visibility
                </label>
                <select
                  id="story-visibility"
                  value={visibility}
                  onChange={(e) => {
                    setVisibility(e.target.value as StoryVisibility);
                    isDirtyRef.current = true;
                    setSaveStatus('unsaved');
                    triggerDebouncedAutosave();
                  }}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)] cursor-pointer"
                >
                  <option value="draft">Draft (Author only)</option>
                  <option value="published">Published (Public)</option>
                  <option value="private">Private (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Chapter Label */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="story-chapter"
                  className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
                >
                  Chapter Label
                </label>
                <input
                  id="story-chapter"
                  type="text"
                  value={chapterLabel}
                  onChange={(e) => {
                    setChapterLabel(e.target.value);
                    isDirtyRef.current = true;
                    setSaveStatus('unsaved');
                    triggerDebouncedAutosave();
                  }}
                  placeholder="e.g. Chapter I"
                  className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
                />
              </div>

              {/* Optional Year */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="story-year"
                  className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
                >
                  Year / Circa (Optional)
                </label>
                <input
                  id="story-year"
                  type="text"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    isDirtyRef.current = true;
                    setSaveStatus('unsaved');
                    triggerDebouncedAutosave();
                  }}
                  placeholder="e.g. 1974 or Late 1980s"
                  className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
                />
              </div>

              {/* Comments Toggle */}
              <div className="sm:col-span-3 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => {
                      setAllowComments(e.target.checked);
                      isDirtyRef.current = true;
                      setSaveStatus('unsaved');
                      triggerDebouncedAutosave();
                    }}
                    className="w-4 h-4 accent-[var(--color-terracotta)] rounded-xs"
                  />
                  <span>Allow Reader Reflections</span>
                </label>
              </div>

              {/* Live Statistics */}
              <div className="sm:col-span-3 flex items-end">
                <div className="w-full px-3 py-2 bg-[var(--bg-canvas)]/50 border border-[var(--border-subtle)]/70 rounded-sm text-xs text-[var(--text-muted)] flex items-center justify-between">
                  <span>{wordCount} words</span>
                  <span>{readingTime}</span>
                </div>
              </div>
            </div>

            {/* Subtitle / Excerpt */}
            <div>
              <label
                htmlFor="story-excerpt"
                className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1"
              >
                Excerpt / Summary (Optional — Auto-generated if blank)
              </label>
              <textarea
                id="story-excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  isDirtyRef.current = true;
                  setSaveStatus('unsaved');
                  triggerDebouncedAutosave();
                }}
                placeholder="Leave blank to automatically extract opening narrative sentences..."
                className="w-full px-3.5 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs font-serif text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
              />
            </div>
          </div>

          {/* Tiptap Editor & Minimal Calm Toolbar */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-2.5 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] flex items-center gap-1.5 flex-wrap">
              {/* Bold */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor}
                className={`p-2 rounded-xs transition-colors ${
                  editor?.isActive('bold')
                    ? 'bg-[var(--color-terracotta)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor}
                className={`p-2 rounded-xs transition-colors ${
                  editor?.isActive('italic')
                    ? 'bg-[var(--color-terracotta)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-[var(--border-subtle)] mx-1" />

              {/* Subheading H3 */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={!editor}
                className={`p-2 rounded-xs transition-colors ${
                  editor?.isActive('heading', { level: 3 })
                    ? 'bg-[var(--color-terracotta)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
                title="Subheading H3 (Ctrl+Alt+3)"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              {/* Blockquote */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                disabled={!editor}
                className={`p-2 rounded-xs transition-colors ${
                  editor?.isActive('blockquote')
                    ? 'bg-[var(--color-terracotta)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
                title="Blockquote (Ctrl+Shift+B)"
              >
                <Quote className="w-4 h-4" />
              </button>

              {/* Decorative Divider */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                disabled={!editor}
                className="p-2 rounded-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
                title="Decorative Divider"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-[var(--border-subtle)] mx-1" />

              {/* Photo Plate Insertion */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                disabled={!editor}
                className="inline-flex items-center gap-1 p-2 rounded-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--color-terracotta)] transition-colors"
                title="Insert Archival Photo Plate"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Photo</span>
              </button>

              <div className="w-[1px] h-5 bg-[var(--border-subtle)] mx-1" />

              {/* Undo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="p-2 rounded-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>

              {/* Redo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="p-2 rounded-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Editorial Writing Body Canvas */}
            <div className="max-w-[680px] mx-auto">
              <EditorContent editor={editor} />
            </div>

          </div>

        </div>
      )}

      {/* Archival Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--color-terracotta)]" />
                <h3 className="text-base font-normal text-[var(--text-primary)]">
                  Insert Archival Photo
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {photoUploadError && (
              <div className="mb-4 p-2.5 bg-red-950/10 border border-red-500/30 rounded-sm text-xs text-red-700 dark:text-red-300">
                {photoUploadError}
              </div>
            )}

            <form onSubmit={handlePhotoModalUpload} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Select Image File (JPEG, PNG, WebP)
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-xs text-[var(--text-primary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-serif file:bg-[var(--color-terracotta)] file:text-white hover:file:bg-[var(--color-terracotta-hover)]"
                />
                <p className="text-[10px] text-[var(--text-muted)] italic mt-1">
                  Image is compressed to WebP and all EXIF/GPS metadata is stripped automatically.
                </p>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Alt Text (Required for accessibility)
                </label>
                <input
                  type="text"
                  value={photoAlt}
                  onChange={(e) => setPhotoAlt(e.target.value)}
                  placeholder="e.g. Clay pottery in the village courtyard"
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Photo Caption (Optional)
                </label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="e.g. Village square during the festival of lights"
                  className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-terracotta)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  disabled={uploadingPhoto}
                  className="px-3.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-white text-xs rounded-sm transition-all disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing &amp; Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Insert into Chapter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
