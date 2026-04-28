import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Birthday QR Surprise',
  description: 'Terms and conditions for using Birthday QR Surprise – free birthday wish generator with QR codes.',
};

export default function TermsPage() {
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
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Terms of Service</span>
        </nav>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}>
            Terms of Service
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(248,244,255,0.4)' }}>Effective: April 28, 2026</p>

          <div className="space-y-6 text-sm md:text-base" style={{ color: 'rgba(248,244,255,0.7)' }}>
            <p>Welcome to Birthday QR Surprise! By using our website (birthdayqrsurprise.com), you agree to these Terms.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>1. Service Description</h2>
            <p>We provide a free tool to generate personalized birthday pages with QR codes. The service is provided “as is” without warranties of any kind.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>2. Acceptable Use</h2>
            <p>You agree not to use the service for any illegal or harmful purposes. Do not generate pages that contain hate speech, harassment, or copyrighted material you don’t own. We reserve the right to remove any content at our sole discretion.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>3. Intellectual Property</h2>
            <p>Our code, design, and branding are owned by Birthday QR Surprise. However, the birthday messages and names you enter belong to you. The generated pages are for personal, non‑commercial use.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>4. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service. In no event shall our liability exceed $100.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>5. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use after changes means you accept the revised Terms.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>6. Governing Law</h2>
            <p>These Terms are governed by the laws of India / your jurisdiction of residence.</p>

            <h2 className="text-xl font-semibold mt-6" style={{ color: '#fde68a' }}>7. Contact</h2>
            <p>For any issues, please <Link href="/contact" className="text-yellow-400 hover:underline">contact us</Link>.</p>
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