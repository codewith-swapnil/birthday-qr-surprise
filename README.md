# 🎉 Birthday QR Surprise

> A viral-ready birthday wish generator with QR codes, confetti, balloons, and stunning animations.

![Birthday QR Surprise](public/icons/android-chrome-192x192.png)

## ✨ Features

- 🎁 **Create personalized birthday pages** with name, age & custom message
- 📱 **QR Code generation** — scan to open the wish page
- 🎊 **Confetti rain & floating balloons** on the wish page
- 🔗 **Shareable links** — works across all devices without a database
- 💬 **WhatsApp share** with pre-filled message
- 😍 **Emoji reactions** on the wish page
- 🌍 **Full SEO optimization** with dynamic meta tags
- 📲 **PWA support** — installable & offline-ready
- 💰 **AdSense-ready** ad slots pre-built in layout
- 🎨 **Stunning UI** — glassmorphism, star field, animated backgrounds

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or download the project
cd birthday-qr-surprise

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | SSR, SEO, routing |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **qrcode.react** | QR code generation |
| **canvas-confetti** | Confetti animation |
| **Google Fonts** | Playfair Display + DM Sans |

---

## 🏗️ Project Structure

```
birthday-qr-surprise/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Home page (form)
│   ├── globals.css         # Global styles
│   ├── sitemap.ts          # Dynamic sitemap
│   └── wish/
│       └── [slug]/
│           └── page.tsx    # Birthday wish page (SSR + dynamic meta)
├── components/
│   ├── HomeForm.tsx         # Form with validation
│   ├── QRDisplay.tsx        # QR code + share buttons
│   ├── BirthdayWish.tsx     # Full celebration page
│   ├── Balloons.tsx         # Floating balloon animations
│   ├── ConfettiEffect.tsx   # Canvas confetti
│   ├── StarField.tsx        # Animated star background
│   └── ServiceWorkerRegistration.tsx
├── lib/
│   └── utils.ts            # Slug generation, data encoding
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # SEO robots
│   └── sw.js               # Service worker
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🔐 How Data Works (No Database Needed!)

The wish data (name, age, message) is **base64-encoded into the URL**:

```
/wish/raveena-25-abc123?d=eyJuYW1lIjoiUmF2ZWVuYSJ9...
```

This means:
- ✅ Works instantly — no backend required
- ✅ Cross-device sharing (QR → phone → opens perfectly)
- ✅ Deploys to Vercel free tier
- ✅ Privacy-preserving (no data stored on server)

---

## 🌍 Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo to Vercel dashboard for auto-deploy
```

**Environment Variables** (none required for basic setup)

For custom domain:
1. Add domain in Vercel dashboard
2. Update `sitemap.ts` with your real domain
3. Update `robots.txt` with your real sitemap URL

---

## 💰 Monetization Setup

### Google AdSense
1. Sign up at [Google AdSense](https://adsense.google.com)
2. Get approved
3. Replace `ad-slot` divs in `page.tsx` and `BirthdayWish.tsx` with AdSense code:

```jsx
// Replace this:
<div className="ad-slot h-16 rounded-xl">Advertisement</div>

// With this:
<ins
  className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
/>
```

Ad slots are pre-placed in:
- Home page: top banner + middle section
- Wish page: top banner + between content + bottom

---

## 🎯 SEO Optimization

- ✅ Dynamic `<title>` and `<meta>` per wish page
- ✅ Open Graph tags for WhatsApp/Twitter previews
- ✅ Schema.org Event markup
- ✅ Clean URLs (`/wish/name-age-id`)
- ✅ `sitemap.xml` via Next.js App Router
- ✅ `robots.txt` configured
- ✅ Fast loading (no database roundtrip)

### Target Keywords
- "birthday wish generator"
- "birthday QR code"
- "personalized birthday message"
- "birthday surprise generator"
- "happy birthday page generator"

---

## 🔥 Viral Growth Features

- **WhatsApp sharing** with pre-filled message
- **"Create Your Own"** CTA on every wish page (viral loop)
- **QR code** makes physical sharing dead-simple
- **Emoji reactions** increase engagement
- **Beautiful UI** people want to share

---

## 📱 PWA Installation

Users on mobile will see an "Add to Home Screen" prompt:
1. Open the site on mobile
2. Tap the browser menu
3. Select "Add to Home Screen"
4. App installs like a native app

---

## 🎨 Customization

### Colors (in `globals.css`)
```css
:root {
  --gold: #fbbf24;
  --rose-glow: #ff6b9d;
  --midnight: #030014;
}
```

### Fonts (in `globals.css`)
```css
@import url('..Playfair Display + DM Sans...');
```

### Balloon count & size (in `BirthdayWish.tsx`)
```jsx
<Balloons count={14} size="lg" />
```

---

## 🤝 Contributing

Pull requests welcome! Areas for improvement:
- [ ] Add birthday date for countdown timer
- [ ] Custom background music upload
- [ ] More animation themes
- [ ] Short URL service integration
- [ ] Analytics dashboard

---

## 📄 License

MIT — free to use and modify.

---

**Made with ❤️ | Birthday QR Surprise**
# birthday-qr-surprise
