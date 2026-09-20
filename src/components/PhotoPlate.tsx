import React from 'react';
import Image from 'next/image';

interface PhotoPlateProps {
  src: string;
  alt: string;
  caption?: string | null;
  year?: string | null;
  width?: number;
  height?: number;
  effect?: 'tape-top' | 'tape-corners' | 'corner-pins' | 'simple-frame' | 'auto';
  rotation?: number;
  className?: string;
}

/**
 * Deterministic string hash function.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const EFFECTS: ('tape-top' | 'tape-corners' | 'corner-pins' | 'simple-frame')[] = [
  'tape-top',
  'tape-corners',
  'corner-pins',
  'simple-frame',
];

const ROTATIONS = [
  'sm:rotate-[-0.75deg]',
  'sm:rotate-[0.8deg]',
  'sm:rotate-[-1.2deg]',
  'sm:rotate-[0.5deg]',
  'sm:rotate-[-0.4deg]',
  'sm:rotate-[1.1deg]',
];

export function PhotoPlate({
  src,
  alt,
  caption,
  year,
  width = 800,
  height = 540,
  effect = 'auto',
  rotation,
  className = '',
}: PhotoPlateProps) {
  const hash = hashString(src || 'photo');
  const chosenEffect = effect === 'auto' ? EFFECTS[hash % EFFECTS.length] : effect;
  const chosenRotation = rotation !== undefined ? '' : ROTATIONS[hash % ROTATIONS.length];
  const customRotationStyle = rotation !== undefined ? { transform: `rotate(${rotation}deg)` } : undefined;

  return (
    <figure
      style={customRotationStyle}
      className={`relative my-10 mx-auto max-w-2xl group transition-transform duration-300 ${chosenRotation} ${className}`}
    >
      {/* Tape & Pin decorations */}
      {chosenEffect === 'tape-top' && <div className="washi-tape-top" aria-hidden="true" />}
      {chosenEffect === 'tape-corners' && (
        <>
          <div className="washi-tape-corner-tl" aria-hidden="true" />
          <div className="washi-tape-corner-tr" aria-hidden="true" />
        </>
      )}
      {chosenEffect === 'corner-pins' && (
        <>
          <div className="corner-pin -top-2 -left-2" aria-hidden="true" />
          <div className="corner-pin -top-2 -right-2" aria-hidden="true" />
        </>
      )}

      {/* Outer Paper Frame */}
      <div className="relative p-3 sm:p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-[0_4px_16px_rgba(43,29,20,0.08)] rounded-sm">
        {/* Inner double border archival inset */}
        <div className="relative overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <Image
            src={src}
            alt={alt || 'Archival photograph plate'}
            width={width}
            height={height}
            unoptimized={src.startsWith('http')}
            className="w-full h-auto object-cover sepia-[0.25] contrast-[1.04] brightness-[0.97] transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>

        {(caption || year) && (
          <figcaption className="mt-3 text-center font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] tracking-wide">
            {caption}
            {year && <span className="ml-2 font-normal not-italic text-[var(--text-muted)] text-xs font-mono">• Circa {year}</span>}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

