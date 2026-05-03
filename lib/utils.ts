/**
 * lib/utils.ts
 * Utility helpers for the birthday-wish feature.
 *
 * Updated: all helpers now accept { day, month } separately (no dateOfBirth string).
 */

import type { WishData } from '@/types/wish';
import { MONTH_NAMES } from '@/types/wish';

// ─────────────────────────────────────────────────────────────────────────────
// Encoding / Decoding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encode WishData → URL-safe base64 string for the ?d= query param.
 *
 * @example
 *   const url = `https://yoursite.com/wish/${slug}?d=${encodeWishData(data)}`;
 */
export function encodeWishData(data: WishData): string {
  try {
    const json = JSON.stringify(data);
    const b64  = Buffer.from(json, 'utf-8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * Decode a URL-safe base64 string back into WishData.
 * Returns null on any parse / validation failure — callers should degrade gracefully.
 */
export function decodeWishData(encoded: string): WishData | null {
  try {
    const b64  = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=');
    const json = Buffer.from(b64, 'base64').toString('utf-8');
    const p    = JSON.parse(json) as Partial<WishData>;

    if (
      typeof p.name   !== 'string' ||
      typeof p.day    !== 'number' ||
      typeof p.month  !== 'string' ||
      typeof p.message  !== 'string' ||
      typeof p.createdAt !== 'string'
    ) return null;

    if (p.day < 1 || p.day > 31)            return null;
    if (!MONTH_NAMES.includes(p.month as never)) return null;

    return {
      name:      p.name,
      day:       p.day,
      month:     p.month,
      message:   p.message,
      createdAt: p.createdAt,
      images:    Array.isArray(p.images) ? p.images : undefined,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug & URL helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from name + day + month.
 * e.g.  generateSlug("Raveena", 24, "April") → "raveena-24-april"
 */
export function generateSlug(name: string, day: number, month: string): string {
  const slug = `${name}-${day}-${month}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'birthday-wish';
}

/**
 * Build the full sharable wish URL including the encoded payload.
 */
export function buildWishUrl(slug: string, data: WishData, baseUrl: string): string {
  const encoded = encodeWishData(data);
  return `${baseUrl}/wish/${slug}?d=${encoded}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordinal suffix
// ─────────────────────────────────────────────────────────────────────────────

export function getOrdinal(n: number): string {
  const abs    = Math.abs(n);
  const mod100 = abs % 100;
  const mod10  = abs % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Birthday / countdown helpers (day + month only — no year)
// ─────────────────────────────────────────────────────────────────────────────

/** Convert month name → 0-based index. Returns -1 if not found. */
export function monthIndex(month: string): number {
  return (MONTH_NAMES as readonly string[]).indexOf(month);
}

/**
 * Is today the birthday? (month + day match, year irrelevant)
 */
export function isBirthdayToday(day: number, month: string): boolean {
  const today = new Date();
  const mi    = monthIndex(month);
  return mi !== -1 && today.getMonth() === mi && today.getDate() === day;
}

/**
 * Milliseconds until the next occurrence of (day, month) at midnight local time.
 * Returns 0 if today is the birthday.
 */
export function msToNextBirthday(day: number, month: string): number {
  const mi = monthIndex(month);
  if (mi === -1) return 0;

  const now   = Date.now();
  const today = new Date();
  let year    = today.getFullYear();

  // Try this year
  let next = new Date(year, mi, day, 0, 0, 0, 0).getTime();
  if (next <= now) {
    // Already passed this year → next year
    next = new Date(year + 1, mi, day, 0, 0, 0, 0).getTime();
  }
  return Math.max(0, next - now);
}

/** Format day + month as display string: "24 April" */
export function formatBirthdayDisplay(day: number, month: string): string {
  return `${day} ${month}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary helper (optional — needs NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
// ─────────────────────────────────────────────────────────────────────────────

export function cloudinaryUrl(
  publicId: string,
  opts: { width?: number; height?: number; crop?: string } = {},
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return publicId;
  const { width = 1200, height, crop = 'fill' } = opts;
  const t = [`w_${width}`, height ? `h_${height}` : null, `c_${crop}`, 'q_auto', 'f_auto']
    .filter(Boolean).join(',');
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
}