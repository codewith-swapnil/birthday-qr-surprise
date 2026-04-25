export interface WishData {
  name: string;
  age: string;
  message: string;
  createdAt: string;
  emoji?: string;
}

export function generateSlug(name: string, age: string): string {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${cleanName}-${age}-${randomId}`;
}

export function encodeWishData(data: WishData): string {
  try {
    const json = JSON.stringify(data);
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(encodeURIComponent(json));
    }
    return Buffer.from(json).toString('base64');
  } catch {
    return '';
  }
}

export function decodeWishData(encoded: string): WishData | null {
  try {
    let json: string;
    if (typeof window !== 'undefined' && window.atob) {
      json = decodeURIComponent(window.atob(encoded));
    } else {
      json = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf-8'));
    }
    return JSON.parse(json) as WishData;
  } catch {
    return null;
  }
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function buildWishUrl(slug: string, data: WishData, baseUrl: string): string {
  const encoded = encodeWishData(data);
  return `${baseUrl}/wish/${slug}?d=${encoded}`;
}

export const EMOJIS = ['🎉', '🎂', '🎈', '🎁', '🌟', '💫', '✨', '🥳', '🎊', '💝'];

export function randomEmoji(): string {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}