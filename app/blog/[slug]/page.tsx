import type { Metadata } from 'next';
import Link from 'next/link';
import { FEATURED_SLUGS, generateBlogContent, getAllSlugs } from '@/lib/blogData';

export const metadata: Metadata = {
  title: 'Birthday QR Blog – Ideas, Guides & Surprises | Birthday QR Surprise',
  description:
    'Explore birthday QR code ideas for girlfriend, boyfriend, mom, dad, friends & more. Step-by-step guides, message templates & creative surprises. 100% free.',
  alternates: {
    canonical: 'https://wishqr.in/blog',
  },
};

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
  searchParams?: Promise<{ page?: string }> | { page?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // ✅ Await searchParams (Next.js 15+)
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  
  const allSlugs = getAllSlugs();
  const totalPosts = allSlugs.length;

  // Featured posts (first 12)
  const featuredPosts = FEATURED_SLUGS.slice(0, 12).map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  // All non‑featured slugs
  const otherSlugs = allSlugs.filter((s) => !FEATURED_SLUGS.includes(s));
  const totalPages = Math.ceil(otherSlugs.length / POSTS_PER_PAGE);

  // Paginate
  const paginatedSlugs = otherSlugs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  const paginatedPosts = paginatedSlugs.map((slug) => ({
    slug,
    ...generateBlogContent(slug),
  }));

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      <div className="relative z-10 px-4 py-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block text-sm mb-6 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(248,244,255,0.5)',
            }}
          >
            ← Back to Generator
          </Link>
          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Birthday QR Blog 🎉
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(248,244,255,0.6)' }}>
            Guides, ideas &amp; message templates for every relationship. Make every birthday
            unforgettable with a personalised QR surprise.
          </p>
          <p className="mt-2 text-sm" style={{ color: 'rgba(248,244,255,0.3)' }}>
            {totalPosts}+ articles and growing
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ label }) => (
            <span
              key={label}
              className="text-sm px-4 py-1.5 rounded-full cursor-pointer transition-all"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: 'rgba(248,244,255,0.7)',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Ad slot */}
        <div className="ad-slot h-16 rounded-xl mb-10" aria-label="Advertisement">
          <span>Advertisement</span>
        </div>

        {/* Featured Posts */}
        <h2
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

        {/* All Posts with Pagination */}
        <h2
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
              >
                ← Previous
              </Link>
            )}
            <span className="px-3 py-1 text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-16 text-center rounded-2xl p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(251,191,36,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="text-4xl mb-3">🎁</div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Ready to Create Your Surprise?
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
            🎉 Create Birthday Surprise Now
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} Birthday QR Surprise · All rights reserved
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─── Blog Card Component (unchanged) ─────────────────────────

function BlogCard({
  post,
  featured = false,
}: {
  post: ReturnType<typeof generateBlogContent> & { slug: string };
  featured?: boolean;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article
        className="h-full rounded-2xl p-5 transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          background: featured
            ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(251,191,36,0.06))'
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${featured ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{post.emoji}</span>
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
          <span className="text-xs" style={{ color: 'rgba(248,244,255,0.25)' }}>
            {post.publishDate}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
            Read →
          </span>
        </div>
      </article>
    </Link>
  );
}