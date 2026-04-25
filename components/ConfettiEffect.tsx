'use client';

import { useEffect } from 'react';

interface ConfettiEffectProps {
  trigger?: boolean;
  loop?: boolean;
}

export default function ConfettiEffect({ trigger = true, loop = false }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    let animationId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    async function launchConfetti() {
      const confetti = (await import('canvas-confetti')).default;

      const colors = [
        '#fbbf24', '#ff6b9d', '#34d399', '#60a5fa',
        '#a78bfa', '#fb923c', '#f472b6', '#fde68a',
      ];

      // Initial burst
      const burst = (origin: { x: number; y: number }) => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin,
          colors,
          gravity: 0.8,
          scalar: 1.2,
          shapes: ['circle', 'square'],
        });
      };

      burst({ x: 0.2, y: 0.6 });
      setTimeout(() => burst({ x: 0.8, y: 0.6 }), 200);
      setTimeout(() => burst({ x: 0.5, y: 0.5 }), 400);

      if (loop && isMounted) {
        // Continuous gentle confetti
        const gentleShower = () => {
          if (!isMounted) return;
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors,
            gravity: 0.6,
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors,
            gravity: 0.6,
          });
          animationId = setTimeout(gentleShower, 400);
        };

        animationId = setTimeout(gentleShower, 1000);
      }
    }

    launchConfetti();

    return () => {
      isMounted = false;
      clearTimeout(animationId);
    };
  }, [trigger, loop]);

  return null;
}
