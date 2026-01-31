import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  // Basic celebration for correct answers (streak of 3+)
  const fireStreak = useCallback((count: number) => {
    if (count < 3) return;

    const intensity = Math.min(count / 5, 1);
    
    confetti({
      particleCount: 30 + count * 10,
      spread: 60 + count * 5,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'],
      scalar: 0.8 + intensity * 0.4,
    });
  }, []);

  // Level completion celebration
  const fireLevelUp = useCallback((passed: boolean) => {
    if (!passed) return;

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#22C55E', '#10B981', '#34D399', '#6EE7B7'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#22C55E', '#10B981', '#34D399', '#6EE7B7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Topic mastery - big celebration!
  const fireMastery = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF4500'],
      scalar: 1.2,
    });

    // Continuous celebration
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 5,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.5 },
        colors: ['#A855F7', '#8B5CF6', '#7C3AED', '#6366F1'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.5 },
        colors: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8'],
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Achievement unlock celebration
  const fireAchievement = useCallback(() => {
    // Star burst from center
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'] as const,
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#A855F7'],
    };

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 0.8,
      });
    }, 200);
  }, []);

  // Daily challenge complete
  const fireDailyChallenge = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
      scalar: 1,
    });
  }, []);

  return {
    fireStreak,
    fireLevelUp,
    fireMastery,
    fireAchievement,
    fireDailyChallenge,
  };
};
