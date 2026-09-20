'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mic, MicOff, Square, Play, Pause, Upload, Trash2, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface StoryAudioRecorderProps {
  audioUrl?: string | null;
  audioDurationSeconds?: number | null;
  audioMime?: string | null;
  onChange: (data: { audio_url: string | null; audio_duration_seconds: number | null; audio_mime: string | null }) => void;
}

export function StoryAudioRecorder({
  audioUrl,
  audioDurationSeconds,
  audioMime,
  onChange,
}: StoryAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Audio recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedUrl(url);

        // Stop all mic stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(500); // 500ms chunks
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Microphone access denied';
      if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('NotAllowedError')) {
        setMicError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        setMicError(`Unable to start recording: ${errorMsg}`);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const saveRecordedAudio = async () => {
    if (!recordedBlob) return;
    await uploadBlobToStorage(recordedBlob, `narration_${Date.now()}.${recordedBlob.type.includes('mp4') ? 'm4a' : 'webm'}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('Audio file exceeds the 30 MB size limit.');
      return;
    }

    await uploadBlobToStorage(file, file.name);
  };

  const uploadBlobToStorage = async (blobOrFile: Blob | File, filename: string) => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const supabase = createClient();
      const sanitizedName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      setUploadProgress(40);
      const { data, error } = await supabase.storage
        .from('story-audio')
        .upload(sanitizedName, blobOrFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: blobOrFile.type || 'audio/mpeg',
        });

      if (error) {
        throw error;
      }

      setUploadProgress(80);
      const {
        data: { publicUrl },
      } = supabase.storage.from('story-audio').getPublicUrl(sanitizedName);

      setUploadProgress(100);
      onChange({
        audio_url: publicUrl,
        audio_duration_seconds: recordingDuration > 0 ? recordingDuration : null,
        audio_mime: blobOrFile.type || 'audio/mpeg',
      });

      setRecordedBlob(null);
      setRecordedUrl(null);
      alert('Audio narration uploaded and attached successfully!');
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAudio = () => {
    if (confirm('Are you sure you want to remove the narration from this chapter?')) {
      onChange({
        audio_url: null,
        audio_duration_seconds: null,
        audio_mime: null,
      });
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 sm:p-5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-sm space-y-4 font-serif text-xs">
      
      {/* Existing Attached Audio */}
      {audioUrl ? (
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--color-terracotta)]/30 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-terracotta)] font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Narration Attached</span>
            </div>
            <button
              type="button"
              onClick={removeAudio}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <audio src={audioUrl} controls className="w-full h-8" />
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            URL: {audioUrl}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Microphone Permission Warning */}
          {micError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
          )}

          {/* In-Browser MediaRecorder */}
          <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Option A: Record in Browser
              </span>
              {isRecording && (
                <span className="inline-flex items-center gap-1.5 text-red-600 font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  {formatSecs(recordingDuration)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!isRecording && !recordedBlob && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-white cursor-pointer shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <>
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeRecording}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-amber-600 text-white cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-amber-600 text-white cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-red-600 text-white cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop & Review</span>
                  </button>
                </>
              )}

              {recordedBlob && recordedUrl && (
                <div className="w-full space-y-2 pt-2">
                  <div className="font-medium text-[var(--text-primary)]">Listen to review:</div>
                  <audio src={recordedUrl} controls className="w-full h-8" />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={saveRecordedAudio}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[var(--color-terracotta)] text-white hover:bg-[var(--color-terracotta-hover)] cursor-pointer"
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Save Narration to Chapter</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={startRecording}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xs border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-record</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Upload Option */}
          <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm space-y-2">
            <span className="font-semibold uppercase tracking-wider text-[var(--text-primary)] block">
              Option B: Upload Audio File (e.g. m4a / mp3 from phone voice recorder)
            </span>
            <input
              type="file"
              accept="audio/mp4,audio/x-m4a,audio/mpeg,audio/aac,audio/webm,audio/ogg,audio/wav"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border file:border-[var(--border-subtle)] file:bg-[var(--bg-canvas)] file:text-xs file:font-serif file:cursor-pointer"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-[var(--color-terracotta)] pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading directly to storage ({uploadProgress}%)...</span>
              </div>
            )}
          </div>

          {/* Quality & Format Hint */}
          <p className="text-[11px] text-[var(--text-muted)] italic">
            Tip: 64–96 kbps mono voice recording is ideal for clear speech without large file sizes (max 30 MB).
          </p>

        </div>
      )}

    </div>
  );
}
