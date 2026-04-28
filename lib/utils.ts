export interface WishData {
  name: string;
  age: string;
  message: string;
  createdAt: string;
  images?: string[];   // Cloudinary URLs — optional
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
    let base64: string;

    if (typeof window === 'undefined') {
      base64 = Buffer.from(json, 'utf-8').toString('base64');
    } else {
      base64 = btoa(
        encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        )
      );
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch {
    return '';
  }
}

export function decodeWishData(encoded: string): WishData | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    let json: string;
    if (typeof window === 'undefined') {
      json = Buffer.from(padded, 'base64').toString('utf-8');
    } else {
      json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
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
