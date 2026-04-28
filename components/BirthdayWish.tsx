'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { WishData, getOrdinal } from '@/lib/utils';
import dynamic from 'next/dynamic';
const ImageSlider = dynamic(() => import('@/components/ImageSlider'), { ssr: false });


interface BirthdayWishProps {
  rawData: WishData | null;
  slug: string;
}

// Happy Birthday melody: [frequency_hz, duration_sec]
const MELODY: Array<[number, number]> = [
  [392,0.3],[392,0.15],[440,0.45],[392,0.45],[523.25,0.45],[493.88,0.85],
  [392,0.3],[392,0.15],[440,0.45],[392,0.45],[587.33,0.45],[523.25,0.85],
  [392,0.3],[392,0.15],[783.99,0.45],[659.25,0.45],[523.25,0.45],[493.88,0.45],[440,0.85],
  [698.46,0.3],[698.46,0.15],[659.25,0.45],[523.25,0.45],[587.33,0.45],[523.25,1.1],
];

const SLIDES = [
  { emoji:'🎂', bg:'linear-gradient(135deg,#ff6b9d,#ff8e53)', glow:'#ff6b9d55' },
  { emoji:'🎉', bg:'linear-gradient(135deg,#667eea,#764ba2)', glow:'#764ba255' },
  { emoji:'🌟', bg:'linear-gradient(135deg,#f093fb,#f5576c)', glow:'#f093fb55' },
  { emoji:'🥳', bg:'linear-gradient(135deg,#43e97b,#38f9d7)', glow:'#43e97b55' },
  { emoji:'💫', bg:'linear-gradient(135deg,#4facfe,#00f2fe)', glow:'#4facfe55' },
];

const WISHES = [
  {
    lang:'English', flag:'🇬🇧',
    text:'May this birthday be the beginning of a year filled with beautiful moments, great achievements, and endless happiness. You truly deserve the world! 🌎',
  },
  {
    lang:'Hindi', flag:'🇮🇳',
    text:'आपको जन्मदिन की हार्दिक शुभकामनाएं! ईश्वर आपकी हर मनोकामना पूरी करें और आपका जीवन खुशियों से भरा रहे। 🎂✨',
  },
  {
    lang:'Marathi', flag:'🌸',
    text:'वाढदिवसाच्या हार्दिक शुभेच्छा! तुमचा हा वाढदिवस आनंद, प्रेम आणि यशाने भरलेला असो! 🎉💝',
  },
];

const REACTIONS = ['❤️','🔥','🥹','😍','🫶','💯','🎊','✨'];

export default function BirthdayWish({ rawData, slug }: BirthdayWishProps) {
  // Phase
  const [phase, setPhase]         = useState<'intro'|'main'>('intro');
  const [introOut, setIntroOut]   = useState(false);

  // Music
  const [musicOn, setMusicOn]     = useState(false);
  const audioCtxRef               = useRef<AudioContext | null>(null);
  const musicActiveRef            = useRef(false);

  // Content reveal
  const [nameVisible, setNameVisible]     = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [typedMsg, setTypedMsg]           = useState('');
  const [typingDone, setTypingDone]       = useState(false);

  // Interactions
  const [surprised, setSurprised]   = useState(false);
  const [shaking, setShaking]       = useState(false);
  const [reactions, setReactions]   = useState<Record<string,number>>({});
  const [floaters, setFloaters]     = useState<Array<{id:number;emoji:string;x:number;y:number;size:number}>>([]);
  const floatId                     = useRef(0);

  // Carousel
  const [slideIdx, setSlideIdx]   = useState(0);
  const [langIdx, setLangIdx]     = useState(0);
  const [langKey, setLangKey]     = useState(0);

  // Image slider fallback (if all Cloudinary images fail)
  const [useEmojiSlider, setUseEmojiSlider] = useState(false);

  // Share
  const [copied, setCopied]       = useState(false);

  const message = rawData?.message ?? '';
  const name    = rawData?.name    ?? '';
  const age     = rawData?.age     ?? '';

  /* ─── INTRO → MAIN ──────────────────────────────────── */
  useEffect(() => {
    const t1 = setTimeout(() => setIntroOut(true), 3200);
    const t2 = setTimeout(() => {
      setPhase('main');
      setTimeout(() => setNameVisible(true), 300);
      setTimeout(() => setContentVisible(true), 900);
    }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* ─── TYPEWRITER ─────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'main' || !message) return;
    let i = 0;
    const timer = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setTypedMsg(message.slice(0, i));
        if (i >= message.length) { clearInterval(iv); setTypingDone(true); }
      }, 38);
      return () => clearInterval(iv);
    }, 1400);
    return () => clearTimeout(timer);
  }, [phase, message]);

  /* ─── AUTO SLIDE ─────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'main') return;
    const iv = setInterval(() => setSlideIdx(i => (i+1)%SLIDES.length), 3000);
    return () => clearInterval(iv);
  }, [phase]);

  /* ─── LANGUAGE ROTATE ────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'main') return;
    const iv = setInterval(() => {
      setLangIdx(i => (i+1)%WISHES.length);
      setLangKey(k => k+1);
    }, 4500);
    return () => clearInterval(iv);
  }, [phase]);

  /* ─── AMBIENT SPARKLES ───────────────────────────────── */
  useEffect(() => {
    if (phase !== 'main') return;
    const sparkEmojis = ['✨','💫','⭐','🌟'];
    const iv = setInterval(() => {
      const id = ++floatId.current;
      setFloaters(prev => [...prev, {
        id,
        emoji: sparkEmojis[Math.floor(Math.random() * sparkEmojis.length)],
        x: 2 + Math.random() * 96,
        y: 5 + Math.random() * 85,
        size: 0.7 + Math.random() * 0.8,
      }]);
      setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 3500);
    }, 1200);
    return () => clearInterval(iv);
  }, [phase]);

  /* ─── MUSIC (Web Audio API) ──────────────────────────── */
  function playNote(ctx: AudioContext, freq: number, start: number, dur: number, vol = 0.07) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.06);
    gain.gain.linearRampToValueAtTime(0, start + dur * 0.85);
    osc.start(start);
    osc.stop(start + dur);
  }

  const scheduleMelody = useCallback((ctx: AudioContext) => {
    let t = ctx.currentTime + 0.1;
    for (const [freq, dur] of MELODY) {
      playNote(ctx, freq, t, dur, 0.07);
      if (freq > 420) playNote(ctx, freq * 0.5, t, dur, 0.025);
      t += dur + 0.04;
    }
    const total = MELODY.reduce((s,[,d]) => s + d + 0.04, 0.1);
    setTimeout(() => { if (musicActiveRef.current) scheduleMelody(ctx); }, total * 1000);
  }, []);

  function toggleMusic() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (!musicOn) {
      musicActiveRef.current = true;
      setMusicOn(true);
      if (ctx.state === 'suspended') ctx.resume();
      scheduleMelody(ctx);
    } else {
      musicActiveRef.current = false;
      setMusicOn(false);
      ctx.suspend();
    }
  }

  /* ─── SURPRISE ───────────────────────────────────────── */
  async function activateSurprise() {
    setSurprised(true);
    setShaking(true);
    setTimeout(() => setShaking(false), 700);

    const confetti = (await import('canvas-confetti')).default;
    const colors = ['#fbbf24','#ff6b9d','#34d399','#60a5fa','#a78bfa','#fb923c','#fde68a'];

    confetti({ particleCount:160, spread:130, origin:{x:0.5,y:0.35}, colors, gravity:0.65, scalar:1.3 });
    setTimeout(() => confetti({ particleCount:100, spread:110, origin:{x:0.15,y:0.5}, colors }), 180);
    setTimeout(() => confetti({ particleCount:100, spread:110, origin:{x:0.85,y:0.5}, colors }), 320);
    setTimeout(() => confetti({ particleCount:80,  spread:90,  origin:{x:0.5, y:0.65}, colors, angle:90 }), 480);
    setTimeout(() => confetti({ particleCount:60,  spread:160, origin:{x:0.5, y:0.2}, colors, gravity:1.2 }), 650);

    const burst = ['❤️','🎉','✨','🎊','💫','🌟','🎈','💝','🥳','🎁'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const id = ++floatId.current;
        setFloaters(prev => [...prev, {
          id,
          emoji: burst[Math.floor(Math.random() * burst.length)],
          x: 5 + Math.random() * 90,
          y: 10 + Math.random() * 80,
          size: 1 + Math.random() * 1.5,
        }]);
        setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 2800);
      }, i * 80);
    }
  }

  /* ─── REACTION ───────────────────────────────────────── */
  function addReaction(emoji: string) {
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji]||0)+1 }));
    const id = ++floatId.current;
    setFloaters(prev => [...prev, { id, emoji, x:15+Math.random()*70, y:40+Math.random()*40, size:1.2+Math.random()*0.8 }]);
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 2200);
  }

  /* ─── SHARE ──────────────────────────────────────────── */
  async function copyLink() {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareWhatsApp() {
    const url = window.location.href;
    const msg = encodeURIComponent(`🎉 *Happy Birthday ${name}!* 🎂\n\nI made you a special birthday surprise — open this!\n\n${url}\n\n💝 Create yours at ${window.location.origin}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  /* ─── NOT FOUND ──────────────────────────────────────── */
  if (!rawData) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#030014', padding:'2rem', textAlign:'center' }}>
      <div style={{ fontSize:'5rem', marginBottom:'1.5rem' }}>🎂</div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'#fde68a', marginBottom:'1rem' }}>Oops! Wish Not Found</h1>
      <p style={{ color:'rgba(248,244,255,0.5)', marginBottom:'2rem', maxWidth:400 }}>This link may be invalid or expired. Create a fresh one!</p>
      <Link href="/" style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'#030014', padding:'1rem 2.5rem', borderRadius:'1rem', fontWeight:700, textDecoration:'none', display:'inline-block' }}>
        🎉 Create a Birthday Wish
      </Link>
    </div>
  );

  const ordinal = getOrdinal(Number(age));
  const slide   = SLIDES[slideIdx];
  const wish    = WISHES[langIdx];

  return (
    <>
      {/* ───── ALL KEYFRAMES ───── */}
      <style>{`
        @keyframes introIn   { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes introOut  { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(1.06)} }
        @keyframes nameReveal {
          0%   { opacity:0; transform:translateY(50px) scale(.85); filter:blur(16px); }
          60%  { filter:blur(0); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        @keyframes glowPulse {
          0%,100% { text-shadow:0 0 30px rgba(251,191,36,.5),0 0 60px rgba(251,191,36,.25); }
          50%     { text-shadow:0 0 60px rgba(251,191,36,.9),0 0 100px rgba(251,191,36,.5),0 0 140px rgba(251,191,36,.2); }
        }
        @keyframes goldShimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatEmoji {
          0%   { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
          80%  { opacity:.8; }
          100% { opacity:0; transform:translateY(-220px) scale(1.6) rotate(20deg); }
        }
        @keyframes shake {
          0%,100%{ transform:translateX(0) rotate(0); }
          15%    { transform:translateX(-9px) rotate(-1.5deg); }
          30%    { transform:translateX(9px)  rotate(1.5deg); }
          45%    { transform:translateX(-6px); }
          60%    { transform:translateX(6px); }
          75%    { transform:translateX(-3px); }
          90%    { transform:translateX(3px); }
        }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float {
          0%,100%{ transform:translateY(0) rotate(0deg); }
          33%    { transform:translateY(-14px) rotate(4deg); }
          66%    { transform:translateY(-7px) rotate(-3deg); }
        }
        @keyframes orb1 {
          0%,100%{ transform:translate(0,0) scale(1); }
          33%    { transform:translate(40px,-30px) scale(1.12); }
          66%    { transform:translate(-25px,20px) scale(.9); }
        }
        @keyframes orb2 {
          0%,100%{ transform:translate(0,0) scale(1); }
          33%    { transform:translate(-35px,25px) scale(.88); }
          66%    { transform:translate(20px,-15px) scale(1.1); }
        }
        @keyframes langSlide {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideIn {
          from { opacity:0; transform:scale(.92) translateX(12px); }
          to   { opacity:1; transform:scale(1) translateX(0); }
        }
        @keyframes surpriseGlow {
          0%,100%{ box-shadow:0 0 30px rgba(251,191,36,.3); }
          50%    { box-shadow:0 0 80px rgba(251,191,36,.8),0 0 140px rgba(251,191,36,.4); }
        }
        @keyframes heartBeat {
          0%,100%{ transform:scale(1); }
          25%    { transform:scale(1.35); }
          50%    { transform:scale(1); }
          75%    { transform:scale(1.2); }
        }
        @keyframes pulseDot {
          0%,100%{ transform:scale(1); opacity:.6; }
          50%    { transform:scale(1.5); opacity:1; }
        }
        .gold-shimmer-text {
          background:linear-gradient(90deg,#f59e0b,#fde68a,#fbbf24,#fde68a,#f59e0b);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:goldShimmer 3s linear infinite;
        }
        .name-glow { animation:glowPulse 2.5s ease-in-out infinite; }
        .glass-card {
          background:rgba(255,255,255,.04);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,.08);
        }
        .glass-gold {
          background:rgba(251,191,36,.06);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(251,191,36,.18);
        }
      `}</style>

      {/* ───── FLOATING EMOJI LAYER ───── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
        {floaters.map(f => (
          <span key={f.id} style={{
            position:'absolute',
            left:`${f.x}%`,
            top:`${f.y}%`,
            fontSize:`${f.size * 1.8}rem`,
            animation:'floatEmoji 2.6s ease-out forwards',
            userSelect:'none',
            lineHeight:1,
          }}>{f.emoji}</span>
        ))}
      </div>

      {/* ───── MUSIC TOGGLE (fixed) ───── */}
      {phase === 'main' && (
        <button
          onClick={toggleMusic}
          title={musicOn ? 'Mute music' : 'Play music'}
          style={{
            position:'fixed', top:16, right:16, zIndex:200,
            width:44, height:44, borderRadius:'50%',
            background:musicOn ? 'rgba(251,191,36,.2)' : 'rgba(255,255,255,.07)',
            border:`1px solid ${musicOn ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.12)'}`,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.2rem', transition:'all .3s ease',
            backdropFilter:'blur(10px)',
          }}
        >
          {musicOn ? '🎵' : '🔇'}
        </button>
      )}

      {/* ───── CINEMATIC INTRO ───── */}
      {phase === 'intro' && (
        <div style={{
          position:'fixed', inset:0, zIndex:500,
          background:'#000000',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          animation:`${introOut ? 'introOut' : 'introIn'} .7s cubic-bezier(.16,1,.3,1) both`,
        }}>
          {/* Subtle radial glow */}
          <div style={{
            position:'absolute', inset:0,
            background:'radial-gradient(ellipse at center,rgba(251,191,36,.06) 0%,transparent 70%)',
            pointerEvents:'none',
          }}/>

          <div style={{ position:'relative', textAlign:'center', padding:'0 2rem' }}>
            {/* Gift icon */}
            <div style={{
              fontSize:'4rem', marginBottom:'2rem',
              animation:'float 3s ease-in-out infinite',
              display:'inline-block',
            }}>🎁</div>

            <p style={{
              fontFamily:'var(--font-display)',
              fontSize:'clamp(1.4rem,5vw,2.2rem)',
              color:'rgba(255,255,255,.9)',
              letterSpacing:'0.02em',
              lineHeight:1.5,
              animation:'fadeUp .8s ease-out .4s both',
            }}>
              Someone has a
            </p>
            <p style={{
              fontFamily:'var(--font-display)',
              fontSize:'clamp(1.8rem,6vw,2.8rem)',
              fontWeight:700,
              letterSpacing:'0.02em',
              animation:'fadeUp .8s ease-out .7s both',
            }} className="gold-shimmer-text">
              surprise for you…
            </p>

            {/* Animated dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:'2.5rem', animation:'fadeUp .5s ease-out 1.2s both' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:7, height:7, borderRadius:'50%', background:'rgba(251,191,36,.6)',
                  animation:`pulseDot 1.4s ease-in-out ${i*0.25}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───── MAIN EXPERIENCE ───── */}
      <main style={{
        minHeight:'100vh',
        background:'radial-gradient(ellipse at 25% 15%,#1e005a 0%,#030014 55%,#0d001a 100%)',
        position:'relative', overflowX:'hidden',
        opacity: phase === 'main' ? 1 : 0,
        transition:'opacity .8s ease',
        animation: shaking ? 'shake .6s cubic-bezier(.36,.07,.19,.97) both' : 'none',
      }}>

        {/* Ambient orbs */}
        <div aria-hidden style={{
          position:'fixed', top:'-15%', left:'-10%', width:'60vw', height:'60vw',
          background:'radial-gradient(circle,rgba(120,60,255,.18) 0%,transparent 70%)',
          borderRadius:'50%', pointerEvents:'none',
          animation:'orb1 18s ease-in-out infinite',
        }}/>
        <div aria-hidden style={{
          position:'fixed', bottom:'-20%', right:'-15%', width:'55vw', height:'55vw',
          background:'radial-gradient(circle,rgba(255,107,157,.12) 0%,transparent 70%)',
          borderRadius:'50%', pointerEvents:'none',
          animation:'orb2 22s ease-in-out infinite',
        }}/>
        <div aria-hidden style={{
          position:'fixed', top:'40%', right:'5%', width:'30vw', height:'30vw',
          background:'radial-gradient(circle,rgba(251,191,36,.07) 0%,transparent 70%)',
          borderRadius:'50%', pointerEvents:'none',
        }}/>

        {/* Star field */}
        <StarParticles />

        <div style={{ position:'relative', zIndex:10, maxWidth:860, margin:'0 auto', padding:'2rem 1.25rem 5rem' }}>

          {/* ── TOP AD SLOT ── */}
          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ background:'rgba(255,255,255,.03)', border:'1px dashed rgba(255,255,255,.08)', borderRadius:10, height:56, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.15)', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }}>
              Advertisement
            </div>
          </div>

          {/* ── HERO: REAL PHOTOS or EMOJI FALLBACK ── */}
          <section style={{ textAlign:'center', marginBottom:'3rem' }}>

            {/* ── Real photo slider (when Cloudinary images exist) ── */}
            {rawData.images && rawData.images.length > 0 && !useEmojiSlider && (
              <div style={{ marginBottom:'2rem', borderRadius:'1.5rem', overflow:'hidden', boxShadow:'0 0 60px rgba(251,191,36,.15), 0 30px 60px rgba(0,0,0,.5)' }}>
                <ImageSlider
                  images={rawData.images}
                  name={name}
                  onAllFailed={() => setUseEmojiSlider(true)}
                />
              </div>
            )}

            {/* ── Emoji slider fallback ── */}
            {(!rawData.images || rawData.images.length === 0 || useEmojiSlider) && (
              <>
                <div style={{
                  position:'relative', width:170, height:170,
                  margin:'0 auto 2.5rem',
                  borderRadius:'50%',
                  background:slide.bg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'5.5rem',
                  boxShadow:`0 0 60px ${slide.glow},0 0 120px ${slide.glow}`,
                  transition:'background .8s ease, box-shadow .8s ease',
                  animation:'slideIn .5s ease-out, surpriseGlow 4s ease-in-out infinite',
                }}>
                  <span key={slideIdx} style={{ animation:'slideIn .4s ease-out' }}>{slide.emoji}</span>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      position:'absolute', inset:-(i*20), borderRadius:'50%',
                      border:'1px solid rgba(251,191,36,.12)',
                      animation:`heartBeat ${2.5+i*.5}s ease-in-out ${i*.35}s infinite`,
                    }}/>
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:'2.5rem' }}>
                  {SLIDES.map((_,i) => (
                    <button key={i} onClick={() => setSlideIdx(i)} style={{
                      width:i===slideIdx?26:8, height:8, borderRadius:4,
                      background:i===slideIdx?'#fbbf24':'rgba(255,255,255,.2)',
                      border:'none', cursor:'pointer', transition:'all .3s ease', padding:0,
                    }}/>
                  ))}
                </div>
              </>
            )}

            {/* Label */}
            <p style={{
              fontSize:'.78rem', letterSpacing:'.3em', textTransform:'uppercase',
              color:'rgba(248,244,255,.45)', marginBottom:'.8rem',
              animation:contentVisible?'fadeUp .6s ease-out both':'none',
            }}>
              🎊 &nbsp; A special wish for &nbsp; 🎊
            </p>

            {/* NAME HERO */}
            <h1
              className="gold-shimmer-text name-glow"
              style={{
                fontFamily:'var(--font-display)',
                fontSize:'clamp(3.2rem,11vw,6rem)',
                fontWeight:900,
                lineHeight:1,
                marginBottom:'1rem',
                animation:nameVisible?'nameReveal .9s cubic-bezier(.16,1,.3,1) both':'none',
                opacity:nameVisible?undefined:0,
              }}
            >
              {name}
            </h1>

            {/* Age badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'.6rem',
              background:'rgba(251,191,36,.08)',
              border:'1px solid rgba(251,191,36,.22)',
              borderRadius:'3rem', padding:'.55rem 1.6rem',
              animation:contentVisible?'fadeUp .6s ease-out .3s both':'none',
              opacity:contentVisible?undefined:0,
            }}>
              <span style={{ fontSize:'1.3rem' }}>🎈</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'#fde68a', fontStyle:'italic' }}>
                Happy {ordinal} Birthday!
              </span>
              <span style={{ fontSize:'1.3rem' }}>🎈</span>
            </div>
          </section>

          {/* ── MESSAGE CARD (Typewriter) ── */}
          <section style={{
            marginBottom:'2rem',
            animation:contentVisible?'fadeUp .7s ease-out .5s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <div className="glass-gold" style={{ borderRadius:'2rem', padding:'2.5rem', position:'relative', overflow:'hidden' }}>
              {/* Decorative quotes */}
              <span style={{ position:'absolute', top:12, left:18, fontSize:'6rem', color:'rgba(251,191,36,.07)', fontFamily:'Georgia,serif', lineHeight:1, userSelect:'none', pointerEvents:'none' }}>"</span>
              <span style={{ position:'absolute', bottom:4, right:18, fontSize:'6rem', color:'rgba(251,191,36,.07)', fontFamily:'Georgia,serif', lineHeight:1, userSelect:'none', pointerEvents:'none' }}>"</span>

              <p style={{ fontSize:'.75rem', letterSpacing:'.25em', textTransform:'uppercase', color:'rgba(251,191,36,.7)', marginBottom:'1.25rem' }}>
                💌 &nbsp; A message just for you
              </p>
              <p style={{
                fontFamily:'var(--font-display)',
                fontSize:'clamp(1.05rem,2.8vw,1.35rem)',
                lineHeight:1.75,
                color:'rgba(248,244,255,.88)',
                fontStyle:'italic',
                minHeight:'4rem',
                position:'relative', zIndex:1,
              }}>
                {typedMsg}
                {!typingDone && (
                  <span style={{ display:'inline-block', width:2, height:'1.1em', background:'#fbbf24', marginLeft:3, verticalAlign:'text-bottom', animation:'cursorBlink 1s step-end infinite' }}/>
                )}
              </p>
            </div>
          </section>

          {/* ── AGE CELEBRATION STRIP ── */}
          <section style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem',
            marginBottom:'2.5rem', flexWrap:'wrap',
            animation:contentVisible?'fadeUp .6s ease-out .65s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            {['🎂','✨','🎂'].map((e,i)=>(
              <span key={i} style={{ fontSize:'1.8rem', animation:`float ${3+i}s ease-in-out ${i*.4}s infinite`, display:'inline-block' }}>{e}</span>
            ))}
            <div className="glass-card" style={{ padding:'.7rem 2rem', borderRadius:'3rem', textAlign:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', fontWeight:900, color:'#fbbf24' }}>{age}</span>
              <span style={{ fontFamily:'var(--font-display)', color:'rgba(248,244,255,.6)', marginLeft:'.4rem' }}>years of amazing! 🌟</span>
            </div>
            {['🥳','💫','🥳'].map((e,i)=>(
              <span key={i} style={{ fontSize:'1.8rem', animation:`float ${4+i}s ease-in-out ${i*.3}s infinite`, display:'inline-block' }}>{e}</span>
            ))}
          </section>

          {/* ── SURPRISE BUTTON ── */}
          <section style={{
            textAlign:'center', marginBottom:'2.5rem',
            animation:contentVisible?'fadeUp .6s ease-out .8s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <button
              onClick={activateSurprise}
              style={{
                background: surprised
                  ? 'linear-gradient(135deg,#f59e0b,#fbbf24,#f59e0b)'
                  : 'linear-gradient(135deg,#7c3aed,#9333ea,#c026d3)',
                color:'white', border:'none', cursor:'pointer',
                padding:'1.1rem 2.8rem', borderRadius:'4rem',
                fontSize:'1.1rem', fontWeight:700, fontFamily:'var(--font-body)',
                letterSpacing:'.03em',
                boxShadow: surprised
                  ? '0 0 40px rgba(251,191,36,.5),0 20px 40px rgba(251,191,36,.2)'
                  : '0 0 30px rgba(147,51,234,.4),0 20px 40px rgba(0,0,0,.3)',
                transition:'all .3s ease',
                transform:'translateZ(0)',
                animation: surprised ? 'surpriseGlow 2s ease-in-out infinite' : 'none',
              }}
            >
              {surprised ? '🎊 You\'re Loved! Tap Again!' : '🎁 Tap for a Surprise'}
            </button>
            <p style={{ marginTop:'.75rem', fontSize:'.78rem', color:'rgba(248,244,255,.3)' }}>
              Something magical awaits ✨
            </p>
          </section>

          {/* ── MID AD SLOT ── */}
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ background:'rgba(255,255,255,.03)', border:'1px dashed rgba(255,255,255,.08)', borderRadius:10, height:80, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.15)', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }}>
              Advertisement
            </div>
          </div>

          {/* ── MULTI-LANGUAGE WISHES ── */}
          <section style={{
            marginBottom:'2rem',
            animation:contentVisible?'fadeUp .6s ease-out .9s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <div className="glass-card" style={{ borderRadius:'2rem', overflow:'hidden' }}>
              {/* Language tabs */}
              <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                {WISHES.map((w,i)=>(
                  <button key={w.lang} onClick={()=>{ setLangIdx(i); setLangKey(k=>k+1); }} style={{
                    flex:1, padding:'.75rem .5rem', border:'none', cursor:'pointer',
                    background: i===langIdx ? 'rgba(251,191,36,.1)' : 'transparent',
                    borderBottom: i===langIdx ? '2px solid #fbbf24' : '2px solid transparent',
                    color: i===langIdx ? '#fbbf24' : 'rgba(248,244,255,.4)',
                    fontSize:'.78rem', fontWeight:600, transition:'all .25s ease',
                    fontFamily:'var(--font-body)',
                  }}>
                    {w.flag} {w.lang}
                  </button>
                ))}
              </div>

              <div key={langKey} style={{ padding:'1.8rem 2rem', animation:'langSlide .4s ease-out' }}>
                <p style={{
                  fontFamily: wish.lang==='English' ? 'var(--font-display)' : 'system-ui',
                  fontSize: wish.lang==='English' ? '1.1rem' : '1rem',
                  lineHeight:1.8, color:'rgba(248,244,255,.82)', fontStyle: wish.lang==='English' ? 'italic' : 'normal',
                }}>
                  {wish.text}
                </p>
              </div>
            </div>
          </section>

          {/* ── EMOJI REACTIONS ── */}
          <section style={{
            marginBottom:'2rem',
            animation:contentVisible?'fadeUp .6s ease-out 1s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <div className="glass-card" style={{ borderRadius:'2rem', padding:'1.75rem' }}>
              <p style={{ fontSize:'.75rem', letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(248,244,255,.35)', marginBottom:'1.1rem', textAlign:'center' }}>
                Send your love 💝
              </p>
              <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'.6rem' }}>
                {REACTIONS.map(emoji=>(
                  <button
                    key={emoji}
                    onClick={()=>addReaction(emoji)}
                    style={{
                      background: reactions[emoji] ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.04)',
                      border: reactions[emoji] ? '1px solid rgba(251,191,36,.35)' : '1px solid rgba(255,255,255,.07)',
                      borderRadius:'3rem', padding:'.55rem 1rem',
                      cursor:'pointer', display:'flex', alignItems:'center', gap:'.35rem',
                      fontSize:'1.3rem', transition:'all .2s ease',
                      transform: reactions[emoji] ? 'scale(1.06)' : 'scale(1)',
                    }}
                  >
                    <span>{emoji}</span>
                    {reactions[emoji]>0 && (
                      <span style={{ fontSize:'.72rem', fontWeight:700, color:'#fbbf24' }}>{reactions[emoji]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── SHARE SECTION ── */}
          <section style={{
            marginBottom:'2rem',
            animation:contentVisible?'fadeUp .6s ease-out 1.1s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <div className="glass-card" style={{ borderRadius:'2rem', padding:'1.75rem' }}>
              <p style={{ fontSize:'.75rem', letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(248,244,255,.35)', marginBottom:'1.1rem', textAlign:'center' }}>
                Share this surprise 🎉
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                <button
                  onClick={shareWhatsApp}
                  style={{
                    background:'linear-gradient(135deg,#25d366,#128c7e)',
                    color:'white', border:'none', cursor:'pointer',
                    padding:'1rem', borderRadius:'1rem',
                    fontWeight:700, fontSize:'.9rem', display:'flex',
                    alignItems:'center', justifyContent:'center', gap:'.5rem',
                    fontFamily:'var(--font-body)', transition:'transform .2s ease, box-shadow .2s ease',
                    boxShadow:'0 8px 24px rgba(37,211,102,.25)',
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}
                >
                  <WhatsAppIcon/> WhatsApp
                </button>

                <button
                  onClick={copyLink}
                  style={{
                    background: copied ? 'rgba(52,211,153,.15)' : 'rgba(251,191,36,.1)',
                    border: copied ? '1px solid rgba(52,211,153,.35)' : '1px solid rgba(251,191,36,.25)',
                    color: copied ? '#34d399' : '#fbbf24',
                    cursor:'pointer', padding:'1rem', borderRadius:'1rem',
                    fontWeight:700, fontSize:'.9rem', display:'flex',
                    alignItems:'center', justifyContent:'center', gap:'.5rem',
                    fontFamily:'var(--font-body)', transition:'all .25s ease',
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
            </div>
          </section>

          {/* ── BOTTOM AD ── */}
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ background:'rgba(255,255,255,.03)', border:'1px dashed rgba(255,255,255,.08)', borderRadius:10, height:80, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.15)', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }}>
              Advertisement
            </div>
          </div>

          {/* ── VIRAL FOOTER CTA ── */}
          <section style={{
            textAlign:'center',
            animation:contentVisible?'fadeUp .6s ease-out 1.2s both':'none',
            opacity:contentVisible?undefined:0,
          }}>
            <div className="glass-card" style={{ borderRadius:'2rem', padding:'2rem', position:'relative', overflow:'hidden' }}>
              <div style={{
                position:'absolute', inset:0,
                background:'radial-gradient(ellipse at center,rgba(251,191,36,.04) 0%,transparent 70%)',
                pointerEvents:'none',
              }}/>
              <p style={{ fontSize:'.78rem', letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(248,244,255,.3)', marginBottom:'.75rem' }}>
                Made with ❤️ just for you
              </p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'rgba(248,244,255,.7)', marginBottom:'1.25rem' }}>
                Want to create a surprise like this for someone special?
              </p>
              <Link
                href="/"
                style={{
                  display:'inline-flex', alignItems:'center', gap:'.5rem',
                  background:'linear-gradient(135deg,#f59e0b,#fbbf24,#d97706)',
                  color:'#030014', padding:'.9rem 2.2rem', borderRadius:'3rem',
                  fontWeight:700, textDecoration:'none', fontSize:'.95rem',
                  boxShadow:'0 10px 30px rgba(251,191,36,.3)',
                  transition:'transform .25s ease, box-shadow .25s ease',
                }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.transform='translateY(0)'; }}
              >
                🎉 Create Your Own Birthday Surprise
              </Link>
              <p style={{ marginTop:'1.5rem', fontSize:'.7rem', color:'rgba(248,244,255,.15)' }}>
                © {new Date().getFullYear()} Birthday QR Surprise · Free Birthday Wish Generator
              </p>
            </div>
          </section>

        </div>{/* /container */}
      </main>
    </>
  );
}

/* ───── STAR PARTICLES (inline, no extra file) ───── */
function StarParticles() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.innerHTML = '';
    for (let i = 0; i < 100; i++) {
      const s = document.createElement('div');
      const size = .8 + Math.random() * 2;
      s.style.cssText = `
        position:absolute;
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:white;
        animation:twinkle ${2+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite;
        opacity:${.15+Math.random()*.6};
      `;
      el.appendChild(s);
    }
  }, []);
  return <div ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} aria-hidden/>;
}

/* ───── WHATSAPP ICON ───── */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width:18, height:18, flexShrink:0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
