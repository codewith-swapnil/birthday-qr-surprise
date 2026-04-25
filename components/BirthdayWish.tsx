'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WishData, getOrdinal } from '@/lib/utils';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });
const Balloons = dynamic(() => import('@/components/Balloons'), { ssr: false });
const ConfettiEffect = dynamic(() => import('@/components/ConfettiEffect'), { ssr: false });

interface BirthdayWishProps {
  rawData: WishData | null;
  slug: string;
}

const BIRTHDAY_IMAGES = [
  { emoji: '🎂', bg: 'linear-gradient(135deg, #ff6b9d 0%, #ff8e53 100%)', label: 'Celebration' },
  { emoji: '🎉', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Party' },
  { emoji: '🎈', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Balloons' },
  { emoji: '✨', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Magic' },
  { emoji: '🥳', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Joy' },
];

const EMOJI_REACTIONS = ['❤️', '🔥', '🥹', '😍', '🫶', '💯'];

export default function BirthdayWish({ rawData, slug }: BirthdayWishProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const emojiIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(() => setConfettiTriggered(true), 300);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((i) => (i + 1) % BIRTHDAY_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleReaction(emoji: string) {
    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));

    // Floating emoji animation
    const id = ++emojiIdRef.current;
    const x = 10 + Math.random() * 80;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  }

  const whatsappShare = () => {
    const baseUrl = window.location.origin;
    const msg = encodeURIComponent(
      `🎉 I just found the most beautiful birthday surprise!\n\nCheck it out: ${window.location.href}\n\nCreate your own at ${baseUrl} 🎂`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (!rawData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #1a0058 0%, #030014 60%)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎂</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: '#fde68a',
            marginBottom: '1rem',
          }}
        >
          Oops! Wish Not Found
        </h1>
        <p style={{ color: 'rgba(248,244,255,0.5)', marginBottom: '2rem', maxWidth: 400 }}>
          This birthday wish link may be invalid or expired. Create a fresh one below!
        </p>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            color: '#030014',
            padding: '1rem 2.5rem',
            borderRadius: '1rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          🎉 Create a Birthday Wish
        </Link>
      </div>
    );
  }

  const { name, age, message } = rawData;
  const ordinal = getOrdinal(Number(age));
  const currentSlide = BIRTHDAY_IMAGES[slideIndex];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 10%, #200060 0%, #030014 55%, #0d001f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background layers */}
      <StarField />
      <Balloons count={14} size="lg" />
      <ConfettiEffect trigger={confettiTriggered} loop />

      {/* Floating emoji reactions */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
        {floatingEmojis.map(({ id, emoji, x }) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              bottom: '10%',
              left: `${x}%`,
              fontSize: '2rem',
              animation: 'floatUp 2s ease-out forwards',
              zIndex: 51,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Top Ad Banner */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0.75rem 1rem',
          maxWidth: '900px',
          margin: '0 auto',
          paddingTop: '1rem',
        }}
      >
        <div className="ad-slot h-14 rounded-xl">
          <span>Advertisement</span>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem 1rem 4rem',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Image Slider */}
          <div
            style={{
              width: 160,
              height: 160,
              margin: '0 auto 2rem',
              borderRadius: '50%',
              background: currentSlide.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
              boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 120px rgba(251,191,36,0.1)',
              transition: 'background 0.8s ease, box-shadow 0.8s ease',
              animation: 'pulseGlow 3s ease-in-out infinite',
              position: 'relative',
            }}
          >
            <span style={{ transition: 'all 0.5s ease' }}>{currentSlide.emoji}</span>

            {/* Pulse rings */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: -(i * 20),
                  borderRadius: '50%',
                  border: '1px solid rgba(251,191,36,0.15)',
                  animation: `pulseRing ${2 + i * 0.5}s ease-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Slide dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: '2rem' }}>
            {BIRTHDAY_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                style={{
                  width: i === slideIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === slideIndex ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Happy Birthday Heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(248,244,255,0.5)',
                marginBottom: '0.75rem',
              }}
            >
              🎊 &nbsp; A Special Wish For &nbsp; 🎊
            </p>
            <h1
              className="gold-text"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {name}
            </h1>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '2rem',
                padding: '0.5rem 1.5rem',
                marginTop: '1rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🎈</span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: '#fde68a',
                  fontStyle: 'italic',
                }}
              >
                Happy {ordinal} Birthday!
              </span>
              <span style={{ fontSize: '1.25rem' }}>🎈</span>
            </div>
          </div>
        </div>

        {/* Message Card */}
        <div
          className="glass-gold"
          style={{
            borderRadius: '2rem',
            padding: '2.5rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          {/* Decorative quotes */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              fontSize: '5rem',
              color: 'rgba(251,191,36,0.08)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            "
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 20,
              fontSize: '5rem',
              color: 'rgba(251,191,36,0.08)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            "
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(251,191,36,0.7)',
                marginBottom: '1.25rem',
              }}
            >
              💌 &nbsp; A Message For You
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                lineHeight: 1.7,
                color: 'rgba(248,244,255,0.88)',
                fontStyle: 'italic',
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Age Celebration Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s',
          }}
        >
          {['🎂', '🎂', '🎂'].slice(0, Math.min(3, Number(age))).map((e, i) => (
            <span key={i} style={{ fontSize: '1.75rem', animation: `float ${3 + i}s ease-in-out ${i * 0.4}s infinite` }}>
              {e}
            </span>
          ))}
          <div
            className="glass"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '3rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 900,
                color: '#fbbf24',
              }}
            >
              {age}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: 'rgba(248,244,255,0.6)',
                marginLeft: '0.4rem',
              }}
            >
              years of awesome! 🌟
            </span>
          </div>
          {['🥳', '🥳', '🥳'].slice(0, Math.min(3, Number(age))).map((e, i) => (
            <span key={i} style={{ fontSize: '1.75rem', animation: `float ${4 + i}s ease-in-out ${i * 0.3}s infinite` }}>
              {e}
            </span>
          ))}
        </div>

        {/* Middle Ad */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="ad-slot h-20 rounded-xl">
            <span>Advertisement</span>
          </div>
        </div>

        {/* Emoji Reactions */}
        <div
          className="glass"
          style={{
            borderRadius: '2rem',
            padding: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(248,244,255,0.4)',
              marginBottom: '1.25rem',
            }}
          >
            React to this wish!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                style={{
                  background: reactions[emoji]
                    ? 'rgba(251,191,36,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: reactions[emoji]
                    ? '1px solid rgba(251,191,36,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '3rem',
                  padding: '0.6rem 1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  transform: reactions[emoji] ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span>{emoji}</span>
                {reactions[emoji] ? (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#fbbf24',
                      fontWeight: 700,
                    }}
                  >
                    {reactions[emoji]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* WhatsApp Share */}
          <button
            onClick={whatsappShare}
            className="share-btn"
            style={{
              background: 'linear-gradient(135deg, #25d366, #128c7e)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </button>

          {/* Create Your Own */}
          <Link
            href="/"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
              color: '#030014',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            🎉 Create Your Own Surprise
          </Link>
        </div>

        {/* Wishes Strip */}
        <div
          className="glass"
          style={{
            borderRadius: '2rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              color: 'rgba(248,244,255,0.7)',
              lineHeight: 1.8,
            }}
          >
            May your {ordinal} birthday be filled with{' '}
            <span style={{ color: '#fbbf24' }}>endless joy</span>,{' '}
            <span style={{ color: '#ff6b9d' }}>laughter</span>, and all the{' '}
            <span style={{ color: '#34d399' }}>love</span> in the world.{' '}
            Here's to you, <strong style={{ color: '#fde68a', fontStyle: 'italic' }}>{name}</strong> — you deserve every bit of it! 🥂✨
          </p>
        </div>

        {/* Bottom Ad */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="ad-slot h-20 rounded-xl">
            <span>Advertisement</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(248,244,255,0.3)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            Want to create a birthday surprise like this?
          </p>
          <Link
            href="/"
            style={{
              color: '#fbbf24',
              fontSize: '0.9rem',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(251,191,36,0.3)',
              paddingBottom: 2,
            }}
          >
            Visit Birthday QR Surprise →
          </Link>
          <p style={{ color: 'rgba(248,244,255,0.15)', fontSize: '0.7rem', marginTop: '1.5rem' }}>
            © {new Date().getFullYear()} Birthday QR Surprise · Free Birthday Wish Generator
          </p>
        </div>
      </div>

      {/* Inline styles for animations not in Tailwind */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 80px rgba(251,191,36,0.6), 0 0 120px rgba(251,191,36,0.2); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </main>
  );
}
