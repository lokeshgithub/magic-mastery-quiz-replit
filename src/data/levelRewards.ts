// Level-based reward system with badges, certificates, and titles

export interface LevelReward {
  level: number;
  badge: {
    name: string;
    icon: string;
    color: string;
    description: string;
  };
  title: string;
  certificate: {
    name: string;
    description: string;
  };
  starsBonus: number;
  achievementMessage: string;
  percentileMessage: string;
}

export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 1,
    badge: {
      name: 'Fundamentals Badge',
      icon: '🌱',
      color: 'from-green-400 to-green-600',
      description: 'Textbook Direct - Single-step recall and basic formula application.',
    },
    title: 'Explorer',
    certificate: {
      name: 'Certificate of Fundamentals',
      description: 'Successfully completed Level 1 - Introductory exercises mastered',
    },
    starsBonus: 50,
    achievementMessage: 'Great start! You\'re building the foundation!',
    percentileMessage: 'You\'re in the Top 90% - Fundamentals mastered!',
  },
  {
    level: 2,
    badge: {
      name: 'Fluency Badge',
      icon: '🥉',
      color: 'from-amber-600 to-amber-800',
      description: 'School Standard - Multi-step operations and standard word problems.',
    },
    title: 'Apprentice',
    certificate: {
      name: 'Certificate of Fluency',
      description: 'Demonstrated consistent learning in Level 2 - School Standard',
    },
    starsBonus: 100,
    achievementMessage: 'Excellent progress! Ready for school exams!',
    percentileMessage: 'You\'re in the Top 50% - School Standard achieved!',
  },
  {
    level: 3,
    badge: {
      name: 'Strategic Badge',
      icon: '🥈',
      color: 'from-gray-300 to-gray-500',
      description: 'Competitive Basic - Logic-heavy arithmetic and pattern recognition.',
    },
    title: 'Scholar',
    certificate: {
      name: 'Certificate of Strategic Thinking',
      description: 'Achieved Level 3 - Competitive Basic mastery',
    },
    starsBonus: 200,
    achievementMessage: '🎉 Amazing! You\'re thinking like a competitor!',
    percentileMessage: 'You\'re in the Top 25% - Competitive Basic level!',
  },
  {
    level: 4,
    badge: {
      name: 'Bridge Badge',
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      description: 'Competitive Advanced - Inter-topic connections within the class.',
    },
    title: 'Champion',
    certificate: {
      name: 'Certificate of Excellence',
      description: 'Achieved Level 4 - NSTSE/IMO School Level',
    },
    starsBonus: 350,
    achievementMessage: '🏆 Incredible! You\'re ready for NSTSE/IMO!',
    percentileMessage: 'You\'re in the Top 10% - Olympiad School Level!',
  },
  {
    level: 5,
    badge: {
      name: 'IIT Foundation Badge',
      icon: '💎',
      color: 'from-cyan-400 to-blue-600',
      description: 'Elite Prep - Analytical word problems and multi-stage reasoning.',
    },
    title: 'Genius',
    certificate: {
      name: 'Certificate of IIT Foundation',
      description: 'Achieved Level 5 - FIITJEE/Allen Foundation Level',
    },
    starsBonus: 500,
    achievementMessage: '🌟 EXTRAORDINARY! IIT Foundation material!',
    percentileMessage: 'You\'re in the Top 3-5% - Elite Prep level!',
  },
  {
    level: 6,
    badge: {
      name: 'Olympiad Badge',
      icon: '👑',
      color: 'from-purple-500 to-pink-600',
      description: 'Extended Thinking - Abstract proofs and sophisticated integration.',
    },
    title: 'Wizard Master',
    certificate: {
      name: 'Certificate of Olympiad Mastery',
      description: 'Achieved Level 6 - NMTC/PRMO Level Excellence',
    },
    starsBonus: 1000,
    achievementMessage: '👑 LEGENDARY! You\'re among the TOP 1% in INDIA!',
    percentileMessage: 'You\'re in the Top 1% - National Olympiad level!',
  },
  {
    level: 7,
    badge: {
      name: 'Legendary Badge',
      icon: '⭐',
      color: 'from-rose-500 to-orange-500',
      description: 'Absolute mastery achieved - Beyond Olympiad!',
    },
    title: 'Grand Master',
    certificate: {
      name: 'Certificate of Grand Mastery',
      description: 'Achieved Level 7 - Legendary Status',
    },
    starsBonus: 2000,
    achievementMessage: '🔥 UNSTOPPABLE! You\'ve achieved LEGENDARY status!',
    percentileMessage: 'You\'re among the ELITE! International Champion material!',
  },
];

export const getLevelReward = (level: number): LevelReward | undefined => {
  return LEVEL_REWARDS.find(r => r.level === level);
};

export const getHighestUnlockedReward = (maxLevelReached: number): LevelReward | undefined => {
  return LEVEL_REWARDS.filter(r => r.level <= maxLevelReached).pop();
};

export const getTotalBonusStars = (maxLevelReached: number): number => {
  return LEVEL_REWARDS
    .filter(r => r.level <= maxLevelReached)
    .reduce((sum, r) => sum + r.starsBonus, 0);
};

export const getLevelProgressMessage = (currentLevel: number): string => {
  if (currentLevel >= 6) return 'Top 1% - Olympiad Level! 🇮🇳';
  if (currentLevel >= 5) return 'Top 3-5% - IIT Foundation! 💎';
  if (currentLevel >= 4) return 'Top 10% - Olympiad School Level! 🏆';
  if (currentLevel >= 3) return 'Top 25% - Competitive Basic! 🥈';
  if (currentLevel >= 2) return 'Top 50% - School Standard! 📈';
  return 'Top 90% - Fundamentals! 🌱';
};
