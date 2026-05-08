import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | WishQR',
  description:
    'Read our privacy policy to understand how WishQR collects, uses, and protects your data, including cookie usage, Google AdSense, and MongoDB storage.',
};

export default function PrivacyPage() {
  const sections = [
    {
      id: '1',
      title: 'Information We Collect',
      content: (
        <>
          <p>
            When you use WishQR to create a birthday page, we collect the following information that
            you voluntarily provide:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Recipient&apos;s name and age</li>
            <li>A personalized birthday message</li>
            <li>Any other content you enter into the birthday page generator</li>
          </ul>
          <p className="mt-3">
            This data is <strong>stored in our database (MongoDB)</strong> to generate and serve
            your personalized birthday page via a unique shareable link. We do{' '}
            <strong>not</strong> require you to create an account, and we do{' '}
            <strong>not</strong> collect payment details, government IDs, or sensitive personal
            information.
          </p>
          <p className="mt-3">
            We may also automatically collect limited technical data such as browser type, device
            type, IP address, and pages visited — solely for analytics and security purposes.
          </p>
        </>
      ),
    },
    {
      id: '2',
      title: 'How We Use Your Information',
      content: (
        <>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Generate and display your personalized birthday QR page</li>
            <li>Serve the page when the unique link is accessed</li>
            <li>Improve our service through anonymized analytics</li>
            <li>Display relevant advertisements via Google AdSense</li>
            <li>Prevent abuse and ensure the security of our service</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> use your data for automated decision-making, profiling, or
            any purpose beyond operating and improving this service.
          </p>
        </>
      ),
    },
    {
      id: '3',
      title: 'Cookies & Tracking Technologies',
      content: (
        <>
          <p>We use the following types of cookies on WishQR:</p>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-semibold" style={{ color: '#fde68a' }}>
                Essential Cookies
              </p>
              <p className="mt-1">
                Required for basic site functionality such as form state and page rendering. These
                cannot be disabled.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#fde68a' }}>
                Analytics Cookies
              </p>
              <p className="mt-1">
                We use Vercel Analytics to understand how visitors interact with our site. This
                data is anonymized and does not identify individual users.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#fde68a' }}>
                Advertising Cookies (Google AdSense)
              </p>
              <p className="mt-1">
                Our site uses <strong>Google AdSense</strong> to display advertisements. Google
                may use cookies, web beacons, and similar technologies to serve ads based on your
                prior visits to our site and other sites on the internet. This includes the use of
                the <strong>DoubleClick cookie</strong>, which enables Google and its partners to
                serve ads based on your visit to our and/or other sites.
              </p>
              <p className="mt-2">
                You may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: '#fde68a' }}
                >
                  Google Ad Settings
                </a>
                . You can also opt out via the{' '}
                <a
                  href="https://optout.networkadvertising.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: '#fde68a' }}
                >
                  Network Advertising Initiative opt-out page
                </a>
                .
              </p>
            </div>
          </div>
          <p className="mt-4">
            You can control and manage cookies through your browser settings. Note that disabling
            certain cookies may affect the functionality of our site. For more information, visit{' '}
            <a
              href="https://www.aboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: '#fde68a' }}
            >
              aboutcookies.org
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: '4',
      title: 'Data Storage & Retention',
      content: (
        <>
          <p>
            Birthday page data you submit (name, age, message) is stored in our secure MongoDB
            database hosted on MongoDB Atlas. This data is retained to serve your unique birthday
            page link.
          </p>
          <p className="mt-3">
            If you wish to have your data deleted, please contact us at{' '}
            <a
              href="mailto:support@wishqr.in"
              className="underline"
              style={{ color: '#fde68a' }}
            >
              support@wishqr.in
            </a>{' '}
            with your page link and we will remove it within 7 business days.
          </p>
          <p className="mt-3">
            We implement reasonable technical and organizational measures to protect data against
            unauthorized access, alteration, or deletion.
          </p>
        </>
      ),
    },
    {
      id: '5',
      title: 'Sharing Your Birthday Page',
      content: (
        <p>
          The birthday pages you create are accessible to anyone who has the unique link. By
          sharing the link, you are making that page publicly accessible. Please share only with
          people you trust. WishQR does not publicly list or index birthday pages and does not sell
          or share the data you provide with third parties, except as described in this policy.
        </p>
      ),
    },
    {
      id: '6',
      title: 'Third-Party Services',
      content: (
        <>
          <p>We use the following third-party services, each governed by their own privacy policies:</p>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <strong>Google AdSense</strong> — Advertising.{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#fde68a' }}
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>MongoDB Atlas</strong> — Database hosting.{' '}
              <a
                href="https://www.mongodb.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#fde68a' }}
              >
                MongoDB Privacy Policy
              </a>
            </li>
            <li>
              <strong>Vercel</strong> — Hosting and analytics.{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#fde68a' }}
              >
                Vercel Privacy Policy
              </a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: '7',
      title: 'Your Rights',
      content: (
        <>
          <p>Depending on your location, you may have the following rights regarding your data:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>
              <strong>Access:</strong> Request a copy of the data we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)
            </li>
            <li>
              <strong>Opt-out:</strong> Opt out of personalized advertising at any time
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{' '}
            <a
              href="mailto:support@wishqr.in"
              className="underline"
              style={{ color: '#fde68a' }}
            >
              support@wishqr.in
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: '8',
      title: "Children's Privacy",
      content: (
        <p>
          WishQR is intended for use by adults (18 years and older) to create birthday pages on
          behalf of others, including children. We do not knowingly collect personal information
          directly from children under the age of 13. If you believe a child under 13 has provided
          us with personal information, please contact us immediately at{' '}
          <a
            href="mailto:support@wishqr.in"
            className="underline"
            style={{ color: '#fde68a' }}
          >
            support@wishqr.in
          </a>{' '}
          and we will delete it promptly.
        </p>
      ),
    },
    {
      id: '9',
      title: 'Changes to This Policy',
      content: (
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this
          page with an updated &quot;Last updated&quot; date. We encourage you to review this page
          periodically. Continued use of WishQR after changes are posted constitutes your
          acceptance of the updated policy.
        </p>
      ),
    },
    {
      id: '10',
      title: 'Contact Us',
      content: (
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy, please
          contact us:
          <br />
          <br />
          <strong>Email:</strong>{' '}
          <a
            href="mailto:support@wishqr.in"
            className="underline"
            style={{ color: '#fde68a' }}
          >
            support@wishqr.in
          </a>
          <br />
          <strong>Website:</strong>{' '}
          <Link href="/contact" className="underline" style={{ color: '#fde68a' }}>
            wishqr.in/contact
          </Link>
          <br />
          <strong>Business / Partnerships:</strong>{' '}
          <a
            href="mailto:partners@wishqr.in"
            className="underline"
            style={{ color: '#fde68a' }}
          >
            partners@wishqr.in
          </a>
        </p>
      ),
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 20%, #1a0058 0%, #030014 50%, #0a001f 100%)',
      }}
    >
      <div className="relative z-10 px-4 py-12 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav
          className="text-xs mb-8 flex items-center gap-2"
          style={{ color: 'rgba(248,244,255,0.35)' }}
        >
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Privacy Policy</span>
        </nav>

        {/* Header Card */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🔒</span>
            <div>
              <h1
                className="text-3xl md:text-4xl font-black mb-2"
                style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
              >
                Privacy Policy
              </h1>
              <p className="text-xs" style={{ color: 'rgba(248,244,255,0.4)' }}>
                Last updated: May 8, 2026
              </p>
            </div>
          </div>
          <p
            className="text-sm md:text-base mt-5 leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.65)' }}
          >
            At <strong style={{ color: '#fde68a' }}>WishQR</strong> (wishqr.in), we are committed
            to protecting your privacy. This Privacy Policy explains what information we collect,
            how we use it, and your rights regarding your data. By using our service, you agree to
            the practices described below.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="glass rounded-2xl p-6 md:p-8">
              <h2
                className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: '#fde68a' }}
              >
                <span
                  className="text-sm font-mono px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(253,230,138,0.12)',
                    color: 'rgba(253,230,138,0.6)',
                  }}
                >
                  {section.id}
                </span>
                {section.title}
              </h2>
              <div
                className="text-sm md:text-base leading-relaxed"
                style={{ color: 'rgba(248,244,255,0.65)' }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center pb-6">
          <p className="text-xs" style={{ color: 'rgba(248,244,255,0.2)' }}>
            © {new Date().getFullYear()} WishQR · All rights reserved
          </p>
        </footer>
      </div>
    </main>
  );
}