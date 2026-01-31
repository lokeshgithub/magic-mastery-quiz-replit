import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Zap } from 'lucide-react';

interface DailyStreakTrackerProps {
  hasAnsweredToday: boolean;
  onBonusAwarded?: (stars: number, streakDays: number) => void;
}

interface StreakData {
  currentStreak: number;
  lastPracticeDate: string;
  longestStreak: number;
  bonusClaimedForStreak: number;
}

const STREAK_BONUSES: Record<number, number> = {
  3: 50,
  7: 150,
  14: 300,
  21: 500,
  30: 1000,
};

const getDateKey = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday) === dateStr;
};

const isToday = (dateStr: string): boolean => {
  return getDateKey() === dateStr;
};

export const DailyStreakTracker = ({ hasAnsweredToday, onBonusAwarded }: DailyStreakTrackerProps) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPracticeDate: '',
    longestStreak: 0,
    bonusClaimedForStreak: 0,
  });
  const [showBonus, setShowBonus] = useState<{ stars: number; days: number } | null>(null);
  const [isFlameActive, setIsFlameActive] = useState(false);

  // Load streak data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('daily-streak');
    if (stored) {
      const data: StreakData = JSON.parse(stored);
      
      // Check if streak should reset (missed a day)
      if (data.lastPracticeDate && !isToday(data.lastPracticeDate) && !isYesterday(data.lastPracticeDate)) {
        // Streak broken - reset but keep longest streak
        setStreakData({
          currentStreak: 0,
          lastPracticeDate: '',
          longestStreak: data.longestStreak,
          bonusClaimedForStreak: 0,
        });
      } else {
        setStreakData(data);
        setIsFlameActive(isToday(data.lastPracticeDate));
      }
    }
  }, []);

  // Update streak when user answers questions today
  useEffect(() => {
    if (!hasAnsweredToday) return;

    const today = getDateKey();
    
    // Already counted today
    if (streakData.lastPracticeDate === today) return;

    let newStreak = 1;
    
    // Continue streak if practiced yesterday
    if (isYesterday(streakData.lastPracticeDate)) {
      newStreak = streakData.currentStreak + 1;
    } else if (isToday(streakData.lastPracticeDate)) {
      newStreak = streakData.currentStreak;
    }

    const newLongest = Math.max(newStreak, streakData.longestStreak);
    
    // Check for bonus
    const bonusMilestone = Object.keys(STREAK_BONUSES)
      .map(Number)
      .sort((a, b) => b - a)
      .find(days => newStreak >= days && days > streakData.bonusClaimedForStreak);

    const newData: StreakData = {
      currentStreak: newStreak,
      lastPracticeDate: today,
      longestStreak: newLongest,
      bonusClaimedForStreak: bonusMilestone || streakData.bonusClaimedForStreak,
    };

    setStreakData(newData);
    setIsFlameActive(true);
    localStorage.setItem('daily-streak', JSON.stringify(newData));

    // Show bonus animation
    if (bonusMilestone) {
      const bonusStars = STREAK_BONUSES[bonusMilestone];
      setShowBonus({ stars: bonusStars, days: bonusMilestone });
      onBonusAwarded?.(bonusStars, bonusMilestone);
      setTimeout(() => setShowBonus(null), 3000);
    }
  }, [hasAnsweredToday, streakData, onBonusAwarded]);

  // Get next milestone
  const nextMilestone = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => a - b)
    .find(days => days > streakData.currentStreak);

  const daysToNext = nextMilestone ? nextMilestone - streakData.currentStreak : 0;

  // Flame size based on streak
  const getFlameSize = () => {
    if (streakData.currentStreak >= 30) return 'w-8 h-8';
    if (streakData.currentStreak >= 14) return 'w-7 h-7';
    if (streakData.currentStreak >= 7) return 'w-6 h-6';
    return 'w-5 h-5';
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        ${isFlameActive 
          ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20' 
          : 'bg-card border border-border shadow-sm'
        }
      `}>
        {/* Flame icon with animation */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={isFlameActive ? {
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Flame 
              className={`${getFlameSize()} ${
                isFlameActive 
                  ? 'text-orange-500 fill-orange-500/30' 
                  : 'text-muted-foreground'
              }`} 
            />
            {/* Glow effect when active */}
            {isFlameActive && (
              <motion.div
                className="absolute inset-0 blur-md bg-orange-500/40 rounded-full"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          {/* Streak count badge */}
          {streakData.currentStreak > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {streakData.currentStreak}
            </motion.div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {streakData.currentStreak > 0 ? (
                <>🔥 {streakData.currentStreak} Day Streak!</>
              ) : (
                'Start Your Streak!'
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isFlameActive ? (
              nextMilestone ? (
                <span>
                  <Star className="w-3 h-3 inline text-warning mr-1" />
                  {daysToNext} more day{daysToNext > 1 ? 's' : ''} for +{STREAK_BONUSES[nextMilestone]} stars
                </span>
              ) : (
                <span>🏆 Max streak bonus unlocked!</span>
              )
            ) : (
              <span>Practice today to start!</span>
            )}
          </p>
          
          {/* Best streak */}
          {streakData.longestStreak > streakData.currentStreak && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Best: {streakData.longestStreak} days
            </p>
          )}
        </div>
      </div>

      {/* Bonus popup */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="font-bold text-sm">
                +{showBonus.stars} ⭐ {showBonus.days}-Day Bonus!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles when active */}
      {isFlameActive && streakData.currentStreak >= 3 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-2 left-6"
              animate={{
                y: [-10, -30],
                x: [(i - 1) * 8, (i - 1) * 12],
                opacity: [0.8, 0],
                scale: [0.5, 0.2],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              <div className="w-1 h-1 bg-orange-400 rounded-full" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
