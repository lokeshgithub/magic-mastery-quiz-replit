import { useState } from 'react';
import { motion } from 'framer-motion';
import { TopicProgress } from '@/types/quiz';
import { BookOpen, CheckCircle, Star, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MixTopicsModal } from './MixTopicsModal';

interface TopicGridProps {
  topics: { [name: string]: any[] };
  currentTopic: string | null;
  getProgress: (topic: string) => TopicProgress;
  onSelectTopic: (topic: string) => void;
  onStartMixedQuiz?: (topics: string[]) => void;
  isMixedMode?: boolean;
  getTopicLevels?: (topic: string) => number[];
  isAdmin?: boolean;
}

const formatName = (name: string) => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const TopicGrid = ({ 
  topics, 
  currentTopic, 
  getProgress, 
  onSelectTopic,
  onStartMixedQuiz,
  isMixedMode,
  getTopicLevels,
  isAdmin = false
}: TopicGridProps) => {
  const [showMixModal, setShowMixModal] = useState(false);
  const topicEntries = Object.entries(topics);

  if (topicEntries.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center shadow-card mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          📚
        </motion.div>
        <p className="text-muted-foreground">
          No topics available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {topicEntries.map(([name, questions], index) => {
        const progress = getProgress(name);
        const topicLevels = getTopicLevels ? getTopicLevels(name) : [1, 2, 3, 4, 5];
        const masteredCount = topicLevels.filter(l => progress[l]?.mastered).length;
        const totalLevels = topicLevels.length;
        const isSelected = currentTopic === name;
        const isComplete = masteredCount === totalLevels;

        return (
          <motion.button
            key={name}
            onClick={() => onSelectTopic(name)}
            className={`
              relative p-5 rounded-xl text-left transition-all
              ${isSelected 
                ? 'bg-gradient-magical text-white shadow-magical' 
                : 'bg-card shadow-card hover:shadow-card-hover'
              }
              ${isComplete ? 'ring-2 ring-accent' : ''}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {isComplete && (
              <motion.div 
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-8 h-8 text-accent fill-accent" />
              </motion.div>
            )}
            
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-primary/10'}`}>
                <BookOpen className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                  {formatName(name)}
                </h3>
                {/* Only show question count to admins */}
                {isAdmin && (
                  <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {questions.length} questions
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {topicLevels.map(level => {
                const isMastered = progress[level]?.mastered;
                return (
                  <div
                    key={level}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isMastered 
                        ? 'bg-success text-white' 
                        : isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {isMastered ? <CheckCircle className="w-4 h-4" /> : level}
                  </div>
                );
              })}
            </div>

            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={isSelected ? 'bg-white/60 h-full' : 'bg-success h-full'}
                initial={{ width: 0 }}
                animate={{ width: `${(masteredCount / totalLevels) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            </div>
          </motion.button>
        );
      })}

      {/* Mix Topics Button */}
      {topicEntries.length > 1 && onStartMixedQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: topicEntries.length * 0.05 }}
        >
          <Button
            onClick={() => setShowMixModal(true)}
            variant={isMixedMode ? "default" : "outline"}
            className={`
              w-full h-full min-h-[140px] rounded-xl flex flex-col items-center justify-center gap-3
              ${isMixedMode 
                ? 'bg-gradient-magical text-white shadow-magical' 
                : 'border-2 border-dashed hover:border-primary hover:bg-primary/5'
              }
            `}
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Shuffle className="w-8 h-8" />
            </motion.div>
            <span className="font-semibold">Mix Topics</span>
            <span className="text-xs opacity-70">Practice from multiple topics</span>
          </Button>
        </motion.div>
      )}

      <MixTopicsModal
        isOpen={showMixModal}
        topics={topicEntries.map(([name]) => name)}
        onClose={() => setShowMixModal(false)}
        onStartMix={onStartMixedQuiz || (() => {})}
      />
    </div>
  );
};
