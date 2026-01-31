import { motion } from 'framer-motion';
import { BookOpen, Trophy, Clock, Target, Wand } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <motion.div
      className="bg-card rounded-2xl shadow-card p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✨
      </motion.div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Welcome to Magic Mastery Quiz!
      </h2>
      
      <p className="text-muted-foreground mb-6">
        Ready to become a quiz master? Here's how it works:
      </p>

      <div className="space-y-3 text-left max-w-md mx-auto">
        {[
          { step: '1', text: '📚 Choose a subject from the tabs above', color: 'from-blue-400 to-cyan-400', icon: BookOpen },
          { step: '2', text: '🎯 Select a topic to start practicing', color: 'from-purple-400 to-pink-400', icon: Target },
          { step: '3', text: '✅ Answer questions and get 90% to level up!', color: 'from-orange-400 to-red-400', icon: Trophy },
          { step: '4', text: '⭐ Master all levels to complete a topic!', color: 'from-yellow-400 to-orange-400', icon: Wand },
        ].map((item, index) => (
          <motion.div
            key={item.step}
            className="flex items-center gap-4 p-3 bg-muted rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold`}>
              {item.step}
            </div>
            <span className="text-foreground flex-1">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 p-4 bg-primary/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-2 text-primary font-semibold">
          <Clock className="w-5 h-5" />
          <span>Your time is tracked to help you improve!</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          End your session anytime to see a detailed performance analysis
        </p>
      </motion.div>

      <motion.p
        className="text-sm text-muted-foreground mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Magical companions will guide you along the way! 🧙‍♂️
      </motion.p>
    </motion.div>
  );
};
