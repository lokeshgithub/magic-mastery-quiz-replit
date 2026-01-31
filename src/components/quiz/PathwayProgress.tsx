import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Trophy, ChevronRight, Sparkles, Star } from 'lucide-react';
import { TopicProgress } from '@/types/quiz';

interface PathwayProgressProps {
  topics: { [name: string]: any[] };
  getProgress: (topic: string) => TopicProgress;
  getTopicLevels?: (topic: string) => number[];
}

const pathwayConfig = [
  {
    id: 'practice',
    path: '/',
    icon: BookOpen,
    emoji: '📚',
    title: 'Practice',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    ringColor: 'ring-emerald-500',
  },
  {
    id: 'adaptive',
    path: '/adaptive',
    icon: Brain,
    emoji: '🧠',
    title: 'Adaptive',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600',
    ringColor: 'ring-violet-500',
  },
  {
    id: 'olympiad',
    path: '/olympiad',
    icon: Trophy,
    emoji: '🏆',
    title: 'Olympiad',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    ringColor: 'ring-amber-500',
  },
];

export const PathwayProgress = ({ topics, getProgress, getTopicLevels }: PathwayProgressProps) => {
  // Calculate practice progress
  const practiceStats = useMemo(() => {
    const topicEntries = Object.entries(topics);
    let totalLevels = 0;
    let masteredLevels = 0;
    let topicsMastered = 0;

    topicEntries.forEach(([name]) => {
      const progress = getProgress(name);
      const levels = getTopicLevels ? getTopicLevels(name) : [1, 2, 3, 4, 5];
      const masteredCount = levels.filter(l => progress[l]?.mastered).length;
      
      totalLevels += levels.length;
      masteredLevels += masteredCount;
      
      if (masteredCount === levels.length) {
        topicsMastered++;
      }
    });

    const percentage = totalLevels > 0 ? (masteredLevels / totalLevels) * 100 : 0;
    return { 
      percentage, 
      topicsMastered, 
      totalTopics: topicEntries.length,
      masteredLevels,
      totalLevels,
      label: topicsMastered > 0 ? `${topicsMastered} topics mastered` : 'Start your journey'
    };
  }, [topics, getProgress, getTopicLevels]);

  // Get adaptive stats from localStorage (if any challenges completed)
  const adaptiveStats = useMemo(() => {
    try {
      const stored = localStorage.getItem('adaptive-best-result');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          percentage: Math.min(100, (data.skillScore || 0) / 10),
          label: data.skillTier || 'Challenge completed',
          hasData: true,
        };
      }
    } catch {}
    return { percentage: 0, label: 'Discover your level', hasData: false };
  }, []);

  // Get olympiad stats from localStorage
  const olympiadStats = useMemo(() => {
    try {
      const stored = localStorage.getItem('olympiad-best-result');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          percentage: data.accuracy || 0,
          label: `Best: ${Math.round(data.accuracy || 0)}% accuracy`,
          hasData: true,
        };
      }
    } catch {}
    return { percentage: 0, label: 'Take the test', hasData: false };
  }, []);

  const stats = [practiceStats, adaptiveStats, olympiadStats];

  // Calculate overall journey progress
  const overallProgress = useMemo(() => {
    const practiceWeight = practiceStats.percentage * 0.4;
    const adaptiveWeight = adaptiveStats.percentage * 0.3;
    const olympiadWeight = olympiadStats.percentage * 0.3;
    return Math.round(practiceWeight + adaptiveWeight + olympiadWeight);
  }, [practiceStats, adaptiveStats, olympiadStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Learning Journey
        </h3>
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-foreground">{overallProgress}%</span>
          <span className="text-muted-foreground">overall</span>
        </div>
      </div>

      {/* Journey Path Visualization */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full mx-12 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>

        {/* Pathway Nodes */}
        <div className="relative z-10 flex justify-between items-center">
          {pathwayConfig.map((pathway, index) => {
            const stat = stats[index];
            const Icon = pathway.icon;
            const isComplete = stat.percentage >= 100;
            const hasProgress = stat.percentage > 0;

            return (
              <Link
                key={pathway.id}
                to={pathway.path}
                className="group flex flex-col items-center"
              >
                {/* Progress Ring */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Background Circle */}
                  <div className={`w-16 h-16 rounded-full ${pathway.bgColor} flex items-center justify-center`}>
                    {/* Progress Ring SVG */}
                    <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className={pathway.textColor}
                        style={{
                          stroke: `url(#gradient-${pathway.id})`,
                        }}
                        initial={{ strokeDasharray: '0 176' }}
                        animate={{ 
                          strokeDasharray: `${(stat.percentage / 100) * 176} 176` 
                        }}
                        transition={{ duration: 1, delay: index * 0.2, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id={`gradient-${pathway.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={pathway.textColor} stopColor="currentColor" />
                          <stop offset="100%" className={pathway.textColor} stopColor="currentColor" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Icon/Emoji */}
                    <motion.div
                      className="text-2xl z-10"
                      animate={isComplete ? { 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isComplete ? '✅' : pathway.emoji}
                    </motion.div>
                  </div>

                  {/* Percentage Badge */}
                  {hasProgress && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${pathway.color} text-white text-xs font-bold flex items-center justify-center shadow-md`}
                    >
                      {Math.round(stat.percentage)}
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {pathway.title}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[80px] truncate">
                    {stat.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action */}
      {overallProgress < 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 pt-4 border-t border-border"
        >
          <Link
            to="/"
            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Start with Practice Mode</p>
                <p className="text-xs text-muted-foreground">Build your foundation first</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};
