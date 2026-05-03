import type { Metadata } from 'next';
import { decodeWishData, getOrdinal } from '@/lib/utils';
import BirthdayWish from '@/components/BirthdayWish';
import type { WishData } from '../../../lib/utils';

interface PageProps {
  params: { slug: string };
  searchParams: { d?: string };
}

/** Compute current age from a date-of-birth string (YYYY-MM-DD or ISO). */
function computeAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Format "YYYY-MM-DD" → "24 April" for display. */
function formatBirthdayDisplay(dob: string): string {
  const d = new Date(dob);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const data: WishData | null = searchParams.d
    ? decodeWishData(searchParams.d)
    : null;

  if (!data) {
    return {
      title: 'Birthday Wish 🎉 | Birthday QR Surprise',
      description: 'Open this link to see a special birthday wish!',
    };
  }

  const age = computeAge(data.dateOfBirth);
  const ordinal = getOrdinal(age);
  const bdDisplay = formatBirthdayDisplay(data.dateOfBirth);

  return {
    title: `Happy Birthday ${data.name}! 🎉 ${ordinal} Birthday Wishes`,
    description: `Celebrate ${data.name}'s ${ordinal} birthday (${bdDisplay})! A special personalised birthday wish made just for them. ${data.message.substring(0, 100)}${data.message.length > 100 ? '…' : ''}`,
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
      description: `${data.message.substring(0, 150)}${data.message.length > 150 ? '…' : ''}`,
      images: [
        // Use first uploaded image as OG image if available, else fall back to default.
        ...(data.images?.length
          ? [{ url: data.images[0], width: 1200, height: 630 }]
          : [{ url: '/og-birthday.png', width: 1200, height: 630 }]),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `🎂 Happy Birthday ${data.name}! 🎉`,
      description: data.message.substring(0, 200),
    },
    // Privacy: individual wish pages are not indexed.
    robots: 'noindex, nofollow',
    other: {
      'schema:type': 'Event',
      'schema:name': `${data.name}'s ${ordinal} Birthday`,
      'schema:description': data.message,
    },
  };
}

export default function WishPage({ params, searchParams }: PageProps) {
  const rawData: WishData | null = searchParams.d
    ? decodeWishData(searchParams.d)
    : null;

  const age = rawData ? computeAge(rawData.dateOfBirth) : null;

  // Schema.org structured data for SEO / rich results.
  const schemaData =
    rawData && age !== null
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `${rawData.name}'s ${getOrdinal(age)} Birthday`,
          description: rawData.message,
          startDate: rawData.dateOfBirth,
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