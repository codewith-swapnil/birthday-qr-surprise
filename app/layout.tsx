import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: '#030014',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://wishqr.in'),
  title: 'Happy Birthday Wishes & QR Surprise 🎉 - Personalized Birthday Messages',
  description:
    'Send beautiful happy birthday wishes for friend, sister, brother, wife, husband & love with a magic QR code! Create animated birthday wish pages with confetti, images & heartfelt quotes — free birthday wish generator.',
  keywords: [
    // Core — >1M volume
    'happy birthday wishes',
    'happy birthday',
    // Relationship — >100K / >10K
    'happy birthday wishes for friend',
    'happy birthday wishes for sister',
    'happy birthday sister',
    'happy birthday wishes for brother',
    'happy birthday wishes for best friend',
    'happy birthday wishes for wife',
    'happy birthday wishes for husband',
    'happy birthday wishes for love',
    'happy birthday my love',
    'wish you happy birthday',
    // Language variants — >10K
    'happy birthday wishes in marathi',
    'happy birthday wishes in hindi',
    'happy birthday wishes in english',
    // Content type — >10K
    'happy birthday images',
    'happy birthday quotes',
    'happy birthday png',
    'happy birthday song',
    // QR / product-specific
    'happy birthday qr code generator free',
    'birthday wishes qr code free',
    'birthday wishes qr code free with name',
    'birthday wishes qr code free with name age and message',
    'birthday wishes qr',
    'special happy birthday wishes',
    // Descriptive / long-tail
    'birthday wish generator',
    'birthday QR code',
    'personalized birthday message',
    'birthday surprise',
    'birthday page generator',
    'happy birthday generator',
    'birthday card QR',
    'digital birthday card',
  ],
  authors: [{ name: 'WishQR' }],
  creator: 'WishQR',
  publisher: 'WishQR',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wishqr.in',
    siteName: 'WishQR',
    title: 'Happy Birthday Wishes & QR Surprise 🎉 - Personalized Birthday Messages',
    description:
      'Send happy birthday wishes for friend, sister, brother or love with a magic QR code! Animated pages, confetti & heartfelt messages — free & instant.',
    images: [
      {
        url: 'https://wishqr.in/icons/android-chrome-192x192.png',
        width: 512,
        height: 512,
        alt: 'WishQR – Personalized Happy Birthday Wishes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Birthday Wishes & QR Surprise 🎉',
    description:
      'Create personalized happy birthday wishes for friend, sister, brother, wife or husband — with a free animated QR wish page!',
    images: ['https://wishqr.in/icons/android-chrome-192x192.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon1.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'WishQR',
              url: 'https://wishqr.in',
              description:
                'Create personalized happy birthday wishes for friend, sister, brother, wife, husband or love — with animated QR wish pages.',
              applicationCategory: 'EntertainmentApplication',
              operatingSystem: 'Any',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '120',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WishQR',
              url: 'https://wishqr.in',
              logo: 'https://wishqr.in/icons/android-chrome-192x192.png',
            }),
          }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18141822593"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18141822593');
          `}
        </Script>
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}