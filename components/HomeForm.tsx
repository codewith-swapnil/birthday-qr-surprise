'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import QRDisplay from './QRDisplay';
import { generateSlug, buildWishUrl, WishData } from '@/lib/utils';

/* ─── types ─────────────────────────────────────────────── */
interface FormState { name: string; dateOfBirth: string; message: string; }
interface FormErrors extends Partial<FormState> { images?: string; upload?: string; }
interface PreviewFile { id: string; file: File; previewUrl: string; }
interface GeneratedWish { slug: string; url: string; data: WishData; }

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE  = 2 * 1024 * 1024;
const MAX_FILES = 2;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const QUICK_MESSAGES = [
  "Happy Birthday! 🎂 May your day be filled with joy and laughter!",
  "Wishing you a fantastic year ahead! 🎉",
  "May all your birthday wishes come true! ✨",
  "So glad to celebrate this special day with you! 🥳",
  "Here's to another year of amazing adventures! 🌟",
];

/* ═══════════════════════════════════════════════════════════
   BirthdayDatePicker — custom day + month selector
   ═══════════════════════════════════════════════════════════ */
interface DatePickerProps {
  value: string;                          // "14 March" or ""
  onChange: (value: string) => void;
  error?: string;
}

function BirthdayDatePicker({ value, onChange, error }: DatePickerProps) {
  const parts  = value.split(' ');
  const selDay = parts.length === 2 && !isNaN(Number(parts[0])) ? Number(parts[0]) : null;
  const selMon = parts.length === 2 && MONTHS.includes(parts[1]) ? parts[1] : null;

  const [open, setOpen] = useState<'day' | 'month' | null>(null);
  const dayRef   = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        !dayRef.current?.contains(e.target as Node) &&
        !monthRef.current?.contains(e.target as Node)
      ) setOpen(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function pickDay(d: number) {
    onChange(`${d} ${selMon ?? 'January'}`);
    setOpen(null);
  }
  function pickMonth(m: string) {
    onChange(`${selDay ?? 1} ${m}`);
    setOpen(null);
  }

  /* ── shared styles as JS objects (no Tailwind needed) ── */
  const trigger: React.CSSProperties = {
    width: '100%',
    padding: '.7rem 1rem',
    background: 'rgba(255,255,255,.05)',
    border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,.1)'}`,
    borderRadius: '.75rem',
    color: '#f8f4ff',
    fontSize: '.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    transition: 'all .2s ease',
    outline: 'none',
  };
  const panel: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#1a0035',
    border: '1px solid rgba(251,191,36,.28)',
    borderRadius: '.9rem',
    zIndex: 50,
    boxShadow: '0 16px 48px rgba(0,0,0,.65)',
    overflow: 'hidden',
    animation: 'dpDropIn .18s cubic-bezier(.22,1,.36,1) both',
  };

  return (
    <>
      {/* inject keyframes once */}
      <style>{`
        @keyframes dpDropIn {
          from { opacity:0; transform:scaleY(.93) translateY(-4px); }
          to   { opacity:1; transform:scaleY(1)   translateY(0);    }
        }
        .dp-trigger:hover { border-color:rgba(251,191,36,.45)!important; background:rgba(251,191,36,.06)!important; }
        .dp-trigger:focus-visible { box-shadow:0 0 0 3px rgba(251,191,36,.3)!important; border-color:rgba(251,191,36,.6)!important; }
        .dp-trigger.dp-open { border-color:rgba(251,191,36,.6)!important; background:rgba(251,191,36,.07)!important; box-shadow:0 0 0 3px rgba(251,191,36,.12)!important; }
        .dp-day-btn { aspect-ratio:1; border:none; border-radius:.45rem; background:transparent; color:rgba(248,244,255,.7); font-size:.78rem; cursor:pointer; transition:background .13s,color .13s; display:flex; align-items:center; justify-content:center; }
        .dp-day-btn:hover { background:rgba(251,191,36,.16); color:#fde68a; }
        .dp-day-btn.dp-sel { background:linear-gradient(135deg,#f59e0b,#d97706); color:#1a0010; font-weight:700; }
        .dp-mon-btn { padding:.45rem .3rem; border:none; border-radius:.55rem; background:transparent; color:rgba(248,244,255,.7); font-size:.78rem; cursor:pointer; transition:background .13s,color .13s; text-align:center; }
        .dp-mon-btn:hover { background:rgba(251,191,36,.16); color:#fde68a; }
        .dp-mon-btn.dp-sel { background:linear-gradient(135deg,#f59e0b,#d97706); color:#1a0010; font-weight:700; }
      `}</style>

      <div style={{ display: 'flex', gap: '.75rem' }}>
        {/* ── Day picker ── */}
        <div ref={dayRef} style={{ position: 'relative', flex: 1 }}>
          <button
            type="button"
            className={`dp-trigger${open === 'day' ? ' dp-open' : ''}`}
            style={{ ...trigger, color: selDay ? '#f8f4ff' : 'rgba(248,244,255,.35)' }}
            onClick={() => setOpen(p => p === 'day' ? null : 'day')}
            aria-haspopup="listbox"
            aria-expanded={open === 'day'}
          >
            <span style={{ flex: 1, textAlign: 'left' }}>{selDay ?? 'Day'}</span>
            <Chevron open={open === 'day'} />
          </button>

          {open === 'day' && (
            <div style={panel} role="listbox" aria-label="Select day">
              <PanelHeader>Select Day</PanelHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: '.7rem' }}>
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`dp-day-btn${selDay === d ? ' dp-sel' : ''}`}
                    onClick={() => pickDay(d)}
                    role="option"
                    aria-selected={selDay === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Month picker ── */}
        <div ref={monthRef} style={{ position: 'relative', flex: 1 }}>
          <button
            type="button"
            className={`dp-trigger${open === 'month' ? ' dp-open' : ''}`}
            style={{ ...trigger, color: selMon ? '#f8f4ff' : 'rgba(248,244,255,.35)' }}
            onClick={() => setOpen(p => p === 'month' ? null : 'month')}
            aria-haspopup="listbox"
            aria-expanded={open === 'month'}
          >
            <span style={{ flex: 1, textAlign: 'left' }}>{selMon ?? 'Month'}</span>
            <Chevron open={open === 'month'} />
          </button>

          {open === 'month' && (
            <div style={panel} role="listbox" aria-label="Select month">
              <PanelHeader>Select Month</PanelHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: '.7rem' }}>
                {MONTHS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`dp-mon-btn${selMon === m ? ' dp-sel' : ''}`}
                    onClick={() => pickMonth(m)}
                    role="option"
                    aria-selected={selMon === m}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* selected date badge */}
      {selDay && selMon && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '.4rem',
          marginTop: '.55rem', padding: '.3rem .8rem',
          background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)',
          borderRadius: '2rem', fontSize: '.75rem', color: '#fde68a',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, display:'inline-block' }} />
          🎂 {selDay} {selMon}
        </div>
      )}

      {error && (
        <p style={{ marginTop: '.4rem', fontSize: '.75rem', color: '#f87171' }}>⚠️ {error}</p>
      )}
    </>
  );
}

/* ── tiny sub-components ── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: 'transform .22s ease', transform: open ? 'rotate(180deg)' : 'none', opacity: open ? .9 : .45, flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="rgba(248,244,255,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HomeForm
   ═══════════════════════════════════════════════════════════ */
export default function HomeForm() {
  const [form, setForm]       = useState<FormState>({ name: '', dateOfBirth: '', message: '' });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [generated, setGenerated] = useState<GeneratedWish | null>(null);
  const [step, setStep]       = useState<'form' | 'result'>('form');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── validate ── */
  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter a name (at least 2 characters)';

    const parts = form.dateOfBirth.split(' ');
    if (parts.length !== 2) {
      errs.dateOfBirth = 'Please select a day and month';
    } else {
      const d = parseInt(parts[0]);
      if (isNaN(d) || d < 1 || d > 31) errs.dateOfBirth = 'Day must be between 1 and 31';
      else if (!MONTHS.includes(parts[1]))  errs.dateOfBirth = 'Please select a valid month';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── file handling (unchanged) ── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const errs: string[] = [];
    const valid: PreviewFile[] = [];
    let slots = MAX_FILES - previews.length;
    if (slots <= 0) { errs.push(`Maximum ${MAX_FILES} images allowed.`); }
    for (const file of files) {
      if (slots <= 0) break;
      if (!ALLOWED.includes(file.type)) { errs.push(`"${file.name}" is not a valid type`); continue; }
      if (file.size > MAX_SIZE)         { errs.push(`"${file.name}" exceeds 2 MB`); continue; }
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
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }

  async function uploadImages(): Promise<string[]> {
    if (previews.length === 0) return [];
    setUploadMsg('Uploading photos…');
    const fd = new FormData();
    previews.forEach(p => fd.append('images', p.file));
    const res  = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
    return json.urls as string[];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadImages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (msg.includes('not configured')) { console.warn('Cloudinary not set up'); }
      else { setErrors(prev => ({ ...prev, upload: msg })); setLoading(false); setUploadMsg(''); return; }
    }
    setUploadMsg('Generating your surprise…');
    await new Promise(r => setTimeout(r, 400));
    const wishData: WishData = {
      name:        form.name.trim(),
      dateOfBirth: form.dateOfBirth.trim(),
      message:     form.message.trim() || '',
      createdAt:   new Date().toISOString(),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };
    const slug    = generateSlug(wishData.name, wishData.dateOfBirth);
    const baseUrl = window.location.origin;
    const url     = buildWishUrl(slug, wishData, baseUrl);
    setGenerated({ slug, url, data: wishData });
    setStep('result');
    setLoading(false);
    setUploadMsg('');
  }

  function handleReset() {
    previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setStep('form'); setGenerated(null);
    setForm({ name: '', dateOfBirth: '', message: '' });
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

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-visible reveal">
        <div style={{ position:'absolute', top:0, right:0, width:120, height:120, background:'radial-gradient(circle at top right,rgba(251,191,36,.15),transparent 70%)', pointerEvents:'none' }}/>

        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ fontFamily:'var(--font-display)', color:'#fde68a' }}>
          Fill in the Details
        </h2>
        <p className="text-center text-sm mb-8" style={{ color:'rgba(248,244,255,0.5)' }}>
          We'll craft something magical ✨
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Name ── */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              🎂 Birthday Person's Name
            </label>
            <input
              id="name" type="text"
              className="input-field w-full px-4 py-3 rounded-xl text-base"
              placeholder="e.g. Sophia, Priya, Alex…"
              value={form.name} maxLength={50}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
            />
            {errors.name && <p className="mt-1.5 text-xs" style={{ color:'#f87171' }}>⚠️ {errors.name}</p>}
          </div>

          {/* ── Date of Birth — Enhanced Picker ── */}
          <div className="mb-5" style={{ position: 'relative', zIndex: 20 }}>
            <label className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              🎈 Date of Birth <span style={{ fontWeight:'normal', fontSize:'0.75rem', opacity:.6 }}>(Day &amp; Month only)</span>
            </label>
            <BirthdayDatePicker
              value={form.dateOfBirth}
              onChange={val => { setForm(prev => ({ ...prev, dateOfBirth: val })); setErrors(prev => ({ ...prev, dateOfBirth: undefined })); }}
              error={errors.dateOfBirth}
            />
          </div>

          {/* ── Message ── */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              💌 Your Heartfelt Message <span style={{ fontWeight:'normal', fontSize:'0.7rem', opacity:.6 }}>(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_MESSAGES.map((msg, idx) => (
                <button key={idx} type="button" onClick={() => setQuickMessage(msg)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{ background:'rgba(251,191,36,.12)', border:'1px solid rgba(251,191,36,.3)', color:'#fde68a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,191,36,.12)')}>
                  {msg.length > 30 ? msg.slice(0, 30) + '…' : msg}
                </button>
              ))}
            </div>
            <textarea id="message"
              className="input-field w-full px-4 py-3 rounded-xl text-base resize-none"
              placeholder="Write something beautiful… or choose a quick message ✨"
              rows={4} maxLength={500} value={form.message}
              onChange={e => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: undefined }); }}
            />
            <span className="text-xs mt-1 block" style={{ color:'rgba(248,244,255,.3)' }}>
              Optional · {form.message.length}/500
            </span>
          </div>

          {/* ── Image Upload ── */}
          <div className="mb-7">
            <label className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              📸 Add Photos <span style={{ color:'rgba(248,244,255,.35)', fontWeight:400 }}>(optional · max {MAX_FILES})</span>
            </label>
            {spotsLeft > 0 && (
              <div onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                style={{ border:`2px dashed ${dragOver ? 'rgba(251,191,36,.6)' : 'rgba(255,255,255,.1)'}`, borderRadius:'1rem', background:dragOver ? 'rgba(251,191,36,.05)' : 'rgba(255,255,255,.02)', padding:'1.5rem 1rem', textAlign:'center', cursor:'pointer', transition:'all .25s ease', marginBottom:previews.length ? '1rem' : 0 }}>
                <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>🖼️</div>
                <p style={{ color:'rgba(248,244,255,.5)', fontSize:'.85rem', marginBottom:'.25rem' }}>Tap to add photos or drag &amp; drop</p>
                <p style={{ color:'rgba(248,244,255,.25)', fontSize:'.72rem' }}>JPG, PNG, WEBP · Max 2 MB · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple
              style={{ display:'none' }} onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
            {previews.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'.6rem' }}>
                {previews.map((p, i) => (
                  <div key={p.id} style={{ position:'relative', aspectRatio:'1/1', borderRadius:'.75rem', overflow:'hidden', border:'1px solid rgba(251,191,36,.2)', background:'#0d0020' }}>
                    <div style={{ position:'absolute', top:5, left:6, zIndex:2, background:'rgba(0,0,0,.55)', borderRadius:'1rem', padding:'1px 7px', fontSize:'.6rem', color:'rgba(255,255,255,.7)', fontWeight:600 }}>{i + 1}</div>
                    <img src={p.previewUrl} alt={`Preview ${i + 1}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', inset:0, background:'rgba(3,0,20,.4)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <button type="button" onClick={() => removePreview(p.id)}
                        style={{ background:'rgba(239,68,68,.85)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', color:'white', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                    </div>
                  </div>
                ))}
                {spotsLeft > 0 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    style={{ aspectRatio:'1/1', borderRadius:'.75rem', border:'2px dashed rgba(255,255,255,.1)', background:'rgba(255,255,255,.02)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'.25rem', color:'rgba(248,244,255,.3)', fontSize:'.75rem', transition:'all .2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(251,191,36,.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,191,36,.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,244,255,.3)'; }}>
                    <span style={{ fontSize:'1.4rem', lineHeight:1 }}>+</span>
                    <span>Add</span>
                  </button>
                )}
              </div>
            )}
            {errors.images && <p className="mt-2 text-xs" style={{ color:'#f87171' }}>⚠️ {errors.images}</p>}
            {errors.upload && <p className="mt-2 text-xs" style={{ color:'#f87171' }}>❌ {errors.upload}</p>}
            {previews.length > 0 && (
              <p style={{ marginTop:'.6rem', fontSize:'.7rem', color:'rgba(248,244,255,.25)', textAlign:'center' }}>
                {previews.length} photo{previews.length > 1 ? 's' : ''} selected · These will appear on the birthday page
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold w-full py-4 rounded-2xl text-base relative"
            style={{ fontFamily:'var(--font-body)', opacity:loading ? .85 : 1 }}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {uploadMsg || 'Creating Magic…'}
                </>
              ) : <>✨ Generate Birthday Surprise</>}
            </span>
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color:'rgba(248,244,255,.22)' }}>
          Free forever · No sign-up needed · Share instantly
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['📸 Real Photos', '🎊 Confetti', '🎵 Music', '✨ Animations', '📱 QR Code'].map(f => (
          <span key={f} className="text-xs px-3 py-1 rounded-full"
            style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', color:'rgba(248,244,255,.6)' }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}