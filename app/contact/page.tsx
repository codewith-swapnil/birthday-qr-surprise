import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Birthday QR Surprise',
  description: 'Have questions or feedback? Contact the Birthday QR Surprise team. We’d love to hear from you!',
};

export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      <div className="relative z-10 px-4 py-12 max-w-3xl mx-auto">
        <nav className="text-xs mb-8 flex items-center gap-2" style={{ color: 'rgba(248,244,255,0.35)' }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <span>/</span>
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Contact</span>
        </nav>

        <div className="glass rounded-2xl p-6 md:p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
            Contact Us
          </h1>
          <p className="text-sm md:text-base mb-8" style={{ color: 'rgba(248,244,255,0.65)' }}>
            We’d love to hear from you! Whether you have a question, feedback, or just want to say hi.
          </p>

          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✉️</span>
              <div>
                <h2 className="font-semibold" style={{ color: '#fde68a' }}>Email</h2>
                <p className="text-sm"><a href="mailto:support@wishqr.in" className="hover:text-yellow-400 transition-colors">support@wishqr.in</a></p>
                <p className="text-xs mt-1" style={{ color: 'rgba(248,244,255,0.4)' }}>We aim to reply within 48 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl">💬</span>
              <div>
                <h2 className="font-semibold" style={{ color: '#fde68a' }}>Social / Direct Message</h2>
                <p className="text-sm">Not available yet – please use email.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl">📮</span>
              <div>
                <h2 className="font-semibold" style={{ color: '#fde68a' }}>Business / Partnership</h2>
                <p className="text-sm">For collaborations or advertising inquiries: <a href="mailto:partners@wishqr.in" className="hover:text-yellow-400 transition-colors">partners@wishqr.in</a></p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs" style={{ color: 'rgba(248,244,255,0.4)' }}>
              You can also reach out via the feedback form (coming soon) or simply tweet us at <span className="text-yellow-400">@WishQR</span>.
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} Birthday QR Surprise · All rights reserved
          </p>
        </footer>
      </div>
    </main>
  );
}