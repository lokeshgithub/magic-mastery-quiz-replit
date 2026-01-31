import { motion } from 'framer-motion';
import { SessionStats } from '@/types/quiz';
import { Zap, Target, Flame, Trophy, Star, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  stats: SessionStats;
}

// Get milestone info based on current stats
const getNextMilestone = (stats: SessionStats) => {
  const streakMilestones = [5, 7, 10, 15, 20];
  const totalMilestones = [10, 25, 50, 75, 100, 150, 200];
  
  const nextStreak = streakMilestones.find(m => m > stats.streak);
  const nextTotal = totalMilestones.find(m => m > stats.totalCorrect);
  
  if (nextStreak && stats.streak >= 3) {
    return { type: 'streak', target: nextStreak, current: stats.streak };
  }
  if (nextTotal) {
    return { type: 'total', target: nextTotal, current: stats.totalCorrect };
  }
  return null;
};

export const StatsBar = ({ stats }: StatsBarProps) => {
  const accuracy = stats.solved > 0 
    ? Math.round((stats.correct / stats.solved) * 100) 
    : 0;

  const nextMilestone = getNextMilestone(stats);
  const milestoneProgress = nextMilestone 
    ? Math.round((nextMilestone.current / nextMilestone.target) * 100)
    : 0;

  const statItems = [
    { 
      icon: Zap, 
      value: stats.solved, 
      label: 'Solved', 
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    { 
      icon: Target, 
      value: `${accuracy}%`, 
      label: 'Accuracy', 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      icon: Flame, 
      value: stats.streak, 
      label: 'Streak', 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    { 
      icon: Trophy, 
      value: stats.mastered, 
      label: 'Mastered', 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
  ];

  return (
    <div className="mb-6">
      {/* Stars Bar */}
      <motion.div 
        className="bg-card rounded-xl p-4 mb-4 shadow-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-gold rounded-lg">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-foreground">⭐ Stars Earned</span>
              <span className="text-sm font-bold text-gradient-gold">{stats.stars} ⭐</span>
            </div>
            {nextMilestone && (
              <div className="space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextMilestone.type === 'streak' 
                    ? `🔥 ${nextMilestone.current}/${nextMilestone.target} streak for bonus!`
                    : `🎯 ${nextMilestone.current}/${nextMilestone.target} total correct!`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Streak bonus indicator */}
        {stats.streak >= 2 && (
          <motion.div 
            className="flex items-center justify-center gap-2 mt-2 p-2 bg-destructive/10 rounded-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <TrendingUp className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {stats.streak >= 5 ? '🔥 +30 stars per correct!' :
               stats.streak >= 3 ? '🔥 +20 stars per correct!' :
               '🔥 +15 stars per correct!'}
            </span>
          </motion.div>
        )}

        {/* Best streak */}
        {stats.maxStreak >= 5 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            🏆 Best Streak: {stats.maxStreak} in a row!
          </p>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="bg-card rounded-xl p-4 shadow-card text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`inline-flex p-2 rounded-lg ${item.bgColor} mb-2`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
