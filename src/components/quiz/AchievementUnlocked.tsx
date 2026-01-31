import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Achievement, TIER_COLORS } from '@/types/achievements';

interface AchievementUnlockedProps {
  achievement: Achievement | null;
  onComplete: () => void;
}

export const AchievementUnlocked = ({ achievement, onComplete }: AchievementUnlockedProps) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Dark overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Confetti particles */}
        {[...Array(30)].map((_, i) => (
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
              x: (Math.random() - 0.5) * 600,
              y: (Math.random() - 0.5) * 600,
              scale: [0, 1.5, 0.5],
              opacity: [1, 1, 0],
              rotate: Math.random() * 1080
            }}
            transition={{ 
              duration: 2.5,
              delay: i * 0.03,
              ease: 'easeOut'
            }}
          >
            {['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🏆', achievement.emoji][i % 8]}
          </motion.div>
        ))}

        {/* Achievement card */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        >
          {/* Glow ring */}
          <motion.div
            className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${TIER_COLORS[achievement.tier]} blur-xl`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Card */}
          <div className="relative bg-card rounded-3xl p-8 shadow-2xl border-2 border-white/20 text-center min-w-[300px]">
            {/* Banner */}
            <motion.div
              className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r ${TIER_COLORS[achievement.tier]} text-white font-bold text-sm shadow-lg`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              🏆 ACHIEVEMENT UNLOCKED!
            </motion.div>

            {/* Emoji */}
            <motion.div
              className="text-8xl mb-4 mt-4"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.6, repeat: 3 }}
            >
              {achievement.emoji}
            </motion.div>

            {/* Name */}
            <motion.h3
              className={`text-2xl font-bold bg-gradient-to-r ${TIER_COLORS[achievement.tier]} bg-clip-text text-transparent mb-2`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.name}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {achievement.description}
            </motion.p>

            {/* Tier badge */}
            <motion.div
              className={`inline-block mt-4 px-4 py-1 rounded-full bg-gradient-to-r ${TIER_COLORS[achievement.tier]} text-white text-sm font-medium capitalize`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {achievement.tier} Badge
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
