import { motion } from 'framer-motion';
import { FunElement } from '@/data/funElements';
import { Sparkles, Lightbulb, HelpCircle, BookOpen, Target, Heart } from 'lucide-react';

interface FunElementCardProps {
  element: FunElement;
}

const typeConfig: Record<FunElement['type'], { icon: React.ReactNode; label: string; bgColor: string }> = {
  joke: { icon: <Sparkles className="w-4 h-4" />, label: '😄 Joke', bgColor: 'from-amber-400/20 to-orange-400/20' },
  fact: { icon: <Lightbulb className="w-4 h-4" />, label: '💡 Fun Fact', bgColor: 'from-blue-400/20 to-cyan-400/20' },
  riddle: { icon: <HelpCircle className="w-4 h-4" />, label: '🧩 Riddle', bgColor: 'from-purple-400/20 to-pink-400/20' },
  trivia: { icon: <BookOpen className="w-4 h-4" />, label: '📚 Trivia', bgColor: 'from-green-400/20 to-emerald-400/20' },
  challenge: { icon: <Target className="w-4 h-4" />, label: '🎯 Challenge', bgColor: 'from-red-400/20 to-rose-400/20' },
  motivation: { icon: <Heart className="w-4 h-4" />, label: '💪 Motivation', bgColor: 'from-pink-400/20 to-fuchsia-400/20' },
};

const animationVariants = {
  bounce: {
    initial: { scale: 0, y: 50 },
    animate: { scale: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
    emoji: { y: [0, -10, 0] },
    emojiTransition: { repeat: 2, duration: 0.4 }
  },
  spin: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    emoji: { rotate: 360 },
    emojiTransition: { duration: 0.6 }
  },
  wiggle: {
    initial: { scale: 0, x: -50 },
    animate: { scale: 1, x: 0 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
    emoji: { rotate: [-5, 5, -5, 5, 0] },
    emojiTransition: { duration: 0.5 }
  },
  pulse: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 15 },
    emoji: { scale: [1, 1.3, 1] },
    emojiTransition: { repeat: 2, duration: 0.3 }
  },
  confetti: {
    initial: { scale: 0, y: 30 },
    animate: { scale: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
    emoji: { rotate: [0, 15, -15, 10, -10, 0] },
    emojiTransition: { duration: 0.6 }
  }
};

export const FunElementCard = ({ element }: FunElementCardProps) => {
  const config = typeConfig[element.type];
  const animation = animationVariants[element.animation || 'bounce'];

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${config.bgColor} border border-border/50`}
    >
      {/* Decorative sparkles */}
      <motion.div
        className="absolute top-2 right-2 text-2xl opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-2 left-2 text-xl opacity-20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⭐
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        <motion.span
          className="text-3xl"
          animate={animation.emoji}
          transition={animation.emojiTransition}
        >
          {element.emoji}
        </motion.span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground bg-background/50 px-2 py-1 rounded-full flex items-center gap-1">
              {config.icon}
              {config.label}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {element.content}
          </p>
        </div>
      </div>

      {/* Animated confetti for motivation type */}
      {element.type === 'motivation' && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              initial={{ 
                x: `${20 + i * 15}%`, 
                y: '-10%',
                opacity: 0 
              }}
              animate={{ 
                y: '110%',
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.2,
                ease: 'easeOut'
              }}
            >
              {['🎉', '✨', '⭐', '💫', '🌟'][i]}
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
};
