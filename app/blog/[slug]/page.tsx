// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, generateBlogContent } from '@/lib/blogData';
import BackButton from '@/components/BackButton';

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString; // fallback: show raw if parsing fails
  }
}

// ─── Static Params ────────────────────────────────────────────

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

  // Derive keywords from the slug tokens (e.g. "qr-code-for-girlfriend-birthday" → [...])
  const slugKeywords = params.slug
    .split('-')
    .filter((w) => w.length > 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

  return {
    title: `${content.title} | WishQR Blog`,
    description: content.description,
    keywords: [
      ...slugKeywords,
      'birthday QR code',
      'QR birthday surprise',
      'birthday message QR',
      'WishQR',
    ],
    alternates: { canonical: url },
    authors: [{ name: 'WishQR Team', url: 'https://wishqr.in/about' }],
    openGraph: {
      title: `${content.title} | WishQR`,
      description: content.description,
      url,
      siteName: 'WishQR',
      type: 'article',
      publishedTime: content.publishDate,
      modifiedTime: content.publishDate,
      authors: ['https://wishqr.in/about'],
      locale: 'en_IN',
      images: [
        {
          // Ideally generate per-post OG images with next/og; fallback to default here
          url: `https://wishqr.in/og-image.jpeg`,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${content.title} | WishQR`,
      description: content.description,
      images: [`https://wishqr.in/og-image.jpeg`],
      site: '@wishqr',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slugs = getAllSlugs();
  if (!slugs.includes(params.slug)) notFound();

  const content = generateBlogContent(params.slug);
  const url = `https://wishqr.in/blog/${params.slug}`;

  // ── Article Schema ──
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.h1,
    description: content.description,
    datePublished: content.publishDate,
    dateModified: content.publishDate,
    author: { '@type': 'Organization', name: 'WishQR', url: 'https://wishqr.in/about' },
    publisher: {
      '@type': 'Organization',
      name: 'WishQR',
      url: 'https://wishqr.in',
      logo: { '@type': 'ImageObject', url: 'https://wishqr.in/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    // Article sections become keywords for Google
    keywords: params.slug.split('-').join(', '),
  };

  // ── FAQ Schema ──
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  // ── BreadcrumbList Schema ──
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wishqr.in' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://wishqr.in/blog' },
      { '@type': 'ListItem', position: 3, name: content.title, item: url },
    ],
  };

  // ── HowTo Schema (drives rich results if sections describe steps) ──
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.h1,
    description: content.description,
    step: content.sections.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.heading,
      text: s.body,
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
      {/* Structured Data — order matters: Article first for Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="relative z-10 px-4 py-12 max-w-3xl mx-auto">

        {/* Top Back Button */}
        <div className="mb-6">
          <BackButton href="/blog" label="← Back to Blog" />
        </div>

        {/* Semantic Breadcrumb (visible + schema-annotated) */}
        <nav aria-label="Breadcrumb" className="text-xs mb-8">
          <ol
            className="flex items-center gap-2 flex-wrap"
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
              <Link href="/blog" itemProp="item" className="hover:text-yellow-400 transition-colors">
                <span itemProp="name">Blog</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li aria-hidden>/</li>
            <li
              itemScope
              itemType="https://schema.org/ListItem"
              itemProp="itemListElement"
              className="truncate max-w-[200px]"
            >
              <span itemProp="name" style={{ color: 'rgba(248,244,255,0.55)' }}>
                {content.title}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-10" itemScope itemType="https://schema.org/Article">
          <meta itemProp="url" content={url} />
          <meta itemProp="datePublished" content={content.publishDate} />
          <meta itemProp="dateModified" content={content.publishDate} />
          <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="WishQR" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden>{content.emoji}</span>
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
            <time
              dateTime={content.publishDate}
              className="text-xs"
              style={{ color: 'rgba(248,244,255,0.25)' }}
            >
              {formatDate(content.publishDate)}
            </time>
          </div>

          {/* h1 is the primary keyword target — keep it meaningful */}
          <h1
            className="text-3xl md:text-4xl font-black leading-tight mb-4"
            itemProp="headline"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            {content.h1}
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed"
            itemProp="description"
            style={{ color: 'rgba(248,244,255,0.65)' }}
          >
            {content.intro}
          </p>
        </header>

        {/* Above-fold CTA */}
        <div
          className="rounded-2xl p-6 mb-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <p className="text-sm mb-4" style={{ color: 'rgba(248,244,255,0.7)' }}>
            🎁 Create your birthday QR surprise in under 60 seconds — free!
          </p>
          <Link
            href="/"
            className="inline-block font-bold px-7 py-3 rounded-full text-sm"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#030014' }}
          >
            🎉 Create Free Birthday QR Now
          </Link>
        </div>

        {/* Article Body — each section is a proper <section> with h2 */}
        <article itemProp="articleBody">
          {content.sections.map((section, i) => (
            <section key={i} className="mb-10">
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

        {/* Pro Tips */}
        <aside
          aria-label="Pro tips"
          className="mt-4 rounded-2xl p-6"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            💡 Pro Tips
          </h2>
          <ul className="space-y-3">
            {content.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm"
                style={{ color: 'rgba(248,244,255,0.65)' }}
              >
                <span className="mt-0.5 text-yellow-400 shrink-0" aria-hidden>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* FAQ — semantic <details>/<summary> is crawlable by Google */}
        <section className="mt-12" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
          >
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {content.faqs.map(({ q, a }, i) => (
              <details
                key={i}
                className="rounded-xl p-5 cursor-pointer"
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
                  <span className="text-yellow-400 ml-4 shrink-0" aria-hidden>+</span>
                </summary>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: 'rgba(248,244,255,0.6)' }}
                >
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
          <div className="text-4xl mb-3" aria-hidden>🎂</div>
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
            🎉 Create Your Birthday QR Code — Free
          </Link>
        </div>

        {/* Related Posts — internal links are a strong SEO signal */}
        {content.relatedSlugs.length > 0 && (
          <section className="mt-14" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
            >
              📚 Related Articles
            </h2>
            <nav aria-label="Related articles">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.relatedSlugs.map((rSlug) => {
                  const related = generateBlogContent(rSlug);
                  return (
                    <Link
                      key={rSlug}
                      href={`/blog/${rSlug}`}
                      className="group block"
                      aria-label={`Read related article: ${related.title}`}
                    >
                      <div
                        className="rounded-xl p-4 transition-all duration-200 group-hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span aria-hidden>{related.emoji}</span>
                          <span
                            className="text-xs font-semibold group-hover:text-yellow-400 transition-colors"
                            style={{ color: '#f8f4ff' }}
                          >
                            {related.title.slice(0, 60)}…
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: '#fbbf24' }}>
                          Read article →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </section>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <BackButton href="/blog" label="← Back to all articles" />
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} WishQR · Made with ❤️
          </p>
        </footer>
      </div>
    </main>
  );
}