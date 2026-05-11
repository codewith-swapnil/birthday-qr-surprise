import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const viewport: Viewport = {
  themeColor: '#030014',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://wishqr.in'),
  title: {
    default: 'Birthday QR Code Generator Free 🎉 — Happy Birthday Wish Pages | WishQR',
    template: '%s | WishQR',
  },
  description:
    'Create a free birthday QR code with a personalized animated wish page — confetti, images & heartfelt messages. Share with friends, family & loved ones instantly.',
  alternates: {
    canonical: 'https://wishqr.in',
  },
  category: 'technology',
  authors: [{ name: 'WishQR' }],
  creator: 'WishQR',
  publisher: 'WishQR',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://wishqr.in',
    siteName: 'WishQR',
    title: 'Birthday QR Code Generator Free 🎉 — Happy Birthday Wish Pages | WishQR',
    description:
      'Send happy birthday wishes for friend, sister, brother or love with a magic QR code! Animated pages, confetti & heartfelt messages — free & instant.',
    images: [
      {
        url: 'https://wishqr.in/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Free Birthday QR Code Generator — WishQR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday QR Code Generator Free 🎉 — WishQR',
    description:
      'Create personalized happy birthday wishes for friend, sister, brother, wife or husband — with a free animated QR wish page!',
    images: ['https://wishqr.in/og-image.jpeg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon1.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WishQR',
  },
};

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WishQR',
  url: 'https://wishqr.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://wishqr.in/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const schemaWebApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WishQR',
  url: 'https://wishqr.in',
  description:
    'Create personalized happy birthday wishes for friend, sister, brother, wife, husband or love — with animated QR wish pages.',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  // ⚠️ Only add aggregateRating back when you have real user reviews
};

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WishQR',
  url: 'https://wishqr.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://wishqr.in/og-image.jpeg',
    width: 1200,
    height: 630,
  },
};

const schemaFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create a birthday QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter the birthday person\'s name, add a message, pick a theme, and WishQR instantly generates a personalized animated wish page with a free QR code you can share on WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the birthday QR code generator free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! WishQR is completely free. Create unlimited birthday QR codes with animated wish pages at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add a name and message to the birthday QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can personalize the wish page with the recipient\'s name, a custom message, photos, and choose from multiple animated themes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I send a birthday QR code on WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After creating your wish page on WishQR, share the link or QR code directly on WhatsApp. When scanned, it opens a beautiful animated birthday wish page.',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}