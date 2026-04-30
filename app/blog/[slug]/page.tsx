import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, generateBlogContent } from '@/lib/blogData';

// ─── Static params (builds all 400+ pages at compile time) ───

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ─── Dynamic Metadata ─────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slugs = getAllSlugs();
  if (!slugs.includes(params.slug)) return {};

  const content = generateBlogContent(params.slug);
  const url = `https://wishqr.in/blog/${params.slug}`;

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: url },
    openGraph: {
      title: content.title,
      description: content.description,
      url,
      type: 'article',
      publishedTime: content.publishDate,
    },
    twitter: {
      card: 'summary',
      title: content.title,
      description: content.description,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slugs = getAllSlugs();
  if (!slugs.includes(params.slug)) notFound();

  const content = generateBlogContent(params.slug);
  const url = `https://wishqr.in/blog/${params.slug}`;

  // Article Schema (JSON-LD)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.description,
    datePublished: content.publishDate,
    dateModified: content.publishDate,
    author: { '@type': 'Organization', name: 'Birthday QR Surprise' },
    publisher: {
      '@type': 'Organization',
      name: 'Birthday QR Surprise',
      url: 'https://wishqr.in',
    },
    mainEntityOfPage: url,
  };

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="relative z-10 px-4 py-12 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs mb-8 flex items-center gap-2" style={{ color: 'rgba(248,244,255,0.35)' }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-yellow-400 transition-colors">Blog</Link>
          <span>/</span>
          <span style={{ color: 'rgba(248,244,255,0.55)' }} className="truncate max-w-[200px]">
            {params.slug}
          </span>
        </nav>

        {/* Ad slot */}
        <div className="ad-slot h-16 rounded-xl mb-10" aria-label="Advertisement">
          <span>Advertisement</span>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{content.emoji}</span>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: 'rgba(248,244,255,0.6)',
              }}
            >
              {content.readingTime}
            </span>
            <span className="text-xs" style={{ color: 'rgba(248,244,255,0.25)' }}>
              {content.publishDate}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            {content.h1}
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.65)' }}
          >
            {content.intro}
          </p>
        </header>

        {/* CTA Box (above fold) */}
        <div
          className="rounded-2xl p-6 mb-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <p className="text-sm mb-4" style={{ color: 'rgba(248,244,255,0.7)' }}>
            🎁 Create your birthday surprise in under 60 seconds — free!
          </p>
          <Link
            href="/"
            className="inline-block font-bold px-7 py-3 rounded-full text-sm"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#030014' }}
          >
            🎉 Create Free Birthday QR Now
          </Link>
        </div>

        {/* Article Sections */}
        <article className="space-y-10">
          {content.sections.map((section, i) => (
            <section key={i}>
              <h2
                className="text-xl md:text-2xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: '#f8f4ff' }}
              >
                {section.heading}
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: 'rgba(248,244,255,0.65)' }}
              >
                {section.body}
              </p>
            </section>
          ))}
        </article>

        {/* Tips Box */}
        <div
          className="mt-12 rounded-2xl p-6"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            💡 Pro Tips
          </h3>
          <ul className="space-y-3">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(248,244,255,0.65)' }}>
                <span className="mt-0.5 text-yellow-400 shrink-0">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mid Ad */}
        <div className="ad-slot h-20 rounded-xl my-12" aria-label="Advertisement">
          <span>Advertisement</span>
        </div>

        {/* FAQ Section */}
        <section className="mt-4">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {content.faqs.map(({ q, a }, i) => (
              <details
                key={i}
                className="rounded-xl p-5 cursor-pointer group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <summary
                  className="font-semibold text-sm list-none flex items-center justify-between"
                  style={{ color: '#f8f4ff' }}
                >
                  {q}
                  <span className="text-yellow-400 ml-4 shrink-0">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(248,244,255,0.6)' }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div
          className="mt-14 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(251,191,36,0.08))',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <div className="text-4xl mb-3">🎂</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            Ready to Surprise Someone?
          </h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(248,244,255,0.6)' }}>
            Create a free personalised birthday QR page in seconds. No sign-up required.
          </p>
          <Link
            href="/"
            className="inline-block font-bold px-8 py-3 rounded-full text-sm"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#030014' }}
          >
            🎉 Create Your Birthday QR
          </Link>
        </div>

        {/* Related Posts */}
        {content.relatedSlugs.length > 0 && (
          <section className="mt-14">
            <h2
              className="text-xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
            >
              📚 Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.relatedSlugs.map((rSlug) => {
                const related = generateBlogContent(rSlug);
                return (
                  <Link key={rSlug} href={`/blog/${rSlug}`} className="group block">
                    <div
                      className="rounded-xl p-4 transition-all duration-200 group-hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span>{related.emoji}</span>
                        <span className="text-xs font-semibold group-hover:text-yellow-400 transition-colors" style={{ color: '#f8f4ff' }}>
                          {related.title.slice(0, 60)}…
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: '#fbbf24' }}>Read article →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Breadcrumb footer */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="text-sm hover:text-yellow-400 transition-colors"
            style={{ color: 'rgba(248,244,255,0.4)' }}
          >
            ← Back to all articles
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} Birthday QR Surprise · Made with ❤️
          </p>
        </footer>
      </div>
    </main>
  );
}