'use client';

/**
 * BirthdayWish.tsx
 * ────────────────────────────────────────────────────────────
 * Full-screen animated birthday-wish experience.
 * Driven by WishData; all hardcoded "Raveena" references
 * have been replaced with dynamic props.
 *
 * Features:
 *  • Animated star / petal / confetti / firework canvas layers
 *  • Live countdown → auto-transitions to birthday screen
 *  • Photo gallery slider (uses Cloudinary URLs from WishData.images)
 *  • Memory timeline (first 4 images reused)
 *  • Typed-text effect for "Why you're special"
 *  • Personalised emotional message (WishData.message)
 *  • Surprise button with mini confetti burst
 *  • Custom cursor with floating hearts
 *  • Animated balloons, nav-rail, audio bar
 * ────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { WishData } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BirthdayWishProps {
  rawData: WishData | null;
  slug: string;
}

interface CountdownState {
  d: string;
  h: string;
  m: string;
  s: string;
}

interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number;
  c: string; w: number; h: number;
  rot: number; rv: number; life: number;
  decay: number; shape: 'c' | 'r';
}

interface FireworkParticle {
  x: number; y: number; vx: number; vy: number;
  c: string; r: number; life: number; decay: number;
}

interface StarParticle {
  x: number; y: number; r: number; o: number;
  speed: number; tw: number; ts: number;
}

interface PetalParticle {
  x: number; y: number; sz: number;
  speed: number; drift: number;
  rot: number; rv: number; op: number;
  e: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const BALLOON_COLORS = [
  '#ff6b9d','#c084fc','#fbbf24','#fb7185',
  '#a78bfa','#f472b6','#fde68a','#e879f9',
];

const CONFETTI_COLORS = [
  '#ff6b9d','#c084fc','#fbbf24','#fb7185','#a78bfa',
  '#f472b6','#fde68a','#60a5fa','#34d399','#fff',
];

const FIREWORK_COLORS = [
  '#ff6b9d','#c084fc','#fbbf24','#fb7185',
  '#f9a8d4','#fde68a','#e879f9','#a78bfa',
];

const PETAL_EMOJIS = ['🌸','🌺','🌹','💮','🌼','✿'];

const HEART_EMOJIS = ['💖','💕','✨','🌸','💗','⭐','🌺'];

const SURPRISE_MESSAGES = [
  '🌟 You are like a rare diamond — precious, brilliant, and absolutely irreplaceable. The universe crafted you to be extraordinary! 💎',
  '🌸 Every single person who knows you is lucky beyond measure. Your presence is a gift that keeps giving every single day! 💝',
  '🦋 You have the most magical ability to make ordinary moments feel extraordinary. That\'s not just special — that\'s a superpower! ⚡',
  '🌺 Somewhere right now, someone is thinking about you and smiling without even realising why — that\'s the effect you have! 💫',
  '✨ If happiness had a face, it would look exactly like yours. Happy Birthday to the most radiant you! 🎂',
  '🌙 The stars are jealous of how brightly you shine. Keep glowing, keep being you — the world needs your light! 💛',
];

const NAV_SECTIONS = [
  { id: 's-hero',    label: 'Home'    },
  { id: 's-gallery', label: 'Gallery' },
  { id: 's-wishes',  label: 'Wishes'  },
  { id: 's-special', label: 'Special' },
  { id: 's-msg',     label: 'Message' },
  { id: 's-final',   label: 'Final'   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

function formatBirthdayDisplay(dob: string): string {
  const d = new Date(dob);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function isToday(dob: string): boolean {
  const now = new Date();
  const d   = new Date(dob);
  return now.getMonth() === d.getMonth() && now.getDate() === d.getDate();
}

function msToNextBirthday(dob: string): number {
  const now  = Date.now();
  const birth = new Date(dob);
  let next = new Date(
    new Date().getFullYear(),
    birth.getMonth(),
    birth.getDate(),
    0, 0, 0,
  ).getTime();
  if (next <= now) {
    next = new Date(
      new Date().getFullYear() + 1,
      birth.getMonth(),
      birth.getDate(),
    ).getTime();
  }
  return next - now;
}

function msToCountdown(ms: number): CountdownState {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    d: pad(Math.floor(totalSec / 86400)),
    h: pad(Math.floor((totalSec % 86400) / 3600)),
    m: pad(Math.floor((totalSec % 3600) / 60)),
    s: pad(totalSec % 60),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Single balloon SVG */
function Balloon({ color, size, dur, delay }: {
  color: string; size: number; dur: number; delay: number;
}) {
  return (
    <svg
      viewBox="0 0 100 150"
      width={size}
      style={{ animation: `ballU ${dur}s ${delay}s linear infinite`, color }}
    >
      <ellipse cx="50" cy="55" rx="38" ry="46" fill={color} opacity={0.88} />
      <ellipse cx="40" cy="42" rx="9"  ry="11" fill="rgba(255,255,255,.28)" />
      <path d="M47 101 Q50 108 53 101" stroke={color} strokeWidth="3" fill="none" />
      <line x1="50" y1="104" x2="50" y2="150" stroke={color} strokeWidth="1.5" opacity={0.6} />
    </svg>
  );
}

/** Gallery slide */
function Slide({
  src, caption, onClick,
}: { src: string; caption: string; onClick: () => void }) {
  return (
    <div className="slide" onClick={onClick}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={caption} loading="lazy" />
      ) : (
        <div className="slide-placeholder">{caption}</div>
      )}
      <div className="slide-cap">{caption}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BirthdayWish({ rawData }: BirthdayWishProps) {
  // ── data ──────────────────────────────────────────────────
  const name    = rawData?.name          ?? 'You';
  const dob     = rawData?.dateOfBirth   ?? '';
  const message = rawData?.message       ?? '';
  const images  = useMemo(() => rawData?.images ?? [], [rawData]);

  const bdDisplay = dob ? formatBirthdayDisplay(dob) : '';

  // ── typing phrases (personalised) ─────────────────────────
  const PHRASES = useMemo(() => [
    `${name}, you are the definition of grace, strength, and beauty… ✨`,
    `You make everyone's life brighter simply by being in it… 🌸`,
    `Your kindness is a superpower that touches every heart… 💖`,
    `The world is genuinely better because of you… 🌙`,
    `You are the poem the universe wrote to perfection… 🌺`,
    `Every day with you is a gift nobody deserves but everyone treasures… 💫`,
  ], [name]);

  // ── gallery slides ────────────────────────────────────────
  const SLIDE_CAPTIONS = [
    '🌸 Every day with you is a beautiful blessing',
    '✨ Your smile lights up every room, every heart',
    '🌺 You are one in a million 💖',
    '💎 Precious beyond words, cherished beyond measure',
    '🎉 May every moment of your life feel this magical',
    '🌟 Born to shine, born to be deeply loved',
    '🦋 Free, beautiful, unstoppable — forever you',
    '🌹 Happy Birthday to someone truly extraordinary',
  ];

  const slides = useMemo<Array<{ src: string; caption: string }>>(() => {
    if (images.length > 0) {
      return images.slice(0, 8).map((src, i) => ({
        src,
        caption: SLIDE_CAPTIONS[i] ?? `✨ ${name}`,
      }));
    }
    // No images: show caption-only placeholder slides
    return SLIDE_CAPTIONS.map((caption) => ({ src: '', caption }));
  }, [images, name]);

  const timelineImages = useMemo(() => images.slice(0, 4), [images]);

  // ── UI state ──────────────────────────────────────────────
  const [showBirthday, setShowBirthday] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>({
    d: '00', h: '00', m: '00', s: '00',
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [typeText, setTypeText]         = useState('');
  const [typeCursor, setTypeCursor]     = useState(true);
  const [surpriseIdx, setSurpriseIdx]   = useState(0);
  const [showSurpriseMsg, setShowSurpriseMsg] = useState(false);
  const [activeNav, setActiveNav]       = useState(0);

  // ── refs ─────────────────────────────────────────────────
  const starCanvasRef      = useRef<HTMLCanvasElement>(null);
  const petalCanvasRef     = useRef<HTMLCanvasElement>(null);
  const fireworkCanvasRef  = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef  = useRef<HTMLCanvasElement>(null);
  const audioRef           = useRef<HTMLAudioElement>(null);
  const confettiRef        = useRef<ConfettiParticle[]>([]);
  const fireworksRef       = useRef<FireworkParticle[]>([]);
  const starsRef           = useRef<StarParticle[]>([]);
  const petalsRef          = useRef<PetalParticle[]>([]);
  const afIds              = useRef<number[]>([]);        // animation frame ids
  const sliderTimer        = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─────────────────────────────────────────────────────────
  // Canvas helpers
  // ─────────────────────────────────────────────────────────

  const buildStars = useCallback((w: number, h: number) => {
    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.35 + 0.05,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * 0.03 + 0.01,
    }));
  }, []);

  const buildPetals = useCallback((w: number) => {
    petalsRef.current = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: Math.random() * 900 - 200,
      sz: Math.random() * 20 + 10,
      speed: Math.random() * 0.7 + 0.25,
      drift: (Math.random() - 0.5) * 0.7,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 1.5,
      op: Math.random() * 0.5 + 0.15,
      e: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
    }));
  }, []);

  const launchConfetti = useCallback((
    count: number,
    ox?: number,
    oy?: number,
  ) => {
    const cw = confettiCanvasRef.current?.width  ?? window.innerWidth;
    const ch = confettiCanvasRef.current?.height ?? window.innerHeight;
    for (let i = 0; i < count; i++) {
      const a  = Math.random() * Math.PI * 2;
      const sp = Math.random() * 13 + 4;
      confettiRef.current.push({
        x: ox ?? Math.random() * cw,
        y: oy ?? ch * 0.3,
        vx: Math.cos(a) * sp * (Math.random() * 0.6 + 0.7),
        vy: Math.sin(a) * sp * (Math.random() * 0.6 + 0.7) - Math.random() * 9,
        c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 2,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 9,
        life: 1,
        decay: Math.random() * 0.012 + 0.008,
        shape: Math.random() < 0.3 ? 'c' : 'r',
      });
    }
  }, []);

  const bigConfetti = useCallback(() => {
    const cw = confettiCanvasRef.current?.width  ?? window.innerWidth;
    const ch = confettiCanvasRef.current?.height ?? window.innerHeight;
    launchConfetti(260, cw * 0.5, ch * 0.25);
    setTimeout(() => launchConfetti(180, cw * 0.05, ch * 0.45), 300);
    setTimeout(() => launchConfetti(180, cw * 0.95, ch * 0.45), 500);
    setTimeout(() => launchConfetti(140, cw * 0.25, ch * 0.18), 700);
    setTimeout(() => launchConfetti(140, cw * 0.75, ch * 0.18), 900);
  }, [launchConfetti]);

  const launchFireworks = useCallback(() => {
    const fw = fireworkCanvasRef.current;
    if (!fw) return;
    const { width: fwW, height: fwH } = fw;
    const burst = (x: number, y: number, col: string) => {
      for (let i = 0; i < 75; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 7 + 3;
        fireworksRef.current.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          c: col,
          r: Math.random() * 2.5 + 0.8,
          life: 1,
          decay: Math.random() * 0.018 + 0.01,
        });
      }
    };
    for (let i = 0; i < 12; i++) {
      setTimeout(() => burst(
        fwW * 0.1 + Math.random() * fwW * 0.8,
        fwH * 0.04 + Math.random() * fwH * 0.44,
        FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      ), i * 350);
    }
  }, []);

  // ─────────────────────────────────────────────────────────
  // Canvas animation loops
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const star  = starCanvasRef.current;
    const petal = petalCanvasRef.current;
    const conf  = confettiCanvasRef.current;
    const fw    = fireworkCanvasRef.current;
    if (!star || !petal || !conf || !fw) return;

    const sx = star.getContext('2d')!;
    const px = petal.getContext('2d')!;
    const cx = conf.getContext('2d')!;
    const fx = fw.getContext('2d')!;

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      star.width = petal.width = conf.width = fw.width = w;
      star.height = petal.height = conf.height = fw.height = h;
      buildStars(w, h);
      buildPetals(w);
    };
    resize();
    window.addEventListener('resize', resize);

    // Star loop
    const animStar = () => {
      const { width: w, height: h } = star;
      sx.clearRect(0, 0, w, h);
      starsRef.current.forEach((s) => {
        s.tw += s.ts;
        sx.globalAlpha = s.o * (0.5 + 0.5 * Math.sin(s.tw));
        sx.fillStyle = '#fff';
        sx.beginPath();
        sx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sx.fill();
        s.y -= s.speed;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
      });
      sx.globalAlpha = 1;
      const id = requestAnimationFrame(animStar);
      afIds.current.push(id);
    };

    // Petal loop
    const animPetal = () => {
      const { width: w, height: h } = petal;
      px.clearRect(0, 0, w, h);
      petalsRef.current.forEach((p) => {
        p.y += p.speed; p.x += p.drift; p.rot += p.rv;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -30)   p.x = w + 10;
        if (p.x > w + 30) p.x = -10;
        px.save();
        px.globalAlpha = p.op;
        px.translate(p.x, p.y);
        px.rotate((p.rot * Math.PI) / 180);
        px.font = `${p.sz}px serif`;
        px.fillText(p.e, -p.sz / 2, -p.sz / 2);
        px.restore();
      });
      const id = requestAnimationFrame(animPetal);
      afIds.current.push(id);
    };

    // Confetti loop
    const animConf = () => {
      const { width: cw, height: ch } = conf;
      cx.clearRect(0, 0, cw, ch);
      confettiRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.3; p.vx *= 0.99;
        p.rot += p.rv; p.life -= p.decay;
        cx.save();
        cx.globalAlpha = Math.max(0, p.life);
        cx.fillStyle = p.c;
        cx.translate(p.x, p.y);
        cx.rotate((p.rot * Math.PI) / 180);
        if (p.shape === 'c') {
          cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, Math.PI * 2); cx.fill();
        } else {
          cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        cx.restore();
      });
      confettiRef.current = confettiRef.current.filter((p) => p.life > 0);
      const id = requestAnimationFrame(animConf);
      afIds.current.push(id);
    };

    // Firework loop
    const animFw = () => {
      const { width: fw2w, height: fw2h } = fw;
      fx.clearRect(0, 0, fw2w, fw2h);
      fireworksRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.06; p.life -= p.decay;
        fx.globalAlpha = Math.max(0, p.life);
        fx.fillStyle = p.c;
        fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fx.fill();
      });
      fireworksRef.current = fireworksRef.current.filter((p) => p.life > 0);
      fx.globalAlpha = 1;
      const id = requestAnimationFrame(animFw);
      afIds.current.push(id);
    };

    animStar(); animPetal(); animConf(); animFw();

    return () => {
      window.removeEventListener('resize', resize);
      afIds.current.forEach(cancelAnimationFrame);
      afIds.current = [];
    };
  }, [buildStars, buildPetals]);

  // ─────────────────────────────────────────────────────────
  // Countdown / birthday check
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!dob) {
      // No DOB provided — go straight to birthday screen
      setShowBirthday(true);
      return;
    }

    if (isToday(dob)) {
      setShowBirthday(true);
      return;
    }

    const update = () => {
      const ms = msToNextBirthday(dob);
      if (ms <= 0) {
        setShowBirthday(true);
        clearInterval(timer);
        return;
      }
      setCountdown(msToCountdown(ms));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [dob]);

  // ─────────────────────────────────────────────────────────
  // On birthday screen mount: confetti, fireworks, audio
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showBirthday) return;
    setTimeout(bigConfetti, 400);
    setTimeout(launchFireworks, 600);

    // Periodic mini confetti
    const periodicConf = setInterval(() => launchConfetti(50), 7000);

    // Attempt audio autoplay
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1.0;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {/* browser blocked autoplay — user can press play */});
    }

    return () => clearInterval(periodicConf);
  }, [showBirthday, bigConfetti, launchFireworks, launchConfetti]);

  // ─────────────────────────────────────────────────────────
  // Typing effect
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showBirthday) return;
    let pi = 0, ci = 0, deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = PHRASES[pi];
      if (!deleting) {
        setTypeText(phrase.slice(0, ci + 1));
        ci++;
        if (ci === phrase.length + 1) {
          deleting = true;
          timer = setTimeout(tick, 2400);
          return;
        }
      } else {
        setTypeText(phrase.slice(0, ci - 1));
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % PHRASES.length;
        }
      }
      timer = setTimeout(tick, deleting ? 38 : 62);
    };

    const blinkTimer = setInterval(() => setTypeCursor((v) => !v), 530);
    timer = setTimeout(tick, 900);
    return () => { clearTimeout(timer); clearInterval(blinkTimer); };
  }, [showBirthday, PHRASES]);

  // ─────────────────────────────────────────────────────────
  // Slider auto-advance
  // ─────────────────────────────────────────────────────────

  const goSlide = useCallback((idx: number) => {
    setCurrentSlide((idx + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!showBirthday) return;
    sliderTimer.current = setInterval(() => goSlide(currentSlide + 1), 3800);
    return () => { if (sliderTimer.current) clearInterval(sliderTimer.current); };
  }, [showBirthday, currentSlide, goSlide]);

  // ─────────────────────────────────────────────────────────
  // Intersection observer — reveal animations & nav rail
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showBirthday) return;

    const revealObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          revealObs.unobserve(e.target);
        }
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.w-card,.tl-i,.sp-item').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay =
        el.classList.contains('sp-item') ? `${i * 0.1}s`
        : el.classList.contains('w-card') ? `${i * 0.08}s`
        : '0s';
      revealObs.observe(el);
    });

    const navObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = NAV_SECTIONS.findIndex((s) => s.id === e.target.id);
          if (idx >= 0) setActiveNav(idx);
        }
      }),
      { threshold: 0.4 },
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) navObs.observe(el);
    });

    return () => { revealObs.disconnect(); navObs.disconnect(); };
  }, [showBirthday]);

  // ─────────────────────────────────────────────────────────
  // Custom cursor + floating hearts
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const cursor = document.getElementById('bw-cursor');
    if (!cursor) return;

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top  = `${e.clientY}px`;
      if (Math.random() < 0.22) spawnHeart(e.clientX, e.clientY);
    };

    const spawnHeart = (x: number, y: number) => {
      const el = document.createElement('div');
      el.className = 'bw-hc';
      el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 70}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1450);
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSurprise = () => {
    bigConfetti();
    setShowSurpriseMsg(true);
    setSurpriseIdx((i) => i + 1);

    // Floating emoji burst
    const ico = ['✨','💖','🌸','🦋','⭐','💫','🌺','🎊'];
    for (let i = 0; i < 18; i++) {
      setTimeout(() => {
        const s = document.createElement('div');
        s.style.cssText = `position:fixed;pointer-events:none;z-index:9;left:${Math.random()*95}vw;top:${Math.random()*80}vh;font-size:${Math.random()*1.5+0.9}rem;animation:bwHFloat 1.8s ease forwards;`;
        s.textContent = ico[Math.floor(Math.random() * ico.length)];
        s.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1900);
      }, i * 65);
    }
  };

  const handlePrev = () => {
    if (sliderTimer.current) clearInterval(sliderTimer.current);
    goSlide(currentSlide - 1);
  };
  const handleNext = () => {
    if (sliderTimer.current) clearInterval(sliderTimer.current);
    goSlide(currentSlide + 1);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Global styles ── */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Canvas layers ── */}
      <canvas id="bw-s-cnv"  ref={starCanvasRef}     />
      <canvas id="bw-p-cnv"  ref={petalCanvasRef}    />
      <canvas id="bw-fw-cnv" ref={fireworkCanvasRef} />
      <canvas id="bw-cf-cnv" ref={confettiCanvasRef} />

      {/* ── Ambient glow ── */}
      <div className="bw-amb" />

      {/* ── Custom cursor ── */}
      <div id="bw-cursor" />

      {/* ── Audio ── */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src="/music/nastelbom-happy-birthday-469282.mp3"
        loop
      />

      {/* ── Audio bar ── */}
      <div className="bw-audio-bar">
        <label>🎵 Happy Birthday {name}</label>
        <div className={`bw-eqb${isPlaying ? '' : ' paused'}`}>
          {[0,1,2,3,4].map((i) => <div key={i} />)}
        </div>
        <button className="bw-pbtn" onClick={toggleAudio} aria-label="Play/pause">
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          COUNTDOWN SCREEN
      ════════════════════════════════════════════════════ */}
      {!showBirthday && (
        <section className="bw-cd-scr">
          <span className="bw-cd-pre">✨ Something magical is coming ✨</span>
          <h1 className="bw-cd-name">{name}</h1>
          <p className="bw-cd-sub">The world is counting down to her most special day…</p>
          <div className="bw-cd-grid">
            {(['d','h','m','s'] as const).map((k, i) => (
              <div className="bw-cd-box" key={k}>
                <span className="bw-cd-num">{countdown[k]}</span>
                <span className="bw-cd-lbl">{['Days','Hours','Minutes','Seconds'][i]}</span>
              </div>
            ))}
          </div>
          {bdDisplay && (
            <div className="bw-cd-badge">{bdDisplay} · Her Magical Birthday 🎂</div>
          )}
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          BIRTHDAY SCREEN
      ════════════════════════════════════════════════════ */}
      {showBirthday && (
        <div id="bw-bd-scr">

          {/* Balloons */}
          <div className="bw-balloons">
            {BALLOON_COLORS.map((col, i) => (
              <Balloon
                key={i} color={col}
                size={28 + (i * 7) % 24}
                dur={6.5 + (i * 1.3) % 5}
                delay={(i * 0.6) % 4}
              />
            ))}
          </div>

          {/* Nav rail */}
          <nav className="bw-nav-rail" aria-label="Page sections">
            {NAV_SECTIONS.map(({ id, label }, i) => (
              <button
                key={id}
                className={`bw-nr${activeNav === i ? ' on' : ''}`}
                title={label}
                aria-label={label}
                onClick={() => scrollToSection(id)}
              />
            ))}
          </nav>

          {/* ─── HERO ─────────────────────────────────────── */}
          <section className="bw-hero" id="s-hero">
            <div className="bw-h-rings">
              <span /><span /><span /><span />
            </div>
            <span className="bw-h-eye">
              🌸 · {bdDisplay || 'Today'} · Happy Birthday · 🌸
            </span>
            <h1 className="bw-h-main">Happy Birthday</h1>
            <span className="bw-h-name">{name} ✨</span>
            <p className="bw-h-quote">
              "Today the entire universe pauses to celebrate you —
              the most extraordinary soul in the world. 🌙"
            </p>
            <a className="bw-h-scroll" href="#s-gallery">
              ↓ Scroll to explore your surprise ↓
            </a>
          </section>

          {/* ─── GALLERY ──────────────────────────────────── */}
          <section id="s-gallery">
            <div className="bw-sw">
              <span className="bw-s-eye">📸 Beautiful Memories</span>
              <h2 className="bw-s-ttl">Your Photo Gallery</h2>

              {/* Slider */}
              <div className="bw-s-wrap bw-gc">
                <div
                  className="bw-s-track"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map(({ src, caption }, i) => (
                    <Slide key={i} src={src} caption={caption} onClick={() => {}} />
                  ))}
                </div>
                <button className="bw-s-btn bw-s-prev" onClick={handlePrev} aria-label="Previous">‹</button>
                <button className="bw-s-btn bw-s-next" onClick={handleNext} aria-label="Next">›</button>
              </div>
              {/* Dots */}
              <div className="bw-s-dots">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={`bw-s-dot${currentSlide === i ? ' on' : ''}`}
                    onClick={() => { if (sliderTimer.current) clearInterval(sliderTimer.current); goSlide(i); }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Timeline */}
              <h2 className="bw-s-ttl" style={{ marginTop: '5rem' }}>💫 Memory Timeline</h2>
              <div className="bw-tl">
                {[
                  {
                    yr: '🌸 A Beautiful Beginning',
                    txt: `The day ${name} came into the world, the universe added its most wonderful star. Their arrival made everything brighter, warmer, and more beautiful. 💖`,
                  },
                  {
                    yr: '✨ Growing Into You',
                    txt: 'Every year you became more radiant, more resilient, more you. Watching you bloom has been one of life\'s greatest joys. 🌺',
                  },
                  {
                    yr: '🎉 Beautiful Memories',
                    txt: 'Every memory with you is a treasure. Your laughter, your warmth, your spirit — these are the things that make life truly worth living. 🎊',
                  },
                  {
                    yr: '🌟 Today & Forever',
                    txt: 'The best chapters of your story are still to be written. May every tomorrow bring you more magic, more love, more of everything wonderful. 🦋',
                  },
                ].map(({ yr, txt }, i) => (
                  <div className="bw-tl-i" key={i}>
                    {timelineImages[i] ? (
                      <div className="bw-tl-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={timelineImages[i]} alt={yr} loading="lazy" />
                      </div>
                    ) : (
                      <div className="bw-tl-img bw-tl-img--empty">
                        <span>{['🌸','✨','🎉','🌟'][i]}</span>
                      </div>
                    )}
                    <div className="bw-tl-body">
                      <div className="bw-tl-yr">{yr}</div>
                      <p className="bw-tl-txt">{txt}</p>
                    </div>
                    <div className="bw-tl-dot" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── WISHES ───────────────────────────────────── */}
          <section id="s-wishes">
            <div className="bw-sw">
              <span className="bw-s-eye">💌 From the Heart</span>
              <h2 className="bw-s-ttl">Birthday Wishes for {name}</h2>
              <div className="bw-w-grid">
                {[
                  { txt: 'तुम्हारा जन्मदिन तुम्हारी ज़िंदगी का सबसे खूबसूरत दिन बने। हर पल खुशियों और मुहब्बत से भरा रहे।', em: '❤️' },
                  { txt: 'भगवान तुम्हें दुनिया की सारी खुशियाँ दे, तुम्हारी हर ख्वाहिश पूरी हो, हर सपना सच बने।', em: '🎂' },
                  { txt: `${name}, तुम जहाँ भी जाओ रोशनी बिखेरती रहो। तुम्हारी मुस्कान में जादू है जो दिलों को छू जाती है।`, em: '✨' },
                  { txt: 'तुझा वाढदिवस खूप खास आणि आनंदाचा जावो। तुझ्या जीवनात नेहमी सुख, समृद्धी आणि प्रेम राहो।', em: '🎉' },
                  { txt: 'तुझ्या आयुष्यात कायम आनंद आणि प्रेम राहो। देव तुला दीर्घायुष्य, यश आणि अपार आनंद देवो।', em: '🌺' },
                  { txt: `${name}, तू खूप विशेष आहेस. तुझ्या हास्याने सगळ्यांचं मन प्रसन्न होतं. वाढदिवसाच्या हार्दिक शुभेच्छा!`, em: '💜' },
                  { txt: `Happy Birthday ${name}, you are truly special. The world is a more beautiful place because you exist in it.`, em: '💖' },
                  { txt: 'May your life overflow with love, joy, and success. You deserve every wonderful thing the universe has to offer.', em: '🎂' },
                  { txt: `On your birthday, I wish you a year so full of magic, laughter, and unforgettable moments that your heart could burst. You are irreplaceable, ${name}.`, em: '🌟' },
                ].map(({ txt, em }, i) => (
                  <div className="bw-w-card" key={i}>
                    <p className="bw-w-txt">{txt}</p>
                    <span className="bw-w-em">{em}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── SPECIAL ──────────────────────────────────── */}
          <section id="s-special">
            <div className="bw-sp-sec">
              <span className="bw-s-eye">💛 Because You Matter</span>
              <h2 className="bw-s-ttl">Why {name} Is Special</h2>

              {/* Typing text */}
              <div className="bw-type-el">
                {typeText}
                <span className={`bw-cb${typeCursor ? '' : ' off'}`}>|</span>
              </div>

              <div className="bw-sp-items">
                {[
                  { ico: '🌹', txt: 'Your smile is the kind that makes everyone around you feel warm and loved — even on their darkest, hardest days.' },
                  { ico: '💫', txt: 'You carry a rare, beautiful combination of strength and grace. You handle everything life throws at you with dignity and elegance.' },
                  { ico: '🌸', txt: 'Your kindness is genuine, your laughter is contagious, and your heart is one of the most beautiful things this world has ever known.' },
                  { ico: '⭐', txt: `You dream big, love deep, and shine bright. There is simply no one in this world quite like you, ${name} — you are one of a kind.` },
                  { ico: '🦋', txt: 'You have the rare and precious gift of making people feel truly seen, truly heard, and deeply cherished. That is your superpower.' },
                  { ico: '🌙', txt: 'Even on cloudy days you bring light. You are the reason someone\'s day gets better without them even knowing why.' },
                ].map(({ ico, txt }, i) => (
                  <div className="bw-sp-item" key={i}>
                    <span className="bw-sp-ico">{ico}</span>
                    <p className="bw-sp-txt">{txt}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── MESSAGE ──────────────────────────────────── */}
          <section className="bw-emo-wrap" id="s-msg">
            <div className="bw-sw" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <span className="bw-s-eye">💌 Only For You</span>
              <h2 className="bw-s-ttl">A Message from the Heart ❤️</h2>
            </div>
            <div className="bw-sw" style={{ paddingTop: 0 }}>
              <div className="bw-emo-card">
                {message ? (
                  /* Render the personalised message from WishData */
                  <p
                    className="bw-emo-p"
                    dangerouslySetInnerHTML={{
                      __html: message
                        .replace(
                          new RegExp(`\\b${name}\\b`, 'g'),
                          `<strong>${name}</strong>`,
                        )
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                ) : (
                  /* Fallback generic message */
                  <p className="bw-emo-p">
                    Dear <strong>{name}</strong>, on this beautiful day I want you to stop for a moment —
                    take a breath — and truly feel how loved you are. You are not just special. You are{' '}
                    <strong>extraordinary</strong>. There is only one you in this entire universe
                    and that is the most beautiful thing imaginable.<br /><br />
                    Your laugh, your voice, your presence — they create a warmth that no one else can replicate.
                    You have touched more hearts than you will ever know.{' '}
                    <strong>Simply by being you</strong>, you have changed the world around you.<br /><br />
                    May this be your most beautiful year yet. May every door open wide for you, and may you always,
                    always know how <strong>deeply and truly loved</strong> you are.<br /><br />
                    Happy Birthday, <strong>{name}</strong>. The world is better — brighter, kinder, more wonderful — because you exist. 🌸💖
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ─── SURPRISE ─────────────────────────────────── */}
          <section className="bw-surp-sec">
            <button className="bw-surp-btn" onClick={handleSurprise}>
              🎁 Click me for a surprise!
            </button>
            {showSurpriseMsg && (
              <div className="bw-surp-msg">
                {SURPRISE_MESSAGES[(surpriseIdx - 1) % SURPRISE_MESSAGES.length]}
              </div>
            )}
          </section>

          {/* ─── FINAL ────────────────────────────────────── */}
          <section className="bw-final-sec" id="s-final">
            <div className="bw-f-rings"><span /><span /></div>
            <h2 className="bw-f-ttl">Happy Birthday<br />{name} ❤️</h2>
            <p className="bw-f-sub">You mean the world 🌍</p>
            <div className="bw-f-hearts">💖 🌸 ✨ 🌸 💖</div>
            <p className="bw-f-quote">
              "May every single day of your life feel as magical as you make everyone else's
              feel — you deserve nothing less than magic." 🎂
            </p>
            <div className="bw-f-icons">🎂 🎉 🎈 🌺 💫 🌙 ⭐ 🌸 💎</div>
          </section>

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles  (scoped under `.bw-*` namespace to avoid collisions)
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
:root {
  --bw-rose:#ff6b9d; --bw-blush:#ffb3cc; --bw-mauve:#c084fc;
  --bw-gold:#fbbf24; --bw-champagne:#ffe4b5; --bw-midnight:#06000f;
  --bw-glass:rgba(255,255,255,.07); --bw-gb:rgba(255,255,255,.14);
  --bw-shadow:rgba(255,107,157,.18);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bw-midnight); color: #fff; font-family: 'Quicksand', sans-serif; overflow-x: hidden; cursor: none; min-height: 100vh; }
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,600&family=Quicksand:wght@300;400;500;600&display=swap');

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bw-midnight); }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--bw-rose), var(--bw-mauve)); border-radius: 4px; }

/* CURSOR */
#bw-cursor { width:18px; height:18px; background:radial-gradient(circle,#ff6b9d,#c084fc); border-radius:50%; position:fixed; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); box-shadow:0 0 24px #ff6b9daa,0 0 48px #c084fc55; transition: left .05s, top .05s; }
.bw-hc { position:fixed; pointer-events:none; z-index:9997; font-size:.95rem; animation:bwHFloat 1.4s ease forwards; transform:translate(-50%,-50%); }
@keyframes bwHFloat { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% - 130px)) scale(.25)} }
@keyframes bwHFloat { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% - 130px)) scale(.25)} }

/* CANVAS LAYERS */
#bw-s-cnv, #bw-p-cnv, #bw-cf-cnv, #bw-fw-cnv { position:fixed; inset:0; pointer-events:none; }
#bw-s-cnv  { z-index:0; }
#bw-p-cnv  { z-index:1; }
#bw-fw-cnv { z-index:2; }
#bw-cf-cnv { z-index:3; }

/* AMBIENT */
.bw-amb { position:fixed; inset:0; z-index:0;
  background: radial-gradient(ellipse 90% 70% at 15%  5%,#2d0050cc 0%,transparent 55%),
              radial-gradient(ellipse 70% 55% at 85% 95%,#5c0a2ecc 0%,transparent 55%),
              radial-gradient(ellipse 60% 50% at 50% 50%,#1a003388 0%,var(--bw-midnight) 100%);
  animation: bwAmbP 10s ease-in-out infinite alternate; }
@keyframes bwAmbP { from{opacity:.8} to{opacity:1} }

/* AUDIO BAR */
.bw-audio-bar { position:fixed; bottom:1.2rem; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:.8rem;
  background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.15);
  backdrop-filter:blur(24px); border-radius:60px; padding:.5rem 1.2rem;
  z-index:1000; box-shadow:0 4px 30px rgba(255,107,157,.25); }
.bw-audio-bar label { font-family:'Dancing Script',cursive; font-size:.9rem; color:var(--bw-champagne); white-space:nowrap; }
.bw-pbtn { width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
  background:linear-gradient(135deg,var(--bw-rose),var(--bw-mauve)); font-size:.95rem;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 18px rgba(255,107,157,.5); transition:transform .25s; flex-shrink:0; color:#fff; }
.bw-pbtn:hover { transform:scale(1.15); }
.bw-eqb { display:flex; gap:3px; align-items:flex-end; height:18px; }
.bw-eqb div { width:3px; background:linear-gradient(180deg,var(--bw-gold),var(--bw-rose)); border-radius:2px; animation:bwEqA .6s ease-in-out infinite alternate; }
.bw-eqb div:nth-child(1){height:6px;animation-delay:0s}
.bw-eqb div:nth-child(2){height:14px;animation-delay:.1s}
.bw-eqb div:nth-child(3){height:10px;animation-delay:.2s}
.bw-eqb div:nth-child(4){height:16px;animation-delay:.05s}
.bw-eqb div:nth-child(5){height:8px;animation-delay:.15s}
.bw-eqb.paused div { animation-play-state:paused; }
@keyframes bwEqA { from{transform:scaleY(.35)} to{transform:scaleY(1)} }

/* COUNTDOWN */
.bw-cd-scr { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; position:relative; z-index:10; }
.bw-cd-pre { font-family:'Dancing Script',cursive; font-size:clamp(1.1rem,3vw,1.7rem); color:var(--bw-champagne); letter-spacing:.35em; margin-bottom:1.2rem; animation:bwFadeD 1.2s ease forwards; opacity:0; }
.bw-cd-name { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(3.5rem,13vw,9.5rem); line-height:1;
  background:linear-gradient(135deg,#ffb3cc 0%,#fbbf24 38%,#c084fc 68%,#ff6b9d 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation:bwNameG 3s ease-in-out infinite alternate,bwFadeD 1.2s .3s ease forwards; opacity:0;
  filter:drop-shadow(0 0 35px #ff6b9d66); }
@keyframes bwNameG { from{filter:drop-shadow(0 0 20px #ff6b9d44)} to{filter:drop-shadow(0 0 50px #ff6b9dbb)} }
.bw-cd-sub { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(.9rem,2.5vw,1.4rem); color:var(--bw-blush); margin:1.5rem 0 2.5rem; animation:bwFadeD 1.2s .6s ease forwards; opacity:0; }
.bw-cd-grid { display:flex; gap:clamp(.7rem,3vw,2rem); justify-content:center; flex-wrap:wrap; animation:bwFadeU 1.2s .9s ease forwards; opacity:0; }
.bw-cd-box { background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(22px); border-radius:1.5rem;
  padding:clamp(.9rem,3vw,2rem) clamp(1rem,4vw,2.5rem); min-width:clamp(68px,18vw,108px);
  box-shadow:0 8px 32px var(--bw-shadow),inset 0 1px 0 rgba(255,255,255,.1); position:relative; overflow:hidden; }
.bw-cd-box::after { content:''; position:absolute; inset:-2px; background:conic-gradient(transparent 270deg,rgba(255,107,157,.35) 360deg); animation:bwSpin 4s linear infinite; z-index:-1; border-radius:inherit; }
.bw-cd-num { font-family:'Playfair Display',serif; font-weight:700; font-size:clamp(2.4rem,7vw,5rem); line-height:1;
  background:linear-gradient(180deg,#fff,var(--bw-gold)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; display:block; }
.bw-cd-lbl { font-size:clamp(.5rem,1.4vw,.72rem); letter-spacing:.28em; text-transform:uppercase; color:var(--bw-blush); margin-top:.3rem; }
.bw-cd-badge { margin-top:2.5rem; padding:.7rem 2rem; border:1px solid var(--bw-gb); border-radius:50px; background:var(--bw-glass); backdrop-filter:blur(10px); font-family:'Dancing Script',cursive; font-size:1.1rem; color:var(--bw-champagne); animation:bwFadeU 1.2s 1.2s ease forwards; opacity:0; }

/* BALLOONS */
.bw-balloons { position:fixed; bottom:-40px; left:0; width:100%; pointer-events:none; z-index:4; display:flex; justify-content:space-around; }
@keyframes ballU { 0%{transform:translateY(0) rotate(-6deg);opacity:1} 45%{transform:translateY(-45vh) rotate(6deg)} 100%{transform:translateY(-115vh) rotate(-4deg);opacity:0} }

/* NAV RAIL */
.bw-nav-rail { position:fixed; right:1rem; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:.6rem; z-index:600; }
.bw-nr { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.2); cursor:pointer; transition:all .3s; border:1px solid rgba(255,255,255,.2); }
.bw-nr.on { background:var(--bw-rose); box-shadow:0 0 12px var(--bw-rose); transform:scale(1.5); }
@media(max-width:640px){ .bw-nav-rail{display:none} }

/* HERO */
.bw-hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:4rem 1.5rem; position:relative; overflow:hidden; z-index:10; }
.bw-h-rings span { position:absolute; top:50%; left:50%; border-radius:50%; transform:translate(-50%,-50%); animation:bwRingP 5s ease-in-out infinite; }
.bw-h-rings span:nth-child(1){width:min(380px,80vw);height:min(380px,80vw);border:1px solid rgba(255,107,157,.15)}
.bw-h-rings span:nth-child(2){width:min(600px,90vw);height:min(600px,90vw);border:1px solid rgba(192,132,252,.12);animation-delay:1.2s}
.bw-h-rings span:nth-child(3){width:min(850px,96vw);height:min(850px,96vw);border:1px solid rgba(251,191,36,.08);animation-delay:2.4s}
.bw-h-rings span:nth-child(4){width:min(1100px,99vw);height:min(1100px,99vw);border:1px solid rgba(255,107,157,.05);animation-delay:3.6s}
@keyframes bwRingP { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)} }
.bw-h-eye { font-family:'Dancing Script',cursive; font-size:clamp(1.1rem,3vw,1.7rem); color:var(--bw-gold); letter-spacing:.2em; animation:bwFadeD 1s ease forwards; opacity:0; text-shadow:0 0 30px var(--bw-gold); }
.bw-h-main { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(3.5rem,14vw,10rem); line-height:.95;
  background:linear-gradient(135deg,#ff6b9d 0%,#fbbf24 33%,#c084fc 65%,#ff6b9d 100%); background-size:200% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation:bwShimmer 5s linear infinite,bwFadeS 1.2s .2s ease forwards; opacity:0; filter:drop-shadow(0 0 50px #ff6b9d44); }
.bw-h-name { font-family:'Playfair Display',serif; font-weight:700; font-size:clamp(3rem,11vw,8rem); line-height:1;
  background:linear-gradient(135deg,#fbbf24 0%,#fff 45%,#fbbf24 100%); background-size:200% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation:bwShimmer 4s linear infinite,bwFadeS 1.2s .5s ease forwards; opacity:0;
  filter:drop-shadow(0 0 70px #fbbf2499); display:block; margin:-.3rem 0 1.5rem; }
.bw-h-quote { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:300; font-size:clamp(1rem,3vw,1.6rem); color:var(--bw-champagne); animation:bwFadeU 1s .8s ease forwards; opacity:0; max-width:600px; line-height:1.7; }
.bw-h-scroll { margin-top:2rem; color:var(--bw-blush); font-family:'Dancing Script',cursive; font-size:1.2rem; text-decoration:none; animation:bwFadeU 1s 1.2s ease forwards; opacity:0; display:inline-block; }
.bw-h-scroll:hover { color:var(--bw-rose); }

/* KEYFRAMES */
@keyframes bwShimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
@keyframes bwFadeD   { from{opacity:0;transform:translateY(-28px)} to{opacity:1;transform:translateY(0)} }
@keyframes bwFadeU   { from{opacity:0;transform:translateY(28px)}  to{opacity:1;transform:translateY(0)} }
@keyframes bwFadeS   { from{opacity:0;transform:scale(.82)}        to{opacity:1;transform:scale(1)} }
@keyframes bwSpin    { to{transform:rotate(360deg)} }

/* SHARED SECTION */
section { position:relative; z-index:10; }
.bw-sw { max-width:1120px; margin:0 auto; padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem); }
.bw-s-eye { font-family:'Dancing Script',cursive; font-size:clamp(.95rem,2.5vw,1.35rem); color:var(--bw-gold); letter-spacing:.15em; display:block; margin-bottom:.5rem; text-align:center; }
.bw-s-ttl { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(1.8rem,5vw,3.5rem); text-align:center;
  background:linear-gradient(135deg,#fff,var(--bw-blush)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:clamp(2rem,5vw,4rem); }
.bw-gc { background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); border-radius:2rem; box-shadow:0 8px 40px var(--bw-shadow),inset 0 1px 0 rgba(255,255,255,.06); }

/* SLIDER */
.bw-s-wrap { position:relative; overflow:hidden; border-radius:2rem; }
.bw-s-track { display:flex; transition:transform .75s cubic-bezier(.4,0,.2,1); }
.slide { min-width:100%; position:relative; aspect-ratio:16/9; border-radius:2rem; overflow:hidden; cursor:zoom-in; flex-shrink:0; }
.slide img { width:100%; height:100%; object-fit:cover; transition:transform .7s ease; display:block; }
.slide:hover img { transform:scale(1.06); }
.slide-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(255,107,157,.15),rgba(192,132,252,.12)); font-size:3rem; }
.slide-cap { position:absolute; bottom:0; left:0; right:0; padding:1.5rem 2rem; background:linear-gradient(transparent,rgba(10,0,30,.8)); font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(.9rem,2.5vw,1.4rem); color:#fff; }
.bw-s-btn { position:absolute; top:50%; transform:translateY(-50%); width:clamp(36px,6vw,52px); height:clamp(36px,6vw,52px); background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); backdrop-filter:blur(12px); border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:clamp(.9rem,2vw,1.4rem); transition:all .3s; z-index:5; color:#fff; }
.bw-s-btn:hover { background:rgba(255,107,157,.35); transform:translateY(-50%) scale(1.12); }
.bw-s-prev { left:clamp(.5rem,2vw,1.3rem); }
.bw-s-next { right:clamp(.5rem,2vw,1.3rem); }
.bw-s-dots { display:flex; gap:.5rem; justify-content:center; margin-top:1.5rem; flex-wrap:wrap; }
.bw-s-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.25); cursor:pointer; transition:all .3s; border:none; }
.bw-s-dot.on { background:var(--bw-rose); transform:scale(1.5); }

/* TIMELINE */
.bw-tl { position:relative; padding:1rem 0; }
.bw-tl::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:2px; background:linear-gradient(180deg,transparent,var(--bw-rose) 20%,var(--bw-mauve) 50%,var(--bw-gold) 80%,transparent); transform:translateX(-50%); }
@media(max-width:640px){ .bw-tl::before{left:1.4rem} }
.bw-tl-i { display:flex; gap:2rem; margin-bottom:3.5rem; align-items:center; opacity:0; transform:translateY(35px); transition:all .65s ease; position:relative; }
.bw-tl-i.vis { opacity:1; transform:translateY(0); }
.bw-tl-i:nth-child(even) { flex-direction:row-reverse; }
.bw-tl-img { width:clamp(130px,28vw,220px); aspect-ratio:4/3; border-radius:1.3rem; overflow:hidden; flex-shrink:0; cursor:zoom-in; box-shadow:0 12px 45px rgba(255,107,157,.3); border:2px solid rgba(255,107,157,.25); }
.bw-tl-img img { width:100%; height:100%; object-fit:cover; transition:transform .55s; }
.bw-tl-img:hover img { transform:scale(1.1); }
.bw-tl-img--empty { display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(255,107,157,.12),rgba(192,132,252,.1)); font-size:3rem; }
.bw-tl-body { flex:1; background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(18px); border-radius:1.5rem; padding:1.5rem; }
.bw-tl-yr { font-family:'Dancing Script',cursive; font-size:1.7rem; color:var(--bw-gold); margin-bottom:.4rem; }
.bw-tl-txt { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1rem,2.4vw,1.2rem); color:var(--bw-champagne); line-height:1.7; }
.bw-tl-dot { position:absolute; left:50%; width:14px; height:14px; border-radius:50%; background:var(--bw-rose); border:3px solid var(--bw-midnight); transform:translateX(-50%); box-shadow:0 0 18px var(--bw-rose); }
@media(max-width:640px){ .bw-tl-i,.bw-tl-i:nth-child(even){flex-direction:column;padding-left:3.5rem} .bw-tl-dot{left:1.4rem} .bw-tl-img{width:100%} }

/* WISHES */
.bw-w-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(270px,100%),1fr)); gap:1.4rem; }
.bw-w-card { background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(22px); border-radius:1.6rem; padding:1.8rem; position:relative; overflow:hidden; opacity:0; transform:translateY(32px); transition:opacity .6s ease,transform .6s ease,box-shadow .3s; }
.bw-w-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,107,157,.06),transparent 60%); }
.bw-w-card::after { content:''; position:absolute; top:-60%; left:-60%; width:220%; height:220%; background:conic-gradient(transparent,rgba(255,107,157,.07),transparent 30%); animation:bwSpin 8s linear infinite; pointer-events:none; }
.bw-w-card.vis { opacity:1; transform:translateY(0); }
.bw-w-card:hover { transform:translateY(-7px) !important; box-shadow:0 22px 60px rgba(255,107,157,.22); }
.bw-w-txt { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1.05rem,2.4vw,1.25rem); line-height:1.75; color:#f5d0fe; position:relative; z-index:1; }
.bw-w-em { font-size:1.9rem; display:block; margin-top:.9rem; position:relative; z-index:1; }

/* SPECIAL */
.bw-sp-sec { text-align:center; padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem); max-width:920px; margin:0 auto; }
.bw-sp-items { display:flex; flex-direction:column; gap:1.4rem; margin-top:2.5rem; }
.bw-sp-item { background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(22px); border-radius:1.6rem; padding:1.5rem 2rem; display:flex; align-items:center; gap:1.5rem; text-align:left; opacity:0; transform:translateX(-35px); transition:opacity .65s ease,transform .65s ease; }
.bw-sp-item.vis { opacity:1; transform:translateX(0); }
.bw-sp-item:nth-child(even) { transform:translateX(35px); flex-direction:row-reverse; text-align:right; }
.bw-sp-item:nth-child(even).vis { transform:translateX(0); }
.bw-sp-ico { font-size:clamp(2rem,5vw,3rem); flex-shrink:0; }
.bw-sp-txt { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1rem,2.4vw,1.3rem); color:var(--bw-champagne); line-height:1.65; }

/* TYPING */
.bw-type-el { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1.05rem,3vw,1.6rem); color:var(--bw-blush); line-height:1.8; min-height:3em; background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(18px); border-radius:1.5rem; padding:1.5rem 2rem; margin-bottom:2rem; }
.bw-cb { animation:bwBlink .85s step-end infinite; }
.bw-cb.off { opacity:0; animation:none; }
@keyframes bwBlink { 0%,100%{opacity:1} 50%{opacity:0} }

/* EMOTIONAL */
.bw-emo-wrap { padding:clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem); }
.bw-emo-card { max-width:820px; margin:0 auto; text-align:center; background:linear-gradient(135deg,rgba(255,107,157,.08),rgba(192,132,252,.08)); border:1px solid rgba(255,107,157,.28); backdrop-filter:blur(32px); border-radius:3rem; padding:clamp(2rem,6vw,4.5rem); position:relative; overflow:hidden; }
.bw-emo-card::before { content:'❝'; position:absolute; top:-1rem; left:1.5rem; font-size:7rem; color:rgba(255,107,157,.09); font-family:'Playfair Display',serif; line-height:1; pointer-events:none; }
.bw-emo-p { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1.05rem,2.5vw,1.35rem); line-height:2; color:var(--bw-champagne); }
.bw-emo-p strong { -webkit-text-fill-color:transparent; background:linear-gradient(90deg,var(--bw-rose),var(--bw-gold)); -webkit-background-clip:text; background-clip:text; font-style:normal; }

/* SURPRISE */
.bw-surp-sec { text-align:center; padding:clamp(2rem,6vw,4rem) 1rem; }
.bw-surp-btn { font-family:'Dancing Script',cursive; font-size:clamp(1.2rem,3vw,1.65rem); padding:1rem 3.2rem; border:none; border-radius:60px; background:linear-gradient(135deg,#ff6b9d,#c084fc,#fbbf24,#ff6b9d); background-size:300% auto; color:#fff; cursor:pointer; animation:bwShimmer 4s linear infinite; box-shadow:0 0 45px rgba(255,107,157,.45); transition:transform .3s,box-shadow .3s; }
.bw-surp-btn:hover { transform:scale(1.09) rotate(-2deg); box-shadow:0 0 70px rgba(255,107,157,.7); }
.bw-surp-msg { margin:2rem auto 0; max-width:600px; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1.05rem,2.8vw,1.5rem); color:var(--bw-champagne); background:var(--bw-glass); border:1px solid var(--bw-gb); backdrop-filter:blur(22px); border-radius:2rem; padding:2rem; animation:bwFadeS .7s ease; }

/* FINAL */
.bw-final-sec { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:3rem 1.5rem; position:relative; background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(255,107,157,.12),transparent); z-index:10; }
.bw-f-rings span { position:absolute; top:50%; left:50%; border-radius:50%; transform:translate(-50%,-50%); animation:bwRingP 5s ease-in-out infinite; }
.bw-f-rings span:nth-child(1){width:min(350px,80vw);height:min(350px,80vw);border:1px solid rgba(255,107,157,.1)}
.bw-f-rings span:nth-child(2){width:min(580px,90vw);height:min(580px,90vw);border:1px solid rgba(251,191,36,.07);animation-delay:1s}
.bw-f-ttl { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(2.5rem,9vw,6.5rem); line-height:1.1; background:linear-gradient(135deg,#fff,#fbbf24 45%,#fff); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:bwShimmer 5s linear infinite; filter:drop-shadow(0 0 45px #fbbf2488); }
.bw-f-sub { font-family:'Dancing Script',cursive; font-size:clamp(1.5rem,4.5vw,2.8rem); color:var(--bw-rose); margin:1rem 0 2rem; filter:drop-shadow(0 0 22px var(--bw-rose)); }
.bw-f-hearts { font-size:clamp(2rem,5vw,3.5rem); animation:bwHb 1.6s ease-in-out infinite; }
@keyframes bwHb { 0%,100%{transform:scale(1)} 50%{transform:scale(1.22)} }
.bw-f-quote { margin-top:2rem; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(1rem,2.4vw,1.3rem); color:var(--bw-champagne); max-width:520px; line-height:1.85; }
.bw-f-icons { margin-top:3rem; font-size:clamp(2rem,5vw,3rem); animation:bwHb 2s infinite; }
`;