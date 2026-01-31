import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Calendar, Check, Flame, Trophy, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyLoginRewardsProps {
  onClaimReward?: (stars: number, day: number) => void;
}

interface LoginRewardsData {
  lastLoginDate: string;
  currentLoginStreak: number;
  longestLoginStreak: number;
  totalLoginsThisWeek: number;
  weekStartDate: string;
  claimedToday: boolean;
  weeklyRewards: boolean[]; // 7 days tracking
}

// Daily rewards for each day of the week
const DAILY_REWARDS = [
  { day: 1, stars: 25, icon: '🌟', label: 'Day 1' },
  { day: 2, stars: 35, icon: '⭐', label: 'Day 2' },
  { day: 3, stars: 50, icon: '✨', label: 'Day 3' },
  { day: 4, stars: 65, icon: '💫', label: 'Day 4' },
  { day: 5, stars: 85, icon: '🌠', label: 'Day 5' },
  { day: 6, stars: 100, icon: '🎯', label: 'Day 6' },
  { day: 7, stars: 200, icon: '🏆', label: 'Bonus!' },
];

// Streak milestones with bonus rewards
const STREAK_MILESTONES: Record<number, { bonus: number; title: string; icon: string }> = {
  7: { bonus: 150, title: 'Week Warrior', icon: '🔥' },
  14: { bonus: 350, title: 'Fortnight Hero', icon: '⚡' },
  30: { bonus: 750, title: 'Monthly Master', icon: '👑' },
  60: { bonus: 1500, title: 'Super Scholar', icon: '🎓' },
  100: { bonus: 3000, title: 'Legend', icon: '🏅' },
};

const getDateKey = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getWeekStartDate = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  d.setDate(diff);
  return getDateKey(d);
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday) === dateStr;
};

const isToday = (dateStr: string): boolean => {
  return getDateKey() === dateStr;
};

const DEFAULT_DATA: LoginRewardsData = {
  lastLoginDate: '',
  currentLoginStreak: 0,
  longestLoginStreak: 0,
  totalLoginsThisWeek: 0,
  weekStartDate: '',
  claimedToday: false,
  weeklyRewards: [false, false, false, false, false, false, false],
};

export const DailyLoginRewards = ({ onClaimReward }: DailyLoginRewardsProps) => {
  const [data, setData] = useState<LoginRewardsData>(DEFAULT_DATA);
  const [showModal, setShowModal] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [claimAnimation, setClaimAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState<{ bonus: number; title: string; icon: string } | null>(null);

  // Load data and check login status
  useEffect(() => {
    const stored = localStorage.getItem('daily-login-rewards');
    const today = getDateKey();
    const currentWeekStart = getWeekStartDate();
    
    if (stored) {
      const parsed: LoginRewardsData = JSON.parse(stored);
      
      // Check if we need to reset weekly data
      if (parsed.weekStartDate !== currentWeekStart) {
        // New week - reset weekly rewards
        parsed.weeklyRewards = [false, false, false, false, false, false, false];
        parsed.totalLoginsThisWeek = 0;
        parsed.weekStartDate = currentWeekStart;
      }
      
      // Check if streak should continue or reset
      if (parsed.lastLoginDate && !isToday(parsed.lastLoginDate) && !isYesterday(parsed.lastLoginDate)) {
        // Streak broken
        parsed.currentLoginStreak = 0;
      }
      
      // Check if already claimed today
      if (isToday(parsed.lastLoginDate) && parsed.claimedToday) {
        setData(parsed);
      } else {
        // Show claim modal for new day
        setData(parsed);
        if (!isToday(parsed.lastLoginDate)) {
          setShowClaim(true);
        }
      }
    } else {
      // First time user
      const newData = {
        ...DEFAULT_DATA,
        weekStartDate: currentWeekStart,
      };
      setData(newData);
      setShowClaim(true);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (data.lastLoginDate) {
      localStorage.setItem('daily-login-rewards', JSON.stringify(data));
    }
  }, [data]);

  const claimDailyReward = useCallback(() => {
    const today = getDateKey();
    const currentWeekStart = getWeekStartDate();
    
    // Calculate new streak
    let newStreak = 1;
    if (isYesterday(data.lastLoginDate)) {
      newStreak = data.currentLoginStreak + 1;
    }
    
    // Calculate which day of the week this is (0-6)
    const dayIndex = data.weeklyRewards.filter(Boolean).length;
    const reward = DAILY_REWARDS[Math.min(dayIndex, 6)];
    
    // Update weekly rewards
    const newWeeklyRewards = [...data.weeklyRewards];
    if (dayIndex < 7) {
      newWeeklyRewards[dayIndex] = true;
    }
    
    // Check for streak milestone
    const milestone = STREAK_MILESTONES[newStreak];
    if (milestone) {
      setMilestoneReached(milestone);
    }
    
    const totalReward = reward.stars + (milestone?.bonus || 0);
    setRewardAmount(totalReward);
    
    // Update data
    const newData: LoginRewardsData = {
      lastLoginDate: today,
      currentLoginStreak: newStreak,
      longestLoginStreak: Math.max(newStreak, data.longestLoginStreak),
      totalLoginsThisWeek: data.totalLoginsThisWeek + 1,
      weekStartDate: currentWeekStart,
      claimedToday: true,
      weeklyRewards: newWeeklyRewards,
    };
    
    setData(newData);
    setClaimAnimation(true);
    onClaimReward?.(totalReward, dayIndex + 1);
    
    // Hide claim animation after delay
    setTimeout(() => {
      setClaimAnimation(false);
      setShowClaim(false);
      setMilestoneReached(null);
    }, 3000);
  }, [data, onClaimReward]);

  // Get next streak milestone
  const nextMilestone = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b)
    .find(days => days > data.currentLoginStreak);

  const daysToNextMilestone = nextMilestone ? nextMilestone - data.currentLoginStreak : 0;
  const currentDayIndex = data.weeklyRewards.filter(Boolean).length;
  const todayReward = DAILY_REWARDS[Math.min(currentDayIndex, 6)];

  return (
    <>
      {/* Floating reward indicator */}
      <motion.div
        className="fixed bottom-32 left-4 z-40"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setShowModal(true)}
          variant="outline"
          className={`
            relative flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg
            ${showClaim && !data.claimedToday
              ? 'bg-gradient-to-r from-warning to-warning/80 text-warning-foreground border-warning/50 animate-pulse hover:from-warning/90 hover:to-warning/70'
              : 'bg-card border-border hover:border-primary/50'
            }
          `}
        >
          <Gift className={`w-5 h-5 ${showClaim && !data.claimedToday ? 'animate-bounce' : ''}`} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {data.claimedToday ? 'Login Rewards' : 'Claim Reward!'}
            </span>
            <span className="text-xs opacity-75">
              {data.currentLoginStreak > 0 ? `${data.currentLoginStreak} day streak` : 'Start streak'}
            </span>
          </div>
          
          {/* Unclaimed indicator */}
          {showClaim && !data.claimedToday && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>

      {/* Main Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-warning to-warning/80 p-6 rounded-t-2xl relative overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-3 text-white">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift className="w-10 h-10" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">Daily Rewards</h2>
                    <p className="text-white/80 text-sm">Login every day to earn bonus stars!</p>
                  </div>
                </div>
                
                {/* Streak display */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <Flame className="w-5 h-5" />
                    <span className="font-bold">{data.currentLoginStreak}</span>
                    <span className="text-sm opacity-80">Day Streak</span>
                  </div>
                  {data.longestLoginStreak > 0 && (
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm">Best: {data.longestLoginStreak}</span>
                    </div>
                  )}
                </div>
                
                {/* Decorative sparkles */}
                <Sparkles className="absolute top-4 right-16 w-6 h-6 text-white/30" />
              </div>
              
              {/* Weekly calendar */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  This Week's Rewards
                </h3>
                
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {DAILY_REWARDS.map((reward, index) => {
                    const isClaimed = data.weeklyRewards[index];
                    const isTodays = index === currentDayIndex && !data.claimedToday;
                    const isFuture = index > currentDayIndex || (index === currentDayIndex && data.claimedToday);
                    
                    return (
                      <motion.div
                        key={index}
                        className={`
                          relative flex flex-col items-center p-2 rounded-xl text-center
                          ${isClaimed 
                            ? 'bg-success/10 border-2 border-success' 
                            : isTodays 
                              ? 'bg-primary/10 border-2 border-primary animate-pulse' 
                              : 'bg-muted/50 border-2 border-transparent'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-lg mb-1">{reward.icon}</span>
                        <span className="text-xs font-medium text-foreground">{reward.label}</span>
                        <span className="text-[10px] text-muted-foreground">+{reward.stars}⭐</span>
                        
                        {/* Check mark for claimed */}
                        {isClaimed && (
                          <motion.div
                            className="absolute -top-1 -right-1 bg-success rounded-full p-0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="w-3 h-3 text-success-foreground" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Claim button */}
                {!data.claimedToday ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={claimDailyReward}
                      className="w-full bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-warning-foreground py-6 text-lg font-bold"
                      disabled={claimAnimation}
                    >
                      {claimAnimation ? (
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Star className="w-5 h-5" />
                          +{rewardAmount} Stars Claimed!
                        </motion.div>
                      ) : (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          Claim {todayReward.icon} +{todayReward.stars} Stars
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-success mb-1">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Today's Reward Claimed!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Come back tomorrow to continue your streak
                    </p>
                  </div>
                )}
                
                {/* Next milestone info */}
                {nextMilestone && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Milestone:</span>
                      <span className="font-medium">
                        {STREAK_MILESTONES[nextMilestone].icon} {STREAK_MILESTONES[nextMilestone].title}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-warning to-warning/80"
                          initial={{ width: 0 }}
                          animate={{ width: `${((data.currentLoginStreak / nextMilestone) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {daysToNextMilestone} days left
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      +{STREAK_MILESTONES[nextMilestone].bonus} bonus stars at {nextMilestone} days!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim celebration overlay */}
      <AnimatePresence>
        {claimAnimation && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Flying stars */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              >
                ⭐
              </motion.div>
            ))}
            
            {/* Milestone celebration */}
            {milestoneReached && (
              <motion.div
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: -50 }}
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block">{milestoneReached.icon}</span>
                  <h3 className="text-xl font-bold">{milestoneReached.title}!</h3>
                  <p className="text-white/80">+{milestoneReached.bonus} Bonus Stars</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
