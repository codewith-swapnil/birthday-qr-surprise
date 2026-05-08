import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | WishQR',
  description:
    'Learn about WishQR – our mission and why we built a free birthday wish generator with personalized QR pages.',
};

const commitments = [
  {
    icon: '🔒',
    label: 'Privacy Conscious',
    detail:
      "We collect only what's needed to generate your page. Read our Privacy Policy for full details.",
  },
  {
    icon: '⚡',
    label: 'Fast & Reliable',
    detail: 'Pages load instantly on any device, anywhere in the world.',
  },
  {
    icon: '🎉',
    label: 'Free to Use',
    detail: 'Creating a birthday page costs nothing. The service is supported by ads.',
  },
  {
    icon: '🌍',
    label: 'Made in India',
    detail:
      'Built and maintained in Chhatrapati Sambhajinagar, Maharashtra — serving users worldwide.',
  },
];

export default function AboutPage() {
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
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>About</span>
        </nav>

        {/* Hero Card */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6 text-center">
          <div className="text-5xl mb-3">🎂✨</div>
          <h1
            className="text-3xl md:text-4xl font-black mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            About WishQR
          </h1>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.6)' }}
          >
            A simple, beautiful way to turn your birthday wishes into a shareable animated page —
            complete with a QR code your loved one can scan anywhere.
          </p>
        </div>

        {/* Mission */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#fde68a' }}>
            Our Mission
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.7)' }}
          >
            We believe birthdays deserve more than a plain text message. WishQR was built to help
            anyone create a genuinely personal birthday moment — no account required, no design
            skills needed. Enter a name, an age, and a message, and you get a beautiful page with
            a unique link and QR code in seconds.
          </p>
        </div>

        {/* Why QR Codes */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#fde68a' }}>
            Why QR Codes?
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.7)' }}
          >
            A QR code turns a digital link into a physical surprise. Print it on a card, stick it
            on a gift box, or send it in a chat. When scanned, your recipient lands on a
            confetti-filled animated page that feels personal — because you wrote every word on it.
          </p>
        </div>

        {/* Team */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#fde68a' }}>
            Built with ❤️ by a Small Team
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.7)' }}
          >
            WishQR is built and maintained by a small team of developers based in{' '}
            <strong style={{ color: 'rgba(248,244,255,0.9)' }}>
              Chhatrapati Sambhajinagar, Maharashtra, India
            </strong>
            . We care about clean code, honest design, and making something genuinely useful for
            people around the world.
          </p>
        </div>

        {/* Commitments Grid */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold mb-5" style={{ color: '#fde68a' }}>
            Our Commitments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {commitments.map((c) => (
              <div
                key={c.label}
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(253,230,138,0.05)',
                  border: '1px solid rgba(253,230,138,0.1)',
                }}
              >
                <p className="text-xl mb-1">{c.icon}</p>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'rgba(248,244,255,0.9)' }}
                >
                  {c.label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(248,244,255,0.5)' }}
                >
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Note — critical for Google Ads */}
        <div
          className="glass rounded-2xl p-5 mb-6 text-sm leading-relaxed"
          style={{ color: 'rgba(248,244,255,0.5)' }}
        >
          <span className="mr-2">💡</span>
          <strong style={{ color: 'rgba(248,244,255,0.75)' }}>Transparency: </strong>
          WishQR is free to use and supported by advertising (Google AdSense). We store the
          content you enter in order to generate and serve your birthday page. For full details on
          what we collect and how we use it, please read our{' '}
          <Link href="/privacy" className="underline" style={{ color: '#fde68a' }}>
            Privacy Policy
          </Link>
          .
        </div>

        {/* CTA */}
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm mb-4" style={{ color: 'rgba(248,244,255,0.6)' }}>
            Have a suggestion, found a bug, or just want to say hi?
          </p>
          <Link
            href="/contact"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background:
                'linear-gradient(135deg, rgba(253,230,138,0.2) 0%, rgba(253,200,80,0.15) 100%)',
              border: '1px solid rgba(253,230,138,0.35)',
              color: '#fde68a',
            }}
          >
            Contact Us →
          </Link>
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