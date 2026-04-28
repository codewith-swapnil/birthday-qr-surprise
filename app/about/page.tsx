import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Birthday QR Surprise',
  description: 'Learn about Birthday QR Surprise – our mission, the team, and why we built a free birthday wish generator with QR codes.',
};

export default function AboutPage() {
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
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>About</span>
        </nav>

        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎂✨</div>
            <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
              About Birthday QR Surprise
            </h1>
          </div>

          <div className="space-y-5 text-sm md:text-base" style={{ color: 'rgba(248,244,255,0.7)' }}>
            <p>
              We believe that <strong className="text-yellow-300">birthdays deserve magic</strong>. 
              Not just a “Happy Birthday” text, but a moment of genuine surprise and delight. 
              That’s why we built Birthday QR Surprise – a free, instant, and beautiful way to turn 
              your words into an animated, shareable birthday page.
            </p>

            <h2 className="text-xl font-semibold pt-2" style={{ color: '#fde68a' }}>Our Mission</h2>
            <p>
              To help you create unforgettable birthday moments without spending a dime or jumping 
              through hoops. No accounts, no sign‑ups, no hidden fees. Just enter a name, age, and 
              message – and get a QR code + link in seconds.
            </p>

            <h2 className="text-xl font-semibold pt-2" style={{ color: '#fde68a' }}>Why QR Codes?</h2>
            <p>
              QR codes turn a simple link into a tactile surprise. Print it, stick it on a gift, 
              or send it digitally. When scanned, your loved one gets a personal confetti‑filled 
              webpage that feels like a real gift – because it is.
            </p>

            <h2 className="text-xl font-semibold pt-2" style={{ color: '#fde68a' }}>Built with ❤️ by a Small Team</h2>
            <p>
              Birthday QR Surprise is developed and maintained by a small, passionate group of 
              developers and designers who love birthdays and clean code. We are based in India 
              and serve users worldwide.
            </p>

            <h2 className="text-xl font-semibold pt-2" style={{ color: '#fde68a' }}>Our Commitment</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>🔒 <strong>Privacy first</strong> – We don’t store your personal data.</li>
              <li>⚡ <strong>Instant & reliable</strong> – Pages load fast on any device.</li>
              <li>🧠 <strong>Programmatic SEO blog</strong> – Hundreds of helpful guides (free).</li>
              <li>🎉 <strong>100% free forever</strong> – Supported by non‑intrusive ads.</li>
            </ul>

            <p className="pt-4">
              Have suggestions or found a bug? We’d love to hear from you – <Link href="/contact" className="text-yellow-400 hover:underline">contact us anytime</Link>.
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