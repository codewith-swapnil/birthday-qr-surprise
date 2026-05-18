'use client';

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import type { WishData } from '@/types/wish';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProposeWishProps { rawData: WishData | null; slug: string; }
type Stage = 'envelope' | 'opening' | 'reveal';
interface HeartP { x:number;y:number;vx:number;vy:number;c:string;size:number;life:number;decay:number; }
interface RoseP  { x:number;y:number;sz:number;speed:number;drift:number;rot:number;rv:number;op:number;e:string; }

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const HEART_COLS   = ['#e8315a','#f9a8d4','#fb7185','#f472b6','#fbbf24','#fff','#c084fc','#fde68a'];
const ROSE_EMOJIS  = ['🌹','🌸','💮','🌺','💝','🥀'];
const NAV_IDS      = ['p-hero','p-why','p-msg','p-propose','p-final'];
const MAX_HEARTS   = 500;
const LOVE_NOTES   = [
  "You have no idea how often you cross my mind. Every. Single. Day. 🌹",
  "The world looks entirely different — better — when I'm with you. 💫",
  "I love you in ways I haven't found words for yet. 💝",
  "You make ordinary moments feel like something worth remembering. 🌸",
  "There's no version of my life that doesn't have you in it. ❤️",
  "Loving you is the easiest and most natural thing I've ever done. 💌",
];

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return mobile;
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function RevealSection({ children, delay = 0, style = {} }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  const { ref, vis } = useScrollReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s ease`,
      willChange: 'opacity, transform', ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Heart Confetti
// ─────────────────────────────────────────────────────────────────────────────
function useHeartConfetti(ref: React.RefObject<HTMLCanvasElement>, isMobile: boolean) {
  const parts = useRef<HeartP[]>([]);
  const raf   = useRef<number | null>(null);

  const draw = useCallback(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    parts.current.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.994; p.life -= p.decay;
      if (p.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = p.life * 0.9;
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.bezierCurveTo(s * 0.5, -s, s, s * 0.3, 0, s);
      ctx.bezierCurveTo(-s, s * 0.3, -s * 0.5, -s, 0, -s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    parts.current = parts.current.filter(p => p.life > 0);
    if (parts.current.length > 0) raf.current = requestAnimationFrame(draw);
    else { raf.current = null; ctx.clearRect(0, 0, c.width, c.height); }
  }, [ref]);

  const spawn = useCallback((n: number, ox?: number, oy?: number) => {
    const c = ref.current;
    const W = c?.width ?? innerWidth, H = c?.height ?? innerHeight;
    const budget = Math.min(n, MAX_HEARTS - parts.current.length);
    if (budget <= 0) return;
    for (let i = 0; i < budget; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 13 + 3;
      parts.current.push({
        x: ox ?? W * 0.5, y: oy ?? H * 0.3,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - Math.random() * 8,
        c: HEART_COLS[Math.floor(Math.random() * HEART_COLS.length)],
        size: Math.random() * 8 + 4, life: 1, decay: Math.random() * 0.012 + 0.006,
      });
    }
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [ref, draw]);

  const launch = useCallback(() => {
    const c = ref.current;
    const W = c?.width ?? innerWidth, H = c?.height ?? innerHeight;
    const sc = isMobile ? 0.45 : 1;
    [
      { n: Math.round(220 * sc), x: W * 0.5, y: H * 0.25, t: 0 },
      { n: Math.round(100 * sc), x: W * 0.1, y: H * 0.4,  t: 200 },
      { n: Math.round(100 * sc), x: W * 0.9, y: H * 0.4,  t: 400 },
      { n: Math.round(70  * sc), x: W * 0.25,y: H * 0.15, t: 600 },
      { n: Math.round(70  * sc), x: W * 0.75,y: H * 0.15, t: 750 },
    ].forEach(w => setTimeout(() => spawn(w.n, w.x, w.y), w.t));
  }, [spawn, ref, isMobile]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  return { launch, spawn };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas loops — stars + rose petals
// ─────────────────────────────────────────────────────────────────────────────
function useCanvasLoops(
  starCnv: React.RefObject<HTMLCanvasElement>,
  roseCnv: React.RefObject<HTMLCanvasElement>,
  isMobile: boolean,
) {
  const STAR_CNT = isMobile ? 55 : 130;
  const ROSE_CNT = isMobile ? 14 : 32;

  useEffect(() => {
    const sc = starCnv.current, rc = roseCnv.current;
    if (!sc || !rc) return;
    const sx = sc.getContext('2d')!;
    const rx = rc.getContext('2d')!;

    type StarL = { x:number;y:number;r:number;o:number;spd:number;tw:number;ts:number; };
    type RoseL = RoseP;
    let stars: StarL[] = [], roses: RoseL[] = [];

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      [sc, rc].forEach(c => { c.width = w; c.height = h; });
      stars = Array.from({ length: STAR_CNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3, o: Math.random() * 0.7 + 0.15,
        spd: Math.random() * 0.25 + 0.05,
        tw: Math.random() * Math.PI * 2, ts: Math.random() * 0.025 + 0.01,
      }));
      roses = Array.from({ length: ROSE_CNT }, () => ({
        x: Math.random() * w, y: Math.random() * 600 - 200,
        sz: Math.random() * 14 + 7, speed: Math.random() * 0.55 + 0.2,
        drift: (Math.random() - 0.5) * 0.55, rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 1.4, op: Math.random() * 0.32 + 0.1,
        e: ROSE_EMOJIS[Math.floor(Math.random() * ROSE_EMOJIS.length)],
      }));
    };

    resize();
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 250); };
    window.addEventListener('resize', onResize, { passive: true });

    let frame = 0, rafStar = 0, rafRose = 0;

    const animStar = () => {
      frame++;
      if (isMobile && frame % 2 !== 0) { rafStar = requestAnimationFrame(animStar); return; }
      const { width: w, height: h } = sc;
      sx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.tw += s.ts;
        sx.globalAlpha = s.o * (0.5 + 0.5 * Math.sin(s.tw));
        sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, Math.PI * 2); sx.fill();
        s.y -= s.spd; if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
      });
      sx.globalAlpha = 1;
      rafStar = requestAnimationFrame(animStar);
    };

    const animRose = () => {
      if (isMobile && frame % 2 === 0) { rafRose = requestAnimationFrame(animRose); return; }
      const { width: w, height: h } = rc;
      rx.clearRect(0, 0, w, h);
      roses.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.rot += p.rv;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 10; if (p.x > w + 30) p.x = -10;
        rx.save(); rx.globalAlpha = p.op; rx.translate(p.x, p.y);
        rx.rotate(p.rot * Math.PI / 180); rx.font = `${p.sz}px serif`;
        rx.fillText(p.e, -p.sz / 2, -p.sz / 2); rx.restore();
      });
      rafRose = requestAnimationFrame(animRose);
    };

    const visChange = () => {
      if (document.hidden) { cancelAnimationFrame(rafStar); cancelAnimationFrame(rafRose); }
      else { animStar(); animRose(); }
    };
    document.addEventListener('visibilitychange', visChange);
    animStar(); animRose();

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', visChange);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(rafStar); cancelAnimationFrame(rafRose);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingOrbs — rose/crimson palette
// ─────────────────────────────────────────────────────────────────────────────
const ORB_DATA = [
  { x: 8,  y: 15, size: 340, color: 'rgba(232,49,90,0.06)',   dur: 20, del: 0  },
  { x: 85, y: 8,  size: 280, color: 'rgba(192,132,252,0.07)', dur: 25, del: 4  },
  { x: 45, y: 68, size: 420, color: 'rgba(249,168,212,0.04)', dur: 28, del: 7  },
  { x: 15, y: 82, size: 220, color: 'rgba(244,114,182,0.05)', dur: 22, del: 11 },
  { x: 88, y: 58, size: 300, color: 'rgba(232,49,90,0.06)',   dur: 18, del: 2  },
];
function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {ORB_DATA.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${o.x}%`, top: `${o.y}%`,
          width: o.size, height: o.size, borderRadius: '50%',
          background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`,
          transform: 'translate(-50%,-50%) translateZ(0)',
          animation: `pOrbFloat ${o.dur}s ${o.del}s ease-in-out infinite`,
          filter: 'blur(40px)', willChange: 'transform',
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PersonAvatar — rose gradient
// ─────────────────────────────────────────────────────────────────────────────
function PersonAvatar({ src, name, size = 220 }: { src?: string; name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pad = Math.round(size * 0.08);
  const inner = size - pad * 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', flexShrink: 0, willChange: 'transform' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg,#e8315a,#f9a8d4,#c084fc,#fbbf24,#e8315a)',
        animation: 'pAvatarSpin 4s linear infinite', willChange: 'transform',
      }} />
      <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: '#080008' }} />
      <div style={{
        position: 'absolute', inset: pad, borderRadius: '50%', overflow: 'hidden',
        boxShadow: '0 0 50px rgba(232,49,90,.45),0 0 100px rgba(192,132,252,.2)',
      }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e8315a,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: inner * 0.38, color: '#fff', fontWeight: 600, lineHeight: 1 }}>{initials}</span>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', inset: pad, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 55%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,49,90,.22) 0%,transparent 70%)', animation: 'pGlowPulse 3s ease-in-out infinite', pointerEvents: 'none', willChange: 'opacity' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EnvelopeStage
// ─────────────────────────────────────────────────────────────────────────────
function EnvelopeStage({ onOpen, isOpening, personImage, name }: {
  onOpen: () => void; isOpening: boolean; personImage?: string; name: string;
}) {
  const [hover, setHover]     = useState(false);
  const [showImg, setShowImg] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpening) return;
    const t = setTimeout(() => setShowImg(true), 680);
    return () => clearTimeout(t);
  }, [isOpening]);

  const avatarSize = isMobile ? 165 : 215;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '2rem 1rem', position: 'relative', zIndex: 10,
    }}>
      {/* Pulse rings */}
      {!isOpening && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          {[220, 360, 510].map((r, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', width: r, height: r, borderRadius: '50%',
              border: `1px solid rgba(232,49,90,${0.18 - i * 0.05})`,
              transform: 'translate(-50%,-50%)',
              animation: `pRingExpand ${3 + i}s ${i * 0.85}s ease-in-out infinite`,
              willChange: 'transform,opacity',
            }} />
          ))}
        </div>
      )}

      {/* Person reveal */}
      {isOpening && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-55%)', zIndex: 30,
          opacity: showImg ? 1 : 0,
          animation: showImg ? 'pImgRise 1.1s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
          willChange: 'transform,opacity',
        }}>
          <PersonAvatar src={personImage} name={name} size={avatarSize} />
          {showImg && (
            <div style={{ animation: 'pFadeUp .8s .4s ease forwards', opacity: 0 }}>
              <p style={{
                fontFamily: "'Great Vibes',cursive",
                fontSize: 'clamp(1.5rem,5.5vw,2.6rem)',
                color: '#f9a8d4', lineHeight: 1.2,
                textShadow: '0 0 35px rgba(232,49,90,.65)',
              }}>
                For You, {name} ❤️
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
                fontSize: 'clamp(.85rem,2.8vw,1.1rem)', color: '#ffe4b5',
                marginTop: '.5rem', letterSpacing: '.06em',
                animation: 'pFadeUp .8s .9s ease forwards', opacity: 0,
              }}>
                ✨ With all my heart ✨
              </p>
            </div>
          )}
        </div>
      )}

      {/* Envelope */}
      <div
        onClick={!isOpening ? onOpen : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative', cursor: isOpening ? 'default' : 'pointer',
          animation: isOpening ? 'none' : 'pEnvFloat 3.5s ease-in-out infinite',
          transform: hover && !isOpening ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform .3s cubic-bezier(0.34,1.56,0.64,1),opacity .5s ease',
          opacity: isOpening && showImg ? 0 : 1,
          willChange: 'transform,opacity',
        }}
      >
        {!isOpening && (
          <div style={{
            position: 'absolute', inset: '-40px', borderRadius: '40px',
            background: hover
              ? 'radial-gradient(ellipse,rgba(232,49,90,.5) 0%,rgba(192,132,252,.25) 50%,transparent 70%)'
              : 'radial-gradient(ellipse,rgba(232,49,90,.24) 0%,rgba(192,132,252,.1) 50%,transparent 70%)',
            animation: 'pGlowPulse 2.5s ease-in-out infinite', pointerEvents: 'none',
            transition: 'background .4s ease', willChange: 'opacity',
          }} />
        )}

        {/* Rose floating above envelope */}
        {!isOpening && (
          <div style={{
            position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
            fontSize: 'clamp(2rem,5vw,2.6rem)',
            animation: 'pRoseFloat 2.2s ease-in-out infinite',
            zIndex: 2,
          }}>🌹</div>
        )}

        {/* Envelope SVG */}
        <svg
          width={isMobile ? 190 : 260}
          height={isMobile ? 140 : 195}
          viewBox="0 0 260 195"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(0 20px 56px rgba(232,49,90,${hover ? '0.7' : '0.45'}))`, transition: 'filter .4s ease' }}
        >
          <defs>
            <linearGradient id="envBody" x1="0" y1="0" x2="260" y2="195" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c81d4e" />
              <stop offset=".55" stopColor="#8b1035" />
              <stop offset="1" stopColor="#6b0e2a" />
            </linearGradient>
            <linearGradient id="envFlap" x1="0" y1="0" x2="260" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e8315a" />
              <stop offset="1" stopColor="#b81a40" />
            </linearGradient>
            <linearGradient id="envInner" x1="0" y1="0" x2="260" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff6b95" />
              <stop offset="1" stopColor="#e8315a" />
            </linearGradient>
          </defs>
          {/* Body */}
          <rect x="3" y="48" width="254" height="144" rx="14" fill="url(#envBody)" />
          {/* Shine */}
          <rect x="3" y="48" width="254" height="44" rx="14" fill="url(#envInner)" opacity=".22" />
          {/* Corner lines */}
          <path d="M3 192 L118 112 M257 192 L142 112" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" />
          {/* Flap */}
          <path
            d={isOpening ? 'M3 48 L130 -55 L257 48' : 'M3 48 L130 100 L257 48'}
            fill="url(#envFlap)"
            style={{ transition: 'd .7s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Flap sheen */}
          <path
            d={isOpening ? 'M3 48 L130 -55 L200 20' : 'M3 48 L130 100 L200 72'}
            fill="rgba(255,255,255,.08)"
            style={{ transition: 'd .7s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Heart wax seal */}
          {!isOpening && (
            <g transform="translate(108,140)">
              <circle cx="22" cy="22" r="22" fill="#e8315a" opacity=".95" />
              <path d="M22 32 C22 32 10 22 10 14 C10 9 14 6 22 14 C30 6 34 9 34 14 C34 22 22 32 22 32Z" fill="#fff" opacity=".9" />
            </g>
          )}
          {/* Letter peeking out when opening */}
          {isOpening && (
            <rect x="30" y="50" width="200" height="130" rx="8" fill="#fff4e8" opacity=".95"
              style={{ animation: 'pLetterRise .8s .2s ease forwards', transformBox: 'fill-box', transformOrigin: 'bottom' }} />
          )}
        </svg>
      </div>

      {!isOpening && (
        <>
          <p style={{
            fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
            fontSize: 'clamp(1rem,3.2vw,1.6rem)', color: '#f9a8d4',
            marginTop: '2.5rem', lineHeight: 1.7,
            animation: 'pFadeUp 1s .3s ease forwards', opacity: 0,
          }}>
            A letter straight from the heart waits for you 💌
          </p>
          <button
            onClick={onOpen}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              marginTop: '1.5rem', padding: '.85rem 2.6rem',
              border: 'none', borderRadius: '50px',
              background: 'linear-gradient(135deg,#e8315a,#c084fc,#f9a8d4,#e8315a)',
              backgroundSize: '300% auto', color: '#fff',
              fontFamily: "'Quicksand',sans-serif",
              fontSize: 'clamp(.9rem,2.8vw,1.05rem)', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '.05em',
              animation: 'pShimmer 3.5s linear infinite,pFadeUp 1s .7s ease forwards',
              opacity: 0,
              boxShadow: '0 0 50px rgba(232,49,90,.5)',
              transform: hover ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform .25s cubic-bezier(0.34,1.56,0.64,1)',
              minHeight: '48px', touchAction: 'manipulation',
            }}
          >
            ❤️ Open with Love
          </button>
        </>
      )}

      {isOpening && !showImg && (
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
          fontSize: 'clamp(1rem,3.8vw,1.7rem)', color: '#f9a8d4',
          marginTop: '2rem', animation: 'pFadeIn .5s ease forwards', letterSpacing: '.08em',
        }}>
          💌 Opening…
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProposeWish({ rawData }: ProposeWishProps) {
  const name        = rawData?.name    ?? 'You';
  const message     = rawData?.message ?? '';
  const images      = useMemo(() => (rawData?.images ?? []).slice(0, 8), [rawData]);
  const personImage = images[0] || undefined;
  const isMobile    = useIsMobile();

  const [stage, setStage]         = useState<Stage>('envelope');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [typeText, setTypeText]   = useState('');
  const [typeCursor, setTypeCursor] = useState(true);
  const [noteIdx, setNoteIdx]     = useState(0);
  const [showNote, setShowNote]   = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [saidYes, setSaidYes]     = useState(false);
  const maybeRef = useRef<HTMLButtonElement>(null);

  const starCnv  = useRef<HTMLCanvasElement>(null);
  const roseCnv  = useRef<HTMLCanvasElement>(null);
  const heartCnv = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { launch, spawn } = useHeartConfetti(heartCnv, isMobile);
  useCanvasLoops(starCnv, roseCnv, isMobile);

  // Heart canvas sizing
  useEffect(() => {
    const c = heartCnv.current; if (!c) return;
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Typewriter
  const phrases = useMemo(() => [
    `${name}, you are the reason I believe in love… ❤️`,
    `Every moment with you feels like a beautiful dream… 🌹`,
    `You make this world infinitely more beautiful… 💫`,
    `My heart has always known it was made for you… 🌸`,
    `You are my favourite kind of magic… ✨`,
  ], [name]);

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
      timer = setTimeout(tick, del ? 42 : 68);
    };
    timer = setTimeout(tick, 800);
    return () => { clearTimeout(timer); clearInterval(blink); };
  }, [stage, phrases]);

  // Nav highlight
  useEffect(() => {
    if (stage !== 'reveal') return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const idx = (NAV_IDS as string[]).indexOf(en.target.id);
          if (idx >= 0) setActiveNav(idx);
        }
      });
    }, { threshold: 0.35 });
    NAV_IDS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [stage]);

  // Periodic hearts
  useEffect(() => {
    if (stage !== 'reveal') return;
    const t = setInterval(() => spawn(isMobile ? 15 : 28), isMobile ? 18_000 : 10_000);
    return () => clearInterval(t);
  }, [stage, spawn, isMobile]);

  // Audio
  useEffect(() => {
    if (stage !== 'reveal') return;
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [stage]);

  const handleOpen = useCallback(() => {
    setStage('opening');
    setTimeout(() => { setStage('reveal'); launch(); }, 2400);
  }, [launch]);

  const handleYes = useCallback(() => {
    setSaidYes(true);
    const W = heartCnv.current?.width ?? innerWidth;
    const H = heartCnv.current?.height ?? innerHeight;
    const sc = isMobile ? 0.5 : 1;
    [
      { n: Math.round(180 * sc), x: W * 0.5, y: H * 0.4, t: 0 },
      { n: Math.round(90  * sc), x: W * 0.15,y: H * 0.45,t: 200 },
      { n: Math.round(90  * sc), x: W * 0.85,y: H * 0.45,t: 350 },
      { n: Math.round(70  * sc), x: W * 0.5, y: H * 0.55,t: 520 },
    ].forEach(w => setTimeout(() => spawn(w.n, w.x, w.y), w.t));
  }, [spawn, isMobile]);

  const handleLoveNote = useCallback(() => {
    setNoteCount(c => c + 1);
    setNoteIdx(i => (i + 1) % LOVE_NOTES.length);
    setShowNote(true);
    spawn(isMobile ? 40 : 80);
  }, [spawn, isMobile]);

  // "Maybe" button escapes cursor
  const handleMaybeEnter = () => {
    const b = maybeRef.current; if (!b) return;
    const dx = (Math.random() - 0.5) * 260;
    const dy = (Math.random() - 0.5) * 100;
    b.style.transform = `translate(${dx}px,${dy}px) rotate(${(Math.random() - 0.5) * 18}deg)`;
  };

  const toggleAudio = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) a.play().then(() => setIsPlaying(true)).catch(() => {});
    else { a.pause(); setIsPlaying(false); }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROPOSE_CSS }} />

      <canvas style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, willChange: 'transform' }} ref={starCnv} />
      <canvas style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, willChange: 'transform' }} ref={roseCnv} />
      <canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 200, willChange: 'transform' }} ref={heartCnv} />

      <div className="pw-amb" />
      <FloatingOrbs />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/music/romantic-proposal.mp3" loop preload="none" />

      {/* Audio bar */}
      <div className="pw-bar">
        <span className="pw-bar-lbl">🎵 A Song for {name}</span>
        <div className={`pw-eq${isPlaying ? '' : ' paused'}`}>{[0, 1, 2, 3, 4].map(i => <div key={i} />)}</div>
        <button className="pw-pbtn" onClick={toggleAudio} aria-label={isPlaying ? 'Pause music' : 'Play music'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* ══ ENVELOPE STAGE ═══════════════════════════════════════════════════ */}
      {(stage === 'envelope' || stage === 'opening') && (
        <EnvelopeStage
          onOpen={handleOpen}
          isOpening={stage === 'opening'}
          personImage={personImage}
          name={name}
        />
      )}

      {/* ══ REVEAL ═══════════════════════════════════════════════════════════ */}
      {stage === 'reveal' && (
        <div style={{ position: 'relative', zIndex: 10 }}>

          {/* Floating love icons */}
          <div className="pw-balloons">
            {['❤️', '💕', '💝', '💖', '💗', '🌹', '💞', '💓'].slice(0, isMobile ? 4 : 8).map((e, i) => (
              <span key={i} style={{
                fontSize: isMobile ? '1.3rem' : '1.8rem',
                animation: `pwBU ${6.5 + (i * 1.3) % 5}s ${(i * 0.7) % 4}s linear infinite`,
                willChange: 'transform,opacity', display: 'inline-block',
              }}>{e}</span>
            ))}
          </div>

          {/* Nav rail */}
          <nav className="pw-nav" aria-label="Section navigation">
            {NAV_IDS.map((id, i) => (
              <button key={id} className={`pw-nr${activeNav === i ? ' on' : ''}`}
                onClick={() => scrollTo(id)} aria-label={id.replace('p-', '')} />
            ))}
          </nav>

          {/* ─── HERO ──────────────────────────────────────────────────────── */}
          <section className="pw-hero" id="p-hero">
            <div className="pw-rings"><span /><span /><span /><span /></div>
            <span className="pw-eyebrow">🌹 · With All My Heart · 🌹</span>
            <h1 className="pw-hero-h">For You,</h1>
            <span className="pw-hero-name">{name} ❤️</span>
            <div style={{ margin: '2rem 0', animation: 'pImgEntrance 1.2s .8s cubic-bezier(0.34,1.56,0.64,1) forwards', opacity: 0, transform: 'scale(0.7)', willChange: 'transform,opacity' }}>
              <PersonAvatar src={personImage} name={name} size={isMobile ? 175 : 230} />
            </div>
            <p className="pw-hero-q">
              "Every love story is beautiful,<br />
              but ours is my favourite. 🌹"
            </p>
            <div className="pw-scroll-cue">
              <span>Open your heart</span>
              <div className="pw-scroll-line" />
            </div>
          </section>

          {/* ─── WHY YOU ───────────────────────────────────────────────────── */}
          <section className="pw-section" id="p-why">
            <div className="pw-sw">
              <RevealSection>
                <span className="pw-eye">💕 From My Heart</span>
                <h2 className="pw-stl">Why It's Always Been You</h2>
              </RevealSection>
              <RevealSection delay={0.1}>
                <div className="pw-type">
                  {typeText}<span className={`pw-cursor${typeCursor ? '' : ' off'}`}>|</span>
                </div>
              </RevealSection>
              <div className="pw-why-list">
                {[
                  { ico: '🌹', txt: `${name}, your smile is the most beautiful thing I've ever seen. It stops time completely.` },
                  { ico: '💫', txt: 'The way you carry yourself — with such grace and warmth — takes my breath away every single time.' },
                  { ico: '🌸', txt: 'Being with you feels like home. Peaceful, warm, and entirely, perfectly right.' },
                ].map(({ ico, txt }, i) => (
                  <RevealSection key={i} delay={i * 0.07}>
                    <div className="pw-why-item">
                      <span className="pw-why-ico">{ico}</span>
                      <p className="pw-why-txt">{txt}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>

          {/* ─── PERSONAL MESSAGE ──────────────────────────────────────────── */}
          <section className="pw-section" id="p-msg">
            <div className="pw-sw">
              <RevealSection>
                <span className="pw-eye">💌 My Letter to You</span>
                <h2 className="pw-stl">Words From the Heart</h2>
              </RevealSection>
              <RevealSection delay={0.1}>
                <div className="pw-letter">
                  {/* Ruled lines decoration */}
                  <div className="pw-letter-lines" aria-hidden="true" />
                  <p className="pw-letter-p">
                    {message ? (
                      <>
                        My dearest <strong>{name}</strong>,<br /><br />
                        {message.split('\n').map((line, i, arr) => (
                          <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                        ))}
                        <br /><br />Forever yours ❤️
                      </>
                    ) : (
                      <>
                        My dearest <strong>{name}</strong>,<br /><br />
                        There are a thousand things I want to say, but words always feel too small
                        when I try to describe what I feel. So let me just say this:{' '}
                        <strong>you are everything</strong>.<br /><br />
                        You are the reason I smile without knowing why. You are the thought that visits
                        me in quiet moments. You are, quite simply,{' '}
                        <strong>my favourite person in this entire world</strong>.<br /><br />
                        I don't know what the future holds — but I know I want you in it.
                        Every single part of it. 🌹<br /><br />
                        Forever yours ❤️
                      </>
                    )}
                  </p>
                </div>
              </RevealSection>
            </div>
          </section>

          {/* ─── WILL YOU ──────────────────────────────────────────────────── */}
          <section className="pw-propose-sec" id="p-propose">
            <RevealSection>
              <span className="pw-eye">💍 The Question</span>
              <h2 className="pw-stl" style={{ marginBottom: '1.5rem' }}>Will You Be Mine?</h2>
            </RevealSection>
            <RevealSection delay={0.1}>
              <div className="pw-heart-big" style={{
                animation: saidYes ? 'pHeartBeat .45s ease infinite' : 'pGlowPulse 2s ease-in-out infinite',
              }}>
                {saidYes ? '❤️' : '🤍'}
              </div>

              {!saidYes ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', position: 'relative' }}>
                  <button className="pw-yes-btn" onClick={handleYes}>
                    ❤️ Yes, Always!
                  </button>
                  <button
                    ref={maybeRef}
                    className="pw-maybe-btn"
                    onMouseEnter={handleMaybeEnter}
                    onTouchStart={handleMaybeEnter}
                    onClick={handleMaybeEnter}
                  >
                    🥺 Maybe…
                  </button>
                </div>
              ) : (
                <div style={{ animation: 'pScaleIn .6s cubic-bezier(0.34,1.56,0.64,1)', textAlign: 'center', marginTop: '1.5rem' }}>
                  <p style={{
                    fontFamily: "'Great Vibes',cursive",
                    fontSize: 'clamp(1.6rem,5vw,3rem)',
                    color: '#f9a8d4',
                    textShadow: '0 0 30px rgba(232,49,90,.6)',
                    marginBottom: '.6rem',
                  }}>
                    I knew it was always you! ❤️
                  </p>
                  <p style={{
                    fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
                    color: '#ffe4b5', fontSize: 'clamp(.9rem,2.5vw,1.2rem)',
                  }}>
                    This is the most beautiful moment 🌹
                  </p>
                </div>
              )}
            </RevealSection>

            {/* Love notes */}
            <RevealSection delay={0.2}>
              <div style={{ marginTop: '2.8rem', textAlign: 'center' }}>
                <h3 style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(1rem,3vw,1.5rem)', color: '#f9a8d4', marginBottom: '1rem' }}>
                  ✨ Love Notes for You
                </h3>
                <button className="pw-note-btn" onClick={handleLoveNote}>
                  💌 Read a Love Note
                </button>
                {showNote && (
                  <div className="pw-note-msg" key={noteCount}>
                    {LOVE_NOTES[noteIdx]}
                  </div>
                )}
                {noteCount > 0 && (
                  <p style={{ marginTop: '.75rem', color: 'rgba(249,168,212,0.45)', fontSize: '.85rem', fontFamily: "'Quicksand',sans-serif" }}>
                    {noteCount} love note{noteCount !== 1 ? 's' : ''} opened ❤️
                  </p>
                )}
              </div>
            </RevealSection>
          </section>

          {/* ─── FINAL ─────────────────────────────────────────────────────── */}
          <section className="pw-final" id="p-final">
            <div className="pw-f-rings"><span /><span /></div>
            <RevealSection>
              <div style={{ margin: '0 auto 2rem' }}>
                <PersonAvatar src={personImage} name={name} size={isMobile ? 125 : 160} />
              </div>
            </RevealSection>
            <RevealSection><h2 className="pw-f-ttl">With All My Love,<br />{name} ❤️</h2></RevealSection>
            <RevealSection delay={0.15}><p className="pw-f-sub">You mean everything 🌍</p></RevealSection>
            <RevealSection delay={0.25}><div className="pw-f-hearts">❤️ 🌹 ✨ 🌹 ❤️</div></RevealSection>
            <RevealSection delay={0.35}>
              <p className="pw-f-quote">
                "You are not just someone I love —<br />
                you are the reason I understand love at all." 🌹
              </p>
            </RevealSection>
            <RevealSection delay={0.45}>
              <div className="pw-f-icons">❤️ 💕 🌹 💝 💫 🌙 ⭐ 🌸 💎</div>
            </RevealSection>
          </section>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — MOBILE FONT SIZES FIXED (clamp minimums increased)
// Root cause: On 375-390px phones, vw-based preferred values fall below
// the clamp minimum → minimum is what renders. All minimums updated.
// ─────────────────────────────────────────────────────────────────────────────
const PROPOSE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,400&family=Great+Vibes&family=Quicksand:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
body{
  background:#080008;color:#fff;font-family:'Quicksand',sans-serif;
  overflow-x:hidden;min-height:100vh;
  overscroll-behavior:none;
  -webkit-tap-highlight-color:transparent;
}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#e8315a,#c084fc);border-radius:3px;}

/* ── KEYFRAMES ─────────────────────────────────────────────────────────────── */
@keyframes pFadeDown  {from{opacity:0;transform:translateY(-22px)}to{opacity:1;transform:translateY(0)}}
@keyframes pFadeUp    {from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)}}
@keyframes pFadeIn    {from{opacity:0}to{opacity:1}}
@keyframes pScaleIn   {from{opacity:0;transform:scale(.82)}to{opacity:1;transform:scale(1)}}
@keyframes pShimmer   {from{background-position:0% center}to{background-position:200% center}}
@keyframes pHeartBeat {0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}
@keyframes pGlowPulse {0%,100%{opacity:.5}50%{opacity:1}}
@keyframes pwBlink    {0%,100%{opacity:1}50%{opacity:0}}
@keyframes pwEq       {from{transform:scaleY(.35)}to{transform:scaleY(1)}}
@keyframes pwBU       {0%{transform:translateY(0) rotate(-5deg);opacity:1}45%{transform:translateY(-42vh) rotate(5deg)}100%{transform:translateY(-110vh) rotate(-4deg);opacity:0}}
@keyframes pAvatarSpin{to{transform:rotate(360deg)}}
@keyframes pOrbFloat  {0%,100%{transform:translate(-50%,-50%) translateY(0) scale(1)}33%{transform:translate(-50%,-50%) translateY(-28px) scale(1.04)}66%{transform:translate(-50%,-50%) translateY(18px) scale(.96)}}
@keyframes pRingExpand{0%{opacity:.65;transform:translate(-50%,-50%) scale(.9)}50%{opacity:.25;transform:translate(-50%,-50%) scale(1.1)}100%{opacity:.65;transform:translate(-50%,-50%) scale(.9)}}
@keyframes pRingPulse {0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1)}50%{opacity:.85;transform:translate(-50%,-50%) scale(1.05)}}
@keyframes pEnvFloat  {0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-18px) rotate(1.5deg)}}
@keyframes pRoseFloat {0%,100%{transform:translateX(-50%) translateY(0) rotate(-8deg)}50%{transform:translateX(-50%) translateY(-12px) rotate(8deg)}}
@keyframes pImgRise   {0%{opacity:0;transform:translate(-50%,-35%) scale(0.45)}60%{opacity:1;transform:translate(-50%,-58%) scale(1.04)}100%{opacity:1;transform:translate(-50%,-55%) scale(1)}}
@keyframes pImgEntrance{0%{opacity:0;transform:scale(0.7)}100%{opacity:1;transform:scale(1)}}
@keyframes pLetterRise{0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:.95}}
@keyframes pScrollLine{0%,100%{opacity:0;transform:scaleY(.3) translateY(-10px)}50%{opacity:1;transform:scaleY(1) translateY(10px)}}

/* ── AMBIENT ─────────────────────────────────────────────────────────────────── */
.pw-amb{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse 90% 70% at 15% 5%,rgba(60,0,25,0.85) 0%,transparent 55%),
    radial-gradient(ellipse 70% 55% at 85% 95%,rgba(92,10,46,0.8) 0%,transparent 55%),
    radial-gradient(ellipse 50% 40% at 60% 40%,rgba(192,132,252,.04) 0%,transparent 60%);
  will-change:transform;
}

/* ── AUDIO BAR ────────────────────────────────────────────────────────────────── */
.pw-bar{
  position:fixed;bottom:.9rem;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:.6rem;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(18px);border-radius:50px;
  padding:.5rem 1rem;z-index:1000;
  box-shadow:0 4px 20px rgba(232,49,90,.22);
  max-width:calc(100vw - 2rem);
  touch-action:manipulation;
}
.pw-bar-lbl{font-family:'Great Vibes',cursive;font-size:.85rem;color:#ffd6e7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;}
@media(min-width:480px){.pw-bar-lbl{max-width:230px;font-size:.95rem;}}
.pw-eq{display:flex;gap:3px;align-items:flex-end;height:16px;flex-shrink:0;}
.pw-eq div{width:3px;background:linear-gradient(180deg,#fbbf24,#e8315a);border-radius:2px;animation:pwEq .6s ease-in-out infinite alternate;}
.pw-eq div:nth-child(1){height:5px;animation-delay:0s}
.pw-eq div:nth-child(2){height:13px;animation-delay:.1s}
.pw-eq div:nth-child(3){height:9px;animation-delay:.2s}
.pw-eq div:nth-child(4){height:15px;animation-delay:.05s}
.pw-eq div:nth-child(5){height:7px;animation-delay:.15s}
.pw-eq.paused div{animation-play-state:paused;}
.pw-pbtn{
  width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;
  background:linear-gradient(135deg,#e8315a,#c084fc);font-size:.9rem;
  display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 0 14px rgba(232,49,90,.45);flex-shrink:0;
  touch-action:manipulation;
}

/* ── BALLOONS ─────────────────────────────────────────────────────────────────── */
.pw-balloons{position:fixed;bottom:-40px;left:0;width:100%;pointer-events:none;z-index:4;display:flex;justify-content:space-around;align-items:flex-end;}

/* ── NAV RAIL ─────────────────────────────────────────────────────────────────── */
.pw-nav{display:none;}
@media(min-width:640px){.pw-nav{display:flex;position:fixed;right:.8rem;top:50%;transform:translateY(-50%);flex-direction:column;gap:.55rem;z-index:600;}}
.pw-nr{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;border:1px solid rgba(255,255,255,.2);transition:all .3s;padding:0;touch-action:manipulation;}
.pw-nr.on{background:#e8315a;box-shadow:0 0 10px #e8315a;transform:scale(1.5);}

/* ── HERO ─────────────────────────────────────────────────────────────────────── */
.pw-hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  padding:4rem 1.2rem 3rem;position:relative;overflow:hidden;
}
.pw-rings{position:absolute;inset:0;pointer-events:none;}
.pw-rings span{position:absolute;top:50%;left:50%;border-radius:50%;transform:translate(-50%,-50%);animation:pRingPulse 6s ease-in-out infinite;will-change:transform,opacity;}
.pw-rings span:nth-child(1){width:min(240px,70vw);height:min(240px,70vw);border:1px solid rgba(232,49,90,.15)}
.pw-rings span:nth-child(2){width:min(430px,84vw);height:min(430px,84vw);border:1px solid rgba(192,132,252,.1);animation-delay:1.5s}
.pw-rings span:nth-child(3){width:min(640px,94vw);height:min(640px,94vw);border:1px solid rgba(249,168,212,.065);animation-delay:3s}
.pw-rings span:nth-child(4){width:min(870px,98vw);height:min(870px,98vw);border:1px solid rgba(232,49,90,.035);animation-delay:4.5s}

/* ✅ FIX: clamp MIN 1.1rem (was .88rem — fell below on 375px phones) */
.pw-eyebrow{
  font-family:'Great Vibes',cursive;
  font-size:clamp(1.1rem,3.4vw,1.45rem);
  color:#fbbf24;letter-spacing:.14em;animation:pFadeDown .9s ease forwards;opacity:0;
  text-shadow:0 0 22px rgba(251,191,36,.65);padding:0 1rem;text-align:center;
}
.pw-hero-h{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(2.6rem,10.5vw,8rem);line-height:.95;
  background:linear-gradient(135deg,#e8315a,#f9a8d4 33%,#c084fc 65%,#e8315a);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:pShimmer 5s linear infinite,pScaleIn 1.2s .2s ease forwards;opacity:0;
  filter:drop-shadow(0 0 44px rgba(232,49,90,.28));
}
.pw-hero-name{
  font-family:'Great Vibes',cursive;
  font-size:clamp(1.85rem,8.5vw,6rem);line-height:1;
  background:linear-gradient(135deg,#fbbf24,#fff 45%,#fbbf24);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:pShimmer 4s linear infinite,pScaleIn 1.2s .5s ease forwards;opacity:0;
  filter:drop-shadow(0 0 52px rgba(251,191,36,.55));display:block;margin:-.2rem 0 .8rem;
  word-break:break-word;padding:0 .5rem;
}

/* ✅ FIX: 1.1rem (was .88rem) */
.pw-hero-q{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(1.1rem,2.8vw,1.3rem);
  color:#ffd6e7;animation:pFadeUp .9s .8s ease forwards;opacity:0;
  max-width:480px;line-height:1.9;padding:0 1.2rem;margin-top:.5rem;
}

.pw-scroll-cue{margin-top:2rem;display:flex;flex-direction:column;align-items:center;gap:.5rem;animation:pFadeUp .9s 1.3s ease forwards;opacity:0;}
/* ✅ FIX: .95rem (was .72rem — way too small) */
.pw-scroll-cue span{color:#f9a8d4;font-size:clamp(.95rem,2.4vw,1rem);letter-spacing:.06em;}
.pw-scroll-line{width:1px;height:36px;background:linear-gradient(180deg,rgba(232,49,90,.8),transparent);animation:pScrollLine 1.8s ease-in-out infinite;will-change:transform,opacity;}

/* ── SECTIONS ─────────────────────────────────────────────────────────────────── */
.pw-section{position:relative;z-index:10;}
.pw-sw{max-width:900px;margin:0 auto;padding:clamp(2.5rem,6.5vw,5rem) 1rem;}
@media(min-width:640px){.pw-sw{padding:clamp(3rem,7.5vw,6rem) 1.5rem;}}

/* ✅ FIX: 1.1rem (was .88rem) */
.pw-eye{
  font-family:'Great Vibes',cursive;
  font-size:clamp(1.1rem,2.8vw,1.25rem);
  color:#fbbf24;letter-spacing:.12em;display:block;margin-bottom:.4rem;text-align:center;
}
.pw-stl{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(1.45rem,4.8vw,2.7rem);text-align:center;
  background:linear-gradient(135deg,#fff,#f9a8d4);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:clamp(1.4rem,4.8vw,2.7rem);
}

/* ── TYPEWRITER ──────────────────────────────────────────────────────────────── */
/* ✅ FIX: 1.15rem (was .96rem) */
.pw-type{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.15rem,2.8vw,1.35rem);
  color:#ffd6e7;line-height:1.9;min-height:3.4em;
  background:linear-gradient(135deg,rgba(232,49,90,.06),rgba(192,132,252,.06));
  border:1px solid rgba(232,49,90,.2);border-radius:1.2rem;
  padding:1.2rem 1.4rem;margin-bottom:2rem;backdrop-filter:blur(10px);
}
.pw-cursor{color:#e8315a;animation:pwBlink .85s step-end infinite;}
.pw-cursor.off{opacity:0;animation:none;}

/* ── WHY LIST ────────────────────────────────────────────────────────────────── */
.pw-why-list{display:flex;flex-direction:column;gap:.85rem;}
.pw-why-item{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(10px);border-radius:1.3rem;padding:1.2rem 1.4rem;
  display:flex;align-items:center;gap:1.1rem;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s ease;
  will-change:transform;
}
.pw-why-item:hover{transform:translateX(7px);background:rgba(232,49,90,.055);}
@media(min-width:640px){
  .pw-why-item:nth-child(even){flex-direction:row-reverse;text-align:right;}
  .pw-why-item:nth-child(even):hover{transform:translateX(-7px);}
}
.pw-why-ico{font-size:clamp(1.7rem,4.2vw,2.5rem);flex-shrink:0;}
/* ✅ FIX: 1.05rem (was .88rem) */
.pw-why-txt{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.05rem,2.4vw,1.08rem);
  color:#ffd6e7;line-height:1.85;
}

/* ── LOVE LETTER ─────────────────────────────────────────────────────────────── */
.pw-letter{
  max-width:720px;margin:0 auto;
  background:rgba(255,240,240,.04);
  border:1px solid rgba(232,49,90,.2);
  backdrop-filter:blur(18px);border-radius:1.8rem;
  padding:clamp(1.6rem,5vw,3rem) clamp(1.2rem,4vw,2.8rem);
  position:relative;overflow:hidden;
  box-shadow:0 8px 48px rgba(232,49,90,.1),inset 0 1px 0 rgba(255,255,255,.06);
}
.pw-letter-lines{
  position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(
    to bottom,
    transparent,transparent 31px,
    rgba(232,49,90,.06) 31px,rgba(232,49,90,.06) 32px
  );
  border-radius:inherit;
}
.pw-letter::before{content:'❝';position:absolute;top:-.5rem;left:1rem;font-size:6.5rem;color:rgba(232,49,90,.07);font-family:'Cormorant Garamond',serif;line-height:1;pointer-events:none;user-select:none;}
/* ✅ FIX: 1.15rem (was .96rem) */
.pw-letter-p{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.15rem,2.4vw,1.18rem);
  line-height:2.1;color:#ffd6e7;position:relative;z-index:1;
}
.pw-letter-p strong{-webkit-text-fill-color:transparent;background:linear-gradient(90deg,#e8315a,#fbbf24);-webkit-background-clip:text;background-clip:text;font-style:normal;}

/* ── PROPOSE SECTION ─────────────────────────────────────────────────────────── */
.pw-propose-sec{text-align:center;padding:clamp(2rem,5.5vw,5rem) 1rem;max-width:580px;margin:0 auto;position:relative;z-index:10;}
.pw-heart-big{font-size:clamp(4rem,14vw,7rem);display:block;margin:0 auto .5rem;will-change:transform;}
.pw-yes-btn{
  font-family:'Great Vibes',cursive;font-size:clamp(1.15rem,3.8vw,1.75rem);
  padding:1rem 3.2rem;border:none;border-radius:50px;
  background:linear-gradient(135deg,#e8315a,#c084fc,#f9a8d4,#e8315a);background-size:300% auto;
  color:#fff;cursor:pointer;animation:pShimmer 3.5s linear infinite;
  box-shadow:0 0 48px rgba(232,49,90,.45);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  min-height:52px;touch-action:manipulation;
  will-change:transform;
}
.pw-yes-btn:hover{transform:scale(1.08) rotate(-1.5deg);box-shadow:0 0 72px rgba(232,49,90,.65);}
/* ✅ FIX: 1.05rem (was .9rem) */
.pw-maybe-btn{
  font-family:'Quicksand',sans-serif;font-size:1.05rem;
  padding:.7rem 2rem;border:1px solid rgba(249,168,212,.3);border-radius:50px;
  background:rgba(249,168,212,.08);color:#f9a8d4;
  cursor:pointer;transition:transform .4s cubic-bezier(.34,1.56,.64,1);
  min-height:44px;touch-action:manipulation;
  position:relative;will-change:transform;
}
/* ✅ FIX: 1.2rem (was 1rem) */
.pw-note-btn{
  font-family:'Great Vibes',cursive;font-size:clamp(1.2rem,3.2vw,1.5rem);
  padding:.8rem 2.4rem;border:none;border-radius:50px;
  background:linear-gradient(135deg,#e8315a,#f472b6,#c084fc);
  color:#fff;cursor:pointer;box-shadow:0 0 32px rgba(232,49,90,.35);
  transition:transform .3s,box-shadow .3s;min-height:48px;touch-action:manipulation;
}
.pw-note-btn:hover{transform:scale(1.06);box-shadow:0 0 52px rgba(232,49,90,.55);}
/* ✅ FIX: 1.15rem (was .96rem) */
.pw-note-msg{
  margin:1.4rem auto 0;max-width:500px;
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.15rem,2.8vw,1.22rem);
  color:#ffd6e7;
  background:linear-gradient(135deg,rgba(232,49,90,.08),rgba(192,132,252,.08));
  border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px);
  border-radius:1.4rem;padding:1.7rem 1.4rem;
  animation:pScaleIn .5s ease;
  display:flex;align-items:center;justify-content:center;min-height:5rem;
}

/* ── FINAL ────────────────────────────────────────────────────────────────────── */
.pw-final{
  min-height:90vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  padding:3rem 1.2rem 5rem;position:relative;z-index:10;
  background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(232,49,90,.065),transparent);
}
.pw-f-rings{position:absolute;inset:0;pointer-events:none;}
.pw-f-rings span{position:absolute;top:50%;left:50%;border-radius:50%;transform:translate(-50%,-50%);animation:pRingPulse 5s ease-in-out infinite;will-change:transform,opacity;}
.pw-f-rings span:nth-child(1){width:min(260px,76vw);height:min(260px,76vw);border:1px solid rgba(232,49,90,.09)}
.pw-f-rings span:nth-child(2){width:min(480px,88vw);height:min(480px,88vw);border:1px solid rgba(249,168,212,.065);animation-delay:1s}
.pw-f-ttl{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(1.9rem,8.5vw,5.2rem);line-height:1.1;
  background:linear-gradient(135deg,#fff,#fbbf24 45%,#e8315a 75%,#fff);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:pShimmer 5s linear infinite;word-break:break-word;padding:0 1rem;
  filter:drop-shadow(0 0 36px rgba(232,49,90,.4));
}
.pw-f-sub{font-family:'Great Vibes',cursive;font-size:clamp(1.3rem,4.8vw,2.4rem);color:#e8315a;margin:.9rem 0 1.5rem;filter:drop-shadow(0 0 13px rgba(232,49,90,.45));}
.pw-f-hearts{font-size:clamp(1.7rem,5.2vw,2.6rem);animation:pHeartBeat 1.8s ease-in-out infinite;will-change:transform;}
/* ✅ FIX: 1.08rem (was .88rem) */
.pw-f-quote{
  margin-top:1.5rem;font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.08rem,2.4vw,1.12rem);
  color:#ffd6e7;max-width:460px;line-height:2;padding:0 1rem;
}
.pw-f-icons{margin-top:2.4rem;font-size:clamp(1.5rem,4.8vw,2.3rem);animation:pHeartBeat 2.2s ease-in-out infinite;will-change:transform;}
`;