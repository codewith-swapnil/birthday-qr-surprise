import type { Metadata } from 'next';
import { formatBirthdayDisplay } from '@/lib/utils';
import BirthdayWish from '@/components/BirthdayWish';
import ProposeWish from '@/components/ProposeWish';
import type { WishData } from '@/types/wish';
import { connectDB } from '@/lib/mongodb';
import Wish from '@/models/Wish';
import { cache } from 'react';

interface PageProps {
  params: { slug: string };
  searchParams: Record<string, never>;
}

/* ── Deduplicated DB fetch ── */
const getWish = cache(async (slug: string): Promise<WishData | null> => {
  try {
    await connectDB();
    const wish = await Wish.findOneAndUpdate(
      { slug },
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' }
    ).lean();
    return wish ? (wish.data as WishData) : null;
  } catch (err) {
    console.error('[WishPage] DB error:', err);
    return null;
  }
});

/* ── Metadata ── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getWish(params.slug);
  const isPropose = data?.topic === 'propose';

  if (!data) {
    return {
      title: 'Special Surprise 🎉 | WishQR',
      description: 'Open this link to see a special surprise!',
    };
  }

  const bdDisplay = !isPropose ? formatBirthdayDisplay(data.day, data.month) : null;
  const ogImage = data.images?.[0]
    ? [{ url: data.images[0], width: 1200, height: 630 }]
    : [{ url: isPropose ? '/og-propose.png' : '/og-birthday.png', width: 1200, height: 630 }];

  if (isPropose) {
    return {
      title: `A Special Message for ${data.name} ❤️ | WishQR`,
      description: `Someone has a heartfelt message just for ${data.name}. ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`,
      openGraph: {
        type: 'website',
        title: `❤️ A Special Message for ${data.name}`,
        description: data.message.substring(0, 150) || 'Someone wants to say something beautiful.',
        images: ogImage,
      },
      twitter: {
        card: 'summary_large_image',
        title: `❤️ For ${data.name}`,
        description: data.message.substring(0, 200) || 'Open to see a heartfelt surprise.',
      },
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: `Happy Birthday ${data.name}! 🎉 | WishQR`,
    description: `Celebrate ${data.name}'s birthday on ${bdDisplay}! ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`,
    keywords: [
      `happy birthday ${data.name}`,
      `birthday wish ${data.name}`,
      `${bdDisplay} birthday`,
      'birthday surprise', 'birthday message', 'birthday celebration',
    ],
    openGraph: {
      type: 'website',
      title: `🎂 Happy Birthday, ${data.name}! 🎉`,
      description: `${data.message.substring(0, 150)}${data.message.length > 150 ? '...' : ''}`,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: `🎂 Happy Birthday ${data.name}! 🎉`,
      description: data.message.substring(0, 200),
    },
    robots: 'noindex, nofollow',
  };
}

/* ── Page ── */
export default async function WishPage({ params }: PageProps) {
  const data = await getWish(params.slug);
  const isPropose = data?.topic === 'propose';

  /* Structured data */
  const schemaData = data && !isPropose
    ? {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${data.name}'s Birthday`,
      description: data.message,
      eventStatus: 'https://schema.org/EventScheduled',
      organizer: { '@type': 'Person', name: 'WishQR' },
    }
    : null;

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      {/* Route to the correct experience */}
      {isPropose
        ? <ProposeWish rawData={data} slug={params.slug} />
        : <BirthdayWish rawData={data} slug={params.slug} />
      }
    </>
  );
}