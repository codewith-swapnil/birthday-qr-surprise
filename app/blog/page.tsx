// app/blog/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { FEATURED_SLUGS, generateBlogContent, getAllSlugs } from '@/lib/blogData';
import BackButton from '@/components/BackButton';

// ─── Metadata ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Birthday QR Code Ideas, Guides & Surprises | WishQR Blog',
  description:
    'Discover birthday QR code ideas for girlfriend, boyfriend, mom, dad, best friends & more. Step-by-step guides, heartfelt message templates & creative surprise ideas. 100% free on WishQR.',
  keywords: [
    'birthday QR code ideas',
    'birthday surprise QR',
    'QR code birthday wishes',
    'birthday message QR code',
    'creative birthday gifts',
    'birthday QR for girlfriend',
    'birthday QR for boyfriend',
    'birthday QR for mom',
  ],
  alternates: {
    canonical: 'https://wishqr.in/blog',
  },
  openGraph: {
    title: 'Birthday QR Code Ideas, Guides & Surprises | WishQR Blog',
    description:
      'Guides, ideas & message templates for every relationship. Make every birthday unforgettable with a personalised QR surprise.',
    url: 'https://wishqr.in/blog',
    siteName: 'WishQR',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://wishqr.in/og-image.jpeg', // replace with your actual OG image
        width: 1200,
        height: 630,
        alt: 'WishQR Birthday Blog – Ideas & Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday QR Code Ideas, Guides & Surprises | WishQR Blog',
    description:
      'Guides, ideas & message templates for every relationship. 100% free.',
    images: ['https://wishqr.in/og-image.jpeg'],
    site: '@wishqr', // update with your handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
};

// ─── Constants ────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All', slug: '' },
  { label: '💕 For Her', slug: 'girlfriend' },
  { label: '💙 For Him', slug: 'boyfriend' },
  { label: '🌸 Family', slug: 'mom' },
  { label: '🤝 Friends', slug: 'best-friend' },
  { label: '❤️ Romantic', slug: 'romantic' },
  { label: '😂 Funny', slug: 'funny' },
];

const POSTS_PER_PAGE = 20;

interface BlogPageProps {
  searchParams?: Promise<{ page?: string; category?: string }> | { page?: string; category?: string };
}

// ─── Page ─────────────────────────────────────────────────────

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const activeCategory = resolvedParams?.category ?? '';

  const allSlugs = getAllSlugs();
  const totalPosts = allSlugs.length;

  const featuredPosts = FEATURED_SLUGS.slice(0, 12).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  const otherSlugs = allSlugs.filter((s) => !FEATURED_SLUGS.includes(s));
  const filteredSlugs = activeCategory
    ? otherSlugs.filter((s) => s.includes(activeCategory))
    : otherSlugs;

  const totalPages = Math.ceil(filteredSlugs.length / POSTS_PER_PAGE);
  const paginatedSlugs = filteredSlugs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );
  const paginatedPosts = paginatedSlugs.map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  // ── BreadcrumbList Schema ──
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wishqr.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://wishqr.in/blog' },
    ],
  };

  // ── CollectionPage Schema ──
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Birthday QR Code Ideas, Guides & Surprises | WishQR Blog',
    description:
      'Explore birthday QR code ideas for every relationship. Guides, message templates & creative surprises.',
    url: 'https://wishqr.in/blog',
    publisher: { '@type': 'Organization', name: 'WishQR', url: 'https://wishqr.in' },
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="relative z-10 px-4 py-12 max-w-6xl mx-auto">

        {/* Semantic Breadcrumb (visible) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol
            className="flex items-center gap-2 text-xs"
            style={{ color: 'rgba(248,244,255,0.35)' }}
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <Link href="/" itemProp="item" className="hover:text-yellow-400 transition-colors">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden>/</li>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <span itemProp="name" style={{ color: 'rgba(248,244,255,0.55)' }}>Blog</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          {/* Back to Generator Button */}
          <div className="mb-6">
            <BackButton href="/" label="← Back to Generator" />
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Birthday QR Blog 🎉
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(248,244,255,0.6)' }}
          >
            Guides, ideas &amp; message templates for every relationship. Make every birthday
            unforgettable with a personalised QR surprise.
          </p>
          <p className="mt-2 text-sm" style={{ color: 'rgba(248,244,255,0.3)' }}>
            {totalPosts}+ articles and growing
          </p>
        </header>

        {/* Category Pills — now real links for SEO crawlability */}
        <nav aria-label="Blog categories" className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ label, slug }) => {
            const href = slug ? `/blog?category=${slug}` : '/blog';
            const isActive = activeCategory === slug;
            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className="text-sm px-4 py-1.5 rounded-full transition-all"
                style={{
                  background: isActive ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.15)',
                  border: `1px solid ${isActive ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.3)'}`,
                  color: isActive ? '#f8f4ff' : 'rgba(248,244,255,0.7)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Featured Posts */}
        <section aria-labelledby="featured-heading">
          <h2
            id="featured-heading"
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            ⭐ Featured Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} featured />
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section aria-labelledby="all-articles-heading">
          <h2
            id="all-articles-heading"
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            📚 All Articles ({totalPosts})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* Pagination — SEO-friendly rel=prev/next via <Link> */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center gap-2 mt-10">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                rel="prev"
                className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
              >
                ← Previous
              </Link>
            )}
            <span className="px-3 py-1 text-sm text-gray-400" aria-current="page">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                rel="next"
                className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Next →
              </Link>
            )}
          </nav>
        )}

        {/* CTA */}
        <section
          aria-label="Create your birthday QR surprise"
          className="mt-16 text-center rounded-2xl p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(251,191,36,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="text-4xl mb-3" aria-hidden>🎁</div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Ready to Create Your Birthday Surprise?
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'rgba(248,244,255,0.6)' }}>
            Generate a beautiful birthday QR page in under 60 seconds. Free, instant, no sign-up.
          </p>
          <Link
            href="/"
            className="inline-block font-bold px-8 py-3 rounded-full text-sm"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#030014',
            }}
          >
            🎉 Create Birthday QR Code — Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} WishQR · All rights reserved
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─── Helper: human-readable date ─────────────────────────────
function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

// ─── Blog Card ────────────────────────────────────────────────

function BlogCard({
  post,
  featured = false,
}: {
  post: ReturnType<typeof generateBlogContent> & { slug: string };
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group"
      aria-label={`Read article: ${post.title}`}
    >
      <article
        className="h-full rounded-2xl p-5 transition-all duration-300 group-hover:scale-[1.02]"
        itemScope
        itemType="https://schema.org/BlogPosting"
        style={{
          background: featured
            ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(251,191,36,0.06))'
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${featured ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        {/* Hidden schema props */}
        <meta itemProp="url" content={`https://wishqr.in/blog/${post.slug}`} />
        <meta itemProp="datePublished" content={post.publishDate} />

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl" aria-hidden>{post.emoji}</span>
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
          className="font-bold text-sm leading-snug mb-2 group-hover:text-yellow-300 transition-colors"
          itemProp="headline"
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
          itemProp="description"
          style={{
            color: 'rgba(248,244,255,0.45)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <time
            dateTime={post.publishDate}
            itemProp="datePublished"
            className="text-xs"
            style={{ color: 'rgba(248,244,255,0.25)' }}
          >
            {formatDate(post.publishDate)}
          </time>
          <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
            Read →
          </span>
        </div>
      </article>
    </Link>
  );
}