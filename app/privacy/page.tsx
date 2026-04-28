import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Birthday QR Surprise',
  description: 'Read our privacy policy to understand how we collect, use, and protect your data when using Birthday QR Surprise.',
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      <div className="relative z-10 px-4 py-12 max-w-4xl mx-auto">
        <nav className="text-xs mb-8 flex items-center gap-2" style={{ color: 'rgba(248,244,255,0.35)' }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <span>/</span>
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Privacy Policy</span>
        </nav>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
            Privacy Policy
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(248,244,255,0.4)' }}>Last updated: April 28, 2026</p>

          <div className="space-y-6 text-sm md:text-base" style={{ color: 'rgba(248,244,255,0.7)' }}>
            <p>At Birthday QR Surprise, we respect your privacy. This policy describes how we handle any data when you use our free birthday QR generator.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>1. Information We Collect</h2>
            <p>We do <strong>not</strong> require accounts or collect personal information like names, email addresses, or payment details. The name, age, and message you enter are used only to generate your personalized birthday page. They are <strong>not stored permanently</strong> on our servers after the page is created.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>2. Use of Cookies</h2>
            <p>We may use essential cookies to enable basic site functionality (e.g., form state). No tracking cookies are used without consent. Third‑party ads (if shown) may set cookies; you can manage these via browser settings.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>3. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal data. The birthday pages you create are public by nature if you share the link; please only share with people you trust.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>4. Third‑Party Services</h2>
            <p>We may use standard analytics (e.g., Vercel Analytics) and ad networks (e.g., Google AdSense) that collect anonymized usage data. These services have their own privacy policies.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>5. Children’s Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect information from them.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>6. Changes to This Policy</h2>
            <p>We may update this policy occasionally. The “Last updated” date at the top indicates changes. Continued use of the site implies acceptance.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>7. Contact Us</h2>
            <p>If you have questions, please <Link href="/contact" className="text-yellow-400 hover:underline">contact us</Link>.</p>
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