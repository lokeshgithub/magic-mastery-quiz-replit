import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Play, 
  Target,
  Zap,
  Trophy,
  Info,
  Loader2,
  History,
  Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwayNav } from '@/components/quiz/PathwayNav';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuizStore } from '@/hooks/useQuizStore';
import { useAdaptiveChallenge } from '@/hooks/useAdaptiveChallenge';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';
import { SubjectTabs } from '@/components/quiz/SubjectTabs';
import { SoundToggle } from '@/components/quiz/SoundToggle';
import { AdaptiveQuizCard } from '@/components/adaptive/AdaptiveQuizCard';
import { AdaptiveChallengeResults } from '@/components/adaptive/AdaptiveChallengeResults';
import { AdaptiveLeaderboard } from '@/components/adaptive/AdaptiveLeaderboard';
import { SKILL_TIERS } from '@/types/adaptiveChallenge';
import { saveAdaptiveChallengeResult, calculatePercentile } from '@/services/adaptiveResultsService';
import type { Subject } from '@/types/quiz';

const AdaptiveChallenge = () => {
  const navigate = useNavigate();
  const quiz = useQuizStore();
  const adaptive = useAdaptiveChallenge(quiz.banks);
  const sound = useSoundEffects();
  const confetti = useConfetti();
  
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [percentileData, setPercentileData] = useState<{ percentile: number | null; totalResults: number } | null>(null);
  const hasSavedResult = useRef(false);
  
  // Generate a session ID for guest users
  const sessionId = useRef(`guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Update available topics when subject changes
  useEffect(() => {
    setSelectedTopics([]);
  }, [selectedSubject]);

  const availableTopics = Object.keys(quiz.banks[selectedSubject] || {});

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(availableTopics);
    }
  };

  const handleStartChallenge = () => {
    const topics = selectedTopics.length > 0 ? selectedTopics : availableTopics;
    adaptive.startChallenge(selectedSubject, topics);
  };

  const handleAnswer = useCallback(async (selectedIndex: number) => {
    const result = await adaptive.answerQuestion(selectedIndex);
    
    if (result.isCorrect) {
      sound.playCorrect();
      // Fire confetti for streaks
      const correctStreak = adaptive.state.questionHistory.filter((q, i, arr) => {
        // Count consecutive correct from the end
        for (let j = i; j < arr.length; j++) {
          if (!arr[j].isCorrect) return false;
        }
        return q.isCorrect;
      }).length;
      
      if (correctStreak >= 3) {
        confetti.fireStreak(correctStreak);
      }
    } else {
      sound.playIncorrect();
    }
    
    return result;
  }, [adaptive, sound, confetti]);

  const handleNext = useCallback(() => {
    // Check if challenge is complete
    if (adaptive.state.isComplete) {
      sound.playLevelUp();
      confetti.fireMastery();
    }
  }, [adaptive.state.isComplete, sound, confetti]);

  // Save results when challenge is complete
  useEffect(() => {
    const saveResults = async () => {
      if (adaptive.state.isComplete && adaptive.state.skillTier && !hasSavedResult.current) {
        hasSavedResult.current = true;
        setIsSaving(true);
        setSaveError(null);
        
        const maxLevel = adaptive.getMaxLevel(adaptive.state.subject, adaptive.state.selectedTopics);
        
        const result = await saveAdaptiveChallengeResult({
          state: adaptive.state,
          maxLevel,
          sessionId: sessionId.current,
        });
        
        if (!result.success) {
          setSaveError(result.error || 'Failed to save results');
        }
        
        // Calculate percentile if enough data exists
        const percentile = await calculatePercentile(
          adaptive.state.subject,
          adaptive.state.finalScore
        );
        setPercentileData(percentile);
        
        setIsSaving(false);
      }
    };
    
    saveResults();
  }, [adaptive.state.isComplete, adaptive.state.skillTier, adaptive]);

  const handleRetry = () => {
    hasSavedResult.current = false;
    setPercentileData(null);
    setSaveError(null);
    adaptive.resetChallenge();
  };

  const handleHome = () => {
    navigate('/');
  };

  // Loading state
  if (quiz.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="w-8 h-8" />
                <h1 className="text-2xl md:text-3xl font-bold">Adaptive Challenge</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Pathway Navigation */}
              <PathwayNav />
              
              <Link to="/adaptive/focus">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                >
                  <Crosshair className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Focus</span>
                </Button>
              </Link>
              <Link to="/adaptive/history">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                >
                  <History className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowLeaderboard(true)}
              >
                <Trophy className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggleSound} />
            </div>
          </div>
          <p className="text-white/80 text-sm mt-2 ml-2">
            📋 Take this 20-question assessment to discover your skill level and get a score out of 100
          </p>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Setup Screen */}
        {!adaptive.state.isActive && !adaptive.state.isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* How it works */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  How It Works
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold text-foreground mb-1">Adaptive Difficulty</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions get harder as you succeed, easier when you struggle
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <h3 className="font-semibold text-foreground mb-1">20 Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a score out of 100 with your percentile ranking
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold text-foreground mb-1">Rich Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Get meaningful insights about your abilities
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-muted rounded-xl p-4"
                  >
                    <h4 className="font-semibold text-foreground mb-2">Skill Tiers</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      {SKILL_TIERS.slice(0, 4).map(tier => (
                        <div key={tier.id} className="text-center p-2">
                          <span className="text-2xl">{tier.emoji}</span>
                          <p className="text-muted-foreground">{tier.title}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      {SKILL_TIERS.slice(4).map(tier => (
                        <div key={tier.id} className="text-center p-2">
                          <span className="text-2xl">{tier.emoji}</span>
                          <p className="text-muted-foreground">{tier.title}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subject Selection */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Choose Subject</h2>
              <SubjectTabs 
                currentSubject={selectedSubject} 
                onSelectSubject={setSelectedSubject} 
              />
            </div>

            {/* Topic Selection */}
            {availableTopics.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Select Topics</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedTopics.length === availableTopics.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  {availableTopics.map(topic => (
                    <motion.label
                      key={topic}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                        ${selectedTopics.includes(topic) 
                          ? 'bg-primary/10 ring-2 ring-primary' 
                          : 'bg-muted hover:bg-muted/80'
                        }
                      `}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Checkbox
                        checked={selectedTopics.includes(topic)}
                        onCheckedChange={() => handleToggleTopic(topic)}
                      />
                      <span className="text-foreground font-medium">{topic}</span>
                    </motion.label>
                  ))}
                </div>

                {selectedTopics.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Leave empty to include all topics
                  </p>
                )}
              </div>
            )}

            {availableTopics.length === 0 && (
              <div className="bg-card rounded-2xl p-8 shadow-card text-center">
                <p className="text-muted-foreground">
                  No topics available for this subject yet.
                </p>
              </div>
            )}

            {/* Start Button */}
            {availableTopics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleStartChallenge}
                  className="w-full py-6 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Adaptive Challenge
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Active Challenge */}
        {adaptive.state.isActive && adaptive.state.currentQuestion && (
          <AdaptiveQuizCard
            question={adaptive.state.currentQuestion}
            currentLevel={adaptive.state.currentLevel}
            progress={adaptive.progressPercentage}
            questionsAnswered={adaptive.state.totalQuestions}
            maxQuestions={adaptive.config.maxQuestions}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}

        {/* Results */}
        {adaptive.state.isComplete && adaptive.state.skillTier && (
          <AdaptiveChallengeResults
            state={adaptive.state}
            maxLevel={adaptive.getMaxLevel(adaptive.state.subject, adaptive.state.selectedTopics)}
            onRetry={handleRetry}
            onHome={handleHome}
            isSaving={isSaving}
            saveError={saveError}
            percentileData={percentileData}
          />
        )}

        {/* Leaderboard Modal */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
            >
              <motion.div
                className="w-full max-w-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <AdaptiveLeaderboard 
                  initialSubject={selectedSubject}
                  onClose={() => setShowLeaderboard(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdaptiveChallenge;
