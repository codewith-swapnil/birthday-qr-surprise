import type { Metadata } from 'next';
import { formatBirthdayDisplay } from '@/lib/utils';
import BirthdayWish from '@/components/BirthdayWish';
import type { WishData } from '@/types/wish';
import { connectDB } from '@/lib/mongodb';
import Wish from '@/models/Wish';
import { cache } from 'react';

interface PageProps {
  params: { slug: string };
  searchParams: Record<string, never>;   // no query params needed anymore
}

/* ── Deduplicated DB fetch (one round-trip per request) ── */
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

  if (!data) {
    return {
      title: 'Birthday Wish 🎉 | Birthday QR Surprise',
      description: 'Open this link to see a special birthday wish!',
    };
  }

  const bdDisplay = formatBirthdayDisplay(data.day, data.month);
  const ogImage = data.images?.[0]
    ? [{ url: data.images[0], width: 1200, height: 630 }]
    : [{ url: '/og-birthday.png', width: 1200, height: 630 }];

  return {
    title: `Happy Birthday ${data.name}! 🎉 | Birthday QR Surprise`,
    description: `Celebrate ${data.name}'s birthday on ${bdDisplay}! ${data.message.substring(0, 100)}${data.message.length > 100 ? '…' : ''}`,
    keywords: [
      `happy birthday ${data.name}`,
      `birthday wish ${data.name}`,
      `${bdDisplay} birthday`,
      'birthday surprise',
      'birthday message',
      'birthday celebration',
    ],
    openGraph: {
      type: 'website',
      title: `🎂 Happy Birthday, ${data.name}! 🎉`,
      description: `${data.message.substring(0, 150)}${data.message.length > 150 ? '…' : ''}`,
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
  const data = await getWish(params.slug);   // cache deduplicates — no second DB hit

  const schemaData = data
    ? {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${data.name}'s Birthday`,
      description: data.message,
      eventStatus: 'https://schema.org/EventScheduled',
      organizer: { '@type': 'Person', name: 'Birthday QR Surprise' },
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
      <BirthdayWish rawData={data} slug={params.slug} />
    </>
  );
}