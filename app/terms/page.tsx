import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | WishQR',
  description:
    'Terms and conditions for using WishQR (wishqr.in) – the free birthday wish generator with personalized QR pages.',
};

const sections = [
  {
    id: '1',
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using WishQR at{' '}
          <strong style={{ color: '#fde68a' }}>wishqr.in</strong> (&quot;Service&quot;,
          &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms
          of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use
          the Service.
        </p>
        <p className="mt-3">
          We reserve the right to update these Terms at any time. The &quot;Effective&quot; date
          at the top of this page reflects the latest revision. Continued use of the Service
          after changes are posted constitutes your acceptance of the updated Terms.
        </p>
      </>
    ),
  },
  {
    id: '2',
    title: 'Service Description',
    content: (
      <>
        <p>
          WishQR is a free online tool that allows users to generate personalized birthday pages
          with a unique shareable link and QR code. The Service is provided{' '}
          <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong>{' '}
          without warranties of any kind, either express or implied.
        </p>
        <p className="mt-3">
          We do not guarantee uninterrupted, error-free, or permanent availability of the
          Service. We may modify, suspend, or discontinue any aspect of the Service at any time
          without prior notice.
        </p>
      </>
    ),
  },
  {
    id: '3',
    title: 'Eligibility',
    content: (
      <p>
        You must be at least <strong>18 years of age</strong> to use this Service. By using
        WishQR, you represent and warrant that you meet this age requirement. If you are under
        18, please ask a parent or legal guardian to use the Service on your behalf.
      </p>
    ),
  },
  {
    id: '4',
    title: 'Acceptable Use',
    content: (
      <>
        <p>
          You agree to use WishQR only for lawful, personal, and non-commercial purposes. You
          agree <strong>not</strong> to:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li>
            Submit content that is defamatory, abusive, harassing, obscene, hateful, or
            discriminatory
          </li>
          <li>Use the Service to target, bully, or harm any individual or group</li>
          <li>
            Upload or generate content containing copyrighted material you do not own or have
            permission to use
          </li>
          <li>Use the Service for spam, phishing, or any fraudulent purpose</li>
          <li>
            Attempt to reverse engineer, scrape, or interfere with the Service or its
            infrastructure
          </li>
          <li>
            Circumvent or manipulate any security, rate-limiting, or access control feature
          </li>
          <li>
            Impersonate any person or entity or misrepresent your affiliation with any person
            or entity
          </li>
        </ul>
        <p className="mt-3">
          We reserve the right to remove any content and suspend or terminate any user&apos;s
          access to the Service at our sole discretion, at any time, without notice, if we
          believe these Terms have been violated.
        </p>
      </>
    ),
  },
  {
    id: '5',
    title: 'User-Generated Content',
    content: (
      <>
        <p>
          The birthday messages, names, and any other content you enter into WishQR
          (&quot;User Content&quot;) remain your property. By submitting User Content, you grant
          WishQR a limited, non-exclusive, royalty-free license to store and display that content
          solely for the purpose of operating the Service (i.e., generating and serving your
          birthday page).
        </p>
        <p className="mt-3">
          You represent and warrant that your User Content does not violate any third-party
          rights, including intellectual property rights and privacy rights, and complies with
          all applicable laws.
        </p>
        <p className="mt-3">
          <strong>Public Pages:</strong> Birthday pages you create are accessible to anyone with
          the unique link. Do not include sensitive, private, or confidential information in your
          birthday pages. Share your link only with people you trust.
        </p>
      </>
    ),
  },
  {
    id: '6',
    title: 'Intellectual Property',
    content: (
      <>
        <p>
          All code, design, branding, logos, and other content on WishQR (excluding User
          Content) are the intellectual property of WishQR and are protected under applicable
          Indian and international copyright, trademark, and intellectual property laws.
        </p>
        <p className="mt-3">
          You may not copy, reproduce, distribute, or create derivative works from any part of
          the Service without our prior written consent.
        </p>
      </>
    ),
  },
  {
    id: '7',
    title: 'Advertising',
    content: (
      <p>
        WishQR displays advertisements served by <strong>Google AdSense</strong> and potentially
        other advertising networks. These ads help us keep the Service free. By using WishQR,
        you acknowledge that third-party advertisers may collect data as described in our{' '}
        <Link href="/privacy" className="underline" style={{ color: '#fde68a' }}>
          Privacy Policy
        </Link>
        . We are not responsible for the content of third-party advertisements.
      </p>
    ),
  },
  {
    id: '8',
    title: 'Disclaimer of Warranties',
    content: (
      <>
        <p>
          THE SERVICE IS PROVIDED <strong>&quot;AS IS&quot;</strong> AND{' '}
          <strong>&quot;AS AVAILABLE&quot;</strong>, WITHOUT WARRANTY OF ANY KIND. TO THE
          FULLEST EXTENT PERMITTED BY LAW, WISHQR EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER
          EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
          <li>Warranties regarding the accuracy or reliability of any content</li>
          <li>
            Warranties that generated pages or QR codes will remain accessible indefinitely
          </li>
        </ul>
      </>
    ),
  },
  {
    id: '9',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WISHQR AND ITS OWNERS, EMPLOYEES,
          AND AFFILIATES SHALL NOT BE LIABLE FOR ANY:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Indirect, incidental, special, consequential, or punitive damages</li>
          <li>Loss of data, revenue, goodwill, or profits</li>
          <li>Damages resulting from unauthorized access to your data or birthday pages</li>
          <li>Service interruptions, bugs, or errors</li>
        </ul>
        <p className="mt-3">
          IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED
          TO THE SERVICE EXCEED{' '}
          <strong>₹500 (FIVE HUNDRED INDIAN RUPEES)</strong> OR THE AMOUNT YOU PAID US IN THE
          PAST 12 MONTHS, WHICHEVER IS GREATER.
        </p>
      </>
    ),
  },
  {
    id: '10',
    title: 'Third-Party Links & Services',
    content: (
      <p>
        The Service may contain links to third-party websites or services (e.g., social media
        platforms, ad networks). These are provided for convenience only. WishQR does not
        endorse and is not responsible for the content, privacy practices, or availability of
        any third-party sites. Your use of third-party sites is at your own risk and subject to
        their own terms and policies.
      </p>
    ),
  },
  {
    id: '11',
    title: 'Termination',
    content: (
      <p>
        We reserve the right to suspend or terminate your access to the Service at our sole
        discretion, without notice or liability, for any reason, including if we reasonably
        believe you have violated these Terms. Upon termination, your right to use the Service
        will immediately cease. Sections on Intellectual Property, Disclaimer of Warranties,
        Limitation of Liability, and Governing Law shall survive termination.
      </p>
    ),
  },
  {
    id: '12',
    title: 'Governing Law & Dispute Resolution',
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of{' '}
          <strong>India</strong>, including the Information Technology Act, 2000 and the Consumer
          Protection Act, 2019, without regard to its conflict of law provisions.
        </p>
        <p className="mt-3">
          Any disputes arising out of or relating to these Terms or the Service shall be subject
          to the exclusive jurisdiction of the courts located in{' '}
          <strong>Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India</strong>. You agree
          to submit to the personal jurisdiction of such courts.
        </p>
        <p className="mt-3">
          Before initiating any legal proceedings, you agree to first attempt to resolve any
          dispute informally by contacting us at{' '}
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
    id: '13',
    title: 'Contact Information',
    content: (
      <>
        <p className="mb-4" style={{ color: 'rgba(248,244,255,0.65)' }}>
          If you have any questions about these Terms, please reach out to us through any of the
          following:
        </p>

        {/* Email & Web */}
        <div className="space-y-2 text-sm mb-6">
          <p>
            <strong style={{ color: 'rgba(248,244,255,0.85)' }}>Email:</strong>{' '}
            <a
              href="mailto:support@wishqr.in"
              className="underline"
              style={{ color: '#fde68a' }}
            >
              support@wishqr.in
            </a>
          </p>
          <p>
            <strong style={{ color: 'rgba(248,244,255,0.85)' }}>Website:</strong>{' '}
            <Link href="/contact" className="underline" style={{ color: '#fde68a' }}>
              wishqr.in/contact
            </Link>
          </p>
        </div>

        {/* Address block */}
        <div
          className="rounded-xl p-4 mt-2"
          style={{ background: 'rgba(253,230,138,0.06)', border: '1px solid rgba(253,230,138,0.12)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(253,230,138,0.5)' }}
          >
            Registered Address
          </p>
          <address className="not-italic text-sm leading-7" style={{ color: 'rgba(248,244,255,0.72)' }}>
            <span className="font-semibold" style={{ color: '#fde68a' }}>WishQR</span>
            <br />
            L Sector, Ram Nagar, N 2
            <br />
            CIDCO, Chhatrapati Sambhajinagar
            <br />
            Maharashtra – 431006
            <br />
            India
          </address>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
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
          <span style={{ color: 'rgba(248,244,255,0.55)' }}>Terms of Service</span>
        </nav>

        {/* Header Card */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">📄</span>
            <div>
              <h1
                className="text-3xl md:text-4xl font-black mb-2"
                style={{ fontFamily: 'var(--font-display)', color: '#fde68a' }}
              >
                Terms of Service
              </h1>
              <p className="text-xs" style={{ color: 'rgba(248,244,255,0.4)' }}>
                Effective: May 8, 2026
              </p>
            </div>
          </div>
          <p
            className="text-sm md:text-base mt-5 leading-relaxed"
            style={{ color: 'rgba(248,244,255,0.65)' }}
          >
            Welcome to <strong style={{ color: '#fde68a' }}>WishQR</strong>. These Terms of
            Service govern your use of our website and service at{' '}
            <strong style={{ color: '#fde68a' }}>wishqr.in</strong>. Please read them carefully
            before using the Service.
          </p>

          {/* Quick links */}
          <div
            className="mt-5 pt-5 border-t flex flex-wrap gap-x-4 gap-y-2"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <Link
              href="/privacy"
              className="text-xs hover:text-yellow-400 transition-colors underline underline-offset-2"
              style={{ color: 'rgba(248,244,255,0.45)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-xs hover:text-yellow-400 transition-colors underline underline-offset-2"
              style={{ color: 'rgba(248,244,255,0.45)' }}
            >
              Contact Us
            </Link>
            <a
              href="mailto:support@wishqr.in"
              className="text-xs hover:text-yellow-400 transition-colors underline underline-offset-2"
              style={{ color: 'rgba(248,244,255,0.45)' }}
            >
              support@wishqr.in
            </a>
          </div>
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