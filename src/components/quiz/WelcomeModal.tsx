import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Trophy, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WELCOME_SEEN_KEY = 'magic-mastery-welcome-seen';

const pathways = [
  {
    id: 'practice',
    path: '/',
    icon: BookOpen,
    emoji: '📚',
    title: 'Practice Mode',
    subtitle: 'Master the Basics',
    description: 'Pick topics and work through 4-7 levels per topic. Each level requires 90% accuracy to advance. Perfect for structured learning.',
    colorClass: 'bg-success',
    features: ['Topic-by-topic progression', 'Level-based mastery', 'Detailed explanations'],
  },
  {
    id: 'adaptive',
    path: '/adaptive',
    icon: Brain,
    emoji: '📋',
    title: 'Skill Assessment',
    subtitle: 'Score Out of 100',
    description: 'Take a 20-question assessment where AI adjusts difficulty in real-time. Get your score out of 100 and see your percentile ranking.',
    colorClass: 'bg-primary',
    features: ['Score out of 100', 'Percentile ranking', 'AI-powered difficulty'],
  },
  {
    id: 'olympiad',
    path: '/olympiad',
    icon: Trophy,
    emoji: '🏆',
    title: 'Olympiad Test',
    subtitle: 'Competition Ready',
    description: 'Timed exams with mixed-difficulty questions, just like real Olympiads. Choose Foundation, Regional, or National level.',
    colorClass: 'bg-accent',
    features: ['Timed exams', 'Competition format', 'Strict mode option'],
  },
];

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeen) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="bg-gradient-magical p-6 text-primary-foreground text-center">
              <motion.div
                className="flex justify-center mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Magic Mastery Quiz! ✨</h2>
              <p className="text-primary-foreground/80 text-sm">
                Choose your learning path and start your journey to mastery
              </p>
            </div>

            {/* Pathways */}
            <div className="p-6 space-y-4">
              <p className="text-center text-muted-foreground text-sm mb-4">
                Select a pathway to learn more, or just get started!
              </p>

              <div className="grid gap-3">
                {pathways.map((pathway, index) => {
                  const Icon = pathway.icon;
                  const isSelected = selectedPathway === pathway.id;

                  return (
                    <motion.div
                      key={pathway.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setSelectedPathway(isSelected ? null : pathway.id)}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${
                          isSelected
                            ? `${pathway.colorClass} text-primary-foreground shadow-lg`
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                              isSelected ? 'bg-primary-foreground/20' : `${pathway.colorClass} text-primary-foreground`
                            }`}
                          >
                            {pathway.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                                {pathway.title}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                              }`}>
                                {pathway.subtitle}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                              {pathway.description}
                            </p>
                            
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-3 pt-3 border-t border-primary-foreground/20"
                                >
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {pathway.features.map((feature, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 bg-primary-foreground/20 rounded-full"
                                      >
                                        ✓ {feature}
                                      </span>
                                    ))}
                                  </div>
                                  <Link
                                    to={pathway.path}
                                    onClick={handleGetStarted}
                                    className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                                  >
                                    Start {pathway.title}
                                    <ArrowRight className="w-4 h-4" />
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-8 bg-gradient-magical hover:opacity-90 text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to reset welcome state (for testing)
export const useResetWelcome = () => {
  return () => localStorage.removeItem(WELCOME_SEEN_KEY);
};
