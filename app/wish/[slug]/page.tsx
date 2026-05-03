import type { Metadata } from 'next';
import { decodeWishData, getOrdinal, formatBirthdayDisplay } from '@/lib/utils';
import BirthdayWish from '@/components/BirthdayWish';
import type { WishData } from '@/types/wish';

interface PageProps {
  params: { slug: string };
  searchParams: { d?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const data: WishData | null = searchParams.d ? decodeWishData(searchParams.d) : null;

  if (!data) {
    return {
      title: 'Birthday Wish 🎉 | Birthday QR Surprise',
      description: 'Open this link to see a special birthday wish!',
    };
  }

  const bdDisplay = formatBirthdayDisplay(data.day, data.month);
  // No year stored — we can't compute an exact age, so skip the ordinal suffix in meta
  const ogImage = data.images?.[0]
    ? [{ url: data.images[0], width: 1200, height: 630 }]
    : [{ url: '/og-birthday.png', width: 1200, height: 630 }];

  return {
    title: `Happy Birthday ${data.name}! 🎉 | Birthday QR Surprise`,
    description: `Celebrate ${data.name}'s birthday on ${bdDisplay}! A special personalised birthday surprise made just for them. ${data.message.substring(0, 100)}${data.message.length > 100 ? '…' : ''}`,
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

export default function WishPage({ params, searchParams }: PageProps) {
  const rawData: WishData | null = searchParams.d
    ? decodeWishData(searchParams.d)
    : null;

  const schemaData = rawData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: `${rawData.name}'s Birthday`,
        description: rawData.message,
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
      <BirthdayWish rawData={rawData} slug={params.slug} />
    </>
  );
}