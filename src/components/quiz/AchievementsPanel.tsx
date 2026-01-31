import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, TIER_COLORS, TIER_BG_COLORS } from '@/types/achievements';
import { Trophy, X, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

const CategoryIcon = {
  questions: '📚',
  streak: '🔥',
  mastery: '⭐',
  speed: '⚡',
  special: '🎁',
};

export const AchievementsPanel = ({ achievements, unlockedCount, totalCount }: AchievementsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'questions', 'streak', 'mastery', 'speed', 'special'];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  // Sort: unlocked first, then by tier
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    const tierOrder = { diamond: 0, gold: 1, silver: 2, bronze: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Trophy className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-white text-amber-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unlockedCount}
          </span>
        </div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <Trophy className="w-10 h-10" />
                  <div>
                    <h2 className="text-2xl font-bold">Achievements</h2>
                    <p className="text-white/80">{unlockedCount} of {totalCount} unlocked</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={(unlockedCount / totalCount) * 100} className="h-3 bg-white/30" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat === 'all' ? '🏆 All' : `${CategoryIcon[cat as keyof typeof CategoryIcon]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                  </Button>
                ))}
              </div>

              {/* Achievements Grid */}
              <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`relative rounded-xl p-4 border ${
                      achievement.unlocked 
                        ? `${TIER_BG_COLORS[achievement.tier]} border-transparent` 
                        : 'bg-muted/50 border-border opacity-70'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Emoji/Lock */}
                      <div className={`text-4xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                        {achievement.unlocked ? achievement.emoji : <Lock className="w-8 h-8 text-muted-foreground" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold truncate ${
                            achievement.unlocked 
                              ? `bg-gradient-to-r ${TIER_COLORS[achievement.tier]} bg-clip-text text-transparent`
                              : 'text-muted-foreground'
                          }`}>
                            {achievement.name}
                          </h4>
                          {achievement.unlocked && (
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {achievement.description}
                        </p>

                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.requirement}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.requirement) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        )}

                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Tier badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${TIER_COLORS[achievement.tier]} text-white capitalize flex-shrink-0`}>
                        {achievement.tier}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
