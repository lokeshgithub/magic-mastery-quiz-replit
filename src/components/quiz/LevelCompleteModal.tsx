import { motion, AnimatePresence } from 'framer-motion';
import { themeLevels, getRandomCharacter, getRandomMessage } from '@/data/characters';
import { getLevelReward, getLevelProgressMessage } from '@/data/levelRewards';
import { Trophy, RefreshCw, ArrowRight, Star, Sparkles, Award, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelCompleteModalProps {
  isOpen: boolean;
  passed: boolean;
  level: number;
  stats: { correct: number; total: number };
  maxLevel: number;
  onAdvance: () => void;
  onRetry: () => void;
}

export const LevelCompleteModal = ({
  isOpen,
  passed,
  level,
  stats,
  maxLevel,
  onAdvance,
  onRetry,
}: LevelCompleteModalProps) => {
  const [character, setCharacter] = useState(getRandomCharacter(level));
  const [message, setMessage] = useState('');
  const [showReward, setShowReward] = useState(false);
  
  const accuracy = Math.round((stats.correct / stats.total) * 100);
  const currentTheme = themeLevels.find(t => t.level === level);
  const isTopicComplete = passed && level === maxLevel;
  const reward = getLevelReward(level);
  const progressMessage = getLevelProgressMessage(level);

  useEffect(() => {
    if (isOpen) {
      const char = getRandomCharacter(level);
      setCharacter(char);
      setMessage(getRandomMessage(char, passed ? 'levelUp' : 'encouragement'));
      setShowReward(false);
      
      // Show reward animation after a delay when passed
      if (passed && reward) {
        setTimeout(() => setShowReward(true), 500);
      }
    }
  }, [isOpen, passed, level, reward]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${passed ? (reward?.badge.color || 'from-success to-emerald-400') : 'from-primary to-secondary'} p-6 text-center relative`}>
              {passed && (
                <motion.div
                  className="absolute top-4 left-4"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </motion.div>
              )}
              {passed && (
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </motion.div>
              )}
              
              <motion.div
                className="text-6xl mb-2"
                animate={passed ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : { scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5 }}
              >
                {passed ? (reward?.badge.icon || (isTopicComplete ? '👑' : '🎉')) : '💪'}
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white">
                {passed 
                  ? (isTopicComplete ? 'Topic Mastered!' : `Level ${level} Complete!`)
                  : `Keep Practicing Level ${level}`
                }
              </h2>
              
              {/* Title earned */}
              {passed && reward && (
                <motion.div
                  className="mt-2 inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <span className="text-white font-semibold">🎖️ Title: {reward.title}</span>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Reward Badge - Show prominently when passed */}
              {passed && reward && showReward && (
                <motion.div
                  className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-primary" />
                    <span className="font-bold text-lg">{reward.badge.name} Unlocked!</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{reward.achievementMessage}</p>
                  
                  {/* Progress message */}
                  <motion.div
                    className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="font-semibold text-amber-700 dark:text-amber-300">{reward.percentileMessage}</p>
                  </motion.div>
                  
                  {/* Bonus stars */}
                  <motion.div
                    className="mt-3 flex items-center justify-center gap-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-lg">+{reward.starsBonus} Bonus Stars!</span>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                </motion.div>
              )}

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.correct}/{stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
                    {accuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              {/* Character Message */}
              <motion.div
                className="bg-muted rounded-xl p-4 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.span 
                    className="text-3xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {character.emoji}
                  </motion.span>
                  <span className="font-semibold text-foreground">{character.name}</span>
                </div>
                <p className="text-muted-foreground italic">"{message}"</p>
              </motion.div>

              {/* Next step message */}
              <p className="text-muted-foreground mb-6">
                {passed 
                  ? (isTopicComplete 
                      ? "Congratulations! You've mastered this topic! 🌟" 
                      : `Ready for Level ${level + 1}? ${progressMessage}`)
                  : "You need 90% accuracy to advance. Let's try again!"
                }
              </p>

              {/* Action Button */}
              <motion.button
                onClick={passed ? onAdvance : onRetry}
                className={`
                  w-full p-4 rounded-xl font-semibold flex items-center justify-center gap-2
                  ${passed 
                    ? 'bg-gradient-magical text-white shadow-magical' 
                    : 'bg-primary text-primary-foreground'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {passed ? (
                  <>
                    {isTopicComplete ? 'Choose Another Topic' : 'Continue to Level ' + (level + 1)}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </motion.button>

              {passed && !isTopicComplete && (
                <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {level < 5 
                    ? `Level ${level + 1} brings new challenges!`
                    : level === 5 
                      ? 'You\'re reaching CLASS TOPPER level! 🔥'
                      : 'You\'re becoming a LEGEND! 👑'
                  }
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
