import { useState, useEffect, useRef } from 'react';

interface TypingOptions {
  /** Milliseconds to wait before starting to delete */
  holdMs?: number;
  /** Milliseconds per character while typing */
  typeSpeed?: number;
  /** Milliseconds per character while deleting */
  deleteSpeed?: number;
  /** Milliseconds before the first phrase starts */
  initialDelayMs?: number;
}

interface TypingResult {
  text: string;
  /** Blinks at ~0.85 s — use to render the cursor character */
  showCursor: boolean;
}

/**
 * Cycles through `phrases`, typing and deleting each one.
 * Only starts when `enabled` is true (e.g. after birthday is shown).
 */
export function useTypingEffect(
  phrases: readonly string[],
  enabled: boolean,
  {
    holdMs = 2_400,
    typeSpeed = 62,
    deleteSpeed = 38,
    initialDelayMs = 900,
  }: TypingOptions = {},
): TypingResult {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Keep a stable ref to phrases so the effect doesn't re-run on every render
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    if (!enabled || !phrases.length) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = phrasesRef.current[phraseIdx];

      if (!deleting) {
        // Typing forward
        charIdx++;
        setText(phrase.slice(0, charIdx));

        if (charIdx === phrase.length) {
          // Finished typing — hold, then start deleting
          deleting = true;
          timer = setTimeout(tick, holdMs);
          return;
        }
      } else {
        // Deleting backward
        charIdx--;
        setText(phrase.slice(0, charIdx));

        if (charIdx === 0) {
          // Finished deleting — move to next phrase
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrasesRef.current.length;
        }
      }

      timer = setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    };

    const blinkInterval = setInterval(() => setShowCursor((v) => !v), 530);
    timer = setTimeout(tick, initialDelayMs);

    return () => {
      clearTimeout(timer);
      clearInterval(blinkInterval);
    };
    // `phrases` identity changes are handled via ref; only re-run on enable/disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { text, showCursor };
}