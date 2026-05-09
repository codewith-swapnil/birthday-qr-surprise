import React from 'react';
import styles from './BirthdayWish.module.css';

interface PhotoGridProps {
  images: string[];
}

/**
 * Responsive photo grid that adapts its layout to the number of images.
 *
 * | count | layout                              |
 * |-------|-------------------------------------|
 * | 1     | single centred card (4:3)           |
 * | 2     | two equal columns (1:1)             |
 * | 3     | first image full-width (16:9), then 2-col |
 * | 4     | 2×2 grid (1:1)                      |
 * | 5     | first image full-width, then 2×2    |
 * | 6–8   | 2-col grid (1:1)                    |
 */
export default function PhotoGrid({ images }: PhotoGridProps) {
  if (!images.length) return null;

  const count = images.length;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '0.6rem',
    gridTemplateColumns: count === 1 ? '1fr' : 'repeat(2, 1fr)',
    maxWidth: count === 1 ? 420 : '100%',
    margin: count === 1 ? '0 auto' : undefined,
  };

  return (
    <div style={gridStyle}>
      {images.map((src, i) => {
        // First image spans full width when total count is 3 or 5
        const spanFull = (count === 3 || count === 5) && i === 0;

        const cellStyle: React.CSSProperties = {
          gridColumn: spanFull ? 'span 2' : undefined,
          aspectRatio: count === 1 ? '4/3' : spanFull ? '16/9' : '1/1',
        };

        return (
          <div key={src} className={styles.photoCell} style={cellStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Memory ${i + 1}`}
              loading={i < 2 ? 'eager' : 'lazy'}
              className={styles.photoImg}
            />
          </div>
        );
      })}
    </div>
  );
}