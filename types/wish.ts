/**
 * types/wish.ts
 *
 * CHANGE: dateOfBirth (combined "14 March" string) →
 *         day: number + month: string (separate fields)
 */

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
] as const;

export type MonthName = typeof MONTH_NAMES[number];

export interface WishData {
  /** Birthday person's display name */
  name: string;

  /** Day of birth — 1–31 */
  day: number;

  /** Month of birth as full English name — e.g. "April" */
  month: string;

  /**
   * Optional personalised message (plain text).
   * \n is rendered as a line break on the wish page.
   */
  message: string;

  /** ISO timestamp — when the wish was created */
  createdAt: string;

  /**
   * Optional array of Cloudinary / CDN image URLs.
   * The wish page shows EXACTLY this many photos — never more.
   * Up to 8 are displayed in the photo grid.
   */
  images?: string[];
}