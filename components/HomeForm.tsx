'use client';

import { useState } from 'react';
import QRDisplay from './QRDisplay';
import { generateSlug, encodeWishData, buildWishUrl, WishData } from '@/lib/utils';

interface FormState {
  name: string;
  age: string;
  message: string;
}

interface GeneratedWish {
  slug: string;
  url: string;
  data: WishData;
}

export default function HomeForm() {
  const [form, setForm] = useState<FormState>({ name: '', age: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedWish | null>(null);
  const [step, setStep] = useState<'form' | 'result'>('form');

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Please enter a name (at least 2 characters)';
    }
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) {
      errs.age = 'Please enter a valid age (1–120)';
    }
    if (!form.message.trim() || form.message.trim().length < 5) {
      errs.message = 'Please write a message (at least 5 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate async

    const wishData: WishData = {
      name: form.name.trim(),
      age: form.age.trim(),
      message: form.message.trim(),
      createdAt: new Date().toISOString(),
    };

    const slug = generateSlug(wishData.name, wishData.age);
    const baseUrl = window.location.origin;
    const url = buildWishUrl(slug, wishData, baseUrl);

    setGenerated({ slug, url, data: wishData });
    setStep('result');
    setLoading(false);
  }

  function handleReset() {
    setStep('form');
    setGenerated(null);
    setForm({ name: '', age: '', message: '' });
    setErrors({});
  }

  if (step === 'result' && generated) {
    return <QRDisplay wish={generated} onReset={handleReset} />;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Form Card */}
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden reveal">
        {/* Decorative corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at top right, rgba(251,191,36,0.15), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <h2
          className="text-2xl md:text-3xl font-bold mb-2 text-center"
          style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
        >
          Fill in the Details
        </h2>
        <p className="text-center text-sm mb-8" style={{ color: 'rgba(248,244,255,0.5)' }}>
          We'll craft something magical ✨
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(248,244,255,0.7)', letterSpacing: '0.05em' }}
            >
              🎂 Birthday Person's Name
            </label>
            <input
              id="name"
              type="text"
              className="input-field w-full px-4 py-3 rounded-xl text-base"
              placeholder="e.g. Khushi, Priya, Saurabh..."
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>
                ⚠️ {errors.name}
              </p>
            )}
          </div>

          {/* Age Field */}
          <div className="mb-6">
            <label
              htmlFor="age"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(248,244,255,0.7)', letterSpacing: '0.05em' }}
            >
              🎈 Age (How old are they turning?)
            </label>
            <input
              id="age"
              type="number"
              className="input-field w-full px-4 py-3 rounded-xl text-base"
              placeholder="e.g. 25"
              value={form.age}
              onChange={(e) => {
                setForm({ ...form, age: e.target.value });
                if (errors.age) setErrors({ ...errors, age: undefined });
              }}
              min={1}
              max={120}
            />
            {errors.age && (
              <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>
                ⚠️ {errors.age}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="mb-8">
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(248,244,255,0.7)', letterSpacing: '0.05em' }}
            >
              💌 Your Heartfelt Message
            </label>
            <textarea
              id="message"
              className="input-field w-full px-4 py-3 rounded-xl text-base resize-none"
              placeholder="Write something beautiful... e.g. 'May your day be filled with laughter, joy, and endless cake! 🎂'"
              rows={4}
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {errors.message ? (
                <p className="text-xs" style={{ color: '#f87171' }}>
                  ⚠️ {errors.message}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs" style={{ color: 'rgba(248,244,255,0.3)' }}>
                {form.message.length}/500
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-4 rounded-2xl text-base relative"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Magic...
                </>
              ) : (
                <>
                  ✨ Generate Birthday Surprise
                </>
              )}
            </span>
          </button>
        </form>

        {/* Bottom note */}
        <p className="text-center text-xs mt-5" style={{ color: 'rgba(248,244,255,0.25)' }}>
          Free forever · No sign-up needed · Share instantly
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['🎊 Confetti', '🎈 Balloons', '✨ Animations', '📱 QR Code', '🔗 Shareable'].map((f) => (
          <span
            key={f}
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: 'rgba(248,244,255,0.6)',
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
