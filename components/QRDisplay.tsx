'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { WishData } from '@/types/wish';

// ── Dynamic imports (no SSR) ──────────────────────────────────────────────────
const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((m) => m.QRCodeCanvas),
  { ssr: false }
);
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => m.QRCodeSVG),
  { ssr: false }
);

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedWish { slug: string; url: string; data: WishData; }
interface QRDisplayProps { wish: GeneratedWish; onReset: () => void; }

// ── Constants ─────────────────────────────────────────────────────────────────
const LOGO_DATA_URL_KEY = 'https://wishqr.in/icons/android-chrome-192x192.png';

/**
 * Renders "WishQR" as a white pill with gold text onto an off-screen canvas
 * and returns a data URL. Cached on window to avoid re-rendering.
 */
function buildLogoDataUrl(size: number): string {
  if (typeof window === 'undefined') return '';
  const cacheKey = `${LOGO_DATA_URL_KEY}${size}`;
  if ((window as any)[cacheKey]) return (window as any)[cacheKey];

  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;

  // White pill background
  const r = size * 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  // Gold border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.roundRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth, r);
  ctx.stroke();

  // "W" emoji-style glyph
  ctx.font = `bold ${size * 0.38}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Gold gradient fill for text
  const grad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.8);
  grad.addColorStop(0, '#fbbf24');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillText('🎂', size / 2, size / 2);

  const url = c.toDataURL('image/png');
  (window as any)[cacheKey] = url;
  return url;
}

/**
 * Takes the raw black QR canvas, applies a gold→pink gradient overlay,
 * adds padding + white bg, and returns a download-ready blob URL.
 */
function buildDownloadBlob(
  rawCanvas: HTMLCanvasElement,
  slug: string,
): Promise<string> {
  return new Promise((resolve) => {
    const SIZE   = 480;
    const PAD    = 36;
    const BOTTOM = 72; // space for branding strip
    const out    = document.createElement('canvas');
    out.width    = SIZE;
    out.height   = SIZE + BOTTOM;
    const ctx    = out.getContext('2d')!;

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);

    // ── Subtle gold corner accents ────────────────────────────────────────────
    const accentSize = 28;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth   = 4;
    ctx.lineCap     = 'round';
    // TL
    ctx.beginPath(); ctx.moveTo(PAD, PAD + accentSize); ctx.lineTo(PAD, PAD); ctx.lineTo(PAD + accentSize, PAD); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(SIZE - PAD - accentSize, PAD); ctx.lineTo(SIZE - PAD, PAD); ctx.lineTo(SIZE - PAD, PAD + accentSize); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(PAD, SIZE - PAD - accentSize); ctx.lineTo(PAD, SIZE - PAD); ctx.lineTo(PAD + accentSize, SIZE - PAD); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(SIZE - PAD - accentSize, SIZE - PAD); ctx.lineTo(SIZE - PAD, SIZE - PAD); ctx.lineTo(SIZE - PAD, SIZE - PAD - accentSize); ctx.stroke();

    // ── QR scaled with gradient tint ──────────────────────────────────────────
    const qrSize = SIZE - PAD * 2;
    const offscreen = document.createElement('canvas');
    offscreen.width = qrSize; offscreen.height = qrSize;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.drawImage(rawCanvas, 0, 0, qrSize, qrSize);

    // Gradient overlay on dark pixels
    const imgData = offCtx.getImageData(0, 0, qrSize, qrSize);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 64) { // dark pixel → apply gradient colour
        const pct = (i / 4 / (qrSize * qrSize)); // 0→1 top-to-bottom
        // Interpolate #7c3aed → #ec4899 → #f59e0b
        const r = Math.round(pct < 0.5
          ? 124 + (pct * 2) * (236 - 124)
          : 236 + ((pct - 0.5) * 2) * (245 - 236));
        const g = Math.round(pct < 0.5
          ? 58  + (pct * 2) * (72  - 58 )
          : 72  + ((pct - 0.5) * 2) * (158 - 72 ));
        const b = Math.round(pct < 0.5
          ? 237 + (pct * 2) * (153 - 237)
          : 153 + ((pct - 0.5) * 2) * (11  - 153));
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(offscreen, PAD, PAD);

    // ── WishQR branding strip ────────────────────────────────────────────────
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(0, SIZE, out.width, BOTTOM);

    // Gold gradient for brand name
    const brandGrad = ctx.createLinearGradient(SIZE * 0.2, 0, SIZE * 0.8, 0);
    brandGrad.addColorStop(0, '#fbbf24');
    brandGrad.addColorStop(0.5, '#f9fafb');
    brandGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = brandGrad;
    ctx.font = `bold ${22}px 'Georgia', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎂 WishQR', SIZE / 2, SIZE + BOTTOM / 2 - 6);

    ctx.fillStyle = 'rgba(251,191,36,0.55)';
    ctx.font = `${11}px monospace`;
    ctx.fillText(`wishqr.app/${slug}`, SIZE / 2, SIZE + BOTTOM / 2 + 16);

    // ── Return blob URL ───────────────────────────────────────────────────────
    out.toBlob((blob) => {
      if (!blob) { resolve(''); return; }
      resolve(URL.createObjectURL(blob));
    }, 'image/png', 1.0);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Share option definitions
// ─────────────────────────────────────────────────────────────────────────────
function getShareOptions(url: string, name: string) {
  const text   = `🎉 Happy Birthday ${name}! I made you a special birthday surprise 🎂`;
  const full   = `${text}\n\n${url}`;
  const enc    = encodeURIComponent;

  return [
    {
      id: 'native',
      label: 'Share…',
      sublabel: 'All apps',
      icon: '📤',
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      action: 'native',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      sublabel: 'Message',
      icon: null,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg,#25d366,#128c7e)',
      href: `https://wa.me/?text=${enc(full)}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      sublabel: 'Message',
      icon: null,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg,#2aabee,#229ed9)',
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      sublabel: 'Post',
      icon: null,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)',
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      sublabel: 'Share',
      icon: null,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg,#1877f2,#0d5ecc)',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      id: 'email',
      label: 'Email',
      sublabel: 'Send',
      icon: '✉️',
      gradient: 'linear-gradient(135deg,#ea4335,#c5221f)',
      href: `mailto:?subject=${enc(`🎂 Birthday Surprise for ${name}`)}&body=${enc(full)}`,
    },
    {
      id: 'sms',
      label: 'SMS',
      sublabel: 'Text',
      icon: '💬',
      gradient: 'linear-gradient(135deg,#34d399,#059669)',
      href: `sms:?body=${enc(full)}`,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      sublabel: 'Story',
      icon: null,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)',
      action: 'instagram', // copy link + open Instagram
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function QRDisplay({ wish, onReset }: QRDisplayProps) {
  const { data, url, slug } = wish;

  const [copied, setCopied]         = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [logoUrl, setLogoUrl]       = useState('');
  const [nativeShare, setNativeShare] = useState(false);

  const rawCanvasRef = useRef<HTMLDivElement>(null);

  // Build logo + detect native share on mount
  useEffect(() => {
    setLogoUrl(buildLogoDataUrl(64));
    setNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // ── Copy link ───────────────────────────────────────────────────────────────
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('input');
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [url]);

  // ── Download QR ─────────────────────────────────────────────────────────────
  const downloadQR = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = rawCanvasRef.current?.querySelector('canvas');
      if (!canvas) { alert('QR not ready yet, please wait a moment.'); setDownloading(false); return; }
      const blobUrl = await buildDownloadBlob(canvas, slug);
      if (!blobUrl) { setDownloading(false); return; }
      const a = document.createElement('a');
      a.download = `wishqr-${slug}.png`;
      a.href = blobUrl;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('QR download error:', err);
    } finally {
      setDownloading(false);
    }
  }, [slug]);

  // ── Share dispatcher ────────────────────────────────────────────────────────
  const handleShare = useCallback(async (opt: ReturnType<typeof getShareOptions>[number]) => {
    if (opt.action === 'native') {
      try {
        await navigator.share({ title: `🎂 Birthday surprise for ${data.name}!`, text: `Happy Birthday ${data.name}!`, url });
      } catch { /* user cancelled */ }
      return;
    }
    if (opt.action === 'instagram') {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert('Link copied! Open Instagram and paste it in your story or bio.');
      return;
    }
    if (opt.href) window.open(opt.href, '_blank', 'noopener,noreferrer');
  }, [data.name, url]);

  const shareOptions = getShareOptions(url, data.name);
  // On mobile with native share, put the native button first and prominent
  const visibleOptions = nativeShare
    ? shareOptions
    : shareOptions.filter(o => o.id !== 'native');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>

      {/* Hidden high-res canvas for download pixel source */}
      <div ref={rawCanvasRef} style={{ position:'absolute',left:'-9999px',top:'-9999px',pointerEvents:'none' }} aria-hidden>
        <QRCodeCanvas value={url} size={512} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={false} />
      </div>

      <div className="qrd-root">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="qrd-header">
          <div className="qrd-confetti-emoji">🎉</div>
          <h2 className="qrd-title">Your Surprise is Ready!</h2>
          <p className="qrd-subtitle">Share the magic with {data.name}'s world</p>
        </div>

        {/* ── QR Card (centrepiece) ────────────────────────────────────────── */}
        <div className="qrd-qr-card">
          {/* Animated glow rings */}
          <div className="qrd-ring qrd-ring-1" />
          <div className="qrd-ring qrd-ring-2" />
          <div className="qrd-ring qrd-ring-3" />

          <p className="qrd-scan-label">Scan to celebrate 🎂</p>

          {/* QR frame */}
          <div className="qrd-qr-frame">
            {/* Corner accents */}
            <div className="qrd-corner qrd-corner-tl" />
            <div className="qrd-corner qrd-corner-tr" />
            <div className="qrd-corner qrd-corner-bl" />
            <div className="qrd-corner qrd-corner-br" />

            {/* The actual SVG QR — `imageSettings` renders the logo at centre */}
            <div className="qrd-qr-inner">
              {logoUrl && (
                <QRCodeSVG
                  value={url}
                  size={200}
                  bgColor="transparent"
                  fgColor="url(#qrGrad)"
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: logoUrl,
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              )}
              {/* Inline SVG defs so `url(#qrGrad)` resolves inside the QR component */}
              <svg width="0" height="0" style={{ position:'absolute' }}>
                <defs>
                  <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#7c3aed" />
                    <stop offset="50%"  stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <p className="qrd-hint">Point camera at code to open</p>

          {/* Download button */}
          <button className="qrd-dl-btn" onClick={downloadQR} disabled={downloading}>
            {downloading ? (
              <><span className="qrd-spinner" />Preparing…</>
            ) : (
              <><DownloadIcon /> Download QR</>
            )}
          </button>
        </div>

        {/* ── Info strip ──────────────────────────────────────────────────── */}
        <div className="qrd-info-strip">
          <div className="qrd-info-row">
            <span>🎂</span>
            <span className="qrd-info-name">{data.name}</span>
          </div>
          {data.day && data.month && (
            <div className="qrd-info-row">
              <span>🎈</span>
              <span className="qrd-info-meta">Birthday: {data.day} {data.month}</span>
            </div>
          )}
          {data.message && (
            <div className="qrd-info-row" style={{ alignItems:'flex-start' }}>
              <span>💌</span>
              <span className="qrd-info-msg">
                "{data.message.length > 90 ? data.message.slice(0, 90) + '…' : data.message}"
              </span>
            </div>
          )}
        </div>

        {/* ── Link box ────────────────────────────────────────────────────── */}
        <div className="qrd-link-box">
          <span className="qrd-link-url">
            {url.length > 55 ? url.slice(0, 55) + '…' : url}
          </span>
          <button className={`qrd-copy-btn${copied?' copied':''}`} onClick={copyLink}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>

        {/* ── Share grid ──────────────────────────────────────────────────── */}
        <div className="qrd-share-section">
          <p className="qrd-share-label">Share via</p>
          <div className="qrd-share-grid">
            {visibleOptions.map(opt => (
              <button
                key={opt.id}
                className="qrd-share-btn"
                onClick={() => handleShare(opt)}
                style={{ '--btn-grad': opt.gradient } as React.CSSProperties}
              >
                <span className="qrd-share-icon" style={{ background: opt.gradient }}>
                  {opt.svg ?? <span style={{ fontSize:'1.1rem' }}>{opt.icon}</span>}
                </span>
                <span className="qrd-share-name">{opt.label}</span>
                <span className="qrd-share-sub">{opt.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Reset ────────────────────────────────────────────────────────── */}
        <div className="qrd-reset-row">
          <button className="qrd-reset-btn" onClick={onReset}>
            🔄 Create Another Surprise
          </button>
        </div>
      </div>
    </>
  );
}

// ── Micro SVG icons ───────────────────────────────────────────────────────────
function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width:15,height:15 }}>
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles — scoped .qrd-* namespace, mobile-first
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
/* ── Root ───────────────────────────────────────────────────────────────────── */
.qrd-root {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 0 2rem;
  font-family: 'Quicksand', system-ui, sans-serif;
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.qrd-header { text-align: center; margin-bottom: .25rem; }
.qrd-confetti-emoji {
  font-size: 2.8rem;
  display: inline-block;
  animation: qrdBounce .7s cubic-bezier(.34,1.56,.64,1) forwards;
}
.qrd-title {
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 800;
  letter-spacing: -.02em;
  background: linear-gradient(135deg, #fbbf24, #f9fafb 45%, #fbbf24);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: qrdShimmer 3s linear infinite;
  margin: .4rem 0 .2rem;
}
.qrd-subtitle {
  font-size: .875rem;
  color: rgba(248,244,255,.5);
}

/* ── QR card ────────────────────────────────────────────────────────────────── */
.qrd-qr-card {
  position: relative;
  background: linear-gradient(145deg, rgba(255,255,255,.07) 0%, rgba(251,191,36,.06) 100%);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 28px;
  padding: 1.8rem 1.5rem 1.4rem;
  text-align: center;
  overflow: hidden;
  backdrop-filter: blur(24px);
  box-shadow: 0 0 0 1px rgba(255,255,255,.06) inset,
              0 24px 80px rgba(251,191,36,.08),
              0 4px 20px rgba(0,0,0,.35);
}

/* Glow rings */
.qrd-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(251,191,36,.12);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  pointer-events: none;
  animation: qrdRing 5s ease-in-out infinite;
  will-change: transform, opacity;
}
.qrd-ring-1 { width: 260px; height: 260px; }
.qrd-ring-2 { width: 380px; height: 380px; animation-delay: 1.2s; border-color: rgba(192,132,252,.08); }
.qrd-ring-3 { width: 520px; height: 520px; animation-delay: 2.4s; border-color: rgba(251,191,36,.05); }

.qrd-scan-label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #fbbf24;
  margin-bottom: 1.2rem;
  position: relative; z-index: 1;
}

/* QR frame with corner accents */
.qrd-qr-frame {
  position: relative;
  display: inline-block;
  padding: 18px;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(251,191,36,.35),
    0 8px 40px rgba(251,191,36,.22),
    0 2px 8px rgba(0,0,0,.3);
}
.qrd-qr-inner { position: relative; z-index: 1; line-height: 0; }

/* Corner L-brackets */
.qrd-corner {
  position: absolute;
  width: 22px; height: 22px;
  border-color: #f59e0b;
  border-style: solid;
  border-width: 0;
}
.qrd-corner-tl { top: 6px; left: 6px;   border-top-width: 3px; border-left-width: 3px;  border-top-left-radius: 6px; }
.qrd-corner-tr { top: 6px; right: 6px;  border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 6px; }
.qrd-corner-bl { bottom: 6px; left: 6px;  border-bottom-width: 3px; border-left-width: 3px;  border-bottom-left-radius: 6px; }
.qrd-corner-br { bottom: 6px; right: 6px; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 6px; }

.qrd-hint {
  font-size: .72rem;
  color: rgba(248,244,255,.35);
  margin: .9rem 0 .2rem;
  position: relative; z-index: 1;
}

/* Download button */
.qrd-dl-btn {
  margin-top: .75rem;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .55rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(251,191,36,.25);
  background: rgba(251,191,36,.1);
  color: #fbbf24;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, transform .2s;
  position: relative; z-index: 1;
  touch-action: manipulation;
}
.qrd-dl-btn:hover:not(:disabled) { background: rgba(251,191,36,.18); transform: scale(1.04); }
.qrd-dl-btn:disabled { opacity: .55; cursor: wait; }
.qrd-spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(251,191,36,.3);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: qrdSpin .7s linear infinite;
  display: inline-block;
}

/* ── Info strip ─────────────────────────────────────────────────────────────── */
.qrd-info-strip {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: .55rem;
  backdrop-filter: blur(12px);
}
.qrd-info-row { display: flex; align-items: center; gap: .6rem; }
.qrd-info-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fde68a;
  letter-spacing: -.01em;
}
.qrd-info-meta { font-size: .85rem; color: rgba(248,244,255,.65); }
.qrd-info-msg {
  font-size: .8rem;
  font-style: italic;
  color: rgba(248,244,255,.5);
  line-height: 1.6;
}

/* ── Link box ───────────────────────────────────────────────────────────────── */
.qrd-link-box {
  display: flex;
  align-items: center;
  gap: .6rem;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  padding: .7rem 1rem;
  backdrop-filter: blur(10px);
}
.qrd-link-url {
  flex: 1;
  font-family: monospace;
  font-size: .72rem;
  color: rgba(248,244,255,.4);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.qrd-copy-btn {
  flex-shrink: 0;
  padding: .42rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(251,191,36,.25);
  background: rgba(251,191,36,.1);
  color: #fbbf24;
  font-size: .75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  touch-action: manipulation;
  white-space: nowrap;
}
.qrd-copy-btn.copied {
  background: rgba(52,211,153,.12);
  border-color: rgba(52,211,153,.3);
  color: #34d399;
}

/* ── Share section ──────────────────────────────────────────────────────────── */
.qrd-share-section {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  padding: 1.1rem 1rem;
  backdrop-filter: blur(12px);
}
.qrd-share-label {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(248,244,255,.35);
  margin-bottom: .85rem;
  text-align: center;
}
.qrd-share-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .55rem;
}
@media (min-width: 400px) { .qrd-share-grid { grid-template-columns: repeat(4, 1fr); } }

.qrd-share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .3rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: .35rem .2rem;
  border-radius: 12px;
  transition: transform .2s, background .2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.qrd-share-btn:hover { transform: translateY(-3px); background: rgba(255,255,255,.05); }
.qrd-share-btn:active { transform: scale(.93); }

.qrd-share-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
  font-size: .95rem;
  transition: box-shadow .2s;
  flex-shrink: 0;
}
.qrd-share-btn:hover .qrd-share-icon {
  box-shadow: 0 6px 20px rgba(0,0,0,.4);
}

.qrd-share-name {
  font-size: .65rem;
  font-weight: 700;
  color: rgba(248,244,255,.75);
  text-align: center;
  line-height: 1.2;
}
.qrd-share-sub {
  font-size: .58rem;
  color: rgba(248,244,255,.35);
  text-align: center;
}

/* ── Reset ──────────────────────────────────────────────────────────────────── */
.qrd-reset-row { text-align: center; }
.qrd-reset-btn {
  padding: .7rem 2rem;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.05);
  color: rgba(248,244,255,.6);
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  touch-action: manipulation;
}
.qrd-reset-btn:hover { background: rgba(255,255,255,.09); color: rgba(248,244,255,.85); transform: scale(1.03); }

/* ── Keyframes ──────────────────────────────────────────────────────────────── */
@keyframes qrdBounce {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.22) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes qrdShimmer {
  from { background-position: 0% center; }
  to   { background-position: 200% center; }
}
@keyframes qrdRing {
  0%,100% { opacity: .4; transform: translate(-50%,-50%) scale(1); }
  50%     { opacity: .9; transform: translate(-50%,-50%) scale(1.06); }
}
@keyframes qrdSpin {
  to { transform: rotate(360deg); }
}
`;