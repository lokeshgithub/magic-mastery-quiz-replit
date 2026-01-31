import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Trophy, Target, Clock, Zap, TrendingUp, Award, ChevronRight, 
  RotateCcw, Home, AlertTriangle, BookOpen, Lightbulb, ChevronDown,
  CheckCircle, XCircle, Loader2, Cloud, Users, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdaptiveState, TopicPerformance, StudyRecommendation } from '@/types/adaptiveChallenge';
import { SKILL_TIERS, analyzeTopicPerformance, generateRecommendations, getEstimatedPercentile } from '@/types/adaptiveChallenge';

interface AdaptiveChallengeResultsProps {
  state: AdaptiveState;
  maxLevel: number;
  onRetry: () => void;
  onHome: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  percentileData?: { percentile: number | null; totalResults: number } | null;
}

export const AdaptiveChallengeResults = ({
  state,
  maxLevel,
  onRetry,
  onHome,
  isSaving = false,
  saveError = null,
  percentileData = null,
}: AdaptiveChallengeResultsProps) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<number | null>(0);
  
  const tier = state.skillTier || SKILL_TIERS[0];
  const accuracy = state.totalQuestions > 0 
    ? Math.round((state.totalCorrect / state.totalQuestions) * 100) 
    : 0;
  const avgTime = state.questionHistory.length > 0
    ? Math.round(state.questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / state.questionHistory.length)
    : 0;
  const duration = state.endTime 
    ? Math.round((state.endTime - state.startTime) / 1000 / 60) 
    : 0;

  // Analyze performance
  const topicPerformances = analyzeTopicPerformance(state.questionHistory);
  const recommendations = generateRecommendations(topicPerformances, state.questionHistory);

  // Find next tier for encouragement
  const nextTierIndex = SKILL_TIERS.findIndex(t => t.id === tier.id) + 1;
  const nextTier = nextTierIndex < SKILL_TIERS.length ? SKILL_TIERS[nextTierIndex] : null;
  const pointsToNextTier = nextTier ? nextTier.minScore - state.finalScore : 0;

  // Get estimated percentile if DB data is insufficient
  const estimatedPercentile = getEstimatedPercentile(state.finalScore);
  const showEstimatedPercentile = !percentileData || percentileData.percentile === null;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-success';
    if (acc >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-600';
      default: return 'bg-success/10 border-success/30 text-success';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-card rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-8 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
      >
        {/* Header with animated gradient */}
        <div className={`bg-gradient-to-r ${tier.colorClass} p-6 text-center relative overflow-hidden sticky top-0 z-10`}>
          {/* Animated sparkles */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>

          {/* Assessment Badge */}
          <motion.div
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-white text-sm font-medium">📋 Assessment Complete</span>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.div
              className="text-5xl relative z-10"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {tier.emoji}
            </motion.div>
            <div className="text-left relative z-10">
              <motion.h1 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {tier.title}
              </motion.h1>
              <motion.p
                className="text-white/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {tier.description}
              </motion.p>
            </div>
          </div>

          {/* Large Score Display */}
          <motion.div
            className="mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{state.finalScore}</div>
                <div className="text-white/80 text-sm">out of 100</div>
              </div>
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
          </motion.div>

          {/* Saving status indicator */}
          {isSaving && (
            <motion.div
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Loader2 className="w-3 h-3 text-white animate-spin" />
              <span className="text-white text-sm">Saving...</span>
            </motion.div>
          )}
        </div>

        {/* Save status */}
        {(isSaving || saveError) && (
          <div className={`px-4 py-2 text-sm text-center ${
            saveError ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          }`}>
            {isSaving && (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving your results...
              </span>
            )}
            {saveError && (
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {saveError}
              </span>
            )}
          </div>
        )}

        {/* Percentile info - show real or estimated */}
        <motion.div
          className="mx-6 mt-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-primary" />
            {percentileData && percentileData.percentile !== null ? (
              <span className="text-sm text-muted-foreground">Based on {percentileData.totalResults.toLocaleString()} students</span>
            ) : (
              <span className="text-sm text-muted-foreground">Estimated Ranking</span>
            )}
          </div>
          <p className="text-xl font-bold text-foreground">
            {percentileData && percentileData.percentile !== null ? (
              <>You scored better than <span className="text-primary">{percentileData.percentile}%</span> of students!</>
            ) : (
              <>
                <span className="text-primary">Top {100 - estimatedPercentile.percentile}%</span> — {estimatedPercentile.message}
              </>
            )}
          </p>
        </motion.div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-4 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-muted rounded-xl p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-success" />
              <div className="text-xl font-bold text-foreground">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-xl font-bold text-foreground">L{state.highestLevelReached}</div>
              <div className="text-xs text-muted-foreground">Max Level</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="text-xl font-bold text-foreground">{avgTime}s</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold text-foreground">{duration}m</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </motion.div>

          {/* Topic Breakdown */}
          {topicPerformances.length > 0 && (
            <motion.div
              className="bg-muted rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Topic-wise Performance
              </h3>
              <div className="space-y-3">
                {topicPerformances.map((topic, index) => (
                  <motion.div
                    key={topic.topicName}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {/* Topic status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      topic.isStrength ? 'bg-success/20' : 
                      topic.isWeakness ? 'bg-destructive/20' : 'bg-muted-foreground/20'
                    }`}>
                      {topic.isStrength ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : topic.isWeakness ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      ) : (
                        <Target className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Topic name and stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground text-sm truncate">
                          {topic.topicName}
                        </span>
                        <span className={`text-sm font-semibold ${getAccuracyColor(topic.accuracy)}`}>
                          {topic.accuracy}%
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            topic.accuracy >= 80 ? 'bg-success' :
                            topic.accuracy >= 60 ? 'bg-amber-500' : 'bg-destructive'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.accuracy}%` }}
                          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{topic.correctAnswers}/{topic.questionsAttempted} correct</span>
                        <span>•</span>
                        <span>{topic.averageTime}s avg</span>
                        <span>•</span>
                        <span>L{topic.lowestLevel}-L{topic.highestLevel}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Personalized Recommendations
              </h3>
              
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className={`border rounded-xl overflow-hidden ${getPriorityColor(rec.priority)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <button
                    onClick={() => setExpandedRecommendation(
                      expandedRecommendation === index ? null : index
                    )}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{rec.message}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                        rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-success/20 text-success'
                      }`}>
                        {rec.priority === 'high' ? 'Priority Focus' : 
                         rec.priority === 'medium' ? 'Suggested' : 'Keep it up!'}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      expandedRecommendation === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedRecommendation === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-current/10"
                      >
                        <div className="p-4 pt-3 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Action Items:
                          </p>
                          <ul className="space-y-1.5">
                            {rec.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Capabilities */}
          <motion.div
            className="bg-muted rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-primary" />
              What Your Score Means
            </h3>
            <ul className="space-y-1">
              {tier.capabilities.slice(0, 3).map((capability, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-muted-foreground text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Next tier teaser */}
          {nextTier && (
            <motion.div
              className="text-center text-sm text-muted-foreground bg-muted/50 rounded-xl p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>Just </span>
              <span className="font-semibold text-primary">{pointsToNextTier} more points</span>
              <span> to reach </span>
              <span className="font-semibold">{nextTier.emoji} {nextTier.title}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              onClick={onRetry}
              className={`flex-1 bg-gradient-to-r ${tier.colorClass} text-white hover:opacity-90`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onHome}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
