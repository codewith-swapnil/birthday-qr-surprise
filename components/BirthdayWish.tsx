'use client';
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import type { WishData } from '@/types/wish';
import { isBirthdayToday, msToNextBirthday, formatBirthdayDisplay } from '@/lib/utils';
interface BirthdayWishProps { rawData: WishData | null; slug: string; }
interface CD { d: string; h: string; m: string; s: string; }
interface CFP {
  x:number;y:number;vx:number;vy:number;c:string;
  w:number;h:number;rot:number;rv:number;life:number;decay:number;shape:'c'|'r';
}
interface FWP { x:number;y:number;vx:number;vy:number;c:string;r:number;life:number;decay:number; }
interface Star { x:number;y:number;r:number;o:number;speed:number;tw:number;ts:number; }
interface Petal { x:number;y:number;sz:number;speed:number;drift:number;rot:number;rv:number;op:number;e:string; }

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const PAD = (n: number) => String(n).padStart(2, '0');

const BALLOON_COLS = ['#ff6b9d','#c084fc','#fbbf24','#fb7185','#a78bfa','#f472b6','#fde68a','#e879f9'];
const CF_COLS      = ['#ff6b9d','#c084fc','#fbbf24','#fb7185','#a78bfa','#f472b6','#fde68a','#60a5fa','#34d399','#fff'];
const FW_COLS      = ['#ff6b9d','#c084fc','#fbbf24','#fb7185','#f9a8d4','#fde68a','#e879f9','#a78bfa'];
const PETAL_EMOJIS = ['🌸','🌺','🌹','💮','🌼','✿'];
const HEARTS       = ['💖','💕','✨','🌸','💗','⭐','🌺'];
const SURPRISE_MSGS = [
  '🌟 You are like a rare diamond — precious, brilliant, and absolutely irreplaceable. The universe crafted you to be extraordinary! 💎',
  '🌸 Every single person who knows you is lucky beyond measure. Your presence is a gift that keeps giving every single day! 💝',
  '🦋 You have the most magical ability to make ordinary moments feel extraordinary. That\'s a superpower! ⚡',
  '🌺 Somewhere right now, someone is thinking about you and smiling without even realising why. That\'s the effect you have! 💫',
  '✨ If happiness had a face, it would look exactly like yours. Happy Birthday to the most radiant you! 🎂',
  '🌙 The stars are jealous of how brightly you shine. Keep glowing, keep being you! 💛',
];
const NAV_IDS = ['s-hero','s-photos','s-wishes','s-special','s-msg','s-final'];

// ─────────────────────────────────────────────────────────
// Photo Grid
// ─────────────────────────────────────────────────────────
function PhotoGrid({ images }: { images: string[] }) {
  if (!images.length) return null;

  const count = images.length;

  // Grid layout classes based on count
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
        // First image spans full width when count is 3 or 5
        const spanFull = (count === 3 || count === 5) && i === 0;
        return (
          <div
            key={src}
            style={{
              gridColumn: spanFull ? 'span 2' : undefined,
              aspectRatio: count === 1 ? '4/3' : spanFull ? '16/9' : '1/1',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '2px solid rgba(255,107,157,.2)',
              boxShadow: '0 8px 32px rgba(255,107,157,.15)',
              background: 'rgba(255,255,255,.04)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Memory ${i + 1}`}
              loading={i < 2 ? 'eager' : 'lazy'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function BirthdayWish({ rawData }: BirthdayWishProps) {
  const name    = rawData?.name    ?? 'You';
  const day     = rawData?.day     ?? 0;
  const month   = rawData?.month   ?? '';
  const message = rawData?.message ?? '';
  const images  = useMemo(() => (rawData?.images ?? []).slice(0, 8), [rawData]);

  const bdDisplay = day && month ? formatBirthdayDisplay(day, month) : '';

  // Typing phrases
  const PHRASES = useMemo(() => [
    `${name}, you are the definition of grace, strength, and beauty… ✨`,
    `You make everyone's life brighter simply by being in it… 🌸`,
    `Your kindness is a superpower that touches every heart… 💖`,
    `The world is genuinely better because of you… 🌙`,
    `You are the poem the universe wrote to perfection… 🌺`,
    `Every day with you is a gift nobody deserves but everyone treasures… 💫`,
  ], [name]);

  // ── State ──
  const [showBirthday, setShowBirthday] = useState(false);
  const [cd, setCd] = useState<CD>({ d:'00', h:'00', m:'00', s:'00' });
  const [isPlaying, setIsPlaying]       = useState(false);
  const [typeText, setTypeText]         = useState('');
  const [typeCursor, setTypeCursor]     = useState(true);
  const [surpriseIdx, setSurpriseIdx]   = useState(0);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeNav, setActiveNav]       = useState(0);

  // ── Refs ──
  const starCnv = useRef<HTMLCanvasElement>(null);
  const petalCnv= useRef<HTMLCanvasElement>(null);
  const fwCnv   = useRef<HTMLCanvasElement>(null);
  const cfCnv   = useRef<HTMLCanvasElement>(null);
  const audioRef= useRef<HTMLAudioElement>(null);
  const cfPRef  = useRef<CFP[]>([]);
  const fwPRef  = useRef<FWP[]>([]);
  const starRef = useRef<Star[]>([]);
  const petalRef= useRef<Petal[]>([]);
  const afIds   = useRef<number[]>([]);

  // ── Particle count adapts to screen width ──
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const STAR_CNT  = isMobile ? 100 : 220;
  const PETAL_CNT = isMobile ? 25  : 55;

  // ─── Canvas setup ───────────────────────────────────────
  const buildStars = useCallback((w: number, h: number) => {
    starRef.current = Array.from({ length: STAR_CNT }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.4+0.3, o: Math.random()*0.8+0.1,
      speed: Math.random()*0.35+0.05,
      tw: Math.random()*Math.PI*2, ts: Math.random()*0.03+0.01,
    }));
  }, [STAR_CNT]);

  const buildPetals = useCallback((w: number) => {
    petalRef.current = Array.from({ length: PETAL_CNT }, () => ({
      x: Math.random()*w, y: Math.random()*900-200,
      sz: Math.random()*16+8, speed: Math.random()*0.7+0.25,
      drift: (Math.random()-0.5)*0.7, rot: Math.random()*360,
      rv: (Math.random()-0.5)*1.5, op: Math.random()*0.4+0.1,
      e: PETAL_EMOJIS[Math.floor(Math.random()*PETAL_EMOJIS.length)],
    }));
  }, [PETAL_CNT]);

  // Canvas animation loops
  useEffect(() => {
    const sc = starCnv.current, pc = petalCnv.current;
    const fc = fwCnv.current,   cc = cfCnv.current;
    if (!sc||!pc||!fc||!cc) return;
    const sx=sc.getContext('2d')!, px=pc.getContext('2d')!;
    const fx=fc.getContext('2d')!, cx=cc.getContext('2d')!;

    const resize = () => {
      const w=innerWidth, h=innerHeight;
      sc.width=pc.width=fc.width=cc.width=w;
      sc.height=pc.height=fc.height=cc.height=h;
      buildStars(w,h); buildPetals(w);
    };
    resize();
    window.addEventListener('resize', resize);

    const animStar=()=>{
      const {width:w,height:h}=sc;
      sx.clearRect(0,0,w,h);
      starRef.current.forEach(s=>{
        s.tw+=s.ts;
        sx.globalAlpha=s.o*(0.5+0.5*Math.sin(s.tw));
        sx.fillStyle='#fff';
        sx.beginPath(); sx.arc(s.x,s.y,s.r,0,Math.PI*2); sx.fill();
        s.y-=s.speed; if(s.y<0){s.y=h;s.x=Math.random()*w;}
      });
      sx.globalAlpha=1;
      const id=requestAnimationFrame(animStar); afIds.current.push(id);
    };
    const animPetal=()=>{
      const {width:w,height:h}=pc;
      px.clearRect(0,0,w,h);
      petalRef.current.forEach(p=>{
        p.y+=p.speed; p.x+=p.drift; p.rot+=p.rv;
        if(p.y>h+30){p.y=-30;p.x=Math.random()*w;}
        if(p.x<-30)p.x=w+10; if(p.x>w+30)p.x=-10;
        px.save(); px.globalAlpha=p.op;
        px.translate(p.x,p.y); px.rotate(p.rot*Math.PI/180);
        px.font=`${p.sz}px serif`; px.fillText(p.e,-p.sz/2,-p.sz/2);
        px.restore();
      });
      const id=requestAnimationFrame(animPetal); afIds.current.push(id);
    };
    const animCf=()=>{
      const {width:cw,height:ch}=cc;
      cx.clearRect(0,0,cw,ch);
      cfPRef.current.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.3; p.vx*=0.99;
        p.rot+=p.rv; p.life-=p.decay;
        cx.save(); cx.globalAlpha=Math.max(0,p.life); cx.fillStyle=p.c;
        cx.translate(p.x,p.y); cx.rotate(p.rot*Math.PI/180);
        if(p.shape==='c'){cx.beginPath();cx.arc(0,0,p.w/2,0,Math.PI*2);cx.fill();}
        else cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        cx.restore();
      });
      cfPRef.current=cfPRef.current.filter(p=>p.life>0);
      const id=requestAnimationFrame(animCf); afIds.current.push(id);
    };
    const animFw=()=>{
      const {width:fw,height:fh}=fc;
      fx.clearRect(0,0,fw,fh);
      fwPRef.current.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life-=p.decay;
        fx.globalAlpha=Math.max(0,p.life); fx.fillStyle=p.c;
        fx.beginPath(); fx.arc(p.x,p.y,p.r,0,Math.PI*2); fx.fill();
      });
      fwPRef.current=fwPRef.current.filter(p=>p.life>0);
      fx.globalAlpha=1;
      const id=requestAnimationFrame(animFw); afIds.current.push(id);
    };
    animStar(); animPetal(); animCf(); animFw();

    return ()=>{ window.removeEventListener('resize',resize); afIds.current.forEach(cancelAnimationFrame); afIds.current=[]; };
  }, [buildStars, buildPetals]);

  // ─── Confetti helpers ────────────────────────────────────
  const spawnConfetti = useCallback((n:number, ox?:number, oy?:number)=>{
    const cw=cfCnv.current?.width??innerWidth, ch=cfCnv.current?.height??innerHeight;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, sp=Math.random()*13+4;
      cfPRef.current.push({
        x:ox??Math.random()*cw, y:oy??ch*0.3,
        vx:Math.cos(a)*sp*(Math.random()*0.6+0.7),
        vy:Math.sin(a)*sp*(Math.random()*0.6+0.7)-Math.random()*9,
        c:CF_COLS[Math.floor(Math.random()*CF_COLS.length)],
        w:Math.random()*10+4, h:Math.random()*6+2,
        rot:Math.random()*360, rv:(Math.random()-0.5)*9,
        life:1, decay:Math.random()*0.012+0.008,
        shape:Math.random()<0.3?'c':'r',
      });
    }
  }, []);

  const bigConfetti = useCallback(()=>{
    const cw=cfCnv.current?.width??innerWidth, ch=cfCnv.current?.height??innerHeight;
    spawnConfetti(isMobile?120:260, cw*0.5, ch*0.25);
    setTimeout(()=>spawnConfetti(80,  cw*0.05, ch*0.45), 300);
    setTimeout(()=>spawnConfetti(80,  cw*0.95, ch*0.45), 500);
    setTimeout(()=>spawnConfetti(60,  cw*0.25, ch*0.18), 700);
    setTimeout(()=>spawnConfetti(60,  cw*0.75, ch*0.18), 900);
  }, [spawnConfetti, isMobile]);

  const launchFireworks = useCallback(()=>{
    const fc2=fwCnv.current; if(!fc2) return;
    const {width:fw,height:fh}=fc2;
    const burst=(x:number,y:number,col:string)=>{
      for(let i=0;i<(isMobile?40:75);i++){
        const a=Math.random()*Math.PI*2, sp=Math.random()*7+3;
        fwPRef.current.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,c:col,r:Math.random()*2.5+0.8,life:1,decay:Math.random()*0.018+0.01});
      }
    };
    const shots=isMobile?6:12;
    for(let i=0;i<shots;i++) setTimeout(()=>burst(fw*0.1+Math.random()*fw*0.8,fh*0.04+Math.random()*fh*0.44,FW_COLS[Math.floor(Math.random()*FW_COLS.length)]),i*350);
  }, [isMobile]);

  // ─── Countdown ───────────────────────────────────────────
  useEffect(()=>{
    if(!day||!month||isBirthdayToday(day,month)){
      setShowBirthday(true); return;
    }
    const update=()=>{
      const ms=msToNextBirthday(day,month);
      if(ms<=0){ setShowBirthday(true); clearInterval(t); return; }
      const s=Math.floor(ms/1000);
      setCd({ d:PAD(Math.floor(s/86400)), h:PAD(Math.floor(s%86400/3600)), m:PAD(Math.floor(s%3600/60)), s:PAD(s%60) });
    };
    update();
    const t=setInterval(update,1000);
    return ()=>clearInterval(t);
  },[day,month]);

  // ─── Birthday screen boot ────────────────────────────────
  useEffect(()=>{
    if(!showBirthday) return;
    setTimeout(bigConfetti,400);
    setTimeout(launchFireworks,600);

    const audio=audioRef.current;
    if(audio){ audio.volume=1; audio.play().then(()=>setIsPlaying(true)).catch(()=>{}); }

    const periodicCf=setInterval(()=>spawnConfetti(30),8000);

    // Intersection observers for reveal
    const revealObs=new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('bwv'); revealObs.unobserve(en.target); } });
    },{threshold:0.1});
    document.querySelectorAll('.bw-reveal').forEach((el,i)=>{
      (el as HTMLElement).style.transitionDelay=`${i*0.07}s`;
      revealObs.observe(el);
    });

    const navObs=new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting){ const idx=NAV_IDS.indexOf(en.target.id); if(idx>=0) setActiveNav(idx); } });
    },{threshold:0.35});
    NAV_IDS.forEach(id=>{ const el=document.getElementById(id); if(el) navObs.observe(el); });

    return ()=>{ clearInterval(periodicCf); revealObs.disconnect(); navObs.disconnect(); };
  },[showBirthday, bigConfetti, launchFireworks, spawnConfetti]);

  // ─── Typing ──────────────────────────────────────────────
  useEffect(()=>{
    if(!showBirthday) return;
    let pi=0, ci=0, del=false;
    let timer: ReturnType<typeof setTimeout>;
    const tick=()=>{
      const phrase=PHRASES[pi];
      setTypeText(del?phrase.slice(0,ci-1):phrase.slice(0,ci+1));
      if(!del){ ci++; if(ci===phrase.length+1){ del=true; timer=setTimeout(tick,2400); return; } }
      else{ ci--; if(ci===0){ del=false; pi=(pi+1)%PHRASES.length; } }
      timer=setTimeout(tick, del?38:62);
    };
    const blinkT=setInterval(()=>setTypeCursor(v=>!v),530);
    timer=setTimeout(tick,900);
    return ()=>{ clearTimeout(timer); clearInterval(blinkT); };
  },[showBirthday, PHRASES]);

  // ─── Custom cursor (desktop only) ────────────────────────
  useEffect(()=>{
    const cur=document.getElementById('bw-cursor'); if(!cur) return;
    const move=(e:MouseEvent)=>{
      cur.style.left=`${e.clientX}px`; cur.style.top=`${e.clientY}px`;
      if(Math.random()<0.18) spawnHeart(e.clientX,e.clientY);
    };
    const spawnHeart=(x:number,y:number)=>{
      const el=document.createElement('div'); el.className='bw-hc';
      el.textContent=HEARTS[Math.floor(Math.random()*HEARTS.length)];
      el.style.left=`${x}px`; el.style.top=`${y}px`;
      el.style.setProperty('--dx',`${(Math.random()-0.5)*70}px`);
      document.body.appendChild(el); setTimeout(()=>el.remove(),1450);
    };
    window.addEventListener('mousemove',move);
    return ()=>window.removeEventListener('mousemove',move);
  },[]);

  // ─── Handlers ────────────────────────────────────────────
  const toggleAudio=()=>{
    const a=audioRef.current; if(!a) return;
    if(a.paused) a.play().then(()=>setIsPlaying(true)).catch(()=>{});
    else{ a.pause(); setIsPlaying(false); }
  };

  const handleSurprise=()=>{
    bigConfetti();
    setShowSurprise(true);
    setSurpriseIdx(i=>i+1);
    const ico=['✨','💖','🌸','🦋','⭐','💫','🌺','🎊'];
    for(let i=0;i<12;i++) setTimeout(()=>{
      const s=document.createElement('div');
      s.style.cssText=`position:fixed;pointer-events:none;z-index:9;left:${Math.random()*95}vw;top:${Math.random()*80}vh;font-size:${Math.random()*1.5+1}rem;animation:bwHF 1.8s ease forwards;`;
      s.textContent=ico[Math.floor(Math.random()*ico.length)];
      s.style.setProperty('--dx',`${(Math.random()-0.5)*80}px`);
      document.body.appendChild(s); setTimeout(()=>s.remove(),1900);
    },i*70);
  };

  const scrollTo=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>

      {/* Canvas layers */}
      <canvas id="bw-sc"  ref={starCnv}/>
      <canvas id="bw-pc"  ref={petalCnv}/>
      <canvas id="bw-fwc" ref={fwCnv}/>
      <canvas id="bw-cfc" ref={cfCnv}/>

      <div className="bw-amb"/>
      <div id="bw-cursor"/>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/music/nastelbom-happy-birthday-469282.mp3" loop/>

      {/* Audio bar */}
      <div className="bw-bar">
        <span className="bw-bar-label">🎵 Happy Birthday {name}</span>
        <div className={`bw-eq${isPlaying?'':' paused'}`}>{[0,1,2,3,4].map(i=><div key={i}/>)}</div>
        <button className="bw-pbtn" onClick={toggleAudio} aria-label={isPlaying?'Pause':'Play'}>
          {isPlaying?'⏸':'▶'}
        </button>
      </div>

      {/* ══ COUNTDOWN ══════════════════════════════════════ */}
      {!showBirthday && (
        <section className="bw-cd">
          <span className="bw-cd-pre">✨ Something magical is coming ✨</span>
          <h1 className="bw-cd-name">{name}</h1>
          <p className="bw-cd-sub">The world is counting down to the most special day…</p>
          <div className="bw-cd-grid">
            {(['d','h','m','s'] as const).map((k,i)=>(
              <div className="bw-cd-box" key={k}>
                <span className="bw-cd-num">{cd[k]}</span>
                <span className="bw-cd-lbl">{['Days','Hours','Mins','Secs'][i]}</span>
              </div>
            ))}
          </div>
          {bdDisplay && <div className="bw-cd-badge">🎂 {bdDisplay} · Her Magical Birthday</div>}
        </section>
      )}

      {/* ══ BIRTHDAY SCREEN ════════════════════════════════ */}
      {showBirthday && (
        <div className="bw-bd">

          {/* Balloons */}
          <div className="bw-balloons">
            {BALLOON_COLS.slice(0, isMobile?4:8).map((col,i)=>(
              <svg key={i} viewBox="0 0 100 150" width={isMobile?22:30}
                style={{animation:`bwBU ${6.5+(i*1.3)%5}s ${(i*0.7)%4}s linear infinite`,color:col}}>
                <ellipse cx="50" cy="55" rx="38" ry="46" fill={col} opacity=".88"/>
                <ellipse cx="40" cy="42" rx="9" ry="11" fill="rgba(255,255,255,.28)"/>
                <path d="M47 101 Q50 108 53 101" stroke={col} strokeWidth="3" fill="none"/>
                <line x1="50" y1="104" x2="50" y2="150" stroke={col} strokeWidth="1.5" opacity=".6"/>
              </svg>
            ))}
          </div>

          {/* Nav rail — desktop only */}
          <nav className="bw-nav" aria-label="Sections">
            {NAV_IDS.map((id,i)=>(
              <button key={id} className={`bw-nr${activeNav===i?' on':''}`}
                onClick={()=>scrollTo(id)} aria-label={id.replace('s-','')}/>
            ))}
          </nav>

          {/* ─── HERO ─────────────────────────────────── */}
          <section className="bw-hero" id="s-hero">
            <div className="bw-rings"><span/><span/><span/><span/></div>
            <span className="bw-eyebrow">🌸 · {bdDisplay||'Today'} · Happy Birthday · 🌸</span>
            <h1 className="bw-hero-h">Happy Birthday</h1>
            <span className="bw-hero-name">{name} ✨</span>
            <p className="bw-hero-q">
              "Today the entire universe pauses to celebrate you —<br/>
              the most extraordinary soul in the world. 🌙"
            </p>
            <button className="bw-scroll-btn" onClick={()=>scrollTo(images.length?'s-photos':'s-wishes')}>
              ↓ Scroll to explore your surprise ↓
            </button>
          </section>

          {/* ─── PHOTOS (only if images exist) ────────── */}
          {images.length > 0 && (
            <section className="bw-section" id="s-photos">
              <div className="bw-sw">
                <span className="bw-eye">📸 Beautiful Memories</span>
                <h2 className="bw-stl">Your Photo Gallery</h2>
                <PhotoGrid images={images}/>
              </div>
            </section>
          )}

          {/* ─── WISHES ───────────────────────────────── */}
          <section className="bw-section" id="s-wishes">
            <div className="bw-sw">
              <span className="bw-eye">💌 From the Heart</span>
              <h2 className="bw-stl">Birthday Wishes for {name}</h2>
              <div className="bw-wgrid">
                {[
                  { txt:`तुम्हारा जन्मदिन तुम्हारी ज़िंदगी का सबसे खूबसूरत दिन बने। हर पल खुशियों और मुहब्बत से भरा रहे।`, em:'❤️' },
                  { txt:`भगवान तुम्हें दुनिया की सारी खुशियाँ दे, तुम्हारी हर ख्वाहिश पूरी हो, हर सपना सच बने।`, em:'🎂' },
                  { txt:`${name}, तुम जहाँ भी जाओ रोशनी बिखेरती रहो। तुम्हारी मुस्कान में जादू है जो दिलों को छू जाती है।`, em:'✨' },
                  { txt:`तुझा वाढदिवस खूप खास आणि आनंदाचा जावो। तुझ्या जीवनात नेहमी सुख, समृद्धी आणि प्रेम राहो।`, em:'🎉' },
                  { txt:`तुझ्या आयुष्यात कायम आनंद आणि प्रेम राहो। देव तुला दीर्घायुष्य, यश आणि अपार आनंद देवो।`, em:'🌺' },
                  { txt:`${name}, तू खूप विशेष आहेस. तुझ्या हास्याने सगळ्यांचं मन प्रसन्न होतं. वाढदिवसाच्या हार्दिक शुभेच्छा!`, em:'💜' },
                  { txt:`Happy Birthday ${name}! You are truly special. The world is a more beautiful place because you exist in it.`, em:'💖' },
                  { txt:`May your life overflow with love, joy, and success. You deserve every wonderful thing the universe has to offer.`, em:'🎂' },
                  { txt:`On your birthday, I wish you a year so full of magic, laughter, and unforgettable moments that your heart could burst. You are irreplaceable, ${name}.`, em:'🌟' },
                ].map(({txt,em},i)=>(
                  <div className="bw-wcard bw-reveal" key={i}>
                    <p className="bw-wtxt">{txt}</p>
                    <span className="bw-wem">{em}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── WHY SPECIAL ──────────────────────────── */}
          <section className="bw-section" id="s-special">
            <div className="bw-sw">
              <span className="bw-eye">💛 Because You Matter</span>
              <h2 className="bw-stl">Why {name} Is So Special</h2>

              {/* Typing text box */}
              <div className="bw-type">
                {typeText}
                <span className={`bw-cursor${typeCursor?'':' off'}`}>|</span>
              </div>

              <div className="bw-sp-list">
                {[
                  { ico:'🌹', txt:`Your smile is the kind that makes everyone around you feel warm and loved — even on their darkest days, ${name}.` },
                  { ico:'💫', txt:'You carry a rare, beautiful combination of strength and grace. You handle everything life throws at you with dignity and elegance.' },
                  { ico:'🌸', txt:'Your kindness is genuine, your laughter is contagious, and your heart is one of the most beautiful things this world has ever known.' },
                  { ico:'⭐', txt:`You dream big, love deep, and shine bright. There is simply no one in this world quite like you — you are one of a kind, ${name}.` },
                  { ico:'🦋', txt:'You have the rare and precious gift of making people feel truly seen, truly heard, and deeply cherished. That is your superpower.' },
                  { ico:'🌙', txt:'Even on cloudy days you bring light. You are the reason someone\'s day gets better without them even knowing why.' },
                ].map(({ico,txt},i)=>(
                  <div className="bw-sp-item bw-reveal" key={i}>
                    <span className="bw-sp-ico">{ico}</span>
                    <p className="bw-sp-txt">{txt}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── MESSAGE FROM HEART ───────────────────── */}
          <section className="bw-section bw-emo-wrap" id="s-msg">
            <div className="bw-sw">
              <span className="bw-eye">💌 Only For You</span>
              <h2 className="bw-stl">A Message from the Heart ❤️</h2>
              <div className="bw-emo-card">
                <p className="bw-emo-p">
                  {message ? (
                    /* Personalised message from WishData — name bolded */
                    <>
                      Dear <strong>{name}</strong>,<br/><br/>
                      {message.split('\n').map((line,i)=>(
                        <React.Fragment key={i}>{line}{i<message.split('\n').length-1&&<br/>}</React.Fragment>
                      ))}
                      <br/><br/>With love 🌸💖
                    </>
                  ) : (
                    /* Static fallback */
                    <>
                      Dear <strong>{name}</strong>, on this beautiful day I want you to stop for a moment —
                      take a breath — and truly feel how loved you are. You are not just special.
                      You are <strong>extraordinary</strong>. There is only one you in this entire universe
                      and that is the most beautiful thing imaginable.<br/><br/>
                      Your laugh, your voice, your presence — they create a warmth that no one else can replicate.
                      You have touched more hearts than you will ever know.{' '}
                      <strong>Simply by being you</strong>, you have changed the world around you.<br/><br/>
                      On this birthday, may you truly see yourself the way everyone who loves you sees you —{' '}
                      <strong>radiant, powerful, and endlessly lovable</strong>. You deserve every wish,
                      every dream, every good thing life can possibly offer.<br/><br/>
                      May this be your most beautiful year yet. May every door open wide for you, and may
                      you always, always know how <strong>deeply and truly loved</strong> you are.<br/><br/>
                      Happy Birthday, <strong>{name}</strong>. The world is better — brighter, kinder,
                      more wonderful — because you exist. 🌸💖
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* ─── SURPRISE ─────────────────────────────── */}
          <section className="bw-surp-sec">
            <button className="bw-surp-btn" onClick={handleSurprise}>
              🎁 Click me for a surprise!
            </button>
            {showSurprise && (
              <div className="bw-surp-msg">
                {SURPRISE_MSGS[(surpriseIdx-1)%SURPRISE_MSGS.length]}
              </div>
            )}
          </section>

          {/* ─── FINAL ────────────────────────────────── */}
          <section className="bw-final" id="s-final">
            <div className="bw-f-rings"><span/><span/></div>
            <h2 className="bw-f-ttl">Happy Birthday<br/>{name} ❤️</h2>
            <p className="bw-f-sub">You mean the world 🌍</p>
            <div className="bw-f-hearts">💖 🌸 ✨ 🌸 💖</div>
            <p className="bw-f-quote">
              "May every single day of your life feel as magical as you make everyone else's feel —
              you deserve nothing less than magic." 🎂
            </p>
            <div className="bw-f-icons">🎂 🎉 🎈 🌺 💫 🌙 ⭐ 🌸 💎</div>
          </section>

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// CSS  — MOBILE-FIRST  (.bw-* namespace)
// Base styles target phones (≤639px).
// Desktop enhancements added inside @media (min-width: 640px).
// ─────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,600&family=Quicksand:wght@300;400;500;600&display=swap');

:root{
  --br:#ff6b9d; --bl:#ffb3cc; --bm:#c084fc;
  --bg:#fbbf24; --bc:#ffe4b5; --bk:#06000f;
  --glass:rgba(255,255,255,.07); --gb:rgba(255,255,255,.14);
  --shadow:rgba(255,107,157,.18);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bk);color:#fff;font-family:'Quicksand',sans-serif;overflow-x:hidden;min-height:100vh}
/* hide custom cursor on touch */
@media(hover:none){#bw-cursor{display:none!important}}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--bk)}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--br),var(--bm));border-radius:3px}

/* CANVAS */
#bw-sc,#bw-pc,#bw-cfc,#bw-fwc{position:fixed;inset:0;pointer-events:none}
#bw-sc{z-index:0}#bw-pc{z-index:1}#bw-fwc{z-index:2}#bw-cfc{z-index:3}

/* AMBIENT */
.bw-amb{position:fixed;inset:0;z-index:0;
  background:radial-gradient(ellipse 90% 70% at 15% 5%,#2d0050cc 0%,transparent 55%),
             radial-gradient(ellipse 70% 55% at 85% 95%,#5c0a2ecc 0%,transparent 55%),
             radial-gradient(ellipse 60% 50% at 50% 50%,#1a003388 0%,var(--bk) 100%)}

/* CURSOR (desktop) */
#bw-cursor{width:16px;height:16px;background:radial-gradient(circle,#ff6b9d,#c084fc);border-radius:50%;
  position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);
  box-shadow:0 0 20px #ff6b9daa}
.bw-hc{position:fixed;pointer-events:none;z-index:9997;font-size:.9rem;
  animation:bwHF 1.4s ease forwards;transform:translate(-50%,-50%)}
@keyframes bwHF{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% - 120px)) scale(.2)}}

/* AUDIO BAR */
.bw-bar{position:fixed;bottom:.9rem;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:.6rem;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
  backdrop-filter:blur(20px);border-radius:50px;padding:.45rem 1rem;
  z-index:1000;box-shadow:0 4px 24px rgba(255,107,157,.25);
  max-width:calc(100vw - 2rem)}
.bw-bar-label{font-family:'Dancing Script',cursive;font-size:.8rem;color:var(--bc);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
@media(min-width:640px){.bw-bar-label{max-width:240px;font-size:.9rem}}
.bw-eq{display:flex;gap:3px;align-items:flex-end;height:16px;flex-shrink:0}
.bw-eq div{width:3px;background:linear-gradient(180deg,var(--bg),var(--br));border-radius:2px;
  animation:bwEq .6s ease-in-out infinite alternate}
.bw-eq div:nth-child(1){height:5px;animation-delay:0s}
.bw-eq div:nth-child(2){height:13px;animation-delay:.1s}
.bw-eq div:nth-child(3){height:9px;animation-delay:.2s}
.bw-eq div:nth-child(4){height:15px;animation-delay:.05s}
.bw-eq div:nth-child(5){height:7px;animation-delay:.15s}
.bw-eq.paused div{animation-play-state:paused}
@keyframes bwEq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
.bw-pbtn{width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;
  background:linear-gradient(135deg,var(--br),var(--bm));font-size:.9rem;
  display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 0 16px rgba(255,107,157,.5);flex-shrink:0;touch-action:manipulation}

/* ── COUNTDOWN ─────────────────────────────── */
.bw-cd{min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:1.5rem 1rem;position:relative;z-index:10}
.bw-cd-pre{font-family:'Dancing Script',cursive;font-size:clamp(1rem,4vw,1.6rem);
  color:var(--bc);letter-spacing:.2em;margin-bottom:1rem;
  animation:bwFD 1.2s ease forwards;opacity:0}
.bw-cd-name{font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(2.8rem,12vw,8rem);line-height:1;
  background:linear-gradient(135deg,#ffb3cc 0%,#fbbf24 38%,#c084fc 68%,#ff6b9d 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:bwNG 3s ease-in-out infinite alternate,bwFD 1.2s .3s ease forwards;opacity:0;
  filter:drop-shadow(0 0 30px #ff6b9d66);word-break:break-word;padding:0 .5rem}
@keyframes bwNG{from{filter:drop-shadow(0 0 18px #ff6b9d44)}to{filter:drop-shadow(0 0 45px #ff6b9dbb)}}
.bw-cd-sub{font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(.85rem,3vw,1.3rem);color:var(--bl);margin:1.2rem 0 2rem;
  animation:bwFD 1.2s .6s ease forwards;opacity:0;padding:0 1rem}
.bw-cd-grid{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;
  animation:bwFU 1.2s .9s ease forwards;opacity:0;width:100%;max-width:380px}
.bw-cd-box{background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(18px);
  border-radius:1.2rem;padding:.8rem .9rem;flex:1;min-width:68px;max-width:90px;
  box-shadow:0 8px 28px var(--shadow),inset 0 1px 0 rgba(255,255,255,.1);
  position:relative;overflow:hidden}
.bw-cd-box::after{content:'';position:absolute;inset:-2px;
  background:conic-gradient(transparent 270deg,rgba(255,107,157,.3) 360deg);
  animation:bwSpin 4s linear infinite;z-index:-1;border-radius:inherit}
.bw-cd-num{font-family:'Playfair Display',serif;font-weight:700;
  font-size:clamp(2rem,7vw,4.5rem);line-height:1;
  background:linear-gradient(180deg,#fff,var(--bg));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block}
.bw-cd-lbl{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--bl);margin-top:.2rem}
.bw-cd-badge{margin-top:2rem;padding:.6rem 1.6rem;border:1px solid var(--gb);border-radius:50px;
  background:var(--glass);backdrop-filter:blur(10px);font-family:'Dancing Script',cursive;
  font-size:1rem;color:var(--bc);animation:bwFU 1.2s 1.2s ease forwards;opacity:0}

/* KEYFRAMES */
@keyframes bwFD{from{opacity:0;transform:translateY(-22px)}to{opacity:1;transform:translateY(0)}}
@keyframes bwFU{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes bwFS{from{opacity:0;transform:scale(.84)}to{opacity:1;transform:scale(1)}}
@keyframes bwSpin{to{transform:rotate(360deg)}}
@keyframes bwSh{0%{background-position:0% center}100%{background-position:200% center}}
@keyframes bwRP{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}}
@keyframes bwBU{0%{transform:translateY(0) rotate(-6deg);opacity:1}
  45%{transform:translateY(-45vh) rotate(6deg)}
  100%{transform:translateY(-115vh) rotate(-4deg);opacity:0}}

/* BALLOONS */
.bw-balloons{position:fixed;bottom:-40px;left:0;width:100%;pointer-events:none;z-index:4;
  display:flex;justify-content:space-around}

/* NAV RAIL — hidden on mobile */
.bw-nav{display:none}
@media(min-width:640px){
  .bw-nav{display:flex;position:fixed;right:.8rem;top:50%;transform:translateY(-50%);
    flex-direction:column;gap:.55rem;z-index:600}
}
.bw-nr{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;
  border:1px solid rgba(255,255,255,.2);transition:all .3s;padding:0}
.bw-nr.on{background:var(--br);box-shadow:0 0 10px var(--br);transform:scale(1.5)}

/* BIRTHDAY SCREEN */
.bw-bd{position:relative;z-index:10}

/* ── HERO ──────────────────────────────────── */
.bw-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:5rem 1.2rem 3rem;position:relative;overflow:hidden}
.bw-rings span{position:absolute;top:50%;left:50%;border-radius:50%;
  transform:translate(-50%,-50%);animation:bwRP 5s ease-in-out infinite}
.bw-rings span:nth-child(1){width:min(280px,75vw);height:min(280px,75vw);border:1px solid rgba(255,107,157,.15)}
.bw-rings span:nth-child(2){width:min(480px,88vw);height:min(480px,88vw);border:1px solid rgba(192,132,252,.1);animation-delay:1.2s}
.bw-rings span:nth-child(3){width:min(700px,96vw);height:min(700px,96vw);border:1px solid rgba(251,191,36,.07);animation-delay:2.4s}
.bw-rings span:nth-child(4){width:min(940px,99vw);height:min(940px,99vw);border:1px solid rgba(255,107,157,.04);animation-delay:3.6s}
.bw-eyebrow{font-family:'Dancing Script',cursive;font-size:clamp(.9rem,3.5vw,1.5rem);
  color:var(--bg);letter-spacing:.15em;animation:bwFD 1s ease forwards;opacity:0;
  text-shadow:0 0 25px var(--bg);padding:0 1rem;text-align:center}
.bw-hero-h{font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(2.8rem,12vw,9rem);line-height:.95;
  background:linear-gradient(135deg,#ff6b9d 0%,#fbbf24 33%,#c084fc 65%,#ff6b9d 100%);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:bwSh 5s linear infinite,bwFS 1.2s .2s ease forwards;opacity:0;
  filter:drop-shadow(0 0 40px #ff6b9d33)}
.bw-hero-name{font-family:'Playfair Display',serif;font-weight:700;
  font-size:clamp(2.2rem,10vw,7rem);line-height:1;
  background:linear-gradient(135deg,#fbbf24 0%,#fff 45%,#fbbf24 100%);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:bwSh 4s linear infinite,bwFS 1.2s .5s ease forwards;opacity:0;
  filter:drop-shadow(0 0 55px #fbbf2499);display:block;margin:-.2rem 0 1.2rem;
  word-break:break-word;padding:0 .5rem}
.bw-hero-q{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(.95rem,3.2vw,1.5rem);color:var(--bc);
  animation:bwFU 1s .8s ease forwards;opacity:0;max-width:520px;line-height:1.75;
  padding:0 1.2rem}
.bw-scroll-btn{margin-top:2rem;color:var(--bl);font-family:'Dancing Script',cursive;
  font-size:clamp(1rem,3.5vw,1.2rem);text-decoration:none;background:none;border:none;cursor:pointer;
  animation:bwFU 1s 1.2s ease forwards;opacity:0;display:inline-block;
  touch-action:manipulation}
.bw-scroll-btn:hover{color:var(--br)}

/* ── SHARED SECTION ────────────────────────── */
.bw-section{position:relative;z-index:10}
.bw-sw{max-width:900px;margin:0 auto;padding:clamp(2.5rem,7vw,5rem) 1rem}
@media(min-width:640px){.bw-sw{padding:clamp(3rem,8vw,6rem) 1.5rem}}
.bw-eye{font-family:'Dancing Script',cursive;font-size:clamp(.9rem,3vw,1.3rem);
  color:var(--bg);letter-spacing:.12em;display:block;margin-bottom:.4rem;text-align:center}
.bw-stl{font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(1.5rem,5.5vw,3rem);text-align:center;
  background:linear-gradient(135deg,#fff,var(--bl));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:clamp(1.5rem,5vw,3rem)}

/* reveal animation */
.bw-reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
.bw-reveal.bwv{opacity:1;transform:translateY(0)}

/* ── PHOTO GRID ────────────────────────────── */
/* (styles are inline in the <PhotoGrid> component above) */

/* ── WISHES ────────────────────────────────── */
.bw-wgrid{display:grid;grid-template-columns:1fr;gap:1rem}
@media(min-width:480px){.bw-wgrid{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.bw-wgrid{grid-template-columns:1fr 1fr 1fr}}
.bw-wcard{background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(20px);
  border-radius:1.4rem;padding:1.5rem;position:relative;overflow:hidden;
  transition:opacity .6s ease,transform .6s ease,box-shadow .3s}
.bw-wcard::before{content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,107,157,.06),transparent 60%);pointer-events:none}
.bw-wcard::after{content:'';position:absolute;top:-60%;left:-60%;width:220%;height:220%;
  background:conic-gradient(transparent,rgba(255,107,157,.06),transparent 30%);
  animation:bwSpin 9s linear infinite;pointer-events:none}
.bw-wcard:active{transform:scale(.98)}
@media(hover:hover){.bw-wcard:hover{transform:translateY(-5px);box-shadow:0 18px 50px rgba(255,107,157,.2)}}
.bw-wtxt{font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1rem,3vw,1.2rem);line-height:1.75;color:#f5d0fe;position:relative;z-index:1}
.bw-wem{font-size:1.8rem;display:block;margin-top:.8rem;position:relative;z-index:1}

/* ── WHY SPECIAL ───────────────────────────── */
.bw-type{font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1rem,3.5vw,1.5rem);color:var(--bl);line-height:1.8;
  min-height:3.2em;background:var(--glass);border:1px solid var(--gb);
  backdrop-filter:blur(16px);border-radius:1.2rem;padding:1.2rem 1.5rem;margin-bottom:1.8rem}
.bw-cursor{animation:bwBlink .85s step-end infinite}
.bw-cursor.off{opacity:0;animation:none}
@keyframes bwBlink{0%,100%{opacity:1}50%{opacity:0}}

.bw-sp-list{display:flex;flex-direction:column;gap:1rem}
.bw-sp-item{background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(18px);
  border-radius:1.4rem;padding:1.3rem 1.5rem;display:flex;align-items:center;gap:1.2rem;
  transition:opacity .65s ease,transform .65s ease}
.bw-sp-ico{font-size:clamp(1.8rem,5vw,2.8rem);flex-shrink:0}
.bw-sp-txt{font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(.95rem,2.8vw,1.2rem);color:var(--bc);line-height:1.65}

/* alternate even items on desktop */
@media(min-width:640px){
  .bw-sp-item:nth-child(even){flex-direction:row-reverse;text-align:right}
}

/* ── EMOTIONAL MESSAGE ─────────────────────── */
.bw-emo-wrap{position:relative;z-index:10}
.bw-emo-card{max-width:780px;margin:0 auto;text-align:center;
  background:linear-gradient(135deg,rgba(255,107,157,.08),rgba(192,132,252,.08));
  border:1px solid rgba(255,107,157,.25);backdrop-filter:blur(28px);
  border-radius:2rem;padding:clamp(1.5rem,5vw,4rem) clamp(1.2rem,4vw,3.5rem);
  position:relative;overflow:hidden}
.bw-emo-card::before{content:'❝';position:absolute;top:-.5rem;left:1rem;
  font-size:6rem;color:rgba(255,107,157,.08);font-family:'Playfair Display',serif;
  line-height:1;pointer-events:none}
.bw-emo-p{font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1rem,2.8vw,1.3rem);line-height:2;color:var(--bc)}
.bw-emo-p strong{-webkit-text-fill-color:transparent;
  background:linear-gradient(90deg,var(--br),var(--bg));
  -webkit-background-clip:text;background-clip:text;font-style:normal}

/* ── SURPRISE ──────────────────────────────── */
.bw-surp-sec{text-align:center;padding:clamp(2rem,6vw,4rem) 1rem;position:relative;z-index:10}
.bw-surp-btn{font-family:'Dancing Script',cursive;font-size:clamp(1.1rem,4vw,1.6rem);
  padding:.9rem 2.5rem;border:none;border-radius:50px;
  background:linear-gradient(135deg,#ff6b9d,#c084fc,#fbbf24,#ff6b9d);background-size:300% auto;
  color:#fff;cursor:pointer;animation:bwSh 4s linear infinite;
  box-shadow:0 0 40px rgba(255,107,157,.4);transition:transform .3s,box-shadow .3s;
  touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.bw-surp-btn:active{transform:scale(.97)}
@media(hover:hover){.bw-surp-btn:hover{transform:scale(1.07) rotate(-2deg);box-shadow:0 0 65px rgba(255,107,157,.65)}}
.bw-surp-msg{margin:1.5rem auto 0;max-width:560px;
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1rem,3vw,1.4rem);color:var(--bc);
  background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(20px);
  border-radius:1.5rem;padding:1.5rem;animation:bwFS .7s ease}

/* ── FINAL ─────────────────────────────────── */
.bw-final{min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:3rem 1.2rem;position:relative;z-index:10;
  background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(255,107,157,.1),transparent)}
.bw-f-rings span{position:absolute;top:50%;left:50%;border-radius:50%;
  transform:translate(-50%,-50%);animation:bwRP 5s ease-in-out infinite}
.bw-f-rings span:nth-child(1){width:min(280px,78vw);height:min(280px,78vw);border:1px solid rgba(255,107,157,.1)}
.bw-f-rings span:nth-child(2){width:min(500px,90vw);height:min(500px,90vw);border:1px solid rgba(251,191,36,.07);animation-delay:1s}
.bw-f-ttl{font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(2rem,9vw,6rem);line-height:1.1;
  background:linear-gradient(135deg,#fff,#fbbf24 45%,#fff);background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:bwSh 5s linear infinite;filter:drop-shadow(0 0 40px #fbbf2477);
  word-break:break-word;padding:0 1rem}
.bw-f-sub{font-family:'Dancing Script',cursive;font-size:clamp(1.3rem,5vw,2.5rem);
  color:var(--br);margin:1rem 0 1.5rem;filter:drop-shadow(0 0 18px var(--br))}
.bw-f-hearts{font-size:clamp(1.8rem,6vw,3rem);animation:bwHB 1.6s ease-in-out infinite}
@keyframes bwHB{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
.bw-f-quote{margin-top:1.5rem;font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(.9rem,2.8vw,1.2rem);color:var(--bc);max-width:480px;line-height:1.85;
  padding:0 1rem}
.bw-f-icons{margin-top:2rem;font-size:clamp(1.6rem,5vw,2.8rem);animation:bwHB 2s infinite}

/* ── FLOATING SURPRISE EMOJI (JS-injected) ─── */
@keyframes bwHF{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% - 120px)) scale(.2)}}
`;