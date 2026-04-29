'use client';

import { useState, useRef, useCallback } from 'react';
import QRDisplay from './QRDisplay';
import { generateSlug, buildWishUrl, WishData } from '@/lib/utils';

/* ─── types ─────────────────────────────────────────────── */
interface FormState { name: string; age: string; message: string; }
interface FormErrors extends Partial<FormState> { images?: string; upload?: string; }
interface PreviewFile { id: string; file: File; previewUrl: string; }
interface GeneratedWish { slug: string; url: string; data: WishData; }

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE  = 2 * 1024 * 1024; // 2 MB
const MAX_FILES = 5;

/* ─── component ─────────────────────────────────────────── */
export default function HomeForm() {
  const [form,      setForm]      = useState<FormState>({ name: '', age: '', message: '' });
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [previews,  setPreviews]  = useState<PreviewFile[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [generated, setGenerated] = useState<GeneratedWish | null>(null);
  const [step,      setStep]      = useState<'form' | 'result'>('form');
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── validate form fields ── */
  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter a name (at least 2 characters)';
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)
      errs.age = 'Please enter a valid age (1–120)';
    if (!form.message.trim() || form.message.trim().length < 5)
      errs.message = 'Please write a message (at least 5 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── add files (from input or drop) ── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const errs: string[] = [];
    const valid: PreviewFile[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        errs.push(`"${file.name}" is not a valid image type`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errs.push(`"${file.name}" exceeds 2 MB`);
        continue;
      }
      valid.push({ id: `${file.name}-${file.lastModified}`, file, previewUrl: URL.createObjectURL(file) });
    }

    setPreviews(prev => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_FILES) {
        errs.push(`Maximum ${MAX_FILES} images — only the first ${MAX_FILES} kept.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });

    setErrors(e => ({ ...e, images: errs.length ? errs[0] : undefined }));
  }, []);

  function removePreview(id: string) {
    setPreviews(prev => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  }

  /* ── drag & drop ── */
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  /* ── upload images to Cloudinary via API route ── */
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

  /* ── submit ── */
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
      // If Cloudinary isn't configured, continue without images
      if (msg.includes('not configured')) {
        console.warn('Cloudinary not set up – proceeding without images');
      } else {
        setErrors(prev => ({ ...prev, upload: msg }));
        setLoading(false);
        setUploadMsg('');
        return;
      }
    }

    setUploadMsg('Generating your surprise…');
    await new Promise(r => setTimeout(r, 400));

    const wishData: WishData = {
      name:      form.name.trim(),
      age:       form.age.trim(),
      message:   form.message.trim(),
      createdAt: new Date().toISOString(),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    const slug    = generateSlug(wishData.name, wishData.age);
    const baseUrl = window.location.origin;
    const url     = buildWishUrl(slug, wishData, baseUrl);

    setGenerated({ slug, url, data: wishData });
    setStep('result');
    setLoading(false);
    setUploadMsg('');
  }

  function handleReset() {
    previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setStep('form');
    setGenerated(null);
    setForm({ name: '', age: '', message: '' });
    setErrors({});
    setPreviews([]);
    setUploadMsg('');
  }

  if (step === 'result' && generated) {
    return <QRDisplay wish={generated} onReset={handleReset} />;
  }

  const spotsLeft = MAX_FILES - previews.length;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden reveal">
        {/* Corner glow */}
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
              onChange={e => { setForm({...form, name:e.target.value}); setErrors({...errors, name:undefined}); }}
            />
            {errors.name && <p className="mt-1.5 text-xs" style={{color:'#f87171'}}>⚠️ {errors.name}</p>}
          </div>

          {/* ── Age ── */}
          <div className="mb-5">
            <label htmlFor="age" className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              🎈 Age (How old are they turning?)
            </label>
            <input
              id="age" type="number"
              className="input-field w-full px-4 py-3 rounded-xl text-base"
              placeholder="e.g. 25" min={1} max={120}
              value={form.age}
              onChange={e => { setForm({...form, age:e.target.value}); setErrors({...errors, age:undefined}); }}
            />
            {errors.age && <p className="mt-1.5 text-xs" style={{color:'#f87171'}}>⚠️ {errors.age}</p>}
          </div>

          {/* ── Message ── */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              💌 Your Heartfelt Message
            </label>
            <textarea
              id="message"
              className="input-field w-full px-4 py-3 rounded-xl text-base resize-none"
              placeholder="Write something beautiful… 'May your day be filled with laughter, joy, and endless cake! 🎂'"
              rows={4} maxLength={500}
              value={form.message}
              onChange={e => { setForm({...form, message:e.target.value}); setErrors({...errors, message:undefined}); }}
            />
            <div className="flex justify-between mt-1">
              {errors.message
                ? <p className="text-xs" style={{color:'#f87171'}}>⚠️ {errors.message}</p>
                : <span/>}
              <span className="text-xs" style={{color:'rgba(248,244,255,.3)'}}>{form.message.length}/500</span>
            </div>
          </div>

          {/* ── IMAGE UPLOAD ── */}
          <div className="mb-7">
            <label className="block text-sm font-medium mb-2" style={{ color:'rgba(248,244,255,.7)', letterSpacing:'.05em' }}>
              📸 Add Photos <span style={{color:'rgba(248,244,255,.35)', fontWeight:400}}>(optional · max {MAX_FILES})</span>
            </label>

            {/* Drop zone */}
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
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .25s ease',
                  marginBottom: previews.length ? '1rem' : 0,
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🖼️</div>
                <p style={{ color: 'rgba(248,244,255,.5)', fontSize: '.85rem', marginBottom: '.25rem' }}>
                  Tap to add photos or drag & drop
                </p>
                <p style={{ color: 'rgba(248,244,255,.25)', fontSize: '.72rem' }}>
                  JPG, PNG, WEBP · Max 2 MB each · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />

            {/* Preview grid */}
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.6rem' }}>
                {previews.map((p, i) => (
                  <div key={p.id} style={{
                    position: 'relative', aspectRatio: '1/1',
                    borderRadius: '.75rem', overflow: 'hidden',
                    border: '1px solid rgba(251,191,36,.2)',
                    background: '#0d0020',
                  }}>
                    {/* Badge */}
                    <div style={{
                      position: 'absolute', top: 5, left: 6, zIndex: 2,
                      background: 'rgba(0,0,0,.55)', borderRadius: '1rem',
                      padding: '1px 7px', fontSize: '.6rem',
                      color: 'rgba(255,255,255,.7)', fontWeight: 600,
                    }}>
                      {i + 1}
                    </div>

                    <img
                      src={p.previewUrl}
                      alt={`Preview ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />

                    {/* Overlay on hover */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(3,0,20,.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity .2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <button
                        type="button"
                        onClick={() => removePreview(p.id)}
                        style={{
                          background: 'rgba(239,68,68,.85)',
                          border: 'none', borderRadius: '50%',
                          width: 30, height: 30, cursor: 'pointer',
                          color: 'white', fontSize: '1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more slot */}
                {spotsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '1/1', borderRadius: '.75rem',
                      border: '2px dashed rgba(255,255,255,.1)',
                      background: 'rgba(255,255,255,.02)',
                      cursor: 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '.25rem', color: 'rgba(248,244,255,.3)', fontSize: '.75rem',
                      transition: 'all .2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(251,191,36,.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,191,36,.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,244,255,.3)'; }}
                  >
                    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>+</span>
                    <span>Add</span>
                  </button>
                )}
              </div>
            )}

            {errors.images  && <p className="mt-2 text-xs" style={{color:'#f87171'}}>⚠️ {errors.images}</p>}
            {errors.upload  && <p className="mt-2 text-xs" style={{color:'#f87171'}}>❌ {errors.upload}</p>}

            {previews.length > 0 && (
              <p style={{ marginTop: '.6rem', fontSize: '.7rem', color: 'rgba(248,244,255,.25)', textAlign: 'center' }}>
                {previews.length} photo{previews.length > 1 ? 's' : ''} selected · These will appear on the birthday page
              </p>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-4 rounded-2xl text-base relative"
            style={{ fontFamily: 'var(--font-body)', opacity: loading ? .85 : 1 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {uploadMsg || 'Creating Magic…'}
                </>
              ) : (
                <>✨ Generate Birthday Surprise</>
              )}
            </span>
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color:'rgba(248,244,255,.22)' }}>
          Free forever · No sign-up needed · Share instantly
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['📸 Real Photos','🎊 Confetti','🎵 Music','✨ Animations','📱 QR Code'].map(f => (
          <span key={f} className="text-xs px-3 py-1 rounded-full" style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', color:'rgba(248,244,255,.6)' }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
