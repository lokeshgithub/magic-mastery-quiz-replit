import { useState, useCallback, useEffect } from 'react';
import { Achievement, AchievementProgress, ACHIEVEMENTS } from '@/types/achievements';

const ACHIEVEMENTS_KEY = 'magical-mastery-achievements';

const initialProgress: AchievementProgress = {
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  maxStreak: 0,
  topicsMastered: 0,
  perfectLevels: 0,
  speedDemon: 0,
  dailyStreak: 0,
  lastPracticeDate: null,
  subjectsExplored: [],
};

const loadAchievements = (): { achievements: Achievement[]; progress: AchievementProgress } => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        achievements: parsed.achievements || initializeAchievements(),
        progress: parsed.progress || initialProgress,
      };
    }
  } catch (e) {
    console.error('Failed to load achievements:', e);
  }
  return { achievements: initializeAchievements(), progress: initialProgress };
};

const initializeAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: false,
    progress: 0,
  }));
};

const saveAchievements = (achievements: Achievement[], progress: AchievementProgress) => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify({ achievements, progress }));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
};

export const useAchievements = () => {
  const stored = loadAchievements();
  const [achievements, setAchievements] = useState<Achievement[]>(stored.achievements);
  const [progress, setProgress] = useState<AchievementProgress>(stored.progress);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Save when state changes
  useEffect(() => {
    saveAchievements(achievements, progress);
  }, [achievements, progress]);

  // Check and update daily streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastPracticeDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (progress.lastPracticeDate === yesterday.toDateString()) {
        // Continued streak
        setProgress(prev => ({ ...prev, dailyStreak: prev.dailyStreak + 1, lastPracticeDate: today }));
      } else if (progress.lastPracticeDate !== null) {
        // Streak broken
        setProgress(prev => ({ ...prev, dailyStreak: 1, lastPracticeDate: today }));
      }
    }
  }, []);

  const checkAchievements = useCallback((updatedProgress: AchievementProgress) => {
    setAchievements(prev => {
      const updated = [...prev];
      let justUnlocked: Achievement | null = null;

      updated.forEach((achievement, index) => {
        if (achievement.unlocked) return;

        let currentProgress = 0;

        switch (achievement.id) {
          // Questions answered
          case 'first_steps':
          case 'getting_started':
          case 'curious_mind':
          case 'dedicated_learner':
          case 'knowledge_seeker':
          case 'quiz_master':
          case 'legendary':
            currentProgress = updatedProgress.totalQuestionsAnswered;
            break;

          // Correct answers
          case 'sharp_mind':
          case 'brilliant':
          case 'genius':
          case 'mastermind':
            currentProgress = updatedProgress.totalCorrectAnswers;
            break;

          // Streak
          case 'hot_start':
          case 'on_fire':
          case 'unstoppable':
          case 'invincible':
          case 'legendary_streak':
            currentProgress = updatedProgress.maxStreak;
            break;

          // Mastery
          case 'first_mastery':
          case 'rising_star':
          case 'constellation':
          case 'galaxy_brain':
            currentProgress = updatedProgress.topicsMastered;
            break;

          // Perfect levels
          case 'perfectionist':
          case 'flawless':
          case 'untouchable':
            currentProgress = updatedProgress.perfectLevels;
            break;

          // Speed
          case 'quick_thinker':
          case 'lightning_fast':
          case 'speed_demon':
          case 'flash':
            currentProgress = updatedProgress.speedDemon;
            break;

          // Special
          case 'explorer':
            currentProgress = updatedProgress.subjectsExplored.length;
            break;
          case 'consistent':
          case 'dedicated':
            currentProgress = updatedProgress.dailyStreak;
            break;
          case 'comeback_kid':
            // This is tracked separately via onRetrySuccess
            break;
        }

        updated[index] = { ...achievement, progress: currentProgress };

        if (currentProgress >= achievement.requirement && !achievement.unlocked) {
          updated[index] = {
            ...updated[index],
            unlocked: true,
            unlockedAt: Date.now(),
          };
          justUnlocked = updated[index];
        }
      });

      if (justUnlocked) {
        setNewlyUnlocked(justUnlocked);
      }

      return updated;
    });
  }, []);

  const recordAnswer = useCallback((correct: boolean, timeSpentSeconds: number, currentStreak: number) => {
    setProgress(prev => {
      const updated: AchievementProgress = {
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        totalCorrectAnswers: correct ? prev.totalCorrectAnswers + 1 : prev.totalCorrectAnswers,
        maxStreak: Math.max(prev.maxStreak, currentStreak),
        speedDemon: correct && timeSpentSeconds < 10 ? prev.speedDemon + 1 : prev.speedDemon,
        lastPracticeDate: new Date().toDateString(),
      };
      
      checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  const recordMastery = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, topicsMastered: prev.topicsMastered + 1 };
      checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  const recordPerfectLevel = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, perfectLevels: prev.perfectLevels + 1 };
      checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  const recordSubjectExplored = useCallback((subject: string) => {
    setProgress(prev => {
      if (prev.subjectsExplored.includes(subject)) return prev;
      const updated = { 
        ...prev, 
        subjectsExplored: [...prev.subjectsExplored, subject] 
      };
      checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  const recordRetrySuccess = useCallback(() => {
    setAchievements(prev => {
      const updated = [...prev];
      const comebackIndex = updated.findIndex(a => a.id === 'comeback_kid');
      if (comebackIndex >= 0 && !updated[comebackIndex].unlocked) {
        updated[comebackIndex] = {
          ...updated[comebackIndex],
          unlocked: true,
          unlockedAt: Date.now(),
          progress: 1,
        };
        setNewlyUnlocked(updated[comebackIndex]);
      }
      return updated;
    });
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const getTotalCount = useCallback(() => {
    return achievements.length;
  }, [achievements]);

  return {
    achievements,
    progress,
    newlyUnlocked,
    recordAnswer,
    recordMastery,
    recordPerfectLevel,
    recordSubjectExplored,
    recordRetrySuccess,
    clearNewlyUnlocked,
    getUnlockedCount,
    getTotalCount,
  };
};
