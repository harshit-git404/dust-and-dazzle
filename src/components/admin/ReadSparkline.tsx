import React from 'react';

interface ReadSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function ReadSparkline({ data, width = 64, height = 20 }: ReadSparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min;

  const stepX = width / (data.length - 1 || 1);
  const points = data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible inline-block shrink-0"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="var(--color-terracotta)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
