import { useState } from 'react';
import { motion } from 'framer-motion';
import { themeLevels } from '@/data/characters';
import { TopicProgress } from '@/types/quiz';
import { CheckCircle, Lock, Circle, Sparkles, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface MasteryPanelProps {
  topicName: string;
  currentLevel: number;
  progress: TopicProgress;
  levelStats: { correct: number; total: number };
  perLevel: number;
  topicLevels?: number[];
  onResetProgress?: () => void;
}

const formatName = (name: string) => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Extended theme levels for levels 6 and 7
const getThemeForLevel = (level: number) => {
  // Use predefined themes for levels 1-5
  const existing = themeLevels.find(t => t.level === level);
  if (existing) return existing;

  // Extended themes for levels 6 and 7
  const extendedThemes = [
    {
      level: 6,
      theme: 'Order of the Phoenix',
      bgClass: 'from-red-500 to-orange-500',
      accentColor: 'hsl(var(--level-1))',
    },
    {
      level: 7,
      theme: 'Deathly Hallows Master',
      bgClass: 'from-slate-600 to-slate-800',
      accentColor: 'hsl(var(--level-2))',
    },
  ];

  return extendedThemes.find(t => t.level === level) || themeLevels[0];
};

export const MasteryPanel = ({ 
  topicName, 
  currentLevel, 
  progress, 
  levelStats, 
  perLevel,
  topicLevels = [1, 2, 3, 4, 5],
  onResetProgress
}: MasteryPanelProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const currentTheme = getThemeForLevel(currentLevel);
  const progressPercent = levelStats.total > 0 
    ? Math.round((levelStats.correct / perLevel) * 100)
    : 0;
  const accuracy = levelStats.total > 0 
    ? Math.round((levelStats.correct / levelStats.total) * 100)
    : 0;

  const handleReset = () => {
    onResetProgress?.();
    setShowResetDialog(false);
  };

  return (
    <motion.div
      className="bg-card rounded-xl shadow-card p-5 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground text-lg">{formatName(topicName)}</h3>
          <p className="text-sm text-muted-foreground">
            {currentTheme?.theme || `Level ${currentLevel}`}
          </p>
        </div>
        
        {/* Reset Progress Button */}
        {onResetProgress && (
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your progress for <strong>{formatName(topicName)}</strong> back to Level 1. 
                  You'll need to master each level again. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reset Progress
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Level badges - dynamic based on topic */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {topicLevels.map(level => {
          const levelData = progress[level];
          const isMastered = levelData?.mastered;
          const isCurrent = level === currentLevel;
          const isLocked = level > currentLevel && !progress[level - 1]?.mastered;
          const theme = getThemeForLevel(level);

          return (
            <motion.div
              key={level}
              className={`
                relative px-4 py-3 rounded-xl text-center min-w-[70px] flex-shrink-0
                ${isMastered 
                  ? `bg-gradient-to-br ${theme?.bgClass} text-white` 
                  : isLocked 
                    ? 'bg-muted text-muted-foreground' 
                    : isCurrent 
                      ? `bg-gradient-to-br ${theme?.bgClass} text-white ring-4 ring-accent ring-offset-2` 
                      : 'bg-muted text-muted-foreground'
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: level * 0.1 }}
              whileHover={!isLocked ? { scale: 1.05 } : undefined}
            >
              {isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-accent" />
                </motion.div>
              )}
              <div className="text-xl font-bold">{level}</div>
              <div className="text-xs opacity-90">
                {isMastered ? (
                  <CheckCircle className="w-4 h-4 mx-auto" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 mx-auto" />
                ) : isCurrent ? (
                  <Circle className="w-4 h-4 mx-auto fill-current" />
                ) : (
                  <Circle className="w-4 h-4 mx-auto" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current level progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Level {currentLevel} Progress</span>
          <span className="font-semibold text-foreground">
            {levelStats.correct}/{perLevel} needed
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${currentTheme?.bgClass || 'from-primary to-secondary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{levelStats.correct} correct of {levelStats.total} answered</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
      </div>
    </motion.div>
  );
};
