import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const viewport: Viewport = {
  themeColor: '#030014',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://birthday-qr.vercel.app'),
  title: 'Birthday QR Surprise 🎉 - Create Personalized Birthday Wishes',
  description:
    'Create a beautiful, personalized birthday surprise with a QR code! Share a magical birthday wish page with animations, confetti, and heartfelt messages. Free birthday wish generator.',
  keywords: [
    'birthday wish generator',
    'birthday QR code',
    'personalized birthday message',
    'birthday surprise',
    'birthday page generator',
    'happy birthday generator',
    'birthday card QR',
    'digital birthday card',
  ],
  verification: {
    google: '0943dc92510d531f',
  },
  authors: [{ name: 'Birthday QR Surprise' }],
  creator: 'Birthday QR Surprise',
  publisher: 'Birthday QR Surprise',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://birthday-qr.vercel.app',
    siteName: 'Birthday QR Surprise',
    title: 'Birthday QR Surprise 🎉 - Create Personalized Birthday Wishes',
    description:
      'Create a beautiful birthday QR code surprise! Share magical animated birthday wishes with friends & family.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Birthday QR Surprise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday QR Surprise 🎉',
    description: 'Create personalized birthday QR codes with beautiful animated wish pages!',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon-32x32.png',
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
              name: 'Birthday QR Surprise',
              url: 'https://birthday-qr.vercel.app',
              description: 'Create personalized birthday wish pages with QR codes',
              applicationCategory: 'EntertainmentApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
