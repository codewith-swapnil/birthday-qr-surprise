// ─────────────────────────────────────────────────────────────
//  Programmatic SEO: Blog Data Engine
//  Generates 1000+ unique slugs + rich page content
// ─────────────────────────────────────────────────────────────

export const relations = [
  'girlfriend', 'boyfriend', 'wife', 'husband',
  'best-friend', 'brother', 'sister', 'mom', 'dad',
  'crush', 'colleague', 'teacher', 'friend',
];

export const modifiers = [
  'romantic', 'funny', 'emotional', 'creative', 'unique',
  'sweet', 'heartfelt', 'surprise', 'special', 'cute',
];

export const languages = ['english', 'hindi', 'marathi'];

export const occasions = [
  '18th', '21st', '25th', '30th', '40th', '50th', 'milestone',
];

export const years = ['2025', '2026'];

// ─── Slug generators ─────────────────────────────────────────

function slugifyRelation(r: string) {
  return r; // already hyphenated
}

export function getAllSlugs(): string[] {
  const slugs: string[] = [];

  // Type A: {modifier}-birthday-qr-for-{relation}  (130 pages)
  for (const m of modifiers) {
    for (const r of relations) {
      slugs.push(`${m}-birthday-qr-for-${r}`);
    }
  }

  // Type B: birthday-qr-for-{relation}-in-{language}  (39 pages)
  for (const r of relations) {
    for (const lang of languages) {
      slugs.push(`birthday-qr-for-${r}-in-${lang}`);
    }
  }

  // Type C: {occasion}-birthday-qr-for-{relation}  (91 pages)
  for (const occ of occasions) {
    for (const r of relations) {
      slugs.push(`${occ}-birthday-qr-for-${r}`);
    }
  }

  // Type D: birthday-qr-surprise-for-{relation}-{year}  (26 pages)
  for (const r of relations) {
    for (const yr of years) {
      slugs.push(`birthday-qr-surprise-for-${r}-${yr}`);
    }
  }

  // Type E: how-to-create-{modifier}-birthday-qr-for-{relation}  (130 pages)
  for (const m of modifiers) {
    for (const r of relations) {
      slugs.push(`how-to-create-${m}-birthday-qr-for-${r}`);
    }
  }

  // Type F: best-birthday-qr-ideas-for-{relation}  (13 pages)
  for (const r of relations) {
    slugs.push(`best-birthday-qr-ideas-for-${r}`);
  }

  // Deduplicate
  return [...new Set(slugs)];
}

// ─── Helpers ──────────────────────────────────────────────────

function titleCase(str: string) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectParts(slug: string): {
  modifier: string;
  relation: string;
  language: string;
  occasion: string;
  year: string;
  type: string;
} {
  let modifier = '';
  let relation = '';
  let language = '';
  let occasion = '';
  let year = '';
  let type = 'general';

  // Type A
  const typeA = slug.match(
    /^(romantic|funny|emotional|creative|unique|sweet|heartfelt|surprise|special|cute)-birthday-qr-for-(.+)$/
  );
  if (typeA) {
    modifier = typeA[1];
    relation = typeA[2];
    type = 'modifier-relation';
  }

  // Type B
  const typeB = slug.match(/^birthday-qr-for-(.+)-in-(english|hindi|marathi)$/);
  if (typeB) {
    relation = typeB[1];
    language = typeB[2];
    type = 'language';
  }

  // Type C
  const typeC = slug.match(/^(\d+th|milestone)-birthday-qr-for-(.+)$/);
  if (typeC) {
    occasion = typeC[1];
    relation = typeC[2];
    type = 'occasion';
  }

  // Type D
  const typeD = slug.match(/^birthday-qr-surprise-for-(.+)-(\d{4})$/);
  if (typeD) {
    relation = typeD[1];
    year = typeD[2];
    type = 'year';
  }

  // Type E
  const typeE = slug.match(
    /^how-to-create-(romantic|funny|emotional|creative|unique|sweet|heartfelt|surprise|special|cute)-birthday-qr-for-(.+)$/
  );
  if (typeE) {
    modifier = typeE[1];
    relation = typeE[2];
    type = 'howto';
  }

  // Type F
  const typeF = slug.match(/^best-birthday-qr-ideas-for-(.+)$/);
  if (typeF) {
    relation = typeF[1];
    type = 'ideas';
  }

  return { modifier, relation, language, occasion, year, type };
}

// ─── Emoji map ────────────────────────────────────────────────

const relationEmoji: Record<string, string> = {
  girlfriend: '💕', boyfriend: '💙', wife: '💍', husband: '🤵',
  'best-friend': '🤝', brother: '👊', sister: '🌸', mom: '🌷',
  dad: '👔', crush: '😍', colleague: '🤝', teacher: '📚', friend: '😊',
};

const modifierEmoji: Record<string, string> = {
  romantic: '❤️', funny: '😂', emotional: '😢', creative: '🎨',
  unique: '✨', sweet: '🍬', heartfelt: '💝', surprise: '🎁',
  special: '⭐', cute: '🥰',
};

// ─── Content Generator ────────────────────────────────────────

export interface BlogContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string }[];
  tips: string[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  emoji: string;
  readingTime: string;
  publishDate: string;
}

const SAMPLE_DATES = [
  '2025-01-15', '2025-02-10', '2025-03-05', '2025-04-20',
  '2025-05-12', '2025-06-18', '2025-11-25', '2025-12-01',
];

function deterministicDate(slug: string) {
  const idx = slug.length % SAMPLE_DATES.length;
  return SAMPLE_DATES[idx];
}

export function generateBlogContent(slug: string): BlogContent {
  const { modifier, relation, language, occasion, year, type } = detectParts(slug);

  const relLabel = titleCase(relation || 'someone special');
  const modLabel = titleCase(modifier || 'beautiful');
  const langLabel = titleCase(language);
  const occLabel = occasion ? `${occasion} ` : '';
  const emoji = relationEmoji[relation] || modifierEmoji[modifier] || '🎉';

  // ── Title & Description ──
  let title = '';
  let description = '';
  let h1 = '';
  let intro = '';

  if (type === 'modifier-relation') {
    title = `${modLabel} Birthday QR Surprise for Your ${relLabel} – Free Generator`;
    description = `Create a ${modLabel.toLowerCase()} birthday QR surprise for your ${relLabel.toLowerCase()}. Personalized wish page with confetti, balloons & shareable link. 100% free!`;
    h1 = `${modLabel} Birthday QR Code for Your ${relLabel} ${emoji}`;
    intro = `Want to make your ${relLabel.toLowerCase()}'s birthday unforgettable? A ${modLabel.toLowerCase()} QR birthday surprise is the perfect modern way to show you care. Instead of a plain text message or boring card, surprise them with a magical animated birthday page — complete with confetti, balloons, and your heartfelt words — all accessible with a single QR scan.`;
  } else if (type === 'language') {
    title = `Birthday QR Code for ${relLabel} in ${langLabel} – Create in Seconds`;
    description = `Generate a personalized birthday QR surprise for your ${relLabel.toLowerCase()} with a message in ${langLabel}. Free & instant.`;
    h1 = `Birthday QR Surprise for ${relLabel} in ${langLabel} ${emoji}`;
    intro = `Sending birthday wishes in ${langLabel} makes them 10× more personal. Our generator lets you create a beautiful birthday QR page with your ${relLabel.toLowerCase()}'s name and a message in ${langLabel} — then share it instantly on WhatsApp.`;
  } else if (type === 'occasion') {
    title = `${occLabel}Birthday QR Surprise for ${relLabel} – Make It Memorable`;
    description = `Celebrate your ${relLabel.toLowerCase()}'s ${occLabel}birthday with a personalized QR surprise page. Free, animated, and shareable.`;
    h1 = `${occLabel}Birthday QR Code for Your ${relLabel} ${emoji}`;
    intro = `A ${occLabel.toLowerCase()}birthday is a major milestone that deserves something extraordinary. Our birthday QR generator lets you create a stunning animated wish page in seconds. Share the QR code with guests, put it on a cake box, or send it on WhatsApp — your ${relLabel.toLowerCase()} will be amazed.`;
  } else if (type === 'year') {
    title = `Birthday QR Surprise for ${relLabel} in ${year} – Best Free Tool`;
    description = `The best way to surprise your ${relLabel.toLowerCase()} on their birthday in ${year}. Create a free animated QR wish page now.`;
    h1 = `Best Birthday QR Surprise for ${relLabel} (${year}) ${emoji}`;
    intro = `In ${year}, standing out on someone's birthday means going beyond a basic WhatsApp forward. Our QR birthday surprise tool lets you generate a personalized animated wish page for your ${relLabel.toLowerCase()} — completely free, no sign-up needed.`;
  } else if (type === 'howto') {
    title = `How to Create a ${modLabel} Birthday QR for Your ${relLabel} – Step-by-Step`;
    description = `Step-by-step guide to creating a ${modLabel.toLowerCase()} birthday QR code surprise for your ${relLabel.toLowerCase()}. Free & easy!`;
    h1 = `How to Create a ${modLabel} Birthday QR for Your ${relLabel} ${emoji}`;
    intro = `Creating a ${modLabel.toLowerCase()} birthday QR code for your ${relLabel.toLowerCase()} takes less than 60 seconds. In this guide we'll walk you through each step so the surprise lands perfectly.`;
  } else if (type === 'ideas') {
    title = `Best Birthday QR Code Ideas for Your ${relLabel} – 10 Creative Surprises`;
    description = `Discover the best birthday QR code surprise ideas for your ${relLabel.toLowerCase()}. Animated wish pages, hidden messages, photo slideshows & more. Free!`;
    h1 = `10 Best Birthday QR Code Ideas for Your ${relLabel} ${emoji}`;
    intro = `Looking for creative ways to use birthday QR codes for your ${relLabel.toLowerCase()}? You've come to the right place. Below are 10 unique ideas that will make their birthday unforgettable — from romantic animated pages to fun meme collections.`;
  } else {
    title = `Birthday QR Surprise – Free Generator`;
    description = `Create a personalized birthday QR surprise. Free, instant, and magical.`;
    h1 = `Birthday QR Surprise Generator 🎉`;
    intro = `Surprise the people you love with a beautiful birthday QR code page.`;
  }

  // ── Sections ──
  const sections: { heading: string; body: string }[] = [
    {
      heading: `Why a QR Birthday Surprise for Your ${relLabel}?`,
      body: `Traditional birthday cards get forgotten in a drawer. A QR birthday page lives on their phone forever. Every time they scan it, they relive the animated confetti, the balloons, and your personal message. It's shareable, saveable, and absolutely free to create. Best of all, your ${relLabel.toLowerCase()} doesn't need any special app — just their phone camera.`,
    },
    {
      heading: 'What You Get on the Birthday Page',
      body: `Our generator creates a full-screen animated birthday page with: confetti rain, floating balloons, a star field background, your custom message, and the birthday person's name displayed in beautiful typography. The page also includes a WhatsApp share button so they can spread the joy instantly.`,
    },
    {
      heading: 'How to Share the QR Code',
      body: `After generating your birthday page, you'll receive a QR code and a shareable link. You can: print the QR code on a cake box, send the QR image on WhatsApp, paste the link in a birthday message, display it on a TV or laptop during the party. The link works on any device — no app install required.`,
    },
    {
      heading: `${modLabel || 'Creative'} Message Ideas for Your ${relLabel}`,
      body: `Need inspiration for your message? Try something like: "Every year with you is my favourite chapter 📖", "You make the world brighter just by being in it ✨", "Here's to more adventures, more laughs, and more memories together 🥂". Keep it personal — mention an inside joke, a shared memory, or a simple truth about why they're special to you.`,
    },
  ];

  // ── Tips ──
  const tips = [
    `Add a photo or emoji in your message to make it extra personal.`,
    `Send the QR code at midnight so they wake up to a surprise.`,
    `Print the QR on a small card and tuck it inside a gift bag.`,
    `Record a short voice note and paste the link in the message field for a multimedia surprise.`,
    `Use the "Copy Link" button to share via Instagram DM, Telegram, or email.`,
  ];

  // ── FAQs ──
  const faqs: { q: string; a: string }[] = [
    {
      q: `Is this birthday QR surprise tool really free?`,
      a: `Yes — 100% free. No account, no credit card, no hidden charges. Generate as many birthday pages as you like.`,
    },
    {
      q: `How long does the birthday wish page stay active?`,
      a: `Your birthday wish page stays active permanently. Bookmark it or save the link — it will always work.`,
    },
    {
      q: `Can I use this for my ${relLabel.toLowerCase()}?`,
      a: `Absolutely! Our tool works for any relationship — ${relLabel.toLowerCase()}, best friends, family, colleagues. Just enter the name and message.`,
    },
    {
      q: `Does the birthday person need to install any app?`,
      a: `No app needed. They simply scan the QR code with their phone camera or open the link in any browser.`,
    },
    {
      q: `Can I customise the birthday page?`,
      a: `Yes! You can set the person's name, age, and a custom message. The page automatically generates beautiful animations around your content.`,
    },
  ];

  // ── Related Slugs ──
  const allSlugs = getAllSlugs();
  const related = allSlugs
    .filter((s) => s !== slug && (s.includes(relation) || s.includes(modifier)))
    .slice(0, 6);

  return {
    title,
    description,
    h1,
    intro,
    sections,
    tips,
    faqs,
    relatedSlugs: related,
    emoji,
    readingTime: '4 min read',
    publishDate: deterministicDate(slug),
  };
}

// ─── Featured posts for homepage / listing ────────────────────

export const FEATURED_SLUGS = [
  'romantic-birthday-qr-for-girlfriend',
  'funny-birthday-qr-for-brother',
  'emotional-birthday-qr-for-mom',
  'sweet-birthday-qr-for-best-friend',
  'creative-birthday-qr-for-wife',
  'heartfelt-birthday-qr-for-dad',
  'birthday-qr-for-girlfriend-in-hindi',
  'birthday-qr-for-wife-in-marathi',
  '21st-birthday-qr-for-best-friend',
  '30th-birthday-qr-for-husband',
  'best-birthday-qr-ideas-for-girlfriend',
  'how-to-create-romantic-birthday-qr-for-girlfriend',
];