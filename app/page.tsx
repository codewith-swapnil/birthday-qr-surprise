import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import HomeForm from '@/components/HomeForm';
import { FEATURED_SLUGS, generateBlogContent, getAllSlugs } from '@/lib/blogData';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

// ─── Metadata ────────────────────────────────────────────────────────────────
// Page-level metadata inherits metadataBase & icons from layout.
// Keep title/description/OG distinct from layout defaults.
export const metadata: Metadata = {
  title: 'Birthday QR Code Generator Free 🎉 — Happy Birthday Wish Pages | WishQR',
  description:
    'Create a free birthday QR code with a personalized animated wish page — confetti, images & heartfelt messages. Perfect birthday wish for friend, sister, brother, wife, husband or love. Share instantly via WhatsApp.',
  alternates: {
    canonical: 'https://wishqr.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Birthday QR Code Generator Free 🎉 — Happy Birthday Wish Pages | WishQR',
    description:
      'Send a magical birthday wish for friend, sister, brother, wife, husband or love — animated page + free QR code, instant!',
    url: 'https://wishqr.in',
    siteName: 'WishQR',
    images: [
      {
        url: 'https://wishqr.in/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Free Birthday QR Code Generator — WishQR',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday QR Code Generator Free 🎉 — WishQR',
    description:
      'Create a personalized birthday wish for friend, sister, brother, wife or husband — animated QR wish page, free!',
    images: ['https://wishqr.in/og-image.jpeg'],
  },
};

// ─── Structured Data ─────────────────────────────────────────────────────────
// Page-level BreadcrumbList schema — layout handles WebSite, WebApp, Org, FAQ
const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://wishqr.in',
    },
  ],
};

// ─── Static data ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '✍️',
    title: 'Fill the Form',
    desc: "Enter the birthday person's name, age, and a heartfelt message in seconds.",
  },
  {
    step: '02',
    icon: '🔗',
    title: 'Get QR + Link',
    desc: 'We instantly generate a unique animated wish page with a free QR code and shareable link.',
  },
  {
    step: '03',
    icon: '🎊',
    title: 'Share & Celebrate',
    desc: 'Send via WhatsApp, SMS, or any platform. They open it to a beautiful birthday surprise!',
  },
];

const FEATURES = [
  { icon: '🎊', label: 'Confetti Rain' },
  { icon: '🎈', label: 'Floating Balloons' },
  { icon: '✨', label: 'Sparkle Effects' },
  { icon: '📱', label: 'QR Code' },
  { icon: '🔗', label: 'Shareable URL' },
  { icon: '💌', label: 'Custom Message' },
  { icon: '📲', label: 'WhatsApp Share' },
  { icon: '🌍', label: 'Works Worldwide' },
];

// Covers the relationship keywords that were in the keyword meta tag.
// Keeping them in visible content is what actually drives rankings.
const FOR_WHOM = [
  { rel: 'Friend', emoji: '👫' },
  { rel: 'Sister', emoji: '👩‍👧' },
  { rel: 'Brother', emoji: '👨‍👦' },
  { rel: 'Wife', emoji: '💍' },
  { rel: 'Husband', emoji: '🤵' },
  { rel: 'Girlfriend', emoji: '💕' },
  { rel: 'Boyfriend', emoji: '💑' },
  { rel: 'Best Friend', emoji: '🤝' },
  { rel: 'Son', emoji: '👦' },
  { rel: 'Daughter', emoji: '👧' },
  { rel: 'Mom', emoji: '👩' },
  { rel: 'Dad', emoji: '👨' },
];

const FAQ_ITEMS = [
  {
    q: 'How do I create a birthday QR code?',
    a: "Enter the birthday person's name, age, and message above. WishQR instantly generates a personalized animated wish page with a free QR code you can share on WhatsApp or any platform.",
  },
  {
    q: 'Is the birthday QR code generator completely free?',
    a: 'Yes! WishQR is 100% free. Create unlimited personalized birthday QR codes with animated wish pages — no sign-up required.',
  },
  {
    q: 'Can I add a name, age, and custom message to the birthday QR?',
    a: "Absolutely. You can fully personalize the wish page with the recipient's name, age, a custom heartfelt message, and choose from animated themes with confetti and balloons.",
  },
  {
    q: 'How do I send a birthday wish on WhatsApp using a QR code?',
    a: "After creating your wish page on WishQR, tap the WhatsApp share button or copy the link. Paste it in any chat — when they open it, they see a beautiful animated birthday surprise.",
  },
  {
    q: 'Happy birthday wish kaise kare? (How to wish happy birthday?)',
    a: "WishQR pe jaiye, naam aur message likho, aur ek free animated birthday wish page banaiye — QR code ke saath jo aap WhatsApp par share kar sakte ho.",
  },
  {
    q: 'Can I create birthday wishes in Hindi or Marathi?',
    a: 'Yes. Simply type your birthday message in Hindi, Marathi, or any language — WishQR supports all languages and character sets.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const featuredPosts = FEATURED_SLUGS.slice(0, 6).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));
  const totalBlogPosts = getAllSlugs().length;

  return (
    <>
      {/* Breadcrumb schema — page level */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />

      {/* Skip link */}
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

        {/* Decorative glows */}
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

          {/* ── Hero ── */}
          <header className="text-center mb-10 md:mb-14">
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

            {/*
              H1 — exact match to primary keyword "Birthday QR Code Generator"
              Secondary keyword "Happy Birthday Wish" appears in sub-copy below.
              Google weights H1 text heavily; don't split the keyword across lines.
            */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4 leading-tight">
              <span className="gold-text">Birthday QR Code</span>
              <br />
              <span className="text-white">Generator Free</span>{' '}
              <span aria-hidden="true" style={{ animation: 'float 2s ease-in-out infinite', display: 'inline-block' }}>
                🎉
              </span>
            </h1>

            {/*
              Subtitle naturally weaves in "happy birthday wish" variants
              and relationship keywords — visible to Google, reads naturally.
            */}
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-300">
              Send a beautiful{' '}
              <strong className="text-yellow-400 font-semibold">happy birthday wish</strong> for{' '}
              <span className="text-yellow-400 font-semibold">
                friend, sister, brother, wife, husband
              </span>{' '}
              or{' '}
              <span className="text-pink-400 font-semibold">your love</span> — with{' '}
              <span className="text-yellow-400 font-semibold">animations & confetti</span>,
              shared as a{' '}
              <span className="text-pink-400 font-semibold">free QR code</span> or link.
              <br className="hidden md:block" /> No sign-up. Instant. Utterly magical. ✨
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6">
              {[
                { icon: '⚡', label: 'Instant' },
                { icon: '🆓', label: '100% Free' },
                { icon: '📱', label: 'Mobile Ready' },
                { icon: '🔗', label: 'Shareable Link' },
                { icon: '🌐', label: 'All Languages' },
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

          {/* ── Form ── */}
          <HomeForm />

          {/* ── For Whom — relationship keyword section ── */}
          {/*
            This section exists purely to place relationship keywords in
            crawlable body text. Each chip is an internal anchor to a
            future filtered page (/wish/for-friend etc.) — when those
            pages exist, replace # with real hrefs for silo linking.
          */}
          <section
            className="max-w-3xl mx-auto mt-12 text-center"
            aria-labelledby="for-whom-heading"
          >
            <h2
              id="for-whom-heading"
              className="text-xl sm:text-2xl font-bold mb-5 text-yellow-300"
            >
              Happy Birthday Wishes For Everyone 🎂
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Create a personalized birthday QR wish page for any relationship — in seconds.
            </p>
            <ul
              className="flex flex-wrap justify-center gap-2 md:gap-3"
              aria-label="Birthday wish categories"
            >
              {FOR_WHOM.map(({ rel, emoji }) => (
                <li key={rel}>
                  <Link
                    href={`/wish/for-${rel.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-gray-300 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                  >
                    <span aria-hidden="true">{emoji}</span>
                    <span>For {rel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ── How It Works ── */}
          <section
            className="max-w-4xl mx-auto mt-14 md:mt-16 text-center"
            aria-labelledby="how-it-works-heading"
          >
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-yellow-300"
            >
              How to Create a Birthday QR Code 🎂
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
              {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
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

          {/* ── Features ── */}
          <section
            className="max-w-4xl mx-auto mt-14 md:mt-16"
            aria-labelledby="features-heading"
          >
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-yellow-300"
            >
              What&apos;s Included in Every Birthday Wish 🎁
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {FEATURES.map(({ icon, label }) => (
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

          {/* ── Blog ── */}
          <section
            className="max-w-6xl mx-auto mt-16 md:mt-20"
            aria-labelledby="blog-heading"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-3">
              <h2
                id="blog-heading"
                className="text-2xl sm:text-3xl font-bold text-yellow-300 text-center sm:text-left"
              >
                📖 Birthday Wish Ideas &amp; Guides
              </h2>
              <Link
                href="/blog"
                className="text-sm px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                aria-label="View all birthday wish articles"
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
                      <span className="text-3xl" aria-hidden="true">{post.emoji}</span>
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

          {/* ── FAQ ── */}
          {/*
            CRITICAL for SEO:
            - Matches FAQPage schema in layout.tsx → enables Google rich results
            - Targets long-tail question queries ("how to", "kaise kare", "is it free")
            - Each answer naturally contains target keywords
          */}
          <section
            className="max-w-3xl mx-auto mt-16 md:mt-20"
            aria-labelledby="faq-heading"
          >
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-bold mb-8 text-center text-yellow-300"
            >
              Frequently Asked Questions ❓
            </h2>
            <dl className="space-y-4">
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-5 md:p-6 border border-yellow-500/10"
                >
                  <dt className="font-semibold text-base md:text-lg text-white mb-2">{q}</dt>
                  <dd className="text-sm md:text-base text-gray-400 leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Footer ── */}
          <footer className="max-w-4xl mx-auto mt-16 md:mt-20 pt-6 pb-4 text-center border-t border-white/10">
            {/*
              Footer body copy — last chance for keyword placement.
              Reads naturally; avoids keyword stuffing.
            */}
            <p className="text-xs text-gray-500 mb-1">
              WishQR is the free birthday QR code generator for creating animated happy birthday
              wish pages — for friend, sister, brother, wife, husband or any loved one.
            </p>
            <p className="text-xs text-gray-600 mb-4">
              © {new Date().getFullYear()} WishQR · Made with ❤️ in India
            </p>
            <nav
              className="flex flex-wrap justify-center gap-4"
              aria-label="Footer navigation"
            >
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/contact', label: 'Contact' },
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blog' },
                { href: '/sitemap.xml', label: 'Sitemap' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}