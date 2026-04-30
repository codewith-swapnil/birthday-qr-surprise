import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import HomeForm from '@/components/HomeForm';
import { FEATURED_SLUGS, generateBlogContent } from '@/lib/blogData';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

export const metadata: Metadata = {
  title: 'Birthday QR Surprise 🎉 – Free Birthday Wish Generator & QR Code Creator',
  description:
    'Create a personalized birthday surprise with QR code. Enter name, age & message to generate a magical animated wish page with confetti and balloons. Share instantly via WhatsApp. 100% free.',
  keywords: [
    'birthday wish generator',
    'free birthday QR code',
    'personalized birthday message',
    'magical birthday surprise',
    'birthday page with confetti',
    'shareable birthday link',
  ],
  alternates: {
    canonical: 'https://wishqr.in',
  },
  openGraph: {
    title: 'Birthday QR Surprise – Free Magical Birthday Wish Generator',
    description: 'Generate a stunning birthday page with confetti, balloons, and a QR code. Share the love in seconds!',
    url: 'https://wishqr.in',
    siteName: 'Birthday QR Surprise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Birthday QR Surprise – Create magical birthday wishes',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday QR Surprise – Free Birthday Wish Generator',
    description: 'Create a personalized animated birthday page with QR code – share via WhatsApp.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  const featuredPosts = FEATURED_SLUGS.slice(0, 6).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-md"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <StarField />

        {/* Ambient glows - purely decorative */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative z-10 px-4 sm:px-6 py-8 md:py-12 lg:py-16">
          {/* Top Ad Banner - responsive height */}
          <div className="max-w-3xl mx-auto mb-6 md:mb-8">
            <div
              className="ad-slot h-14 sm:h-16 rounded-xl"
              aria-label="Advertisement space"
            >
              <span>Advertisement</span>
            </div>
          </div>

          {/* Header Section */}
          <header className="text-center mb-10 md:mb-14">
            {/* Floating emoji row */}
            <div className="flex justify-center gap-3 mb-4 md:mb-5" aria-hidden="true">
              {['🎉', '🎂', '🎈', '🎁', '✨'].map((emoji, i) => (
                <span
                  key={emoji}
                  className="text-2xl md:text-3xl lg:text-4xl"
                  style={{
                    display: 'inline-block',
                    animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4 leading-tight">
              <span className="gold-text">Create a Surprise</span>
              <br />
              <span className="text-white">Birthday Wish</span>{' '}
              <span
                aria-hidden="true"
                className="inline-block animate-float"
                style={{ animation: 'float 2s ease-in-out infinite' }}
              >
                🎉
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-300">
              Generate a beautiful birthday page with{' '}
              <span className="text-yellow-400 font-semibold">animations & confetti</span>,
              then share it as a{' '}
              <span className="text-pink-400 font-semibold">QR code</span> or link.
              <br className="hidden md:block" /> Free, instant, and utterly magical. ✨
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6">
              {[
                { icon: '⚡', label: 'Instant' },
                { icon: '🆓', label: '100% Free' },
                { icon: '📱', label: 'Mobile Ready' },
                { icon: '🔗', label: 'Shareable Link' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </header>

          {/* Interactive form */}
          <HomeForm />

          {/* Middle Ad */}
          <div className="max-w-3xl mx-auto mt-12 md:mt-14 mb-6">
            <div
              className="ad-slot h-20 sm:h-24 rounded-xl"
              aria-label="Advertisement space"
            >
              <span>Advertisement</span>
            </div>
          </div>

          {/* How It Works Section */}
          <section className="max-w-4xl mx-auto mt-10 md:mt-12 text-center" aria-labelledby="how-it-works-heading">
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-yellow-300"
            >
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[
                {
                  step: '01',
                  icon: '✍️',
                  title: 'Fill the Form',
                  desc: "Enter the birthday person's name, age, and a heartfelt message",
                },
                {
                  step: '02',
                  icon: '🔗',
                  title: 'Get QR + Link',
                  desc: 'We generate a unique page with QR code and shareable link instantly',
                },
                {
                  step: '03',
                  icon: '🎊',
                  title: 'Share & Celebrate',
                  desc: 'Send via WhatsApp or share the link. They open it to a beautiful surprise!',
                },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden text-left sm:text-center"
                >
                  <div
                    aria-hidden="true"
                    className="absolute top-2 right-3 text-4xl md:text-5xl font-black text-yellow-500/10"
                  >
                    {step}
                  </div>
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3" aria-hidden="true">
                    {icon}
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2 text-yellow-300">
                    {title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Blog Section */}
          <section className="max-w-6xl mx-auto mt-16 md:mt-20" aria-labelledby="blog-heading">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-3">
              <h2
                id="blog-heading"
                className="text-2xl sm:text-3xl font-bold text-yellow-300 text-center sm:text-left"
              >
                📖 Birthday QR Blog: Ideas & Guides
              </h2>
              <Link
                href="/blog"
                className="text-sm px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all text-center"
                aria-label="View all blog articles"
              >
                View all articles →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-2xl"
                >
                  <article
                    className="h-full rounded-2xl p-5 transition-all duration-300 group-hover:scale-[1.02] group-focus:scale-[1.02] bg-gradient-to-br from-purple-500/10 to-yellow-500/5 border border-yellow-500/20"
                    aria-labelledby={`blog-title-${post.slug}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl" aria-hidden="true">
                        {post.emoji}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                        {post.readingTime}
                      </span>
                    </div>
                    <h3
                      id={`blog-title-${post.slug}`}
                      className="font-bold text-base md:text-lg leading-snug mb-2 group-hover:text-yellow-300 transition-colors line-clamp-2"
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{post.publishDate}</span>
                      <span className="text-xs font-semibold text-yellow-400" aria-hidden="true">
                        Read Article →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/blog"
                className="inline-block text-sm px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                🎂 Explore all birthday surprise ideas (400+ articles)
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="max-w-4xl mx-auto mt-14 md:mt-16" aria-labelledby="features-heading">
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-yellow-300"
            >
              What&apos;s Included 🎁
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: '🎊', label: 'Confetti Rain' },
                { icon: '🎈', label: 'Floating Balloons' },
                { icon: '✨', label: 'Sparkle Effects' },
                { icon: '📱', label: 'QR Code' },
                { icon: '🔗', label: 'Shareable URL' },
                { icon: '💌', label: 'Custom Message' },
                { icon: '📲', label: 'WhatsApp Share' },
                { icon: '🌍', label: 'SEO Optimized' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="glass rounded-xl p-3 md:p-4 text-center border border-yellow-500/10"
                >
                  <div className="text-xl sm:text-2xl mb-1" aria-hidden="true">
                    {icon}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="max-w-4xl mx-auto mt-16 md:mt-20 pt-6 pb-4 text-center border-t border-white/10">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Birthday QR Surprise · Made with ❤️ · Free Birthday Wish Generator
            </p>
            <nav className="flex flex-wrap justify-center gap-4 mt-3" aria-label="Footer navigation">
              <Link
                href="/privacy"
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/about"
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                About Us
              </Link>
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}