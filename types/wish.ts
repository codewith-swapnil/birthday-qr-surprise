export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export type MonthName = typeof MONTH_NAMES[number];
export type WishTopic = 'birthday' | 'propose';

export interface WishData {
  name: string;
  day: number;
  month: string;
  message: string;
  createdAt: string;
  images?: string[];
  topic?: WishTopic;   // 'birthday' (default) | 'propose'
}