import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | WishQR',
  description:
    "Have questions, feedback, or a partnership inquiry? Reach out to the WishQR team — we'd love to hear from you.",
};

const contacts = [
  {
    icon: '✉️',
    title: 'General Support',
    description: 'Questions about your birthday page, bugs, or general help.',
    value: 'support@wishqr.in',
    href: 'mailto:support@wishqr.in',
    note: 'We aim to reply within 48 hours.',
  },
  {
    icon: '📮',
    title: 'Business & Partnerships',
    description: 'For collaborations, advertising inquiries, or business proposals.',
    value: 'partners@wishqr.in',
    href: 'mailto:partners@wishqr.in',
    note: 'We review all partnership requests carefully.',
  },
  {
    icon: '🔒',
    title: 'Privacy & Data Requests',
    description:
      'To request data deletion, access your stored data, or report a privacy concern.',
    value: 'support@wishqr.in',
    href: 'mailto:support@wishqr.in',
    note: 'Data requests are processed within 7 business days.',
  },
];

export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      <div className="relative z-10 px-4 py-12 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav
          className="text-xs mb-8 flex items-center gap-2"
          style={{ color: 'rgba(248,244,255,0.35)' }}
        >
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Contact</span>
        </nav>

        {/* Header */}
        <div className="glass rounded-2xl p-6 md:p-8 text-center mb-6">
          <div className="text-5xl mb-4">📬</div>
          <h1
            className="text-3xl md:text-4xl font-black mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Contact Us
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'rgba(248,244,255,0.6)' }}>
            Whether you have a question, found a bug, or just want to say hi — we&apos;re here.
            Choose the right inbox below for the fastest response.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c.title}
              className="glass rounded-2xl p-6 flex items-start gap-4 group hover:scale-[1.01] transition-transform duration-200"
            >
              <span className="text-3xl mt-0.5">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base mb-0.5" style={{ color: '#fde68a' }}>
                  {c.title}
                </h2>
                <p
                  className="text-xs mb-2 leading-relaxed"
                  style={{ color: 'rgba(248,244,255,0.45)' }}
                >
                  {c.description}
                </p>
                <a
                  href={c.href}
                  className="text-sm font-medium underline underline-offset-2 decoration-yellow-400/40 hover:decoration-yellow-400 transition-all"
                  style={{ color: '#fde68a' }}
                >
                  {c.value}
                </a>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(248,244,255,0.3)' }}>
                  {c.note}
                </p>
              </div>
            </div>
          ))}

          {/* ── Physical Address Card ── */}
          <div className="glass rounded-2xl p-6 flex items-start gap-4">
            <span className="text-3xl mt-0.5">📍</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base mb-0.5" style={{ color: '#fde68a' }}>
                Our Address
              </h2>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: 'rgba(248,244,255,0.45)' }}
              >
                For official correspondence and legal notices only.
              </p>
              <address
                className="not-italic text-sm leading-7"
                style={{ color: 'rgba(248,244,255,0.72)' }}
              >
                <span className="font-semibold" style={{ color: '#fde68a' }}>WishQR</span>
                <br />
                L Sector, Ram Nagar, N 2
                <br />
                CIDCO, Chhatrapati Sambhajinagar
                <br />
                Maharashtra – 431006
                <br />
                India
              </address>
            </div>
          </div>
        </div>

        {/* Legal Note */}
        <div
          className="glass rounded-2xl p-5 mt-6 text-sm leading-relaxed"
          style={{ color: 'rgba(248,244,255,0.45)' }}
        >
          <span className="text-base mr-2">⚖️</span>
          For data deletion or access requests under applicable privacy laws (GDPR, India IT
          Act), please email{' '}
          <a href="mailto:support@wishqr.in" className="underline" style={{ color: '#fde68a' }}>
            support@wishqr.in
          </a>{' '}
          with the subject line <em>&quot;Data Request&quot;</em>. Include your page link if
          applicable. We process all requests within{' '}
          <strong style={{ color: 'rgba(248,244,255,0.7)' }}>7 business days</strong>.
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.35)' }}>
            For more on how we handle your data, read our{' '}
            <Link
              href="/privacy"
              className="underline hover:text-yellow-400 transition-colors"
              style={{ color: 'rgba(248,244,255,0.55)' }}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} WishQR · All rights reserved
          </p>
        </footer>
      </div>
    </main>
  );
}