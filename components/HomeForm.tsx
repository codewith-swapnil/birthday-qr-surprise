'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRDisplay from './QRDisplay';
import { generateSlug, buildWishUrl } from '@/lib/utils';
import type { WishData, WishTopic } from '@/types/wish';
import { MONTH_NAMES } from '@/types/wish';

/* ─── types ─────────────────────────────────────────────── */
interface FormState {
  name: string;
  day: string;
  month: string;
  message: string;
  topic: WishTopic;
}
interface FormErrors {
  name?: string;
  day?: string;
  month?: string;
  message?: string;
  dateOfBirth?: string;
  images?: string;
  upload?: string;
}
interface PreviewFile { id: string; file: File; previewUrl: string; }
interface GeneratedWish { slug: string; url: string; data: WishData; }

const ALLOWED  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 2;
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/* ─── Topic config ───────────────────────────────────────── */
const TOPIC_CONFIG: Record<WishTopic, {
  label: string;
  emoji: string;
  tagline: string;
  namePlaceholder: string;
  nameLbl: string;
  quickMessages: string[];
  msgPlaceholder: string;
  showDate: boolean;
  accent: string;          // CSS colour for active ring
  gradient: string;        // button gradient
}> = {
  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    tagline: 'Create a magical birthday surprise page',
    namePlaceholder: 'e.g. Sophia, Priya, Alex…',
    nameLbl: "🎂 Birthday Person's Name",
    quickMessages: [
      'Happy Birthday! 🎂 May your day be filled with joy and laughter!',
      'Wishing you a fantastic year ahead! 🎉',
      'May all your birthday wishes come true! ✨',
      'So glad to celebrate this special day with you! 🥳',
      "Here's to another year of amazing adventures! 🌟",
    ],
    msgPlaceholder: 'Write something beautiful… or choose a quick message ✨',
    showDate: true,
    accent: 'rgba(251,191,36,.6)',
    gradient: 'linear-gradient(135deg,#ff6b9d,#c084fc,#fbbf24)',
  },
  propose: {
    label: 'Propose / Love',
    emoji: '💍',
    tagline: 'Say "I love you" with a stunning surprise page',
    namePlaceholder: 'e.g. Ananya, Sara, Riya…',
    nameLbl: '🌹 Their Name',
    quickMessages: [
      'You are the reason I believe in love. ❤️',
      "I've never been so certain about anything as I am about you. 🌹",
      'Every moment with you is my favourite moment. 💕',
      'Will you make me the happiest person alive? 💍',
      "You are my today and all of my tomorrows. 💝",
    ],
    msgPlaceholder: 'Pour your heart out… speak from the soul ❤️',
    showDate: false,
    accent: 'rgba(232,49,90,.6)',
    gradient: 'linear-gradient(135deg,#e8315a,#c084fc,#f9a8d4)',
  },
};

/* ═══════════════════════════════════════════════════════════
   TopicPicker
   ═══════════════════════════════════════════════════════════ */
interface TopicPickerProps {
  value: WishTopic;
  onChange: (t: WishTopic) => void;
}
function TopicPicker({ value, onChange }: TopicPickerProps) {
  return (
    <>
      <style>{`
        .tp-card{
          flex:1;min-width:0;padding:1.1rem .9rem;border-radius:1.15rem;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.1);
          cursor:pointer;text-align:center;
          transition:all .25s cubic-bezier(.34,1.56,.64,1);
          display:flex;flex-direction:column;align-items:center;gap:.45rem;
          -webkit-tap-highlight-color:transparent;
          will-change:transform;
        }
        .tp-card:hover{transform:translateY(-3px);background:rgba(255,255,255,.07);}
        .tp-card.tp-active-birthday{
          border-color:rgba(251,191,36,.65);
          background:rgba(251,191,36,.09);
          box-shadow:0 0 0 3px rgba(251,191,36,.14),0 8px 28px rgba(251,191,36,.15);
          transform:translateY(-3px);
        }
        .tp-card.tp-active-propose{
          border-color:rgba(232,49,90,.65);
          background:rgba(232,49,90,.09);
          box-shadow:0 0 0 3px rgba(232,49,90,.14),0 8px 28px rgba(232,49,90,.18);
          transform:translateY(-3px);
        }
        .tp-emoji{font-size:2rem;line-height:1;display:block;}
        .tp-lbl{font-size:.82rem;font-weight:600;letter-spacing:.04em;color:rgba(248,244,255,.75);}
        .tp-tag{font-size:.66rem;color:rgba(248,244,255,.35);line-height:1.3;margin-top:.1rem;}
        .tp-card.tp-active-birthday .tp-lbl{color:#fde68a;}
        .tp-card.tp-active-propose  .tp-lbl{color:#f9a8d4;}
        .tp-dot{
          width:8px;height:8px;border-radius:50%;
          border:1.5px solid rgba(255,255,255,.2);
          margin-top:.2rem;transition:all .25s ease;
        }
        .tp-card.tp-active-birthday .tp-dot{background:#fbbf24;border-color:#fbbf24;box-shadow:0 0 8px #fbbf24;}
        .tp-card.tp-active-propose  .tp-dot{background:#e8315a;border-color:#e8315a;box-shadow:0 0 8px #e8315a;}
      `}</style>
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.6rem' }}>
        {(Object.keys(TOPIC_CONFIG) as WishTopic[]).map(t => {
          const cfg = TOPIC_CONFIG[t];
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              className={`tp-card${active ? ` tp-active-${t}` : ''}`}
              onClick={() => onChange(t)}
              aria-pressed={active}
            >
              <span className="tp-emoji">{cfg.emoji}</span>
              <span className="tp-lbl">{cfg.label}</span>
              <span className="tp-tag">{cfg.tagline}</span>
              <span className="tp-dot" />
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   BirthdayDatePicker
   ═══════════════════════════════════════════════════════════ */
interface DatePickerProps {
  day: string; month: string;
  onDayChange: (d: string) => void;
  onMonthChange: (m: string) => void;
  error?: string;
}
function BirthdayDatePicker({ day, month, onDayChange, onMonthChange, error }: DatePickerProps) {
  const [open, setOpen] = useState<'day' | 'month' | null>(null);
  const dayRef   = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  const closeHandler = useCallback((e: MouseEvent) => {
    if (!dayRef.current?.contains(e.target as Node) && !monthRef.current?.contains(e.target as Node))
      setOpen(null);
  }, []);
  useEffect(() => {
    document.addEventListener('mousedown', closeHandler);
    return () => document.removeEventListener('mousedown', closeHandler);
  }, [closeHandler]);

  const selDay = day ? Number(day) : null;
  const selMon = month || null;

  const trigger: React.CSSProperties = {
    width: '100%', padding: '.7rem 1rem',
    background: 'rgba(255,255,255,.05)',
    border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,.1)'}`,
    borderRadius: '.75rem', color: '#f8f4ff', fontSize: '.92rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '.5rem',
    transition: 'all .2s ease', outline: 'none',
  };
  const panel: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: '#1a0035', border: '1px solid rgba(251,191,36,.28)',
    borderRadius: '.9rem', zIndex: 50,
    boxShadow: '0 16px 48px rgba(0,0,0,.65)', overflow: 'hidden',
    animation: 'dpDropIn .18s cubic-bezier(.22,1,.36,1) both',
  };
  return (
    <>
      <style>{`
        @keyframes dpDropIn{from{opacity:0;transform:scaleY(.93) translateY(-4px)}to{opacity:1;transform:scaleY(1) translateY(0)}}
        .dp-trigger:hover{border-color:rgba(251,191,36,.45)!important;background:rgba(251,191,36,.06)!important;}
        .dp-trigger.dp-open{border-color:rgba(251,191,36,.6)!important;background:rgba(251,191,36,.07)!important;box-shadow:0 0 0 3px rgba(251,191,36,.12)!important;}
        .dp-day-btn{aspect-ratio:1;border:none;border-radius:.45rem;background:transparent;color:rgba(248,244,255,.7);font-size:.78rem;cursor:pointer;transition:background .13s,color .13s;display:flex;align-items:center;justify-content:center;}
        .dp-day-btn:hover{background:rgba(251,191,36,.16);color:#fde68a;}
        .dp-day-btn.dp-sel{background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a0010;font-weight:700;}
        .dp-mon-btn{padding:.45rem .3rem;border:none;border-radius:.55rem;background:transparent;color:rgba(248,244,255,.7);font-size:.78rem;cursor:pointer;transition:background .13s,color .13s;text-align:center;}
        .dp-mon-btn:hover{background:rgba(251,191,36,.16);color:#fde68a;}
        .dp-mon-btn.dp-sel{background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a0010;font-weight:700;}
      `}</style>
      <div style={{ display: 'flex', gap: '.75rem' }}>
        {/* Day */}
        <div ref={dayRef} style={{ position: 'relative', flex: 1 }}>
          <button type="button" className={`dp-trigger${open === 'day' ? ' dp-open' : ''}`}
            style={{ ...trigger, color: selDay ? '#f8f4ff' : 'rgba(248,244,255,.35)' }}
            onClick={() => setOpen(p => p === 'day' ? null : 'day')}
            aria-haspopup="listbox" aria-expanded={open === 'day'}>
            <span style={{ flex: 1, textAlign: 'left' }}>{selDay ?? 'Day'}</span>
            <Chevron open={open === 'day'} />
          </button>
          {open === 'day' && (
            <div style={panel} role="listbox" aria-label="Select day">
              <PanelHeader>Select Day</PanelHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: '.7rem' }}>
                {DAYS.map(d => (
                  <button key={d} type="button" className={`dp-day-btn${selDay === d ? ' dp-sel' : ''}`}
                    onClick={() => { onDayChange(String(d)); setOpen(null); }}
                    role="option" aria-selected={selDay === d}>{d}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Month */}
        <div ref={monthRef} style={{ position: 'relative', flex: 1 }}>
          <button type="button" className={`dp-trigger${open === 'month' ? ' dp-open' : ''}`}
            style={{ ...trigger, color: selMon ? '#f8f4ff' : 'rgba(248,244,255,.35)' }}
            onClick={() => setOpen(p => p === 'month' ? null : 'month')}
            aria-haspopup="listbox" aria-expanded={open === 'month'}>
            <span style={{ flex: 1, textAlign: 'left' }}>{selMon ?? 'Month'}</span>
            <Chevron open={open === 'month'} />
          </button>
          {open === 'month' && (
            <div style={panel} role="listbox" aria-label="Select month">
              <PanelHeader>Select Month</PanelHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: '.7rem' }}>
                {MONTH_NAMES.map(m => (
                  <button key={m} type="button" className={`dp-mon-btn${selMon === m ? ' dp-sel' : ''}`}
                    onClick={() => { onMonthChange(m); setOpen(null); }}
                    role="option" aria-selected={selMon === m}>{m.slice(0, 3)}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {selDay && selMon && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '.4rem',
          marginTop: '.55rem', padding: '.3rem .8rem',
          background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)',
          borderRadius: '2rem', fontSize: '.75rem', color: '#fde68a',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
          🎂 {selDay} {selMon}
        </div>
      )}
      {error && <p style={{ marginTop: '.4rem', fontSize: '.75rem', color: '#f87171' }}>⚠️ {error}</p>}
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: 'transform .22s ease', transform: open ? 'rotate(180deg)' : 'none', opacity: open ? .9 : .45, flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="rgba(248,244,255,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '.5rem .85rem .3rem',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      fontSize: '.65rem', color: 'rgba(248,244,255,.3)',
      letterSpacing: '.1em', textTransform: 'uppercase',
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ImageCard
   ═══════════════════════════════════════════════════════════ */
function ImageCard({ preview, index, onRemove }: { preview: PreviewFile; index: number; onRemove: (id: string) => void; }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '.85rem', overflow: 'hidden', border: '1px solid rgba(251,191,36,.25)', background: '#0d0020', boxShadow: '0 4px 16px rgba(0,0,0,.35)' }}>
      <div style={{ position: 'absolute', top: 6, left: 7, zIndex: 2, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '1px 8px', fontSize: '.6rem', color: 'rgba(255,255,255,.8)', fontWeight: 700, letterSpacing: '.04em' }}>
        {index + 1}
      </div>
      <button type="button" onClick={() => onRemove(preview.id)} aria-label={`Remove photo ${index + 1}`}
        style={{ position: 'absolute', top: 6, right: 6, zIndex: 3, width: 28, height: 28, background: 'rgba(239,68,68,.9)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: '50%', cursor: 'pointer', color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.45)', transition: 'transform .15s ease,background .15s ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.9)'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview.previewUrl} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top,rgba(0,0,0,.45),transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HomeForm
   ═══════════════════════════════════════════════════════════ */
export default function HomeForm() {
  const [form, setForm] = useState<FormState>({ name: '', day: '', month: '', message: '', topic: 'birthday' });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [previews, setPreviews]   = useState<PreviewFile[]>([]);
  const [loading, setLoading]     = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [generated, setGenerated] = useState<GeneratedWish | null>(null);
  const [step, setStep]           = useState<'form' | 'result'>('form');
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cfg = TOPIC_CONFIG[form.topic];

  // Reset date + message when topic switches
  const handleTopicChange = (t: WishTopic) => {
    setForm(prev => ({ ...prev, topic: t, day: '', month: '', message: '' }));
    setErrors({});
  };

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter a name (at least 2 characters)';

    if (cfg.showDate) {
      const dayNum = parseInt(form.day);
      if (!form.day || isNaN(dayNum) || dayNum < 1 || dayNum > 31)
        errs.dateOfBirth = 'Please select a valid day and month';
      else if (!form.month || !(MONTH_NAMES as readonly string[]).includes(form.month))
        errs.dateOfBirth = 'Please select a valid month';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const errs: string[] = [];
    const valid: PreviewFile[] = [];
    let slots = MAX_FILES - previews.length;
    if (slots <= 0) { errs.push(`Maximum ${MAX_FILES} images allowed.`); }
    for (const file of files) {
      if (slots <= 0) break;
      if (!ALLOWED.includes(file.type)) { errs.push(`"${file.name}" is not a valid type`); continue; }
      if (file.size > MAX_SIZE)         { errs.push(`"${file.name}" exceeds 10 MB`); continue; }
      valid.push({ id: `${file.name}-${file.lastModified}`, file, previewUrl: URL.createObjectURL(file) });
      slots--;
    }
    setPreviews(prev => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_FILES) { errs.push(`Only first ${MAX_FILES} kept.`); return combined.slice(0, MAX_FILES); }
      return combined;
    });
    setErrors(e => ({ ...e, images: errs.length ? errs[0] : undefined }));
  }, [previews.length]);

  function removePreview(id: string) {
    setPreviews(prev => { const item = prev.find(p => p.id === id); if (item) URL.revokeObjectURL(item.previewUrl); return prev.filter(p => p.id !== id); });
    setErrors(e => ({ ...e, images: undefined }));
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }

  async function uploadImages(): Promise<string[]> {
    if (previews.length === 0) return [];
    setUploadMsg('Uploading photos…');
    const fd = new FormData();
    previews.forEach(p => fd.append('images', p.file));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
    return json.urls as string[];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});

    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadImages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (!msg.includes('not configured')) {
        setErrors(prev => ({ ...prev, upload: msg }));
        setLoading(false); setUploadMsg(''); return;
      }
    }

    setUploadMsg('Generating your surprise…');
    await new Promise(r => setTimeout(r, 400));

    // For propose pages date is optional — default to 1/January as placeholder
    const wishData: WishData = {
      name:      form.name.trim(),
      day:       form.topic === 'propose' ? 1 : parseInt(form.day),
      month:     form.topic === 'propose' ? 'January' : form.month,
      message:   form.message.trim(),
      createdAt: new Date().toISOString(),
      topic:     form.topic,
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    const slug    = generateSlug(wishData.name, wishData.day, wishData.month);
    const baseUrl = window.location.origin;
    const url     = buildWishUrl(slug, baseUrl);

    try {
      setUploadMsg('Saving your wish…');
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, url, data: wishData }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json.error ?? 'Failed to save wish'); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save wish';
      setErrors(prev => ({ ...prev, upload: msg }));
      setLoading(false); setUploadMsg(''); return;
    }

    setGenerated({ slug, url, data: wishData });
    setStep('result'); setLoading(false); setUploadMsg('');
  }

  function handleReset() {
    previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setStep('form'); setGenerated(null);
    setForm({ name: '', day: '', month: '', message: '', topic: 'birthday' });
    setErrors({}); setPreviews([]); setUploadMsg('');
  }

  function setQuickMessage(msg: string) {
    setForm(prev => ({ ...prev, message: msg }));
    setErrors(prev => ({ ...prev, message: undefined }));
  }

  if (step === 'result' && generated) {
    return <QRDisplay wish={generated} onReset={handleReset} />;
  }

  const spotsLeft = MAX_FILES - previews.length;

  // Dynamic button label per topic
  const submitLabel = form.topic === 'propose'
    ? '❤️ Generate Love Surprise'
    : '✨ Generate Birthday Surprise';

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-visible reveal">
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle at top right,rgba(251,191,36,.15),transparent 70%)', pointerEvents: 'none' }} />

        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
          Fill in the Details
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: 'rgba(248,244,255,0.5)' }}>
          We'll craft something magical ✨
        </p>

        {/* ── Topic Picker ── */}
        <TopicPicker value={form.topic} onChange={handleTopicChange} />

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Name ── */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'rgba(248,244,255,.7)', letterSpacing: '.05em' }}>
              {cfg.nameLbl}
            </label>
            <input
              id="name" type="text"
              className="input-field w-full px-4 py-3 rounded-xl text-base"
              placeholder={cfg.namePlaceholder}
              value={form.name} maxLength={50}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
            />
            {errors.name && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>⚠️ {errors.name}</p>}
          </div>

          {/* ── Birthday date (only for birthday topic) ── */}
          {cfg.showDate && (
            <div className="mb-5" style={{ position: 'relative', zIndex: 20 }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(248,244,255,.7)', letterSpacing: '.05em' }}>
                🎈 Birthday Date{' '}
                <span style={{ fontWeight: 'normal', fontSize: '0.75rem', opacity: .6 }}>(Day &amp; Month only)</span>
              </label>
              <BirthdayDatePicker
                day={form.day} month={form.month}
                onDayChange={val => { setForm(prev => ({ ...prev, day: val })); setErrors(prev => ({ ...prev, dateOfBirth: undefined })); }}
                onMonthChange={val => { setForm(prev => ({ ...prev, month: val })); setErrors(prev => ({ ...prev, dateOfBirth: undefined })); }}
                error={errors.dateOfBirth}
              />
            </div>
          )}

          {/* ── Message ── */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'rgba(248,244,255,.7)', letterSpacing: '.05em' }}>
              {form.topic === 'propose' ? '💌 Your Love Message' : '💌 Your Heartfelt Message'}{' '}
              <span style={{ fontWeight: 'normal', fontSize: '0.7rem', opacity: .6 }}>(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cfg.quickMessages.map((msg, idx) => (
                <button key={idx} type="button" onClick={() => setQuickMessage(msg)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{ background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.3)', color: '#fde68a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,191,36,.12)')}>
                  {msg.length > 30 ? msg.slice(0, 30) + '…' : msg}
                </button>
              ))}
            </div>
            <textarea id="message"
              className="input-field w-full px-4 py-3 rounded-xl text-base resize-none"
              placeholder={cfg.msgPlaceholder}
              rows={4} maxLength={500} value={form.message}
              onChange={e => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: undefined }); }}
            />
            <span className="text-xs mt-1 block" style={{ color: 'rgba(248,244,255,.3)' }}>
              Optional · {form.message.length}/500
            </span>
          </div>

          {/* ── Image Upload ── */}
          <div className="mb-7">
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(248,244,255,.7)', letterSpacing: '.05em' }}>
              📸 Add Photos{' '}
              <span style={{ color: 'rgba(248,244,255,.35)', fontWeight: 400 }}>(optional · max {MAX_FILES})</span>
            </label>

            {spotsLeft > 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                style={{
                  border: `2px dashed ${dragOver ? 'rgba(251,191,36,.6)' : 'rgba(255,255,255,.1)'}`,
                  borderRadius: '1rem',
                  background: dragOver ? 'rgba(251,191,36,.05)' : 'rgba(255,255,255,.02)',
                  padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                  transition: 'all .25s ease',
                  marginBottom: previews.length ? '1rem' : 0,
                }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🖼️</div>
                <p style={{ color: 'rgba(248,244,255,.5)', fontSize: '.85rem', marginBottom: '.25rem' }}>
                  Tap to add photos or drag &amp; drop
                </p>
                <p style={{ color: 'rgba(248,244,255,.25)', fontSize: '.72rem' }}>
                  JPG, PNG, WEBP · Max 10 MB · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                </p>
              </div>
            )}

            <input ref={fileInputRef} type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp" multiple
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX_FILES},1fr)`, gap: '.75rem' }}>
                {previews.map((p, i) => <ImageCard key={p.id} preview={p} index={i} onRemove={removePreview} />)}
                {spotsLeft > 0 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Add another photo"
                    style={{ aspectRatio: '1/1', borderRadius: '.85rem', border: '2px dashed rgba(255,255,255,.1)', background: 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.3rem', color: 'rgba(248,244,255,.3)', fontSize: '.75rem', transition: 'all .2s ease' }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(251,191,36,.4)'; b.style.color = 'rgba(251,191,36,.7)'; b.style.background = 'rgba(251,191,36,.04)'; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,.1)'; b.style.color = 'rgba(248,244,255,.3)'; b.style.background = 'rgba(255,255,255,.02)'; }}>
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>+</span>
                    <span>Add</span>
                  </button>
                )}
              </div>
            )}

            {errors.images && <p className="mt-2 text-xs" style={{ color: '#f87171' }}>⚠️ {errors.images}</p>}
            {errors.upload && <p className="mt-2 text-xs" style={{ color: '#f87171' }}>❌ {errors.upload}</p>}
            {previews.length > 0 && (
              <p style={{ marginTop: '.6rem', fontSize: '.7rem', color: 'rgba(248,244,255,.25)', textAlign: 'center' }}>
                {previews.length}/{MAX_FILES} photo{previews.length > 1 ? 's' : ''} · Tap 🗑 to remove
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold w-full py-4 rounded-2xl text-base relative"
            style={{
              fontFamily: 'var(--font-body)',
              opacity: loading ? .85 : 1,
              background: cfg.gradient,
            }}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploadMsg || 'Creating Magic…'}
                </>
              ) : submitLabel}
            </span>
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(248,244,255,.22)' }}>
          Free forever · No sign-up needed · Share instantly
        </p>
      </div>

      {/* Feature badges — update per topic */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {(form.topic === 'propose'
          ? ['📸 Real Photos', '💕 Heart Confetti', '🎵 Music', '✨ Animations', '📱 QR Code']
          : ['📸 Real Photos', '🎊 Confetti', '🎵 Music', '✨ Animations', '📱 QR Code']
        ).map(f => (
          <span key={f} className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', color: 'rgba(248,244,255,.6)' }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}