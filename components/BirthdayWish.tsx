'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { WishData } from '@/types/wish';
import { isBirthdayToday, msToNextBirthday, formatBirthdayDisplay } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface BirthdayWishProps { rawData: WishData | null; slug: string; }
type Stage = 'countdown' | 'gift' | 'opening' | 'reveal';
interface CFP { x: number; y: number; vx: number; vy: number; c: string; w: number; h: number; rot: number; rv: number; life: number; decay: number; shape: 'c' | 'r' | 't'; scale: number; }
interface FWP { x: number; y: number; vx: number; vy: number; c: string; r: number; life: number; decay: number; }
interface Star { x: number; y: number; r: number; o: number; speed: number; tw: number; ts: number; }
interface Petal { x: number; y: number; sz: number; speed: number; drift: number; rot: number; rv: number; op: number; e: string; }

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAD = (n: number) => String(n).padStart(2, '0');
const BALLOON_COLS = ['#ff6b9d', '#c084fc', '#fbbf24', '#fb7185', '#a78bfa', '#f472b6', '#fde68a', '#e879f9'];
const CF_COLS = ['#ff6b9d', '#c084fc', '#fbbf24', '#fb7185', '#a78bfa', '#f472b6', '#fde68a', '#60a5fa', '#34d399', '#fff', '#f9a8d4', '#818cf8', '#4ade80', '#facc15'];
const FW_COLS = ['#ff6b9d', '#c084fc', '#fbbf24', '#fb7185', '#f9a8d4', '#fde68a', '#e879f9', '#a78bfa'];
const PETAL_EMOJIS = ['🌸', '🌺', '🌹', '💮', '🌼', '✿'];
const NAV_IDS = ['s-hero', 's-photos', 's-wishes', 's-special', 's-msg', 's-final'];
const SURPRISES = [
  "You're the kind of person people think about on their worst days — because you make things better just by existing. 💎",
  "Every single person who knows you is quietly grateful. Your presence is a gift they don't always say out loud. 💝",
  "You have this rare ability to make ordinary moments feel like they matter. Don't ever lose that. ⚡",
  "If happiness had a face, honestly — it would look a lot like yours. 🎂",
  "You shine so naturally that most people don't realise how much they need your light until it's gone. 💛",
  "The world is genuinely, measurably better because you're in it. That's not flattery. That's just true. 🌙",
];

// ─────────────────────────────────────────────────────────────────────────────
// PhotoGrid
// ─────────────────────────────────────────────────────────────────────────────
function PhotoGrid({ images }: { images: string[] }) {
  if (!images.length) return null;
  const count = images.length;
  return (
    <div style={{
      display: 'grid', gap: '.75rem',
      gridTemplateColumns: count === 1 ? '1fr' : 'repeat(2,1fr)',
      maxWidth: count === 1 ? 480 : '100%',
      margin: count === 1 ? '0 auto' : undefined,
    }}>
      {images.map((src, i) => {
        const span = (count === 3 || count === 5) && i === 0;
        return (
          <div key={src} style={{
            gridColumn: span ? 'span 2' : undefined,
            aspectRatio: count === 1 ? '4/3' : span ? '16/9' : '1/1',
            borderRadius: '1.25rem', overflow: 'hidden',
            border: '1px solid rgba(255,107,157,.2)',
            boxShadow: '0 8px 32px rgba(255,107,157,.15)',
            background: 'rgba(255,255,255,.03)', position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 60%,rgba(0,0,0,.25))', zIndex: 1, pointerEvents: 'none' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Memory ${i + 1}`} loading={i < 2 ? 'eager' : 'lazy'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingOrbs
// ─────────────────────────────────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = useMemo(() => [
    { x: 8, y: 15, size: 340, color: 'rgba(255,107,157,0.06)', dur: 20, del: 0 },
    { x: 85, y: 8, size: 280, color: 'rgba(192,132,252,0.07)', dur: 25, del: 4 },
    { x: 45, y: 68, size: 420, color: 'rgba(251,191,36,0.04)', dur: 28, del: 7 },
    { x: 15, y: 82, size: 220, color: 'rgba(96,165,250,0.05)', dur: 22, del: 11 },
    { x: 88, y: 58, size: 300, color: 'rgba(244,114,182,0.06)', dur: 18, del: 2 },
  ], []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${o.x}%`, top: `${o.y}%`,
          width: o.size, height: o.size, borderRadius: '50%',
          background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`,
          transform: 'translate(-50%,-50%)',
          animation: `orbFloat ${o.dur}s ${o.del}s ease-in-out infinite`,
          filter: 'blur(40px)',
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useMagneticCursor
// ─────────────────────────────────────────────────────────────────────────────
function useMagneticCursor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover:none)').matches) return;
    const trail = Array.from({ length: 7 }, (_, i) => {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;width:${8 - i}px;height:${8 - i}px;border-radius:50%;`
        + `background:rgba(255,107,157,${(0.55 - i * 0.07).toFixed(2)});`
        + `pointer-events:none;z-index:9999;transform:translate(-50%,-50%);`;
      document.body.appendChild(d);
      return { el: d, x: 0, y: 0 };
    });
    const pos = { x: 0, y: 0 };
    let raf: number;
    const move = (e: MouseEvent) => { pos.x = e.clientX; pos.y = e.clientY; };
    window.addEventListener('mousemove', move);
    const animate = () => {
      let px = pos.x, py = pos.y;
      trail.forEach((t, i) => {
        t.x += (px - t.x) * (0.32 - i * 0.03); t.y += (py - t.y) * (0.32 - i * 0.03);
        t.el.style.left = t.x + 'px'; t.el.style.top = t.y + 'px';
        px = t.x; py = t.y;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); trail.forEach(t => t.el.remove()); };
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// useScrollReveal + RevealSection
// ─────────────────────────────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function RevealSection({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, vis } = useScrollReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(36px)',
      transition: `opacity .75s ${delay}s ease, transform .75s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useConfetti
// ─────────────────────────────────────────────────────────────────────────────
function useConfetti(ref: React.RefObject<HTMLCanvasElement>) {
  const parts = useRef<CFP[]>([]);
  const raf = useRef<number | null>(null);

  const draw = useCallback(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    parts.current.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.vx *= 0.992;
      p.rot += p.rv; p.life -= p.decay; p.scale = Math.max(0, p.scale - 0.001);
      if (p.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = p.life * 0.9; ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.scale(p.scale, p.scale);
      if (p.shape === 'c') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else if (p.shape === 't') { ctx.beginPath(); ctx.moveTo(0, -p.w); ctx.lineTo(p.w, p.w); ctx.lineTo(-p.w, p.w); ctx.closePath(); ctx.fill(); }
      else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      ctx.restore();
    });
    parts.current = parts.current.filter(p => p.life > 0);
    if (parts.current.length > 0) raf.current = requestAnimationFrame(draw);
    else { raf.current = null; ctx.clearRect(0, 0, c.width, c.height); }
  }, [ref]);

  const spawn = useCallback((n: number, ox?: number, oy?: number) => {
    const c = ref.current;
    const W = c?.width ?? innerWidth, H = c?.height ?? innerHeight;
    const shapes: ('c' | 'r' | 't')[] = ['c', 'r', 't'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 16 + 5;
      parts.current.push({
        x: ox ?? W * .5, y: oy ?? H * .3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - Math.random() * 12,
        c: CF_COLS[Math.floor(Math.random() * CF_COLS.length)],
        w: Math.random() * 10 + 4, h: Math.random() * 6 + 2,
        rot: Math.random() * 360, rv: (Math.random() - .5) * 12,
        life: 1, decay: Math.random() * .01 + .005,
        shape: shapes[Math.floor(Math.random() * shapes.length)], scale: 1,
      });
    }
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [ref, draw]);

  const launch = useCallback(() => {
    const c = ref.current;
    const W = c?.width ?? innerWidth, H = c?.height ?? innerHeight;
    [
      { n: 320, x: W * .5, y: H * .25, t: 0 },
      { n: 150, x: W * .08, y: H * .4, t: 250 },
      { n: 150, x: W * .92, y: H * .4, t: 450 },
      { n: 100, x: W * .25, y: H * .15, t: 650 },
      { n: 100, x: W * .75, y: H * .15, t: 800 },
      { n: 90, x: W * .5, y: H * .5, t: 1000 },
      { n: 80, x: W * .15, y: H * .6, t: 1200 },
      { n: 80, x: W * .85, y: H * .6, t: 1350 },
    ].forEach(w => setTimeout(() => spawn(w.n, w.x, w.y), w.t));
  }, [spawn, ref]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  return { launch, spawn };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAISurprise
// ─────────────────────────────────────────────────────────────────────────────
function useAISurprise(name: string) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const countRef = useRef(0);

  const generate = useCallback(async () => {
    setLoading(true); countRef.current++;
    const n = countRef.current;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You write warm, heartfelt birthday surprise messages for someone named ${name}. Each must be COMPLETELY DIFFERENT. Poetic, genuine, 2-3 sentences, end with 1-2 fitting emojis. Never generic. Unexpected angles. Return ONLY the message text — no preamble.`,
          messages: [{ role: 'user', content: `Write unique birthday surprise #${n} for ${name}. Fresh angle.` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b: { text?: string }) => b.text || '').join('') || '';
      setMsg(text.trim() || SURPRISES[n % SURPRISES.length]);
    } catch {
      setMsg(SURPRISES[countRef.current % SURPRISES.length]);
    } finally {
      setLoading(false);
    }
  }, [name]);

  return { generate, loading, msg };
}

// ─────────────────────────────────────────────────────────────────────────────
// PersonAvatar — spinning conic ring + circular photo
// ─────────────────────────────────────────────────────────────────────────────
function PersonAvatar({ src, name, size = 220 }: { src?: string; name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pad = Math.round(size * 0.08);
  const inner = size - pad * 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', flexShrink: 0 }}>
      {/* Spinning gradient ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #ff6b9d, #fbbf24, #c084fc, #60a5fa, #ff6b9d)',
        animation: 'avatarSpin 4s linear infinite',
      }} />
      {/* Dark gap */}
      <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: '#06000f' }} />
      {/* Photo or initials */}
      <div style={{
        position: 'absolute', inset: pad, borderRadius: '50%', overflow: 'hidden',
        boxShadow: '0 0 60px rgba(255,107,157,.5), 0 0 120px rgba(192,132,252,.25)',
      }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#ff6b9d,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: inner * .38, color: '#fff', fontWeight: 600, lineHeight: 1 }}>{initials}</span>
          </div>
        )}
      </div>
      {/* Shimmer sheen */}
      <div style={{ position: 'absolute', inset: pad, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 55%)', pointerEvents: 'none' }} />
      {/* Outer glow halo */}
      <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,157,.25) 0%,transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite', pointerEvents: 'none' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GiftStage — gift box with person's image rising on open
// ─────────────────────────────────────────────────────────────────────────────
function GiftStage({ onOpen, isOpening, personImage, name }: {
  onOpen: () => void; isOpening: boolean; personImage?: string; name: string;
}) {
  const [hover, setHover] = useState(false);
  const [showImg, setShowImg] = useState(false);

  useEffect(() => {
    if (isOpening) {
      const t = setTimeout(() => setShowImg(true), 650);
      return () => clearTimeout(t);
    }
  }, [isOpening]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const avatarSize = isMobile ? 170 : 220;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '2rem 1rem', position: 'relative', zIndex: 10,
    }}>
      <FloatingOrbs />

      {/* Pulse rings (hidden when opening) */}
      {!isOpening && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          {[260, 400, 560].map((r, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', width: r, height: r, borderRadius: '50%',
              border: `1px solid rgba(255,107,157,${0.14 - i * 0.04})`,
              transform: 'translate(-50%,-50%)',
              animation: `ringExpand ${3 + i}s ${i * 0.9}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      )}

      {/* ── IMAGE REVEAL (rises from box) ─────────────────────────────────── */}
      {isOpening && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          zIndex: 30,
          opacity: showImg ? 1 : 0,
          animation: showImg ? 'imgRise 1.1s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
        }}>
          <PersonAvatar src={personImage} name={name} size={avatarSize} />
          {showImg && (
            <div style={{ animation: 'fadeUp .8s .4s ease forwards', opacity: 0 }}>
              <p style={{
                fontFamily: "'Great Vibes',cursive",
                fontSize: 'clamp(1.8rem,6vw,2.8rem)',
                color: '#fbbf24',
                lineHeight: 1.2,
                textShadow: '0 0 40px rgba(251,191,36,.7)',
                whiteSpace: 'nowrap',
              }}>
                Happy Birthday {name}! 🎂
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
                fontSize: 'clamp(.9rem,3vw,1.15rem)', color: '#f5d0fe',
                marginTop: '.5rem', letterSpacing: '.06em',
                animation: 'fadeUp .8s .9s ease forwards', opacity: 0,
              }}>
                ✨ Your gift is unwrapped ✨
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── GIFT BOX ────────────────────────────────────────────────────── */}
      <div
        onClick={!isOpening ? onOpen : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative', cursor: isOpening ? 'default' : 'pointer',
          animation: isOpening ? 'none' : 'giftFloat 3s ease-in-out infinite',
          transform: hover && !isOpening ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform .3s cubic-bezier(0.34,1.56,0.64,1), opacity .5s ease',
          opacity: isOpening && showImg ? 0 : 1,
        }}
      >
        {/* Hover glow */}
        {!isOpening && (
          <div style={{
            position: 'absolute', inset: '-40px', borderRadius: '40px',
            background: hover
              ? 'radial-gradient(ellipse,rgba(255,107,157,.55) 0%,rgba(192,132,252,.3) 50%,transparent 70%)'
              : 'radial-gradient(ellipse,rgba(255,107,157,.28) 0%,rgba(192,132,252,.12) 50%,transparent 70%)',
            animation: 'glowPulse 2.5s ease-in-out infinite', pointerEvents: 'none',
            transition: 'background .4s ease',
          }} />
        )}

        {/* Lid */}
        <div style={{
          width: 'clamp(155px,30vw,220px)', height: 'clamp(42px,8vw,60px)',
          background: 'linear-gradient(135deg,#fbbf24,#fb7185,#ff6b9d)',
          borderRadius: '10px 10px 4px 4px', margin: '0 auto -3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 2,
          animation: isOpening ? 'lidFly 0.9s cubic-bezier(0.4,0,0.6,1) forwards' : 'none',
          boxShadow: '0 -4px 28px rgba(251,191,36,.55)',
        }}>
          <span style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', position: 'relative', top: '-26px', userSelect: 'none' }}>🎀</span>
        </div>

        {/* Box body */}
        <div style={{
          width: 'clamp(155px,30vw,220px)', height: 'clamp(125px,24vw,180px)',
          background: 'linear-gradient(135deg,#ff6b9d 0%,#c084fc 55%,#a78bfa 100%)',
          borderRadius: '4px 4px 16px 16px', position: 'relative', overflow: 'hidden',
          boxShadow: hover && !isOpening
            ? '0 28px 80px rgba(255,107,157,.65), 0 0 0 2px rgba(255,255,255,.18) inset'
            : '0 18px 60px rgba(255,107,157,.35), 0 0 0 2px rgba(255,255,255,.08) inset',
          transition: 'box-shadow .4s ease',
        }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '16px', background: 'rgba(255,255,255,.25)', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '16px', background: 'rgba(255,255,255,.25)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42%', background: 'linear-gradient(180deg,rgba(255,255,255,.22),transparent)', borderRadius: 'inherit', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Pre-open CTA */}
      {!isOpening && (
        <>
          <p style={{
            fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
            fontSize: 'clamp(1.1rem,3.5vw,1.7rem)', color: '#f5d0fe',
            marginTop: '2.5rem', lineHeight: 1.7,
            animation: 'fadeUp 1s .3s ease forwards', opacity: 0,
          }}>
            There's something magical waiting for you 🎁
          </p>
          <button
            onClick={onOpen}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              marginTop: '1.5rem', padding: '.9rem 2.8rem',
              border: 'none', borderRadius: '50px',
              background: 'linear-gradient(135deg,#ff6b9d,#c084fc,#fbbf24,#ff6b9d)',
              backgroundSize: '300% auto', color: '#fff',
              fontFamily: "'Quicksand',sans-serif",
              fontSize: 'clamp(.95rem,3vw,1.1rem)', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '.05em',
              animation: 'shimmer 3.5s linear infinite, fadeUp 1s .7s ease forwards',
              opacity: 0,
              boxShadow: '0 0 55px rgba(255,107,157,.55)',
              transform: hover ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform .25s cubic-bezier(0.34,1.56,0.64,1)',
              minHeight: '48px',  /* touch-friendly */
            }}
          >
            ✨ Open your gift
          </button>
        </>
      )}

      {isOpening && !showImg && (
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
          fontSize: 'clamp(1.1rem,4vw,1.8rem)', color: '#fbbf24',
          marginTop: '2rem', animation: 'fadeIn .5s ease forwards', letterSpacing: '.08em',
        }}>
          🎊 Opening…
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BirthdayWish({ rawData }: BirthdayWishProps) {
  const name = rawData?.name ?? 'You';
  const day = rawData?.day ?? 0;
  const month = rawData?.month ?? '';
  const message = rawData?.message ?? '';
  const images = useMemo(() => (rawData?.images ?? []).slice(0, 8), [rawData]);

  // images[0] = hero portrait of birthday person; rest = gallery
  const personImage = images[0];
  const galleryImages = images.slice(1);

  const bdDisplay = day && month ? formatBirthdayDisplay(day, month) : '';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const STAR_CNT = isMobile ? 80 : 160;
  const PETAL_CNT = isMobile ? 20 : 40;

  // ── State ──────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('gift');
  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [typeText, setTypeText] = useState('');
  const [typeCursor, setTypeCursor] = useState(true);
  const [surpCount, setSurpCount] = useState(0);
  const [staticIdx, setStaticIdx] = useState(0);
  const [showSurp, setShowSurp] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const starCnv = useRef<HTMLCanvasElement>(null);
  const petalCnv = useRef<HTMLCanvasElement>(null);
  const fwCnv = useRef<HTMLCanvasElement>(null);
  const cfCnv = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const starRef = useRef<Star[]>([]);
  const petalRef = useRef<Petal[]>([]);
  const fwPRef = useRef<FWP[]>([]);
  const starRaf = useRef(0);
  const petalRaf = useRef(0);
  const fwRaf = useRef(0);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { launch, spawn } = useConfetti(cfCnv);
  const { generate, loading: aiLoading, msg: aiMsg } = useAISurprise(name);
  useMagneticCursor();

  const phrases = useMemo(() => [
    `${name}, you are the definition of grace, strength, and beauty… ✨`,
    `You make everyone's life brighter simply by being in it… 🌸`,
    `Your kindness is a superpower that touches every heart… 💖`,
    `The world is genuinely better because of you… 🌙`,
    `You turn ordinary moments into memories worth keeping… 🌟`,
  ], [name]);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!day || !month || isBirthdayToday(day, month)) return;
    setStage('countdown');
    const update = () => {
      const ms = msToNextBirthday(day, month);
      if (ms <= 0) { setStage('gift'); clearInterval(t); return; }
      const s = Math.floor(ms / 1000);
      setCd({ d: PAD(Math.floor(s / 86400)), h: PAD(Math.floor(s % 86400 / 3600)), m: PAD(Math.floor(s % 3600 / 60)), s: PAD(s % 60) });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [day, month]);

  // ── Canvas loops (stars + petals + fireworks) ──────────────────────────────
  useEffect(() => {
    const sc = starCnv.current, pc = petalCnv.current, fc = fwCnv.current;
    if (!sc || !pc || !fc) return;
    const sx = sc.getContext('2d')!, px = pc.getContext('2d')!, fx = fc.getContext('2d')!;

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      sc.width = pc.width = fc.width = w;
      sc.height = pc.height = fc.height = h;
      starRef.current = Array.from({ length: STAR_CNT }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + .3,
        o: Math.random() * .8 + .1, speed: Math.random() * .35 + .05,
        tw: Math.random() * Math.PI * 2, ts: Math.random() * .03 + .01,
      }));
      petalRef.current = Array.from({ length: PETAL_CNT }, () => ({
        x: Math.random() * w, y: Math.random() * 800 - 200, sz: Math.random() * 14 + 8,
        speed: Math.random() * .6 + .2, drift: (Math.random() - .5) * .6,
        rot: Math.random() * 360, rv: (Math.random() - .5) * 1.5,
        op: Math.random() * .35 + .1, e: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const visChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(starRaf.current);
        cancelAnimationFrame(petalRaf.current);
        cancelAnimationFrame(fwRaf.current);
      } else { animStar(); animPetal(); animFw(); }
    };
    document.addEventListener('visibilitychange', visChange);

    const animStar = () => {
      const { width: w, height: h } = sc;
      sx.clearRect(0, 0, w, h);
      starRef.current.forEach(s => {
        s.tw += s.ts;
        sx.globalAlpha = s.o * (0.5 + 0.5 * Math.sin(s.tw));
        sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, Math.PI * 2); sx.fill();
        s.y -= s.speed; if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
      });
      sx.globalAlpha = 1;
      starRaf.current = requestAnimationFrame(animStar);
    };

    const animPetal = () => {
      const { width: w, height: h } = pc;
      px.clearRect(0, 0, w, h);
      petalRef.current.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.rot += p.rv;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 10; if (p.x > w + 30) p.x = -10;
        px.save(); px.globalAlpha = p.op; px.translate(p.x, p.y);
        px.rotate(p.rot * Math.PI / 180); px.font = `${p.sz}px serif`;
        px.fillText(p.e, -p.sz / 2, -p.sz / 2); px.restore();
      });
      petalRaf.current = requestAnimationFrame(animPetal);
    };

    const animFw = () => {
      const { width: fw, height: fh } = fc;
      fx.clearRect(0, 0, fw, fh);
      fwPRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= p.decay;
        fx.globalAlpha = Math.max(0, p.life); fx.fillStyle = p.c;
        fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fx.fill();
      });
      fwPRef.current = fwPRef.current.filter(p => p.life > 0);
      fx.globalAlpha = 1;
      fwRaf.current = requestAnimationFrame(animFw);
    };

    animStar(); animPetal(); animFw();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visChange);
      cancelAnimationFrame(starRaf.current);
      cancelAnimationFrame(petalRaf.current);
      cancelAnimationFrame(fwRaf.current);
    };
  }, [STAR_CNT, PETAL_CNT]);

  // Confetti canvas sizing
  useEffect(() => {
    const c = cfCnv.current; if (!c) return;
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Fireworks helper ───────────────────────────────────────────────────────
  const launchFireworks = useCallback(() => {
    const fc2 = fwCnv.current; if (!fc2) return;
    const { width: fw, height: fh } = fc2;
    const burst = (x: number, y: number, col: string) => {
      for (let i = 0; i < (isMobile ? 45 : 85); i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * 8 + 3;
        fwPRef.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: col, r: Math.random() * 2.5 + .8, life: 1, decay: Math.random() * .018 + .01 });
      }
    };
    const shots = isMobile ? 8 : 14;
    for (let i = 0; i < shots; i++)
      setTimeout(() => burst(fw * .1 + Math.random() * fw * .8, fh * .04 + Math.random() * fh * .44, FW_COLS[Math.floor(Math.random() * FW_COLS.length)]), i * 350);
  }, [isMobile]);

  // ── Typewriter ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'reveal') return;
    let pi = 0, ci = 0, del = false;
    let timer: ReturnType<typeof setTimeout>;
    const blink = setInterval(() => setTypeCursor(v => !v), 540);
    const tick = () => {
      const p = phrases[pi];
      setTypeText(del ? p.slice(0, ci - 1) : p.slice(0, ci + 1));
      if (!del) { ci++; if (ci === p.length + 1) { del = true; timer = setTimeout(tick, 2400); return; } }
      else { ci--; if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; } }
      timer = setTimeout(tick, del ? 40 : 65);
    };
    timer = setTimeout(tick, 800);
    return () => { clearTimeout(timer); clearInterval(blink); };
  }, [stage, phrases]);

  // ── Nav highlight ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'reveal') return;
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const idx = (NAV_IDS as string[]).indexOf(en.target.id);
          if (idx >= 0) setActiveNav(idx);
        }
      });
    }, { threshold: 0.35 });
    NAV_IDS.forEach(id => { const el = document.getElementById(id); if (el) navObs.observe(el); });
    return () => navObs.disconnect();
  }, [stage]);

  // ── Periodic confetti ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'reveal') return;
    const t = setInterval(() => spawn(30), 10_000);
    return () => clearInterval(t);
  }, [stage, spawn]);

  // ── Audio ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'reveal') return;
    const a = audioRef.current;
    if (a) a.play().then(() => setIsPlaying(true)).catch(() => { });
  }, [stage]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    setStage('opening');
    // Wait for image-reveal animation, then transition to full page
    setTimeout(() => {
      setStage('reveal');
      launch();                        // ← AUTO CONFETTI 🎊
      setTimeout(launchFireworks, 300);
    }, 2400);
  }, [launch, launchFireworks]);

  const handleSurprise = useCallback(() => {
    setSurpCount(c => c + 1);
    setStaticIdx(i => (i + 1) % SURPRISES.length);
    setShowSurp(true);
    const W = cfCnv.current?.width ?? innerWidth;
    const H = cfCnv.current?.height ?? innerHeight;
    spawn(110, W * .5, H * .4);
    generate();
  }, [spawn, generate]);

  const toggleAudio = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) a.play().then(() => setIsPlaying(true)).catch(() => { });
    else { a.pause(); setIsPlaying(false); }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const displaySurp = aiMsg || (showSurp ? SURPRISES[staticIdx] : '');

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Canvas layers */}
      <canvas style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} ref={starCnv} />
      <canvas style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} ref={petalCnv} />
      <canvas style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }} ref={fwCnv} />
      <canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 200 }} ref={cfCnv} />

      <div className="bw-amb" />
      <FloatingOrbs />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/music/nastelbom-happy-birthday-469282.mp3" loop />

      {/* ── Audio bar ──────────────────────────────────────────────────────── */}
      <div className="bw-bar">
        <span className="bw-bar-lbl">🎵 Happy Birthday {name}</span>
        <div className={`bw-eq${isPlaying ? '' : ' paused'}`}>{[0, 1, 2, 3, 4].map(i => <div key={i} />)}</div>
        <button className="bw-pbtn" onClick={toggleAudio} aria-label={isPlaying ? 'Pause music' : 'Play music'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* ══ COUNTDOWN ═════════════════════════════════════════════════════════ */}
      {stage === 'countdown' && (
        <section className="bw-cd">
          <span className="bw-cd-pre">✨ Something magical is coming ✨</span>
          <h1 className="bw-cd-name">{name}</h1>
          <p className="bw-cd-sub">The universe is counting down to your most special day…</p>
          <div className="bw-cd-grid">
            {(['d', 'h', 'm', 's'] as const).map((k, i) => (
              <div className="bw-cd-box" key={k}>
                <span className="bw-cd-num">{cd[k]}</span>
                <span className="bw-cd-lbl">{['Days', 'Hours', 'Mins', 'Secs'][i]}</span>
              </div>
            ))}
          </div>
          {bdDisplay && <div className="bw-cd-badge">🎂 {bdDisplay} · Your Magical Birthday</div>}
        </section>
      )}

      {/* ══ GIFT STAGE ════════════════════════════════════════════════════════ */}
      {(stage === 'gift' || stage === 'opening') && (
        <GiftStage
          onOpen={handleOpen}
          isOpening={stage === 'opening'}
          personImage={personImage}
          name={name}
        />
      )}

      {/* ══ BIRTHDAY REVEAL ═══════════════════════════════════════════════════ */}
      {stage === 'reveal' && (
        <div style={{ position: 'relative', zIndex: 10 }}>

          {/* Balloons */}
          <div className="bw-balloons">
            {BALLOON_COLS.slice(0, isMobile ? 4 : 8).map((col, i) => (
              <svg key={i} viewBox="0 0 100 150" width={isMobile ? 22 : 30}
                style={{ animation: `bwBU ${6.5 + (i * 1.3) % 5}s ${(i * .7) % 4}s linear infinite` }}>
                <ellipse cx="50" cy="55" rx="38" ry="46" fill={col} opacity=".88" />
                <ellipse cx="40" cy="42" rx="9" ry="11" fill="rgba(255,255,255,.28)" />
                <path d="M47 101 Q50 108 53 101" stroke={col} strokeWidth="3" fill="none" />
                <line x1="50" y1="104" x2="50" y2="150" stroke={col} strokeWidth="1.5" opacity=".6" />
              </svg>
            ))}
          </div>

          {/* Nav rail */}
          <nav className="bw-nav" aria-label="Section navigation">
            {NAV_IDS.map((id, i) => (
              <button key={id} className={`bw-nr${activeNav === i ? ' on' : ''}`}
                onClick={() => scrollTo(id)} aria-label={id.replace('s-', '')} />
            ))}
          </nav>

          {/* ─── HERO ───────────────────────────────────────────────────────── */}
          <section className="bw-hero" id="s-hero">
            <div className="bw-rings"><span /><span /><span /><span /></div>

            <span className="bw-eyebrow">🌸 · {bdDisplay || 'Today'} · Happy Birthday · 🌸</span>
            <h1 className="bw-hero-h">Happy Birthday</h1>
            <span className="bw-hero-name">{name} ✨</span>

            {/* ── PERSON'S IMAGE — prominent hero avatar ── */}
            <div style={{ margin: '2rem 0', animation: 'imgEntrance 1.2s .8s cubic-bezier(0.34,1.56,0.64,1) forwards', opacity: 0, transform: 'scale(0.7)' }}>
              <PersonAvatar src={personImage} name={name} size={isMobile ? 185 : 240} />
            </div>

            <p className="bw-hero-q">
              "Today the universe pauses — just for a moment — to celebrate<br />
              the most extraordinary soul it ever made. 🌙"
            </p>
            <div className="bw-scroll-cue">
              <span>Scroll to explore</span>
              <div className="bw-scroll-line" />
            </div>
          </section>

          {/* ─── GALLERY (images beyond first) ─────────────────────────────── */}
          {galleryImages.length > 0 && (
            <section className="bw-section" id="s-photos">
              <div className="bw-sw">
                <RevealSection>
                  <span className="bw-eye">📸 Beautiful Memories</span>
                  <h2 className="bw-stl">A Gallery of You</h2>
                </RevealSection>
                <RevealSection delay={0.1}><PhotoGrid images={galleryImages} /></RevealSection>
              </div>
            </section>
          )}

          {/* ─── WISHES ─────────────────────────────────────────────────────── */}
          <section className="bw-section" id="s-wishes">
            <div className="bw-sw">
              <RevealSection>
                <span className="bw-eye">💌 From the Heart</span>
                <h2 className="bw-stl">Birthday Wishes for {name}</h2>
              </RevealSection>
              <div className="bw-wgrid">
                {[
                  { txt: `May your birthday be as warm and wonderful as the joy you bring to everyone around you.`, em: '❤️', tag: 'Warmth' },
                  { txt: `May every dream you've held close finally find its way to you — you deserve every single one.`, em: '🎂', tag: 'Dreams' },
                  { txt: `${name}, wherever you go, may you carry light — and may the world always be worthy of it.`, em: '✨', tag: 'Light' },
                  { txt: `Wishing you a birthday full of laughter, surrounded by people who love you exactly as you are.`, em: '🎉', tag: 'Joy' },
                  { txt: `May this coming year bring you abundance — in love, in peace, in everything that truly matters.`, em: '🌺', tag: 'Abundance' },
                  { txt: `Happy Birthday ${name}! The world is genuinely, measurably better because you exist in it.`, em: '💖', tag: 'Truth' },
                ].map(({ txt, em, tag }, i) => (
                  <RevealSection key={i} delay={i * 0.07}>
                    <div className="bw-wcard">
                      <span className="bw-wlang">{tag}</span>
                      <p className="bw-wtxt">{txt}</p>
                      <span className="bw-wem">{em}</span>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>

          {/* ─── WHY SPECIAL ────────────────────────────────────────────────── */}
          <section className="bw-section" id="s-special">
            <div className="bw-sw">
              <RevealSection>
                <span className="bw-eye">💛 Because You Matter</span>
                <h2 className="bw-stl">Why {name} Is So Special</h2>
              </RevealSection>
              <RevealSection delay={0.1}>
                <div className="bw-type">
                  {typeText}
                  <span className={`bw-cursor${typeCursor ? '' : ' off'}`}>|</span>
                </div>
              </RevealSection>
              <div className="bw-sp-list">
                {[
                  { ico: '🌹', txt: `Your smile makes everyone feel warm and loved — even on their darkest days, ${name}.` },
                  { ico: '💫', txt: 'You carry strength and softness in equal measure. That balance is rarer than you know.' },
                  { ico: '🌸', txt: 'Your laugh is contagious in the best possible way. It shifts the energy of every room.' },
                  { ico: '⭐', txt: `You dream big and love deeply. There is simply no one in this world quite like you.` },
                  { ico: '🦋', txt: "You make people feel truly seen — not just noticed, but actually seen. That's a rare superpower." },
                  { ico: '🌙', txt: "Even on cloudy days you bring light. You're the reason someone's day gets better without them knowing why." },
                ].map(({ ico, txt }, i) => (
                  <RevealSection key={i} delay={i * 0.07}>
                    <div className="bw-sp-item">
                      <span className="bw-sp-ico">{ico}</span>
                      <p className="bw-sp-txt">{txt}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>

          {/* ─── PERSONAL MESSAGE ───────────────────────────────────────────── */}
          <section className="bw-section" id="s-msg">
            <div className="bw-sw">
              <RevealSection>
                <span className="bw-eye">💌 Only For You</span>
                <h2 className="bw-stl">A Message from the Heart ❤️</h2>
              </RevealSection>
              <RevealSection delay={0.1}>
                <div className="bw-emo-card">
                  <p className="bw-emo-p">
                    {message ? (
                      <>
                        Dear <strong>{name}</strong>,<br /><br />
                        {message.split('\n').map((line, i, arr) => (
                          <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                        ))}
                        <br /><br />With all my love 🌸💖
                      </>
                    ) : (
                      <>
                        Dear <strong>{name}</strong>, on this beautiful day I want you to stop for a moment —
                        take a breath — and truly feel how loved you are. You are not just special.
                        You are <strong>extraordinary</strong>.<br /><br />
                        Your laugh, your voice, your presence — they create a warmth no one else can replicate.
                        You have touched more hearts than you will ever know.{' '}
                        <strong>Simply by being you</strong>, you have changed the world.<br /><br />
                        Happy Birthday, <strong>{name}</strong>. The world is brighter, kinder, and more
                        wonderful because you exist in it. 🌸💖
                      </>
                    )}
                  </p>
                </div>
              </RevealSection>
            </div>
          </section>

          {/* ─── AI SURPRISE ────────────────────────────────────────────────── */}
          <section className="bw-surp-sec">
            <RevealSection>
              <span className="bw-eye">✨ Magic Surprises</span>
              <h2 className="bw-stl" style={{ marginBottom: '1.5rem' }}>Click for a Birthday Surprise</h2>
            </RevealSection>
            <RevealSection delay={0.1}>
              <button className="bw-surp-btn" onClick={handleSurprise} disabled={aiLoading}>
                {aiLoading ? '✨ Generating…' : '🎁 Surprise Me!'}
              </button>
              {(displaySurp || aiLoading) && (
                <div className="bw-surp-msg" key={surpCount}>
                  {aiLoading && !displaySurp
                    ? <span style={{ color: '#c084fc', fontSize: '1rem' }}>✨ Crafting something special…</span>
                    : displaySurp}
                </div>
              )}
              {surpCount > 0 && (
                <p style={{ marginTop: '.75rem', color: 'rgba(255,179,204,0.5)', fontSize: '.85rem', fontFamily: "'Quicksand',sans-serif" }}>
                  {surpCount} surprise{surpCount !== 1 ? 's' : ''} unlocked ✨
                </p>
              )}
            </RevealSection>
          </section>

          {/* ─── FINAL ──────────────────────────────────────────────────────── */}
          <section className="bw-final" id="s-final">
            <div className="bw-f-rings"><span /><span /></div>

            {/* Person's image at bottom */}
            <RevealSection>
              <div style={{ margin: '0 auto 2rem' }}>
                <PersonAvatar src={personImage} name={name} size={isMobile ? 130 : 165} />
              </div>
            </RevealSection>

            <RevealSection><h2 className="bw-f-ttl">Happy Birthday<br />{name} ❤️</h2></RevealSection>
            <RevealSection delay={0.15}><p className="bw-f-sub">You mean the world 🌍</p></RevealSection>
            <RevealSection delay={0.25}><div className="bw-f-hearts">💖 🌸 ✨ 🌸 💖</div></RevealSection>
            <RevealSection delay={0.35}>
              <p className="bw-f-quote">
                "May every single day of your life feel as magical as you make everyone else's feel —
                you deserve nothing less than magic." 🎂
              </p>
            </RevealSection>
            <RevealSection delay={0.45}>
              <div className="bw-f-icons">🎂 🎉 🎈 🌺 💫 🌙 ⭐ 🌸 💎</div>
            </RevealSection>
          </section>

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — mobile-first, .bw-* namespace
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,400&family=Great+Vibes&family=Quicksand:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { background: #06000f; color: #fff; font-family: 'Quicksand', sans-serif; overflow-x: hidden; min-height: 100vh; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#ff6b9d,#c084fc); border-radius: 3px; }

/* ── KEYFRAMES ─────────────────────────────────────────────────────────────── */
@keyframes fadeDown  { from{opacity:0;transform:translateY(-24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes scaleIn   { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
@keyframes shimmer   { from{background-position:0% center} to{background-position:200% center} }
@keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
@keyframes glowPulse { 0%,100%{opacity:.55} 50%{opacity:1} }
@keyframes twinkle   { 0%,100%{opacity:.1;transform:scale(.6)} 50%{opacity:1;transform:scale(1.4)} }
@keyframes bwBlink   { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes bwEq      { from{transform:scaleY(.35)} to{transform:scaleY(1)} }
@keyframes bwBU      { 0%{transform:translateY(0) rotate(-6deg);opacity:1} 45%{transform:translateY(-45vh) rotate(6deg)} 100%{transform:translateY(-115vh) rotate(-4deg);opacity:0} }
@keyframes bwNG      { from{filter:drop-shadow(0 0 18px #ff6b9d44)} to{filter:drop-shadow(0 0 48px #ff6b9dcc)} }
@keyframes bwSpin    { to{transform:rotate(360deg)} }

/* Gift & reveal */
@keyframes giftFloat  { 0%,100%{transform:translateY(0) rotate(-2.5deg)} 50%{transform:translateY(-18px) rotate(2.5deg)} }
@keyframes lidFly     { 0%{transform:translateY(0) rotate(0deg);opacity:1} 60%{transform:translateY(-180px) rotate(-28deg);opacity:.6} 100%{transform:translateY(-320px) rotate(-45deg);opacity:0} }
@keyframes imgRise    { 0%{opacity:0;transform:translate(-50%,-35%) scale(0.45)} 60%{opacity:1;transform:translate(-50%,-58%) scale(1.04)} 100%{opacity:1;transform:translate(-50%,-55%) scale(1)} }
@keyframes imgEntrance{ 0%{opacity:0;transform:scale(0.7)} 100%{opacity:1;transform:scale(1)} }
@keyframes avatarSpin { to{transform:rotate(360deg)} }
@keyframes ringPulse  { 0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.9;transform:translate(-50%,-50%) scale(1.06)} }
@keyframes ringExpand { 0%{opacity:.7;transform:translate(-50%,-50%) scale(.9)} 50%{opacity:.3;transform:translate(-50%,-50%) scale(1.1)} 100%{opacity:.7;transform:translate(-50%,-50%) scale(.9)} }
@keyframes orbFloat   { 0%,100%{transform:translate(-50%,-50%) translateY(0) scale(1)} 33%{transform:translate(-50%,-50%) translateY(-30px) scale(1.05)} 66%{transform:translate(-50%,-50%) translateY(20px) scale(.95)} }
@keyframes scrollLine { 0%,100%{opacity:0;transform:scaleY(.3) translateY(-10px)} 50%{opacity:1;transform:scaleY(1) translateY(10px)} }

/* ── AMBIENT ────────────────────────────────────────────────────────────────── */
.bw-amb {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 90% 70% at 15% 5%,  #2d005099 0%, transparent 55%),
    radial-gradient(ellipse 70% 55% at 85% 95%,  #5c0a2ecc 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 60% 40%,  rgba(192,132,252,.04) 0%, transparent 60%);
}

/* ── AUDIO BAR ──────────────────────────────────────────────────────────────── */
.bw-bar {
  position: fixed; bottom: .9rem; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: .6rem;
  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(20px); border-radius: 50px;
  padding: .5rem 1rem; z-index: 1000;
  box-shadow: 0 4px 24px rgba(255,107,157,.22);
  max-width: calc(100vw - 2rem);
}
.bw-bar-lbl {
  font-family: 'Great Vibes', cursive; font-size: .85rem; color: #ffe4b5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
}
@media (min-width: 480px) { .bw-bar-lbl { max-width: 240px; font-size: .95rem; } }
.bw-eq { display: flex; gap: 3px; align-items: flex-end; height: 16px; flex-shrink: 0; }
.bw-eq div { width: 3px; background: linear-gradient(180deg,#fbbf24,#ff6b9d); border-radius: 2px; animation: bwEq .6s ease-in-out infinite alternate; }
.bw-eq div:nth-child(1){height:5px;animation-delay:0s}
.bw-eq div:nth-child(2){height:13px;animation-delay:.1s}
.bw-eq div:nth-child(3){height:9px;animation-delay:.2s}
.bw-eq div:nth-child(4){height:15px;animation-delay:.05s}
.bw-eq div:nth-child(5){height:7px;animation-delay:.15s}
.bw-eq.paused div { animation-play-state: paused; }
.bw-pbtn {
  width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(135deg,#ff6b9d,#c084fc); font-size: .9rem;
  display: flex; align-items: center; justify-content: center; color: #fff;
  box-shadow: 0 0 16px rgba(255,107,157,.5); flex-shrink: 0; touch-action: manipulation;
}

/* ── COUNTDOWN ──────────────────────────────────────────────────────────────── */
.bw-cd {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 1.5rem 1rem; position: relative; z-index: 10;
}
.bw-cd-pre {
  font-family: 'Great Vibes', cursive; font-size: clamp(1rem,4vw,1.6rem);
  color: #ffe4b5; letter-spacing: .2em; margin-bottom: 1rem;
  animation: fadeDown 1.2s ease forwards; opacity: 0;
}
.bw-cd-name {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(2.8rem,12vw,8rem); line-height: 1;
  background: linear-gradient(135deg,#ffb3cc,#fbbf24 38%,#c084fc 68%,#ff6b9d 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bwNG 3s ease-in-out infinite alternate, fadeDown 1.2s .3s ease forwards;
  opacity: 0; word-break: break-word; padding: 0 .5rem;
}
.bw-cd-sub {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(.85rem,3vw,1.3rem); color: #ffb3cc; margin: 1.2rem 0 2rem;
  animation: fadeDown 1.2s .6s ease forwards; opacity: 0; padding: 0 1rem;
}
.bw-cd-grid {
  display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap;
  animation: fadeUp 1.2s .9s ease forwards; opacity: 0; width: 100%; max-width: 360px;
}
.bw-cd-box {
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(18px); border-radius: 1.2rem; padding: .8rem .9rem;
  flex: 1; min-width: 66px; max-width: 88px; position: relative; overflow: hidden;
  box-shadow: 0 8px 28px rgba(255,107,157,.18), inset 0 1px 0 rgba(255,255,255,.1);
}
.bw-cd-box::after {
  content: ''; position: absolute; inset: -2px;
  background: conic-gradient(transparent 270deg,rgba(255,107,157,.3) 360deg);
  animation: bwSpin 4s linear infinite; z-index: -1; border-radius: inherit;
}
.bw-cd-num {
  font-family: 'Cormorant Garamond', serif; font-weight: 600;
  font-size: clamp(2rem,7vw,4.5rem); line-height: 1;
  background: linear-gradient(180deg,#fff,#fbbf24);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: block;
}
.bw-cd-lbl { font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: #ffb3cc; margin-top: .2rem; }
.bw-cd-badge {
  margin-top: 2rem; padding: .6rem 1.6rem; border: 1px solid rgba(255,255,255,.14);
  border-radius: 50px; background: rgba(255,255,255,.07); backdrop-filter: blur(10px);
  font-family: 'Great Vibes', cursive; font-size: 1rem; color: #ffe4b5;
  animation: fadeUp 1.2s 1.2s ease forwards; opacity: 0;
}

/* ── BALLOONS ───────────────────────────────────────────────────────────────── */
.bw-balloons {
  position: fixed; bottom: -40px; left: 0; width: 100%;
  pointer-events: none; z-index: 4; display: flex; justify-content: space-around;
}

/* ── NAV RAIL (desktop only) ────────────────────────────────────────────────── */
.bw-nav { display: none; }
@media (min-width: 640px) {
  .bw-nav {
    display: flex; position: fixed; right: .8rem; top: 50%; transform: translateY(-50%);
    flex-direction: column; gap: .55rem; z-index: 600;
  }
}
.bw-nr {
  width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,.2);
  cursor: pointer; border: 1px solid rgba(255,255,255,.2); transition: all .3s; padding: 0;
}
.bw-nr.on { background: #ff6b9d; box-shadow: 0 0 10px #ff6b9d; transform: scale(1.5); }

/* ── HERO ───────────────────────────────────────────────────────────────────── */
.bw-hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 4rem 1.2rem 3rem; position: relative; overflow: hidden;
}
.bw-rings { position: absolute; inset: 0; pointer-events: none; }
.bw-rings span {
  position: absolute; top: 50%; left: 50%; border-radius: 50%;
  transform: translate(-50%,-50%); animation: ringPulse 6s ease-in-out infinite;
}
.bw-rings span:nth-child(1){width:min(260px,72vw);height:min(260px,72vw);border:1px solid rgba(255,107,157,.16)}
.bw-rings span:nth-child(2){width:min(460px,86vw);height:min(460px,86vw);border:1px solid rgba(192,132,252,.1);animation-delay:1.5s}
.bw-rings span:nth-child(3){width:min(680px,95vw);height:min(680px,95vw);border:1px solid rgba(251,191,36,.07);animation-delay:3s}
.bw-rings span:nth-child(4){width:min(920px,99vw);height:min(920px,99vw);border:1px solid rgba(255,107,157,.04);animation-delay:4.5s}
.bw-eyebrow {
  font-family: 'Great Vibes', cursive; font-size: clamp(.9rem,3.5vw,1.5rem);
  color: #fbbf24; letter-spacing: .15em; animation: fadeDown .9s ease forwards; opacity: 0;
  text-shadow: 0 0 25px rgba(251,191,36,.7); padding: 0 1rem; text-align: center;
}
.bw-hero-h {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(2.8rem,11vw,8.5rem); line-height: .95;
  background: linear-gradient(135deg,#ff6b9d,#fbbf24 33%,#c084fc 65%,#ff6b9d); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 5s linear infinite, scaleIn 1.2s .2s ease forwards; opacity: 0;
  filter: drop-shadow(0 0 50px rgba(255,107,157,.3));
}
.bw-hero-name {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2rem,9vw,6.5rem); line-height: 1;
  background: linear-gradient(135deg,#fbbf24,#fff 45%,#fbbf24); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 4s linear infinite, scaleIn 1.2s .5s ease forwards; opacity: 0;
  filter: drop-shadow(0 0 60px rgba(251,191,36,.6)); display: block; margin: -.2rem 0 .8rem;
  word-break: break-word; padding: 0 .5rem;
}
.bw-hero-q {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(.9rem,3vw,1.35rem); color: #ffe4b5;
  animation: fadeUp .9s .8s ease forwards; opacity: 0;
  max-width: 520px; line-height: 1.9; padding: 0 1.2rem; margin-top: .5rem;
}
.bw-scroll-cue {
  margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: .5rem;
  animation: fadeUp .9s 1.3s ease forwards; opacity: 0;
}
.bw-scroll-cue span { color: #ffb3cc; font-size: clamp(.75rem,2.5vw,.9rem); letter-spacing: .06em; }
.bw-scroll-line {
  width: 1px; height: 38px;
  background: linear-gradient(180deg,rgba(255,107,157,.8),transparent);
  animation: scrollLine 1.8s ease-in-out infinite;
}

/* ── SECTIONS ───────────────────────────────────────────────────────────────── */
.bw-section { position: relative; z-index: 10; }
.bw-sw { max-width: 960px; margin: 0 auto; padding: clamp(2.5rem,7vw,5rem) 1rem; }
@media (min-width: 640px) { .bw-sw { padding: clamp(3rem,8vw,6rem) 1.5rem; } }
.bw-eye {
  font-family: 'Great Vibes', cursive; font-size: clamp(.9rem,3vw,1.3rem);
  color: #fbbf24; letter-spacing: .12em; display: block; margin-bottom: .4rem; text-align: center;
}
.bw-stl {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(1.5rem,5vw,2.8rem); text-align: center;
  background: linear-gradient(135deg,#fff,#ffb3cc);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: clamp(1.5rem,5vw,2.8rem);
}

/* ── WISH GRID ──────────────────────────────────────────────────────────────── */
.bw-wgrid { display: grid; grid-template-columns: 1fr; gap: .9rem; }
@media (min-width: 480px) { .bw-wgrid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 900px) { .bw-wgrid { grid-template-columns: repeat(3,1fr); } }
.bw-wcard {
  background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.09);
  backdrop-filter: blur(20px); border-radius: 1.5rem; padding: 1.5rem;
  position: relative; overflow: hidden; height: 100%;
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease;
}
.bw-wcard::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg,rgba(255,107,157,.07),transparent 60%); pointer-events: none;
}
.bw-wcard:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 24px 60px rgba(255,107,157,.2); }
.bw-wlang { font-size: .62rem; letter-spacing: .18em; text-transform: uppercase; color: #a78bfa; margin-bottom: .7rem; display: block; font-weight: 500; }
.bw-wtxt { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: clamp(.95rem,2.5vw,1.1rem); line-height: 1.9; color: #f5d0fe; }
.bw-wem { font-size: 1.8rem; display: block; margin-top: .8rem; }

/* ── TYPEWRITER ─────────────────────────────────────────────────────────────── */
.bw-type {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(1rem,3vw,1.4rem); color: #ffb3cc; line-height: 1.9; min-height: 3.5em;
  background: linear-gradient(135deg,rgba(255,107,157,.06),rgba(192,132,252,.06));
  border: 1px solid rgba(255,107,157,.2); border-radius: 1.2rem;
  padding: 1.3rem 1.5rem; margin-bottom: 2rem; backdrop-filter: blur(12px);
}
.bw-cursor { color: #ff6b9d; animation: bwBlink .85s step-end infinite; }
.bw-cursor.off { opacity: 0; animation: none; }

/* ── SPECIAL LIST ───────────────────────────────────────────────────────────── */
.bw-sp-list { display: flex; flex-direction: column; gap: .9rem; }
.bw-sp-item {
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
  backdrop-filter: blur(12px); border-radius: 1.4rem; padding: 1.3rem 1.5rem;
  display: flex; align-items: center; gap: 1.2rem;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1), background .3s ease;
}
.bw-sp-item:hover { transform: translateX(8px); background: rgba(255,107,157,.06); }
@media (min-width: 640px) {
  .bw-sp-item:nth-child(even) { flex-direction: row-reverse; text-align: right; }
  .bw-sp-item:nth-child(even):hover { transform: translateX(-8px); }
}
.bw-sp-ico { font-size: clamp(1.8rem,4.5vw,2.6rem); flex-shrink: 0; }
.bw-sp-txt { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: clamp(.9rem,2.5vw,1.1rem); color: #ffe4b5; line-height: 1.8; }

/* ── EMO CARD ───────────────────────────────────────────────────────────────── */
.bw-emo-card {
  max-width: 780px; margin: 0 auto; text-align: center;
  background: linear-gradient(135deg,rgba(255,107,157,.08),rgba(192,132,252,.08),rgba(251,191,36,.05));
  border: 1px solid rgba(255,107,157,.25); backdrop-filter: blur(20px);
  border-radius: 2rem; padding: clamp(1.5rem,5vw,3.5rem) clamp(1.2rem,4vw,3rem);
  position: relative; overflow: hidden;
}
.bw-emo-card::before {
  content: '❝'; position: absolute; top: -.5rem; left: 1rem;
  font-size: 7rem; color: rgba(255,107,157,.07); font-family: 'Cormorant Garamond', serif;
  line-height: 1; pointer-events: none; user-select: none;
}
.bw-emo-p {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(1rem,2.5vw,1.2rem); line-height: 2.1; color: #ffe4b5; position: relative; z-index: 1;
}
.bw-emo-p strong {
  -webkit-text-fill-color: transparent;
  background: linear-gradient(90deg,#ff6b9d,#fbbf24);
  -webkit-background-clip: text; background-clip: text; font-style: normal;
}

/* ── SURPRISE SECTION ───────────────────────────────────────────────────────── */
.bw-surp-sec {
  text-align: center; padding: clamp(2rem,6vw,5rem) 1rem;
  max-width: 620px; margin: 0 auto; position: relative; z-index: 10;
}
.bw-surp-btn {
  font-family: 'Great Vibes', cursive; font-size: clamp(1.2rem,4vw,1.8rem);
  padding: 1rem 3.2rem; border: none; border-radius: 50px;
  background: linear-gradient(135deg,#ff6b9d,#c084fc,#fbbf24,#ff6b9d); background-size: 300% auto;
  color: #fff; cursor: pointer; animation: shimmer 3.5s linear infinite;
  box-shadow: 0 0 55px rgba(255,107,157,.45); transition: transform .3s, box-shadow .3s, opacity .3s;
  min-height: 52px; /* touch-friendly */
}
.bw-surp-btn:disabled { opacity: .6; cursor: default; animation: none; }
.bw-surp-btn:not(:disabled):hover { transform: scale(1.07) rotate(-2deg); box-shadow: 0 0 70px rgba(255,107,157,.65); }
.bw-surp-msg {
  margin: 1.5rem auto 0; max-width: 540px;
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(1rem,3vw,1.25rem); color: #ffe4b5;
  background: linear-gradient(135deg,rgba(255,107,157,.08),rgba(192,132,252,.08));
  border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(12px);
  border-radius: 1.5rem; padding: 1.8rem 1.5rem;
  animation: scaleIn .5s ease; min-height: 5rem;
  display: flex; align-items: center; justify-content: center;
}

/* ── FINAL ──────────────────────────────────────────────────────────────────── */
.bw-final {
  min-height: 90vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 3rem 1.2rem 5rem; position: relative; z-index: 10;
  background: radial-gradient(ellipse 80% 60% at 50% 50%,rgba(255,107,157,.07),transparent);
}
.bw-f-rings { position: absolute; inset: 0; pointer-events: none; }
.bw-f-rings span { position: absolute; top: 50%; left: 50%; border-radius: 50%; transform: translate(-50%,-50%); animation: ringPulse 5s ease-in-out infinite; }
.bw-f-rings span:nth-child(1){width:min(280px,78vw);height:min(280px,78vw);border:1px solid rgba(255,107,157,.1)}
.bw-f-rings span:nth-child(2){width:min(500px,90vw);height:min(500px,90vw);border:1px solid rgba(251,191,36,.07);animation-delay:1s}
.bw-f-ttl {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(2rem,9vw,5.5rem); line-height: 1.1;
  background: linear-gradient(135deg,#fff,#fbbf24 45%,#ff6b9d 75%,#fff); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 5s linear infinite; word-break: break-word; padding: 0 1rem;
  filter: drop-shadow(0 0 40px rgba(251,191,36,.5));
}
.bw-f-sub { font-family: 'Great Vibes', cursive; font-size: clamp(1.4rem,5vw,2.5rem); color: #ff6b9d; margin: .9rem 0 1.5rem; filter: drop-shadow(0 0 15px rgba(255,107,157,.5)); }
.bw-f-hearts { font-size: clamp(1.8rem,5.5vw,2.8rem); animation: heartbeat 1.8s ease-in-out infinite; }
.bw-f-quote { margin-top: 1.5rem; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: clamp(.9rem,2.5vw,1.15rem); color: #ffe4b5; max-width: 500px; line-height: 2; padding: 0 1rem; }
.bw-f-icons { margin-top: 2.5rem; font-size: clamp(1.6rem,5vw,2.4rem); animation: heartbeat 2.2s ease-in-out infinite; }
`;