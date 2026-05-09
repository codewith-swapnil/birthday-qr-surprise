'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import type { WishData } from '@/types/wish';
import { formatBirthdayDisplay } from '@/lib/utils';

import styles from './BirthdayWish.module.css';
import PhotoGrid from './PhotoGrid';

import { useIsMobile }      from './hooks/useIsMobile';
import { useCountdown }     from './hooks/useCountdown';
import { useTypingEffect }  from './hooks/useTypingEffect';

import {
  BALLOON_COLS,
  CF_COLS,
  FW_COLS,
  PETAL_EMOJIS,
  HEARTS,
  SURPRISE_MSGS,
  WISH_CARDS,
  WHY_SPECIAL_ITEMS,
  NAV_IDS,
  SURPRISE_ICONS,
  injectName,
} from './constants';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface BirthdayWishProps {
  rawData: WishData | null;
  slug: string;
}

interface CFParticle {
  x: number; y: number; vx: number; vy: number;
  c: string; w: number; h: number;
  rot: number; rv: number; life: number; decay: number;
  shape: 'c' | 'r';
}

interface FWParticle {
  x: number; y: number; vx: number; vy: number;
  c: string; r: number; life: number; decay: number;
}

interface StarParticle {
  x: number; y: number; r: number; o: number;
  speed: number; tw: number; ts: number;
}

interface PetalParticle {
  x: number; y: number; sz: number; speed: number;
  drift: number; rot: number; rv: number; op: number; e: string;
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
export default function BirthdayWish({ rawData }: BirthdayWishProps) {
  const name    = rawData?.name    ?? 'You';
  const day     = rawData?.day     ?? 0;
  const month   = rawData?.month   ?? '';
  const message = rawData?.message ?? '';
  const images  = useMemo(() => (rawData?.images ?? []).slice(0, 8), [rawData]);

  const bdDisplay = day && month ? formatBirthdayDisplay(day, month) : '';

  // ── Custom hooks ──────────────────────────────────────────────
  const isMobile = useIsMobile(640);

  const { showBirthday, cd } = useCountdown(day, month);

  const phrases = useMemo(() => [
    `${name}, you are the definition of grace, strength, and beauty… ✨`,
    `You make everyone's life brighter simply by being in it… 🌸`,
    `Your kindness is a superpower that touches every heart… 💖`,
    `The world is genuinely better because of you… 🌙`,
    `You are the poem the universe wrote to perfection… 🌺`,
    `Every day with you is a gift nobody deserves but everyone treasures… 💫`,
  ], [name]);

  const { text: typeText, showCursor: typeCursor } = useTypingEffect(phrases, showBirthday);

  // ── UI state ──────────────────────────────────────────────────
  const [isPlaying, setIsPlaying]       = useState(false);
  const [surpriseIdx, setSurpriseIdx]   = useState(0);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeNav, setActiveNav]       = useState(0);

  // ── Canvas refs ───────────────────────────────────────────────
  const starCnv  = useRef<HTMLCanvasElement>(null);
  const petalCnv = useRef<HTMLCanvasElement>(null);
  const fwCnv    = useRef<HTMLCanvasElement>(null);
  const cfCnv    = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Particle arrays
  const cfPRef   = useRef<CFParticle[]>([]);
  const fwPRef   = useRef<FWParticle[]>([]);
  const starRef  = useRef<StarParticle[]>([]);
  const petalRef = useRef<PetalParticle[]>([]);

  // One RAF id per loop (not an ever-growing array)
  const starRaf  = useRef(0);
  const petalRaf = useRef(0);
  const cfRaf    = useRef(0);
  const fwRaf    = useRef(0);

  // Particle counts derived from isMobile (updated reactively via the hook)
  const STAR_CNT  = isMobile ? 100 : 220;
  const PETAL_CNT = isMobile ? 25  : 55;

  // ── Canvas particle builders ──────────────────────────────────
  const buildStars = useCallback((w: number, h: number) => {
    starRef.current = Array.from({ length: STAR_CNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.35 + 0.05,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * 0.03 + 0.01,
    }));
  }, [STAR_CNT]);

  const buildPetals = useCallback((w: number) => {
    petalRef.current = Array.from({ length: PETAL_CNT }, () => ({
      x: Math.random() * w, y: Math.random() * 900 - 200,
      sz: Math.random() * 16 + 8,
      speed: Math.random() * 0.7 + 0.25,
      drift: (Math.random() - 0.5) * 0.7,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 1.5,
      op: Math.random() * 0.4 + 0.1,
      e: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
    }));
  }, [PETAL_CNT]);

  // ── Canvas animation loops ────────────────────────────────────
  useEffect(() => {
    const sc = starCnv.current,  pc = petalCnv.current;
    const fc = fwCnv.current,    cc = cfCnv.current;
    if (!sc || !pc || !fc || !cc) return;

    const sx = sc.getContext('2d')!;
    const px = pc.getContext('2d')!;
    const fx = fc.getContext('2d')!;
    const cx = cc.getContext('2d')!;

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      sc.width = pc.width = fc.width = cc.width = w;
      sc.height = pc.height = fc.height = cc.height = h;
      buildStars(w, h);
      buildPetals(w);
    };
    resize();
    window.addEventListener('resize', resize);

    // Pause all loops when the tab is hidden — saves CPU/battery
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(starRaf.current);
        cancelAnimationFrame(petalRaf.current);
        cancelAnimationFrame(cfRaf.current);
        cancelAnimationFrame(fwRaf.current);
      } else {
        animStar();
        animPetal();
        animCf();
        animFw();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animStar = () => {
      const { width: w, height: h } = sc;
      sx.clearRect(0, 0, w, h);
      starRef.current.forEach((s) => {
        s.tw += s.ts;
        sx.globalAlpha = s.o * (0.5 + 0.5 * Math.sin(s.tw));
        sx.fillStyle = '#fff';
        sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, Math.PI * 2); sx.fill();
        s.y -= s.speed;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
      });
      sx.globalAlpha = 1;
      starRaf.current = requestAnimationFrame(animStar);
    };

    const animPetal = () => {
      const { width: w, height: h } = pc;
      px.clearRect(0, 0, w, h);
      petalRef.current.forEach((p) => {
        p.y += p.speed; p.x += p.drift; p.rot += p.rv;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 10;
        if (p.x > w + 30) p.x = -10;
        px.save();
        px.globalAlpha = p.op;
        px.translate(p.x, p.y);
        px.rotate(p.rot * Math.PI / 180);
        px.font = `${p.sz}px serif`;
        px.fillText(p.e, -p.sz / 2, -p.sz / 2);
        px.restore();
      });
      petalRaf.current = requestAnimationFrame(animPetal);
    };

    const animCf = () => {
      const { width: cw, height: ch } = cc;
      cx.clearRect(0, 0, cw, ch);
      cfPRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.vx *= 0.99;
        p.rot += p.rv; p.life -= p.decay;
        cx.save();
        cx.globalAlpha = Math.max(0, p.life);
        cx.fillStyle = p.c;
        cx.translate(p.x, p.y);
        cx.rotate(p.rot * Math.PI / 180);
        if (p.shape === 'c') {
          cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, Math.PI * 2); cx.fill();
        } else {
          cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        cx.restore();
      });
      cfPRef.current = cfPRef.current.filter((p) => p.life > 0);
      cfRaf.current = requestAnimationFrame(animCf);
    };

    const animFw = () => {
      const { width: fw, height: fh } = fc;
      fx.clearRect(0, 0, fw, fh);
      fwPRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= p.decay;
        fx.globalAlpha = Math.max(0, p.life);
        fx.fillStyle = p.c;
        fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fx.fill();
      });
      fwPRef.current = fwPRef.current.filter((p) => p.life > 0);
      fx.globalAlpha = 1;
      fwRaf.current = requestAnimationFrame(animFw);
    };

    animStar(); animPetal(); animCf(); animFw();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(starRaf.current);
      cancelAnimationFrame(petalRaf.current);
      cancelAnimationFrame(cfRaf.current);
      cancelAnimationFrame(fwRaf.current);
    };
  }, [buildStars, buildPetals]);

  // ── Confetti helpers ─────────────────────────────────────────
  const spawnConfetti = useCallback((n: number, ox?: number, oy?: number) => {
    const cw = cfCnv.current?.width ?? innerWidth;
    const ch = cfCnv.current?.height ?? innerHeight;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 13 + 4;
      cfPRef.current.push({
        x: ox ?? Math.random() * cw,
        y: oy ?? ch * 0.3,
        vx: Math.cos(a) * sp * (Math.random() * 0.6 + 0.7),
        vy: Math.sin(a) * sp * (Math.random() * 0.6 + 0.7) - Math.random() * 9,
        c: CF_COLS[Math.floor(Math.random() * CF_COLS.length)],
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
    const cw = cfCnv.current?.width ?? innerWidth;
    const ch = cfCnv.current?.height ?? innerHeight;
    spawnConfetti(isMobile ? 120 : 260, cw * 0.5, ch * 0.25);
    setTimeout(() => spawnConfetti(80, cw * 0.05, ch * 0.45), 300);
    setTimeout(() => spawnConfetti(80, cw * 0.95, ch * 0.45), 500);
    setTimeout(() => spawnConfetti(60, cw * 0.25, ch * 0.18), 700);
    setTimeout(() => spawnConfetti(60, cw * 0.75, ch * 0.18), 900);
  }, [spawnConfetti, isMobile]);

  const launchFireworks = useCallback(() => {
    const fc2 = fwCnv.current; if (!fc2) return;
    const { width: fw, height: fh } = fc2;
    const burst = (x: number, y: number, col: string) => {
      for (let i = 0; i < (isMobile ? 40 : 75); i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 7 + 3;
        fwPRef.current.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          c: col, r: Math.random() * 2.5 + 0.8,
          life: 1, decay: Math.random() * 0.018 + 0.01,
        });
      }
    };
    const shots = isMobile ? 6 : 12;
    for (let i = 0; i < shots; i++) {
      setTimeout(() =>
        burst(
          fw * 0.1 + Math.random() * fw * 0.8,
          fh * 0.04 + Math.random() * fh * 0.44,
          FW_COLS[Math.floor(Math.random() * FW_COLS.length)],
        ),
        i * 350,
      );
    }
  }, [isMobile]);

  // ── Birthday boot ─────────────────────────────────────────────
  useEffect(() => {
    if (!showBirthday) return;

    setTimeout(bigConfetti, 400);
    setTimeout(launchFireworks, 600);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    const periodicCf = setInterval(() => spawnConfetti(30), 8_000);

    // Scroll-reveal for .reveal elements
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add(styles.visible);
            revealObs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(`.${styles.reveal}`).forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 0.07}s`;
      revealObs.observe(el);
    });

    // Active nav highlight
    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const idx = (NAV_IDS as readonly string[]).indexOf(en.target.id);
            if (idx >= 0) setActiveNav(idx);
          }
        });
      },
      { threshold: 0.35 },
    );

    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) navObs.observe(el);
    });

    return () => {
      clearInterval(periodicCf);
      revealObs.disconnect();
      navObs.disconnect();
    };
  }, [showBirthday, bigConfetti, launchFireworks, spawnConfetti]);

  // ── Custom cursor (desktop) ───────────────────────────────────
  useEffect(() => {
    const cur = document.getElementById('bw-cursor');
    if (!cur) return;

    const spawnHeart = (x: number, y: number) => {
      const el = document.createElement('div');
      el.className = styles.heartCrumb;
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 70}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1_450);
    };

    const move = (e: MouseEvent) => {
      cur.style.left = `${e.clientX}px`;
      cur.style.top  = `${e.clientY}px`;
      if (Math.random() < 0.18) spawnHeart(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────
  const toggleAudio = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) a.play().then(() => setIsPlaying(true)).catch(() => {});
    else { a.pause(); setIsPlaying(false); }
  };

  const handleSurprise = () => {
    bigConfetti();
    setShowSurprise(true);
    setSurpriseIdx((i) => i + 1);

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = [
          'position:fixed', 'pointer-events:none', 'z-index:9',
          `left:${Math.random() * 95}vw`, `top:${Math.random() * 80}vh`,
          `font-size:${Math.random() * 1.5 + 1}rem`,
          'animation:heartFloat 1.8s ease forwards',
        ].join(';');
        el.textContent = SURPRISE_ICONS[Math.floor(Math.random() * SURPRISE_ICONS.length)];
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1_900);
      }, i * 70);
    }
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Canvas layers */}
      <canvas className={styles.canvasStar}     ref={starCnv}  />
      <canvas className={styles.canvasPetal}    ref={petalCnv} />
      <canvas className={styles.canvasFirework} ref={fwCnv}    />
      <canvas className={styles.canvasConfetti} ref={cfCnv}    />

      <div className={styles.ambient} />
      <div className={styles.cursor} id="bw-cursor" />

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/music/nastelbom-happy-birthday-469282.mp3" loop />

      {/* Audio bar */}
      <div className={styles.audioBar}>
        <span className={styles.audioBarLabel}>🎵 Happy Birthday {name}</span>
        <div className={`${styles.equaliser}${isPlaying ? '' : ` ${styles.paused}`}`}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} />)}
        </div>
        <button className={styles.playBtn} onClick={toggleAudio} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* ══ COUNTDOWN ══════════════════════════════════════════ */}
      {!showBirthday && (
        <section className={styles.countdown}>
          <span className={styles.cdPre}>✨ Something magical is coming ✨</span>
          <h1 className={styles.cdName}>{name}</h1>
          <p className={styles.cdSub}>The world is counting down to the most special day…</p>
          <div className={styles.cdGrid}>
            {(['d', 'h', 'm', 's'] as const).map((k, i) => (
              <div className={styles.cdBox} key={k}>
                <span className={styles.cdNum}>{cd[k]}</span>
                <span className={styles.cdLabel}>{['Days', 'Hours', 'Mins', 'Secs'][i]}</span>
              </div>
            ))}
          </div>
          {bdDisplay && (
            <div className={styles.cdBadge}>🎂 {bdDisplay} · Her Magical Birthday</div>
          )}
        </section>
      )}

      {/* ══ BIRTHDAY SCREEN ════════════════════════════════════ */}
      {showBirthday && (
        <div className={styles.birthdayScreen}>

          {/* Balloons */}
          <div className={styles.balloons}>
            {BALLOON_COLS.slice(0, isMobile ? 4 : 8).map((col, i) => (
              <svg
                key={i}
                viewBox="0 0 100 150"
                width={isMobile ? 22 : 30}
                className={styles.balloonItem}
                style={{ animationDuration: `${6.5 + (i * 1.3) % 5}s`, animationDelay: `${(i * 0.7) % 4}s` }}
              >
                <ellipse cx="50" cy="55" rx="38" ry="46" fill={col} opacity=".88" />
                <ellipse cx="40" cy="42" rx="9"  ry="11" fill="rgba(255,255,255,.28)" />
                <path d="M47 101 Q50 108 53 101" stroke={col} strokeWidth="3" fill="none" />
                <line x1="50" y1="104" x2="50" y2="150" stroke={col} strokeWidth="1.5" opacity=".6" />
              </svg>
            ))}
          </div>

          {/* Nav rail (desktop) */}
          <nav className={styles.navRail} aria-label="Sections">
            {NAV_IDS.map((id, i) => (
              <button
                key={id}
                className={`${styles.navDot}${activeNav === i ? ` ${styles.active}` : ''}`}
                onClick={() => scrollTo(id)}
                aria-label={id.replace('s-', '')}
              />
            ))}
          </nav>

          {/* ─── HERO ────────────────────────────────────── */}
          <section className={styles.hero} id="s-hero">
            <div className={styles.heroRings}><span /><span /><span /><span /></div>
            <span className={styles.eyebrow}>🌸 · {bdDisplay || 'Today'} · Happy Birthday · 🌸</span>
            <h1 className={styles.heroHeading}>Happy Birthday</h1>
            <span className={styles.heroName}>{name} ✨</span>
            <p className={styles.heroQuote}>
              "Today the entire universe pauses to celebrate you —<br />
              the most extraordinary soul in the world. 🌙"
            </p>
            <button
              className={styles.scrollBtn}
              onClick={() => scrollTo(images.length ? 's-photos' : 's-wishes')}
            >
              ↓ Scroll to explore your surprise ↓
            </button>
          </section>

          {/* ─── PHOTOS ──────────────────────────────────── */}
          {images.length > 0 && (
            <section className={styles.section} id="s-photos">
              <div className={styles.sectionInner}>
                <span className={styles.sectionEye}>📸 Beautiful Memories</span>
                <h2 className={styles.sectionTitle}>Your Photo Gallery</h2>
                <PhotoGrid images={images} />
              </div>
            </section>
          )}

          {/* ─── WISHES ──────────────────────────────────── */}
          <section className={styles.section} id="s-wishes">
            <div className={styles.sectionInner}>
              <span className={styles.sectionEye}>💌 From the Heart</span>
              <h2 className={styles.sectionTitle}>Birthday Wishes for {name}</h2>
              <div className={styles.wishGrid}>
                {WISH_CARDS.map(({ txt, em }, i) => (
                  <div className={`${styles.wishCard} ${styles.reveal}`} key={i}>
                    <p className={styles.wishText}>{injectName(txt, name)}</p>
                    <span className={styles.wishEmoji}>{em}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── WHY SPECIAL ─────────────────────────────── */}
          <section className={styles.section} id="s-special">
            <div className={styles.sectionInner}>
              <span className={styles.sectionEye}>💛 Because You Matter</span>
              <h2 className={styles.sectionTitle}>Why {name} Is So Special</h2>

              <div className={styles.typeBox}>
                {typeText}
                <span className={`${styles.typeCursor}${typeCursor ? '' : ` ${styles.hidden}`}`}>|</span>
              </div>

              <div className={styles.specialList}>
                {WHY_SPECIAL_ITEMS.map(({ ico, txt }, i) => (
                  <div className={`${styles.specialItem} ${styles.reveal}`} key={i}>
                    <span className={styles.specialIcon}>{ico}</span>
                    <p className={styles.specialText}>{injectName(txt, name)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── MESSAGE FROM HEART ──────────────────────── */}
          <section className={styles.section} id="s-msg">
            <div className={styles.sectionInner}>
              <span className={styles.sectionEye}>💌 Only For You</span>
              <h2 className={styles.sectionTitle}>A Message from the Heart ❤️</h2>
              <div className={styles.emoCard}>
                <p className={styles.emoText}>
                  {message ? (
                    <>
                      Dear <strong>{name}</strong>,<br /><br />
                      {message.split('\n').map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                      <br /><br />With love 🌸💖
                    </>
                  ) : (
                    <>
                      Dear <strong>{name}</strong>, on this beautiful day I want you to stop for a
                      moment — take a breath — and truly feel how loved you are. You are not just
                      special. You are <strong>extraordinary</strong>. There is only one you in this
                      entire universe and that is the most beautiful thing imaginable.<br /><br />
                      Your laugh, your voice, your presence — they create a warmth that no one else
                      can replicate. You have touched more hearts than you will ever know.{' '}
                      <strong>Simply by being you</strong>, you have changed the world around
                      you.<br /><br />
                      On this birthday, may you truly see yourself the way everyone who loves you
                      sees you — <strong>radiant, powerful, and endlessly lovable</strong>. You
                      deserve every wish, every dream, every good thing life can possibly
                      offer.<br /><br />
                      Happy Birthday, <strong>{name}</strong>. The world is better — brighter,
                      kinder, more wonderful — because you exist. 🌸💖
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* ─── SURPRISE ────────────────────────────────── */}
          <section className={styles.surpriseSection}>
            <button className={styles.surpriseBtn} onClick={handleSurprise}>
              🎁 Click me for a surprise!
            </button>
            {showSurprise && (
              <div className={styles.surpriseMessage}>
                {SURPRISE_MSGS[(surpriseIdx - 1) % SURPRISE_MSGS.length]}
              </div>
            )}
          </section>

          {/* ─── FINAL ───────────────────────────────────── */}
          <section className={styles.finalSection} id="s-final">
            <div className={styles.finalRings}><span /><span /></div>
            <h2 className={styles.finalTitle}>Happy Birthday<br />{name} ❤️</h2>
            <p className={styles.finalSub}>You mean the world 🌍</p>
            <div className={styles.finalHearts}>💖 🌸 ✨ 🌸 💖</div>
            <p className={styles.finalQuote}>
              "May every single day of your life feel as magical as you make everyone else's feel —
              you deserve nothing less than magic." 🎂
            </p>
            <div className={styles.finalIcons}>🎂 🎉 🎈 🌺 💫 🌙 ⭐ 🌸 💎</div>
          </section>

        </div>
      )}
    </>
  );
}