import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import HomeForm from '@/components/HomeForm';
import { FEATURED_SLUGS, generateBlogContent, getAllSlugs } from '@/lib/blogData';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

export const metadata: Metadata = {
  title: 'Happy Birthday Wish Generator 🎉 – Free Personalized Birthday QR Code',
  description:
    'Send the perfect happy birthday wish for friend, sister, brother, wife, husband, girlfriend, boyfriend or love — free! Create an animated wish page with confetti & QR code. Share instantly via WhatsApp. Happy birthday wish kaise kare? We make it easy!',
  keywords: [
    // "wish" singular cluster — new batch
    'happy birthday wish',
    'happy birthday wish for friend',
    'happy birthday wish friend',
    'happy birthday wish for sister',
    'happy birthday wish sister',
    'happy birthday wish for brother',
    'happy birthday wish for best friend',
    'happy birthday wish for wife',
    'happy birthday wish for husband',
    'happy birthday wish for love',
    'happy birthday wish for gf',
    'happy birthday wish for bf',
    'happy birthday wish for girlfriend',
    'happy birthday wish for son',
    'happy birthday wish in english',
    'happy birthday wish kaise kare',
    'happy birthday wish kaise kare in english',
    'happy birthday wish kaise karen',
    'happy birthday wish in marathi',
    'happy birthday wish in hindi',
    // "wishes" plural cluster — carried over from layout
    'happy birthday wishes',
    'happy birthday wishes for friend',
    'happy birthday wishes for sister',
    'happy birthday wishes for brother',
    'happy birthday wishes for best friend',
    'happy birthday wishes for wife',
    'happy birthday wishes for husband',
    'happy birthday wishes for love',
    'happy birthday my love',
    'wish you happy birthday',
    'happy birthday wishes in marathi',
    'happy birthday wishes in hindi',
    'happy birthday wishes in english',
    'happy birthday images',
    'happy birthday quotes',
    // Product / QR-specific
    'happy birthday qr code generator free',
    'birthday wishes qr code free',
    'birthday wish generator',
    'birthday QR code',
    'personalized birthday message',
    'birthday surprise',
    'digital birthday card',
  ],
  alternates: {
    canonical: 'https://wishqr.in',
  },
  openGraph: {
    title: 'Happy Birthday Wish Generator 🎉 – Free Personalized QR Code',
    description:
      'Send a magical happy birthday wish for friend, sister, brother, wife, husband, gf or bf — animated page + QR code, free & instant!',
    url: 'https://wishqr.in',
    siteName: 'WishQR',
    images: [
      {
        url: 'https://wishqr.in/icons/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Happy Birthday Wish Generator – WishQR',
      },
    ],
    type: 'website',
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Happy Birthday Wish Generator 🎉 – Free & Animated',
  //   description:
  //     'Create a personalized happy birthday wish for friend, sister, brother, wife or husband — with a free animated QR wish page!',
  //   images: ['https://wishqr.in/icons/android-chrome-512x512.png'],
  // },
};

export default function HomePage() {
  const featuredPosts = FEATURED_SLUGS.slice(0, 6).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  // ✅ Get actual total number of blog posts
  const totalBlogPosts = getAllSlugs().length;

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
              <span className="gold-text">Happy Birthday Wish</span>
              <br />
              <span className="text-white">Generator</span>{' '}
              <span
                aria-hidden="true"
                className="inline-block animate-float"
                style={{ animation: 'float 2s ease-in-out infinite' }}
              >
                🎉
              </span>
            </h1>

            {/* SEO-rich subtitle naturally incorporating keyword variants */}
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-300">
              Create a beautiful birthday wish for{' '}
              <span className="text-yellow-400 font-semibold">
                friend, sister, brother, wife, husband
              </span>{' '}
              or{' '}
              <span className="text-pink-400 font-semibold">your love</span> — with{' '}
              <span className="text-yellow-400 font-semibold">animations & confetti</span>,
              shared as a{' '}
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

          {/* How It Works Section */}
          <section className="max-w-4xl mx-auto mt-10 md:mt-12 text-center" aria-labelledby="how-it-works-heading">
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-yellow-300"
            >
              How to Send a Birthday Wish 🎂
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
                  desc: 'We generate a unique wish page with QR code and shareable link instantly',
                },
                {
                  step: '03',
                  icon: '🎊',
                  title: 'Share & Celebrate',
                  desc: 'Send via WhatsApp or share the link. They open it to a beautiful birthday surprise!',
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
                📖 Birthday Wish Ideas & Guides
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
                🎂 Explore all birthday wish ideas ({totalBlogPosts}+ articles)
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
              © {new Date().getFullYear()} WishQR · Made with ❤️ · Free Happy Birthday Wish Generator
            </p>
            <nav className="flex flex-wrap justify-center gap-4 mt-3" aria-label="Footer navigation">
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                Contact
              </Link>
              <Link href="/about" className="text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                About Us
              </Link>
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}