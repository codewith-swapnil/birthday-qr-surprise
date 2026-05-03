'use client';

import { useRef, useState } from 'react';
import { WishData, getOrdinal } from '@/lib/utils';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((m) => m.QRCodeSVG), { ssr: false });
const QRCodeCanvas = dynamic(() => import('qrcode.react').then((m) => m.QRCodeCanvas), { ssr: false });

interface GeneratedWish {
  slug: string;
  url: string;
  data: WishData;
}

interface QRDisplayProps {
  wish: GeneratedWish;
  onReset: () => void;
}

export default function QRDisplay({ wish, onReset }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const hiddenCanvasRef = useRef<HTMLDivElement>(null);

  const { data, url } = wish;

  const waMessage = encodeURIComponent(
    `🎉 *Happy Birthday ${data.name}!* 🎂\n\nI've created a special birthday surprise just for you!\n\nClick here to open your birthday wish 👇\n${url}\n\n💝 Made with Birthday QR Surprise`
  );
  const waUrl = `https://wa.me/?text=${waMessage}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
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

  function downloadQR() {
    setDownloading(true);
    try {
      // Read directly from the hidden QRCodeCanvas — no SVG serialization
      const canvas = hiddenCanvasRef.current?.querySelector('canvas');
      if (!canvas) {
        alert('QR not ready yet, please wait a moment and try again.');
        setDownloading(false);
        return;
      }

      // Create a padded output canvas for a clean downloadable image
      const SIZE = 400;
      const PADDING = 32;
      const output = document.createElement('canvas');
      output.width = SIZE;
      output.height = SIZE;
      const ctx = output.getContext('2d')!;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Draw QR centered with padding
      const qrSize = SIZE - PADDING * 2;
      ctx.drawImage(canvas, PADDING, PADDING, qrSize, qrSize);

      // Trigger download
      output.toBlob((blob) => {
        if (!blob) { setDownloading(false); return; }
        const link = document.createElement('a');
        link.download = `birthday-qr-${wish.slug}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setDownloading(false);
      }, 'image/png', 1.0);

    } catch (err) {
      console.error('QR download error:', err);
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Hidden high-res QRCodeCanvas — used ONLY for download pixel data */}
      <div
        ref={hiddenCanvasRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <QRCodeCanvas
          value={url}
          size={512}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Success Header */}
      <div className="text-center mb-8 reveal">
        <div
          className="text-5xl mb-3 animate-bounce-in"
          style={{ animationDelay: '0.1s', display: 'inline-block' }}
        >
          🎉
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold gold-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your Surprise is Ready!
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'rgba(248,244,255,0.5)' }}>
          Share the QR code or link with {data.name}'s friends & family
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <div
          className="glass-gold rounded-3xl p-6 text-center relative overflow-hidden reveal"
          style={{ animationDelay: '0.15s' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(251,191,36,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: '#fbbf24' }}>
            Scan to Wish 🎂
          </p>

          {/* Visible SVG QR — crisp at any screen resolution */}
          <div
            className="qr-glow inline-block rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', padding: '16px' }}
          >
            <QRCodeSVG
              value={url}
              size={180}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-xs mt-4" style={{ color: 'rgba(248,244,255,0.4)' }}>
            Point camera at QR code
          </p>

          <button
            onClick={downloadQR}
            disabled={downloading}
            className="mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#fbbf24',
              cursor: downloading ? 'wait' : 'pointer',
            }}
          >
            {downloading ? '⏳ Preparing...' : '⬇️ Download QR Code'}
          </button>
        </div>

        {/* Info & Share Card */}
        <div className="flex flex-col gap-4">
          {/* Wish Summary */}
          <div className="glass rounded-2xl p-5 reveal" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(248,244,255,0.4)' }}>
              Birthday Summary
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span style={{ color: '#fbbf24' }}>🎂</span>
                <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
                  {data.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#fbbf24' }}>🎈</span>
                <span style={{ color: 'rgba(248,244,255,0.7)' }}>
                  Turning {getOrdinal(Number(data.dateOfBirth))}
                </span>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <span style={{ color: '#fbbf24', marginTop: 2 }}>💌</span>
                <span className="text-sm italic leading-relaxed" style={{ color: 'rgba(248,244,255,0.6)' }}>
                  "{data.message.length > 80 ? data.message.substring(0, 80) + '...' : data.message}"
                </span>
              </div>
            </div>
          </div>

          {/* Link Box */}
          <div className="glass rounded-2xl p-4 reveal" style={{ animationDelay: '0.25s' }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(248,244,255,0.4)' }}>
              Share Link
            </p>
            <div
              className="rounded-xl px-3 py-2 text-xs break-all mb-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(248,244,255,0.5)',
                fontFamily: 'monospace',
              }}
            >
              {url.length > 60 ? url.substring(0, 60) + '...' : url}
            </div>
            <button
              onClick={copyLink}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.1)',
                border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(251,191,36,0.2)',
                color: copied ? '#34d399' : '#fbbf24',
              }}
            >
              {copied ? '✅ Link Copied!' : '📋 Copy Link'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="glass rounded-2xl p-4 reveal" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(248,244,255,0.4)' }}>
              Share Via
            </p>
            <div className="flex gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', color: 'white' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Create Another */}
      <div className="text-center mt-8 reveal" style={{ animationDelay: '0.35s' }}>
        <button
          onClick={onReset}
          className="px-8 py-3 rounded-2xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(248,244,255,0.7)',
          }}
        >
          🔄 Create Another Surprise
        </button>
      </div>
    </div>
  );
}
