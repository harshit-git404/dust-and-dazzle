import React from 'react';
import Image from 'next/image';

interface PhotoPlateProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  effect?: 'tape-top' | 'tape-corners' | 'corner-pins' | 'simple-frame';
  className?: string;
}

export function PhotoPlate({
  src,
  alt,
  caption,
  width = 800,
  height = 540,
  effect = 'tape-top',
  className = '',
}: PhotoPlateProps) {
  return (
    <figure className={`relative my-10 mx-auto max-w-2xl group ${className}`}>
      {/* Tape & Pin decorations (lightweight CSS/SVG) */}
      {effect === 'tape-top' && <div className="washi-tape-top" aria-hidden="true" />}
      {effect === 'tape-corners' && (
        <>
          <div className="washi-tape-corner-tl" aria-hidden="true" />
          <div className="washi-tape-corner-tr" aria-hidden="true" />
        </>
      )}
      {effect === 'corner-pins' && (
        <>
          <div className="corner-pin -top-2 -left-2" aria-hidden="true" />
          <div className="corner-pin -top-2 -right-2" aria-hidden="true" />
        </>
      )}

      {/* Outer Paper Frame */}
      <div className="relative p-3 sm:p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-[0_4px_16px_rgba(43,29,20,0.08)] rounded-sm transition-all duration-300">
        {/* Inner double border archival inset */}
        <div className="relative overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-cover sepia-[0.3] contrast-[1.05] brightness-[0.96] transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>

        {caption && (
          <figcaption className="mt-3 text-center font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] tracking-wide">
            {caption}
          </figcaption>
        )}
      </div>
    </figure>
  );
}
