export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'questions' | 'streak' | 'mastery' | 'speed' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface AchievementProgress {
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  maxStreak: number;
  topicsMastered: number;
  perfectLevels: number; // Levels completed with 100% accuracy
  speedDemon: number; // Questions answered under 10 seconds correctly
  dailyStreak: number; // Days practiced in a row
  lastPracticeDate: string | null;
  subjectsExplored: string[];
}

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Questions Answered
  { id: 'first_steps', name: 'First Steps', description: 'Answer your first question', emoji: '👶', category: 'questions', requirement: 1, tier: 'bronze' },
  { id: 'getting_started', name: 'Getting Started', description: 'Answer 10 questions', emoji: '🚀', category: 'questions', requirement: 10, tier: 'bronze' },
  { id: 'curious_mind', name: 'Curious Mind', description: 'Answer 50 questions', emoji: '🧠', category: 'questions', requirement: 50, tier: 'silver' },
  { id: 'dedicated_learner', name: 'Dedicated Learner', description: 'Answer 100 questions', emoji: '📚', category: 'questions', requirement: 100, tier: 'silver' },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Answer 250 questions', emoji: '🔍', category: 'questions', requirement: 250, tier: 'gold' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Answer 500 questions', emoji: '👑', category: 'questions', requirement: 500, tier: 'gold' },
  { id: 'legendary', name: 'Legendary Scholar', description: 'Answer 1000 questions', emoji: '🌟', category: 'questions', requirement: 1000, tier: 'diamond' },

  // Correct Answers
  { id: 'sharp_mind', name: 'Sharp Mind', description: 'Get 10 questions correct', emoji: '✨', category: 'questions', requirement: 10, tier: 'bronze' },
  { id: 'brilliant', name: 'Brilliant', description: 'Get 50 questions correct', emoji: '💡', category: 'questions', requirement: 50, tier: 'silver' },
  { id: 'genius', name: 'Genius', description: 'Get 100 questions correct', emoji: '🎓', category: 'questions', requirement: 100, tier: 'gold' },
  { id: 'mastermind', name: 'Mastermind', description: 'Get 250 questions correct', emoji: '🧙', category: 'questions', requirement: 250, tier: 'diamond' },

  // Streak Achievements
  { id: 'hot_start', name: 'Hot Start', description: 'Get 3 in a row correct', emoji: '🔥', category: 'streak', requirement: 3, tier: 'bronze' },
  { id: 'on_fire', name: 'On Fire', description: 'Get 5 in a row correct', emoji: '🔥', category: 'streak', requirement: 5, tier: 'bronze' },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Get 10 in a row correct', emoji: '⚡', category: 'streak', requirement: 10, tier: 'silver' },
  { id: 'invincible', name: 'Invincible', description: 'Get 15 in a row correct', emoji: '💪', category: 'streak', requirement: 15, tier: 'gold' },
  { id: 'legendary_streak', name: 'Legendary Streak', description: 'Get 20 in a row correct', emoji: '🏆', category: 'streak', requirement: 20, tier: 'diamond' },

  // Mastery Achievements
  { id: 'first_mastery', name: 'First Mastery', description: 'Master your first topic level', emoji: '⭐', category: 'mastery', requirement: 1, tier: 'bronze' },
  { id: 'rising_star', name: 'Rising Star', description: 'Master 5 topic levels', emoji: '🌙', category: 'mastery', requirement: 5, tier: 'silver' },
  { id: 'constellation', name: 'Constellation', description: 'Master 10 topic levels', emoji: '✨', category: 'mastery', requirement: 10, tier: 'gold' },
  { id: 'galaxy_brain', name: 'Galaxy Brain', description: 'Master 25 topic levels', emoji: '🌌', category: 'mastery', requirement: 25, tier: 'diamond' },

  // Perfect Levels (100% accuracy)
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a level with 100% accuracy', emoji: '💯', category: 'mastery', requirement: 1, tier: 'silver' },
  { id: 'flawless', name: 'Flawless', description: 'Complete 5 levels with 100% accuracy', emoji: '💎', category: 'mastery', requirement: 5, tier: 'gold' },
  { id: 'untouchable', name: 'Untouchable', description: 'Complete 10 levels with 100% accuracy', emoji: '👼', category: 'mastery', requirement: 10, tier: 'diamond' },

  // Speed Achievements
  { id: 'quick_thinker', name: 'Quick Thinker', description: 'Answer 5 questions correctly under 10 seconds each', emoji: '⚡', category: 'speed', requirement: 5, tier: 'bronze' },
  { id: 'lightning_fast', name: 'Lightning Fast', description: 'Answer 25 questions correctly under 10 seconds each', emoji: '🌩️', category: 'speed', requirement: 25, tier: 'silver' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Answer 50 questions correctly under 10 seconds each', emoji: '👹', category: 'speed', requirement: 50, tier: 'gold' },
  { id: 'flash', name: 'The Flash', description: 'Answer 100 questions correctly under 10 seconds each', emoji: '⚡', category: 'speed', requirement: 100, tier: 'diamond' },

  // Special Achievements
  { id: 'explorer', name: 'Explorer', description: 'Try all 3 subjects', emoji: '🗺️', category: 'special', requirement: 3, tier: 'silver' },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Retry and pass a level you failed', emoji: '💪', category: 'special', requirement: 1, tier: 'bronze' },
  { id: 'consistent', name: 'Consistent Learner', description: 'Practice 3 days in a row', emoji: '📅', category: 'special', requirement: 3, tier: 'bronze' },
  { id: 'dedicated', name: 'Truly Dedicated', description: 'Practice 7 days in a row', emoji: '🎯', category: 'special', requirement: 7, tier: 'gold' },
];

export const TIER_COLORS = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-400 to-amber-500',
  diamond: 'from-cyan-300 to-blue-500',
};

export const TIER_BG_COLORS = {
  bronze: 'bg-amber-100 dark:bg-amber-900/30',
  silver: 'bg-slate-100 dark:bg-slate-800/50',
  gold: 'bg-yellow-100 dark:bg-yellow-900/30',
  diamond: 'bg-cyan-100 dark:bg-cyan-900/30',
};
