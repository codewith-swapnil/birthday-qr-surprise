import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import HomeForm from '@/components/HomeForm';
import { FEATURED_SLUGS, generateBlogContent } from '@/lib/blogData';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

export const metadata: Metadata = {
  title: 'Birthday QR Surprise 🎉 - Free Birthday Wish Generator',
  description:
    'Create a personalized birthday surprise with QR code! Enter name, age & message to generate a magical birthday wish page with confetti and balloons. Share via WhatsApp instantly.',
};

export default function HomePage() {
  // Get featured posts data
  const featuredPosts = FEATURED_SLUGS.slice(0, 6).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <StarField />

      {/* Ambient glows */}
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

      <div className="relative z-10 px-4 py-12 md:py-16">
        {/* Top Ad Banner */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="ad-slot h-16 rounded-xl" aria-label="Advertisement">
            <span>Advertisement</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12 md:mb-14">
          {/* Floating emoji row */}
          <div className="flex justify-center gap-3 mb-5">
            {['🎉', '🎂', '🎈', '🎁', '✨'].map((emoji, i) => (
              <span
                key={emoji}
                className="text-2xl md:text-3xl"
                style={{
                  display: 'inline-block',
                  animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Main Heading */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.1 }}
          >
            <span className="gold-text">Create a Surprise</span>
            <br />
            <span style={{ color: '#f8f4ff' }}>Birthday Wish</span>{' '}
            <span
              style={{
                display: 'inline-block',
                animation: 'float 2s ease-in-out infinite',
              }}
            >
              🎉
            </span>
          </h1>

          <p
            className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.6)' }}
          >
            Generate a beautiful birthday page with{' '}
            <span style={{ color: '#fbbf24' }}>animations & confetti</span>,
            then share it as a{' '}
            <span style={{ color: '#ff6b9d' }}>QR code</span> or link.
            <br className="hidden md:block" /> Free, instant, and utterly magical. ✨
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {[
              { icon: '⚡', label: 'Instant' },
              { icon: '🆓', label: '100% Free' },
              { icon: '📱', label: 'Mobile Ready' },
              { icon: '🔗', label: 'Shareable Link' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(248,244,255,0.6)',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <HomeForm />

        {/* Middle Ad */}
        <div className="max-w-3xl mx-auto mt-14 mb-6">
          <div className="ad-slot h-24 rounded-xl" aria-label="Advertisement">
            <span>Advertisement</span>
          </div>
        </div>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto mt-10 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold mb-10"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '✍️',
                title: 'Fill the Form',
                desc: 'Enter the birthday person\'s name, age, and a heartfelt message',
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
              <div key={step} className="glass rounded-2xl p-6 relative overflow-hidden">
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: 'rgba(251,191,36,0.06)',
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1,
                  }}
                >
                  {step}
                </div>
                <div className="text-4xl mb-3">{icon}</div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,244,255,0.55)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 NEW: Featured Blog Section 🎉 */}
        <section className="max-w-6xl mx-auto mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold text-center md:text-left"
              style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
            >
              📖 Birthday QR Blog: Ideas & Guides
            </h2>
            <Link
              href="/blog"
              className="text-sm px-4 py-2 rounded-full transition-all mt-3 md:mt-0"
              style={{
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)',
                color: '#fbbf24',
              }}
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article
                  className="h-full rounded-2xl p-5 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(251,191,36,0.04))',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{post.emoji}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(248,244,255,0.4)',
                      }}
                    >
                      {post.readingTime}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-sm md:text-base leading-snug mb-2 group-hover:text-yellow-300 transition-colors"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: '#f8f4ff',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: 'rgba(248,244,255,0.5)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(248,244,255,0.25)' }}>
                      {post.publishDate}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#fbbf24' }}
                    >
                      Read Article →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Subtle CTA to blog */}
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-block text-sm px-5 py-2 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(248,244,255,0.6)',
              }}
            >
              🎂 Explore all birthday surprise ideas (400+ articles)
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-4xl mx-auto mt-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            What's Included 🎁
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className="glass rounded-xl p-4 text-center"
                style={{ borderColor: 'rgba(251,191,36,0.1)' }}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs" style={{ color: 'rgba(248,244,255,0.6)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto mt-16 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} Birthday QR Surprise · Made with ❤️ · Free Birthday Wish Generator
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <Link
              href="/privacy"
              className="text-xs hover:text-yellow-400 transition-colors"
              style={{ color: 'rgba(248,244,255,0.4)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs hover:text-yellow-400 transition-colors"
              style={{ color: 'rgba(248,244,255,0.4)' }}
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-xs hover:text-yellow-400 transition-colors"
              style={{ color: 'rgba(248,244,255,0.4)' }}
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="text-xs hover:text-yellow-400 transition-colors"
              style={{ color: 'rgba(248,244,255,0.4)' }}
            >
              About Us
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}