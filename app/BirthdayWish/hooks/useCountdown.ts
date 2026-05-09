import { useState, useEffect } from 'react';
import { isBirthdayToday, msToNextBirthday } from '@/lib/utils';
import { padTwo } from '../constants';

export interface CountdownDigits {
  d: string;
  h: string;
  m: string;
  s: string;
}

export interface CountdownResult {
  /** True when the birthday is today (or no date provided) */
  showBirthday: boolean;
  cd: CountdownDigits;
}

/**
 * Counts down to the next occurrence of `day`/`month`.
 * Flips `showBirthday` to true when the countdown reaches zero.
 */
export function useCountdown(day: number, month: string): CountdownResult {
  const [showBirthday, setShowBirthday] = useState(false);
  const [cd, setCd] = useState<CountdownDigits>({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    // No date provided or it's their birthday today → go straight to birthday screen
    if (!day || !month || isBirthdayToday(day, month)) {
      setShowBirthday(true);
      return;
    }

    const update = () => {
      const ms = msToNextBirthday(day, month);
      if (ms <= 0) {
        setShowBirthday(true);
        clearInterval(timer);
        return;
      }
      const totalSeconds = Math.floor(ms / 1000);
      setCd({
        d: padTwo(Math.floor(totalSeconds / 86_400)),
        h: padTwo(Math.floor((totalSeconds % 86_400) / 3_600)),
        m: padTwo(Math.floor((totalSeconds % 3_600) / 60)),
        s: padTwo(totalSeconds % 60),
      });
    };

    update();
    const timer = setInterval(update, 1_000);
    return () => clearInterval(timer);
  }, [day, month]);

  return { showBirthday, cd };
}