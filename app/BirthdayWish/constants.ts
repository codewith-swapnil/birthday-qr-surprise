// ─────────────────────────────────────────────────────────
// BirthdayWish — shared constants
// ─────────────────────────────────────────────────────────

export const padTwo = (n: number): string => String(n).padStart(2, '0');

export const BALLOON_COLS = [
  '#ff6b9d', '#c084fc', '#fbbf24', '#fb7185',
  '#a78bfa', '#f472b6', '#fde68a', '#e879f9',
] as const;

export const CF_COLS = [
  '#ff6b9d', '#c084fc', '#fbbf24', '#fb7185',
  '#a78bfa', '#f472b6', '#fde68a', '#60a5fa',
  '#34d399', '#fff',
] as const;

export const FW_COLS = [
  '#ff6b9d', '#c084fc', '#fbbf24', '#fb7185',
  '#f9a8d4', '#fde68a', '#e879f9', '#a78bfa',
] as const;

export const PETAL_EMOJIS = ['🌸', '🌺', '🌹', '💮', '🌼', '✿'] as const;

export const HEARTS = ['💖', '💕', '✨', '🌸', '💗', '⭐', '🌺'] as const;

export const SURPRISE_MSGS = [
  '🌟 You are like a rare diamond — precious, brilliant, and absolutely irreplaceable. The universe crafted you to be extraordinary! 💎',
  '🌸 Every single person who knows you is lucky beyond measure. Your presence is a gift that keeps giving every single day! 💝',
  "🦋 You have the most magical ability to make ordinary moments feel extraordinary. That's a superpower! ⚡",
  '🌺 Somewhere right now, someone is thinking about you and smiling without even realising why. That\'s the effect you have! 💫',
  '✨ If happiness had a face, it would look exactly like yours. Happy Birthday to the most radiant you! 🎂',
  '🌙 The stars are jealous of how brightly you shine. Keep glowing, keep being you! 💛',
] as const;

export const WISH_CARDS = [
  { txt: 'तुम्हारा जन्मदिन तुम्हारी ज़िंदगी का सबसे खूबसूरत दिन बने। हर पल खुशियों और मुहब्बत से भरा रहे।', em: '❤️' },
  { txt: 'भगवान तुम्हें दुनिया की सारी खुशियाँ दे, तुम्हारी हर ख्वाहिश पूरी हो, हर सपना सच बने।', em: '🎂' },
  { txt: '__NAME__, तुम जहाँ भी जाओ रोशनी बिखेरती रहो। तुम्हारी मुस्कान में जादू है जो दिलों को छू जाती है।', em: '✨' },
  { txt: 'तुझा वाढदिवस खूप खास आणि आनंदाचा जावो। तुझ्या जीवनात नेहमी सुख, समृद्धी आणि प्रेम राहो।', em: '🎉' },
  { txt: 'तुझ्या आयुष्यात कायम आनंद आणि प्रेम राहो। देव तुला दीर्घायुष्य, यश आणि अपार आनंद देवो।', em: '🌺' },
  { txt: '__NAME__, तू खूप विशेष आहेस. तुझ्या हास्याने सगळ्यांचं मन प्रसन्न होतं. वाढदिवसाच्या हार्दिक शुभेच्छा!', em: '💜' },
  { txt: 'Happy Birthday __NAME__! You are truly special. The world is a more beautiful place because you exist in it.', em: '💖' },
  { txt: 'May your life overflow with love, joy, and success. You deserve every wonderful thing the universe has to offer.', em: '🎂' },
  {
    txt: 'On your birthday, I wish you a year so full of magic, laughter, and unforgettable moments that your heart could burst. You are irreplaceable, __NAME__.',
    em: '🌟',
  },
] as const;

export const WHY_SPECIAL_ITEMS = [
  { ico: '🌹', txt: 'Your smile is the kind that makes everyone around you feel warm and loved — even on their darkest days, __NAME__.' },
  { ico: '💫', txt: 'You carry a rare, beautiful combination of strength and grace. You handle everything life throws at you with dignity and elegance.' },
  { ico: '🌸', txt: 'Your kindness is genuine, your laughter is contagious, and your heart is one of the most beautiful things this world has ever known.' },
  { ico: '⭐', txt: 'You dream big, love deep, and shine bright. There is simply no one in this world quite like you — you are one of a kind, __NAME__.' },
  { ico: '🦋', txt: 'You have the rare and precious gift of making people feel truly seen, truly heard, and deeply cherished. That is your superpower.' },
  { ico: '🌙', txt: "Even on cloudy days you bring light. You are the reason someone's day gets better without them even knowing why." },
] as const;

export const NAV_IDS = ['s-hero', 's-photos', 's-wishes', 's-special', 's-msg', 's-final'] as const;

export const SURPRISE_ICONS = ['✨', '💖', '🌸', '🦋', '⭐', '💫', '🌺', '🎊'] as const;

/** Replace __NAME__ placeholder in wish strings */
export function injectName(str: string, name: string): string {
  return str.replaceAll('__NAME__', name);
}