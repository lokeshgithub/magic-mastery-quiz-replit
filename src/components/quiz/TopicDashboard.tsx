import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopicProgress } from '@/types/quiz';
import { 
  Sparkles, Flame, Target, TrendingUp, Play, 
  ChevronRight, Zap, Award, BookOpen, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContinueSession, saveLastSession } from './ContinueSession';
import { SignUpPrompt } from './SignUpPrompt';
import { useGuestLimits, GUEST_TOPIC_LIMIT_COUNT } from '@/hooks/useGuestLimits';

interface TopicDashboardProps {
  topics: { [name: string]: any[] };
  currentTopic: string | null;
  getProgress: (topic: string) => TopicProgress;
  onSelectTopic: (topic: string) => void;
  onStartMixedQuiz?: (topics: string[]) => void;
  getTopicLevels?: (topic: string) => number[];
  isAdmin?: boolean;
  currentSubject?: string;
  isLoggedIn?: boolean;
}

const formatName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get mastery level color based on progress percentage
const getMasteryColor = (percentage: number): { bg: string; text: string; glow: string; emoji: string } => {
  if (percentage >= 100) return { 
    bg: 'from-yellow-400 via-amber-400 to-orange-400', 
    text: 'text-amber-600', 
    glow: 'shadow-[0_0_20px_hsl(45,93%,50%,0.4)]',
    emoji: '🏆' 
  };
  if (percentage >= 80) return { 
    bg: 'from-emerald-400 to-green-500', 
    text: 'text-emerald-600', 
    glow: 'shadow-[0_0_15px_hsl(142,72%,45%,0.3)]',
    emoji: '⭐' 
  };
  if (percentage >= 60) return { 
    bg: 'from-blue-400 to-cyan-500', 
    text: 'text-blue-600', 
    glow: '',
    emoji: '📈' 
  };
  if (percentage >= 40) return { 
    bg: 'from-violet-400 to-purple-500', 
    text: 'text-violet-600', 
    glow: '',
    emoji: '🌱' 
  };
  if (percentage > 0) return { 
    bg: 'from-pink-400 to-rose-500', 
    text: 'text-pink-600', 
    glow: '',
    emoji: '🎯' 
  };
  return { 
    bg: 'from-slate-300 to-slate-400', 
    text: 'text-slate-500', 
    glow: '',
    emoji: '🆕' 
  };
};

// Topic icons based on name patterns
const getTopicIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('decimal')) return '🔢';
  if (lower.includes('fraction')) return '🍕';
  if (lower.includes('ratio') && lower.includes('proportion')) return '⚖️';
  if (lower.includes('ratio')) return '🔗';
  if (lower.includes('proportion')) return '📊';
  if (lower.includes('exponent') || lower.includes('power')) return '⚡';
  if (lower.includes('rational')) return '➗';
  if (lower.includes('algebra')) return '🔤';
  if (lower.includes('geometry')) return '📐';
  if (lower.includes('percent')) return '💯';
  if (lower.includes('integer')) return '🔟';
  if (lower.includes('linear') || lower.includes('equation')) return '📈';
  if (lower.includes('triangle')) return '📐';
  if (lower.includes('circle')) return '⭕';
  if (lower.includes('quadrilateral')) return '🔷';
  if (lower.includes('statistic')) return '📊';
  if (lower.includes('probability')) return '🎲';
  if (lower.includes('number')) return '🔢';
  return '📚';
};

export const TopicDashboard = ({ 
  topics, 
  currentTopic, 
  getProgress, 
  onSelectTopic,
  onStartMixedQuiz,
  getTopicLevels,
  isAdmin = false,
  currentSubject = 'math',
  isLoggedIn = false
}: TopicDashboardProps) => {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const guestLimits = useGuestLimits(isLoggedIn);
  const topicEntries = Object.entries(topics);

  // Calculate topic stats
  const topicStats = useMemo(() => {
    return topicEntries.map(([name, questions]) => {
      const progress = getProgress(name);
      const levels = getTopicLevels ? getTopicLevels(name) : [1, 2, 3, 4, 5];
      const masteredCount = levels.filter(l => progress[l]?.mastered).length;
      const percentage = (masteredCount / levels.length) * 100;
      const colors = getMasteryColor(percentage);
      
      return {
        name,
        questionCount: questions.length,
        levels,
        masteredCount,
        totalLevels: levels.length,
        percentage,
        colors,
        icon: getTopicIcon(name),
        isComplete: masteredCount === levels.length,
        progress,
      };
    });
  }, [topicEntries, getProgress, getTopicLevels]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalMastered = topicStats.reduce((sum, t) => sum + t.masteredCount, 0);
    const totalLevels = topicStats.reduce((sum, t) => sum + t.totalLevels, 0);
    const completedTopics = topicStats.filter(t => t.isComplete).length;
    return { totalMastered, totalLevels, completedTopics, percentage: totalLevels > 0 ? (totalMastered / totalLevels) * 100 : 0 };
  }, [topicStats]);

  // Topics that need improvement (started but not mastered)
  const weakestTopics = useMemo(() => {
    return [...topicStats]
      .filter(t => t.percentage > 0 && t.percentage < 100) // Only started topics
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);
  }, [topicStats]);

  // Topics not yet started
  const notStartedTopics = useMemo(() => {
    return topicStats.filter(t => t.percentage === 0);
  }, [topicStats]);

  if (topicEntries.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-12 text-center shadow-card mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          📚
        </motion.div>
        <p className="text-muted-foreground">No topics available yet. Check back soon!</p>
      </div>
    );
  }

  // Wrapper to save last session when selecting a topic
  const handleSelectTopic = (topicName: string) => {
    // Check guest limits
    if (!guestLimits.canAccessTopic(topicName)) {
      setShowSignUpPrompt(true);
      return;
    }
    
    // Record topic access for guests
    guestLimits.recordTopicAccess(topicName);
    
    const progress = getProgress(topicName);
    const levels = getTopicLevels ? getTopicLevels(topicName) : [1, 2, 3, 4, 5];
    const currentLevel = levels.find(l => !progress[l]?.mastered) || levels[0];
    saveLastSession(currentSubject, topicName, currentLevel);
    onSelectTopic(topicName);
  };

  // Get progress info for continue session
  const getTopicProgressInfo = (topicName: string) => {
    const progress = getProgress(topicName);
    const levels = getTopicLevels ? getTopicLevels(topicName) : [1, 2, 3, 4, 5];
    const masteredCount = levels.filter(l => progress[l]?.mastered).length;
    const percentage = (masteredCount / levels.length) * 100;
    const currentLevel = levels.find(l => !progress[l]?.mastered) || levels[0];
    return { percentage, currentLevel, maxLevel: levels.length };
  };

  return (
    <>
      <div className="space-y-6 mb-6">
        {/* Guest Limit Banner */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border flex items-center justify-between ${
              guestLimits.isLimitReached 
                ? 'bg-destructive/10 border-destructive/20' 
                : 'bg-muted/50 border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              {guestLimits.isLimitReached ? (
                <Lock className="w-4 h-4 text-destructive" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm">
                {guestLimits.isLimitReached ? (
                  <span className="text-destructive font-medium">
                    Guest limit reached! Sign up for unlimited access.
                  </span>
                ) : (
                  <>
                    <span className="text-muted-foreground">Guest mode: </span>
                    <span className="font-medium text-foreground">
                      {guestLimits.remainingTopics} of {GUEST_TOPIC_LIMIT_COUNT} topics remaining
                    </span>
                  </>
                )}
              </span>
            </div>
            {!guestLimits.isLimitReached && guestLimits.topicsUsed.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSignUpPrompt(true)}
                className="text-xs"
              >
                Sign up for more
              </Button>
            )}
          </motion.div>
        )}

        {/* Continue Session Button */}
        <ContinueSession
        currentSubject={currentSubject}
        onContinue={handleSelectTopic}
        getTopicProgress={getTopicProgressInfo}
      />

      {/* Quick Start - Mix All Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Button
          onClick={() => onStartMixedQuiz?.(topicEntries.map(([name]) => name))}
          className="w-full h-auto py-6 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white rounded-2xl shadow-lg relative overflow-hidden group"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${10 + i * 15}%`,
                  bottom: 0,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <div className="text-left">
              <div className="text-xl font-bold">🚀 Start Practice!</div>
              <div className="text-sm opacity-80">Mix all topics • Random questions</div>
            </div>
            <motion.div
              className="ml-4"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Play className="w-8 h-8 fill-current" />
            </motion.div>
          </div>
        </Button>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Progress
          </h3>
          <span className="text-sm text-muted-foreground">
            {overallStats.completedTopics}/{topicStats.length} topics mastered
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallStats.percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
            {Math.round(overallStats.percentage)}% Complete
          </div>
        </div>

        {/* Weak areas suggestion - only for started topics */}
        {weakestTopics.length > 0 && (
          <motion.div 
            className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 p-3 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Flame className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Focus area:</strong> {formatName(weakestTopics[0].name)} needs more practice
            </span>
          </motion.div>
        )}

        {/* Suggestion for not started topics */}
        {weakestTopics.length === 0 && notStartedTopics.length > 0 && (
          <motion.div 
            className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Get started:</strong> Try {formatName(notStartedTopics[0].name)} to begin your journey!
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Topics Grid - Visual Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topicStats.map((topic, index) => (
          <motion.button
            key={topic.name}
            onClick={() => handleSelectTopic(topic.name)}
            onMouseEnter={() => setHoveredTopic(topic.name)}
            onMouseLeave={() => setHoveredTopic(null)}
            className={`
              relative p-4 rounded-2xl text-left transition-all overflow-hidden
              ${currentTopic === topic.name 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                : ''
              }
              ${topic.colors.glow}
              bg-card shadow-card hover:shadow-lg
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Progress background fill */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${topic.colors.bg} opacity-10`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: topic.percentage / 100 }}
              style={{ transformOrigin: 'bottom' }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
            />

            {/* Complete badge */}
            {topic.isComplete && (
              <motion.div
                className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Award className="w-4 h-4 text-white" />
              </motion.div>
            )}

            {/* Content */}
            <div className="relative z-10">
              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{topic.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate">
                    {formatName(topic.name)}
                  </h4>
                  <p className={`text-xs ${topic.colors.text} font-medium`}>
                    {topic.percentage === 100 ? 'Mastered!' : 
                     topic.percentage >= 60 ? 'Good progress' :
                     topic.percentage > 0 ? 'Keep practicing' : 'Not started'}
                  </p>
                </div>
              </div>

              {/* Level indicators */}
              <div className="flex items-center gap-1 mb-3">
                {topic.levels.map((level, i) => {
                  const isMastered = topic.progress[level]?.mastered;
                  return (
                    <motion.div
                      key={level}
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-300
                        ${isMastered 
                          ? `bg-gradient-to-br ${topic.colors.bg} text-white shadow-sm` 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + i * 0.05 }}
                    >
                      {level}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${topic.colors.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                />
              </div>

              {/* Stats on hover */}
              <AnimatePresence>
                {hoveredTopic === topic.name && (
                  <motion.div
                    className="mt-3 pt-3 border-t border-border flex items-center justify-between"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="text-xs text-muted-foreground">
                      {topic.masteredCount}/{topic.totalLevels} levels
                    </span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
          <span>Strong (80%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500" />
          <span>Good (60%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-300 to-slate-400" />
          <span>New</span>
        </div>
      </motion.div>
      </div>

      {/* Sign Up Prompt Modal */}
      <SignUpPrompt 
        isOpen={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        topicsUsed={guestLimits.topicsUsed.length}
      />
    </>
  );
};
