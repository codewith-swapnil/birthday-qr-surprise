'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ImageSliderProps {
  images: string[];   // Cloudinary URLs
  name: string;
  onAllFailed?: () => void;  // Called if every image fails → parent shows emoji fallback
}

export default function ImageSlider({ images, name, onAllFailed }: ImageSliderProps) {
  const [current,  setCurrent]  = useState(0);
  const [prev,     setPrev]     = useState<number | null>(null);
  const [failed,   setFailed]   = useState<Set<number>>(new Set());
  const [paused,   setPaused]   = useState(false);
  const [loaded,   setLoaded]   = useState<Set<number>>(new Set());
  const touchX                  = useRef<number | null>(null);
  const timerRef                = useRef<ReturnType<typeof setInterval>>();

  // Indices that still work
  const valid = images
    .map((_, i) => i)
    .filter(i => !failed.has(i));

  // If every image errored → notify parent
  useEffect(() => {
    if (failed.size > 0 && failed.size === images.length) {
      onAllFailed?.();
    }
  }, [failed, images.length, onAllFailed]);

  const goTo = useCallback((targetIndex: number) => {
    setPrev(current);
    setCurrent(targetIndex);
  }, [current]);

  const goNext = useCallback(() => {
    if (valid.length < 2) return;
    const pos = valid.indexOf(current);
    goTo(valid[(pos + 1) % valid.length]);
  }, [valid, current, goTo]);

  const goPrev = useCallback(() => {
    if (valid.length < 2) return;
    const pos = valid.indexOf(current);
    goTo(valid[(pos - 1 + valid.length) % valid.length]);
  }, [valid, current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || valid.length < 2) return;
    timerRef.current = setInterval(goNext, 3500);
    return () => clearInterval(timerRef.current);
  }, [paused, goNext, valid.length]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) delta > 0 ? goNext() : goPrev();
    touchX.current = null;
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (valid.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1)    translate(0%, 0%); }
          100% { transform: scale(1.14) translate(-2%, -2%); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmerBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .img-slide-enter { animation: fadeSlide .65s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      <div
        role="region"
        aria-label={`Photos of ${name}`}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          background: '#0d0020',
          cursor: valid.length > 1 ? 'grab' : 'default',
          userSelect: 'none',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── All slides (only current visible) ── */}
        {valid.map((imgIdx) => {
          const isCurrent = imgIdx === current;
          return (
            <div
              key={imgIdx}
              style={{
                position: 'absolute', inset: 0,
                opacity: isCurrent ? 1 : 0,
                transition: 'opacity .75s cubic-bezier(.4,0,.2,1)',
                zIndex: isCurrent ? 2 : 1,
              }}
            >
              {/* Ken Burns wrapper */}
              <div style={{
                position: 'absolute', inset: 0,
                animation: isCurrent ? 'kenBurns 8s ease-out forwards' : 'none',
                willChange: 'transform',
              }}>
                {/* Shimmer skeleton while loading */}
                {!loaded.has(imgIdx) && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg,#1a0040 25%,#2d0060 50%,#1a0040 75%)',
                    backgroundSize: '200% 100%',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg,transparent,rgba(251,191,36,.08),transparent)',
                      animation: 'shimmerBar 1.5s ease-in-out infinite',
                    }}/>
                  </div>
                )}

                <img
                  src={images[imgIdx]}
                  alt={`${name} – photo ${imgIdx + 1}`}
                  loading={imgIdx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={isCurrent ? 'img-slide-enter' : ''}
                  onLoad={() => setLoaded(s => new Set(Array.from(s).concat(imgIdx)))}
                  onError={() => setFailed(s => new Set(Array.from(s).concat(imgIdx)))}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center top',
                    display: 'block',
                    opacity: loaded.has(imgIdx) ? 1 : 0,
                    transition: 'opacity .4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* ── Gradient overlays (premium depth) ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(3,0,20,.25) 0%, transparent 35%, transparent 55%, rgba(3,0,20,.75) 100%)',
        }}/>
        {/* Side vignettes */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(3,0,20,.35) 100%)',
        }}/>

        {/* ── Name badge (bottom left) ── */}
        <div style={{
          position: 'absolute', bottom: 56, left: 16, zIndex: 5,
          background: 'rgba(0,0,0,.45)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '3rem',
          padding: '.35rem .9rem',
          display: 'flex', alignItems: 'center', gap: '.4rem',
        }}>
          <span style={{ fontSize: '.7rem', color: '#fbbf24' }}>📸</span>
          <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.8)', fontWeight: 600, letterSpacing: '.04em' }}>
            {name}'s photos
          </span>
        </div>

        {/* ── Image counter (top right) ── */}
        {valid.length > 1 && (
          <div style={{
            position: 'absolute', top: 14, right: 14, zIndex: 5,
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '3rem',
            padding: '.25rem .75rem',
            fontSize: '.7rem', color: 'rgba(255,255,255,.8)',
            fontWeight: 600, letterSpacing: '.05em',
          }}>
            {valid.indexOf(current) + 1} / {valid.length}
          </div>
        )}

        {/* ── Prev / Next arrows ── */}
        {valid.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0,0,0,.45)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,.15)',
                color: 'white', fontSize: '1rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s ease',
                opacity: paused ? 1 : 0.6,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = paused ? '1' : '0.6';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,.45)';
              }}
            >
              ‹
            </button>

            <button
              onClick={goNext}
              aria-label="Next photo"
              style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0,0,0,.45)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,.15)',
                color: 'white', fontSize: '1rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s ease',
                opacity: paused ? 1 : 0.6,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = paused ? '1' : '0.6';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,.45)';
              }}
            >
              ›
            </button>
          </>
        )}

        {/* ── Dot indicators ── */}
        {valid.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 14, left: '50%',
            transform: 'translateX(-50%)', zIndex: 5,
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            {valid.map((imgIdx, pos) => {
              const isActive = imgIdx === current;
              return (
                <button
                  key={imgIdx}
                  onClick={() => goTo(imgIdx)}
                  aria-label={`Go to photo ${pos + 1}`}
                  style={{
                    width: isActive ? 22 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: isActive ? '#fbbf24' : 'rgba(255,255,255,.4)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                    boxShadow: isActive ? '0 0 8px rgba(251,191,36,.6)' : 'none',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* ── Auto-play progress bar ── */}
        {valid.length > 1 && !paused && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2, zIndex: 6, background: 'rgba(255,255,255,.1)',
            overflow: 'hidden',
          }}>
            <div
              key={current} // reset animation on slide change
              style={{
                height: '100%',
                background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
                animation: 'progressFill 3.5s linear forwards',
                transformOrigin: 'left',
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </>
  );
}
