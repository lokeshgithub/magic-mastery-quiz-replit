import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Sparkles } from 'lucide-react';

interface DailyGoalTrackerProps {
  questionsAnswered: number;
  dailyGoal?: number;
}

const getTodayKey = () => {
  const today = new Date();
  return `daily-goal-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
};

export const DailyGoalTracker = ({ questionsAnswered, dailyGoal = 20 }: DailyGoalTrackerProps) => {
  const [storedCount, setStoredCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  // Load today's count from localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const stored = localStorage.getItem(todayKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      setStoredCount(parsed.count || 0);
      setHasShownCelebration(parsed.celebrated || false);
    }
  }, []);

  // Update count when questions are answered
  useEffect(() => {
    const todayKey = getTodayKey();
    const newCount = questionsAnswered;
    
    if (newCount > storedCount) {
      setStoredCount(newCount);
      localStorage.setItem(todayKey, JSON.stringify({ 
        count: newCount, 
        celebrated: hasShownCelebration || newCount >= dailyGoal 
      }));

      // Show celebration when goal is reached for the first time
      if (newCount >= dailyGoal && !hasShownCelebration) {
        setShowCelebration(true);
        setHasShownCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [questionsAnswered, storedCount, dailyGoal, hasShownCelebration]);

  const progress = Math.min((storedCount / dailyGoal) * 100, 100);
  const isComplete = storedCount >= dailyGoal;
  
  // SVG circle calculations
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        ${isComplete 
          ? 'bg-success/10 border border-success/20' 
          : 'bg-card border border-border shadow-sm'
        }
      `}>
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={isComplete ? 'text-success' : 'text-primary'}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <CheckCircle2 className="w-5 h-5 text-success" />
              </motion.div>
            ) : (
              <Target className="w-5 h-5 text-primary" />
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Daily Goal
            </span>
            {isComplete && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-success font-medium"
              >
                ✓ Complete!
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isComplete ? (
              <span>🎉 You answered {storedCount} questions!</span>
            ) : (
              <span>
                <span className="font-semibold text-foreground">{storedCount}</span>
                <span className="text-muted-foreground"> / {dailyGoal} questions</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  rotate: 0 
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                  y: [0, -20 - i * 8],
                  rotate: [0, (i % 2 === 0 ? 1 : -1) * 180]
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-warning" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
