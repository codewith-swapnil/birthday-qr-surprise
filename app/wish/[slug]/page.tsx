import type { Metadata } from 'next';
import { decodeWishData, getOrdinal } from '@/lib/utils';
import BirthdayWish from '@/components/BirthdayWish';

interface PageProps {
  params: { slug: string };
  searchParams: { d?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const data = searchParams.d ? decodeWishData(searchParams.d) : null;

  if (!data) {
    return {
      title: 'Birthday Wish 🎉 | Birthday QR Surprise',
      description: 'Open this link to see a special birthday wish!',
    };
  }

  const ordinal = getOrdinal(Number(data.age));

  return {
    title: `Happy Birthday ${data.name}! 🎉 ${ordinal} Birthday Wishes`,
    description: `Celebrate ${data.name}'s ${ordinal} birthday! A special personalized birthday wish made just for them. ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`,
    keywords: [
      `happy birthday ${data.name}`,
      `birthday wish ${data.name}`,
      `${ordinal} birthday`,
      'birthday surprise',
      'birthday message',
      'birthday celebration',
    ],
    openGraph: {
      type: 'website',
      title: `🎂 Happy ${ordinal} Birthday, ${data.name}! 🎉`,
      description: `${data.message.substring(0, 150)}${data.message.length > 150 ? '...' : ''}`,
      images: [{ url: '/og-birthday.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `🎂 Happy Birthday ${data.name}! 🎉`,
      description: data.message.substring(0, 200),
    },
    robots: 'noindex, nofollow', // Privacy: individual wish pages not indexed
    other: {
      'schema:type': 'Event',
      'schema:name': `${data.name}'s ${ordinal} Birthday`,
      'schema:description': data.message,
    },
  };
}

export default function WishPage({ params, searchParams }: PageProps) {
  const rawData = searchParams.d ? decodeWishData(searchParams.d) : null;

  // Schema.org structured data
  const schemaData = rawData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: `${rawData.name}'s ${getOrdinal(Number(rawData.age))} Birthday`,
        description: rawData.message,
        eventStatus: 'https://schema.org/EventScheduled',
        organizer: {
          '@type': 'Person',
          name: 'Birthday QR Surprise',
        },
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
