export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD format
  question: {
    id: string;
    subject: string;
    topic: string;
    level: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  completed: boolean;
  correct: boolean | null;
  timeSpentSeconds: number | null;
  completedAt: number | null;
}

export interface DailyChallengeStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalCorrect: number;
  lastCompletedDate: string | null;
  bonusStarsEarned: number;
}

// Bonus stars for daily challenge streaks
export const getDailyChallengeBonus = (streak: number): number => {
  if (streak >= 30) return 500;
  if (streak >= 14) return 200;
  if (streak >= 7) return 100;
  if (streak >= 3) return 50;
  return 25; // Base bonus for completing daily challenge
};
