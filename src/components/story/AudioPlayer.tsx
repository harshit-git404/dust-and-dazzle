'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, Download, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  storyTitle: string;
  slug: string;
  chapterLabel?: string;
  durationSeconds?: number | null;
  mimeType?: string | null;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function AudioPlayer({
  src,
  storyTitle,
  slug,
  chapterLabel,
  durationSeconds,
  mimeType,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [canPlay, setCanPlay] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `dust_audio_pos_${slug}`;

  // Check canPlayType on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && mimeType) {
      const tempAudio = document.createElement('audio');
      const support = tempAudio.canPlayType(mimeType);
      if (support === '') {
        setCanPlay(false);
      }
    }
  }, [mimeType]);

  // Restore saved playback position
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedTime = parseFloat(saved);
        if (!isNaN(savedTime) && savedTime > 0) {
          setCurrentTime(savedTime);
          if (audioRef.current) {
            audioRef.current.currentTime = savedTime;
          }
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Media Session API integration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: storyTitle,
          artist: 'Ajeet Kumar Singh',
          album: 'Dust and Dazzle',
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          skip(-15);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          skip(15);
        });
      } catch {
        // ignore
      }
    }
  }, [storyTitle]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    // Save position to localStorage
    try {
      localStorage.setItem(storageKey, cur.toString());
    } catch {
      // ignore
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (!isNaN(dur) && dur > 0) {
      setDuration(dur);
    }
    setIsLoaded(true);

    // Restore saved time if available
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedTime = parseFloat(saved);
        if (!isNaN(savedTime) && savedTime < dur) {
          audioRef.current.currentTime = savedTime;
          setCurrentTime(savedTime);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  if (!canPlay) {
    return (
      <div className="my-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm font-serif text-xs text-[var(--text-secondary)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This author recording cannot be played directly on this device.</span>
        </div>
        <a
          href={src}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[var(--color-terracotta)] text-white text-xs hover:bg-[var(--color-terracotta-hover)]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Audio</span>
        </a>
      </div>
    );
  }

  return (
    <div className="my-8 p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm shadow-[0_2px_12px_rgba(43,29,20,0.04)] font-serif">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-diya)] animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-terracotta)] font-semibold">
            Listen, in the author&apos;s voice
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] italic">
          Recorded by Ajeet Kumar Singh
        </span>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => skip(-15)}
            aria-label="Rewind 15 seconds"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] rounded-full transition-colors cursor-pointer"
            title="Rewind 15 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            className="w-10 h-10 rounded-full bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-hover)] text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)]"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => skip(15)}
            aria-label="Fast forward 15 seconds"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] rounded-full transition-colors cursor-pointer"
            title="Forward 15 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Scrubber & Timers */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio scrubber slider"
            className="w-full h-1.5 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--color-terracotta)]"
          />

          <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Speed & Direct Download */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={cyclePlaybackRate}
            aria-label={`Playback speed ${playbackRate}x`}
            className="px-2.5 py-1 text-xs font-mono rounded-xs border border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            title="Click to cycle playback speed"
          >
            {playbackRate}x
          </button>

          <a
            href={src}
            download
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] rounded-full transition-colors"
            title="Download original audio file"
            aria-label="Download audio recording"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
