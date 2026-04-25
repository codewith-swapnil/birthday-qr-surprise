'use client';

import { useEffect, useRef } from 'react';

const BALLOON_COLORS = [
  '#ff6b9d', '#fbbf24', '#34d399', '#60a5fa',
  '#a78bfa', '#fb923c', '#f472b6', '#38bdf8',
];

interface BalloonsProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function Balloons({ count = 12, size = 'md' }: BalloonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeMap = { sm: [30, 50], md: [50, 80], lg: [70, 110] };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const [minS, maxS] = sizeMap[size];
      const s = minS + Math.random() * (maxS - minS);
      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      const duration = 8 + Math.random() * 12;
      const delay = Math.random() * 10;
      const left = Math.random() * 95;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: -${s + 20}px;
        animation: floatUp ${duration}s ${delay}s linear infinite;
        pointer-events: none;
        z-index: 1;
      `;

      // Balloon body
      const body = document.createElement('div');
      body.style.cssText = `
        width: ${s}px;
        height: ${s * 1.15}px;
        background: radial-gradient(circle at 35% 35%, ${color}dd, ${color}88);
        border-radius: 50% 50% 45% 45%;
        position: relative;
        filter: drop-shadow(0 ${s * 0.1}px ${s * 0.2}px rgba(0,0,0,0.4));
      `;

      // Shine
      const shine = document.createElement('div');
      shine.style.cssText = `
        position: absolute;
        width: ${s * 0.25}px;
        height: ${s * 0.25}px;
        background: rgba(255,255,255,0.5);
        border-radius: 50%;
        top: 18%;
        left: 22%;
        filter: blur(2px);
      `;
      body.appendChild(shine);

      // Knot
      const knot = document.createElement('div');
      knot.style.cssText = `
        width: 8px;
        height: 10px;
        background: ${color};
        margin: 0 auto;
        border-radius: 0 0 4px 4px;
        position: relative;
        left: ${s / 2 - 4}px;
        top: 0;
      `;

      // String
      const string = document.createElement('div');
      string.style.cssText = `
        width: 1px;
        height: ${s * 0.8}px;
        background: rgba(255,255,255,0.3);
        margin: 0 auto;
        position: relative;
        left: ${s / 2}px;
      `;

      wrapper.appendChild(body);
      wrapper.appendChild(string);
      container.appendChild(wrapper);
    }

    return () => { container.innerHTML = ''; };
  }, [count, size]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
