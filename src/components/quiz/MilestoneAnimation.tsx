import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MilestoneAnimationProps {
  milestone: { emoji: string; message: string; animation: string } | null;
  onComplete: () => void;
}

export const MilestoneAnimation = ({ milestone, onComplete }: MilestoneAnimationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (milestone) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [milestone, onComplete]);

  if (!milestone) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Radial burst background */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-primary/30 via-transparent to-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
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
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.05,
                ease: 'easeOut'
              }}
            >
              {['⭐', '✨', '🌟', '💫', '🎉', '🎊', '🔥', milestone.emoji][i % 8]}
            </motion.div>
          ))}

          {/* Main content */}
          <motion.div
            className="relative bg-card/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-primary/50 text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-primary/20"
              animate={{ 
                boxShadow: [
                  '0 0 20px hsl(var(--primary) / 0.3)',
                  '0 0 60px hsl(var(--primary) / 0.6)',
                  '0 0 20px hsl(var(--primary) / 0.3)'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Emoji with special animation */}
            <motion.div
              className="text-7xl mb-4 relative z-10"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              {milestone.emoji}
            </motion.div>

            {/* Message */}
            <motion.p
              className="text-xl font-bold text-foreground relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {milestone.message}
            </motion.p>

            {/* Sparkle underline */}
            <motion.div
              className="mt-3 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full relative z-10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
