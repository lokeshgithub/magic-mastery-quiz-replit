import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Info, Loader2, Clock, 
  AlertTriangle, Play, Medal, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwayNav } from '@/components/quiz/PathwayNav';
import { useQuizStore } from '@/hooks/useQuizStore';
import { useOlympiadTest } from '@/hooks/useOlympiadTest';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';
import { OlympiadQuizCard } from '@/components/olympiad/OlympiadQuizCard';
import { OlympiadResults } from '@/components/olympiad/OlympiadResults';
import { SubjectTabs } from '@/components/quiz/SubjectTabs';
import { SoundToggle } from '@/components/quiz/SoundToggle';
import type { Subject } from '@/types/quiz';

const examTypeInfo = {
  foundation: {
    label: 'Foundation',
    description: 'Build your basics • 15 questions • 30 minutes',
    icon: '🌟',
    color: 'from-green-500 to-emerald-600',
  },
  regional: {
    label: 'Regional',
    description: 'State level prep • 20 questions • 45 minutes',
    icon: '🏆',
    color: 'from-blue-500 to-indigo-600',
  },
  national: {
    label: 'National',
    description: 'Olympiad level • 25 questions • 60 minutes',
    icon: '👑',
    color: 'from-purple-500 to-pink-600',
  },
};

export default function OlympiadTest() {
  const navigate = useNavigate();
  const quiz = useQuizStore();
  const olympiad = useOlympiadTest(quiz.banks);
  const sound = useSoundEffects();
  const confetti = useConfetti();

  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<'foundation' | 'regional' | 'national'>('foundation');
  const [showInfo, setShowInfo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [strictMode, setStrictMode] = useState(false);

  // Timer for active test
  useEffect(() => {
    if (!olympiad.state.isActive || olympiad.state.isComplete) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - olympiad.state.startTime) / 1000 / 60;
      const remaining = Math.max(0, olympiad.state.timeLimit - elapsed);
      setTimeRemaining(remaining);

      // Auto-end if time is up
      if (remaining <= 0) {
        olympiad.endTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [olympiad.state.isActive, olympiad.state.isComplete, olympiad.state.startTime, olympiad.state.timeLimit, olympiad]);

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

  const handleStartTest = () => {
    const topics = selectedTopics.length > 0 ? selectedTopics : availableTopics;
    olympiad.startTest(selectedSubject, topics, selectedExamType);
  };

  const handleAnswer = async (selectedIndex: number) => {
    const result = await olympiad.answerQuestion(selectedIndex);
    // Only play sounds if not in strict mode
    if (!strictMode) {
      if (result.isCorrect) {
        sound.playCorrect();
      } else {
        sound.playIncorrect();
      }
    }
    return result;
  };

  const handleNext = () => {
    if (olympiad.state.currentQuestionIndex >= olympiad.state.questions.length - 1) {
      // Test complete
      confetti.fireMastery();
      sound.playLevelUp();
    } else {
      olympiad.nextQuestion();
    }
  };

  const handleRetry = () => {
    olympiad.resetTest();
  };

  const handleHome = () => {
    navigate('/');
  };

  const formatTimeRemaining = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quiz.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-4 px-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <h1 className="font-bold text-xl text-white">Olympiad Test</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Pathway Navigation */}
            <PathwayNav />
            
            {olympiad.state.isActive && !olympiad.state.isComplete && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining < 5 ? 'bg-white/20 text-white animate-pulse' : 'bg-white/10 text-white'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTimeRemaining(timeRemaining)}
              </div>
            )}
            <SoundToggle enabled={sound.enabled} onToggle={sound.toggleSound} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!olympiad.state.isActive ? (
            /* Setup Screen */
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Medal className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">Olympiad-Style Test</h2>
                    <p className="text-white/80 text-sm">
                      Experience a real Olympiad-like exam with mixed difficulty levels. 
                      Questions are arranged just like actual competitions — no hints about which ones are easy or hard!
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Type Selection */}
              <div className="bg-card rounded-xl p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Select Exam Level
                </h3>
                <div className="grid gap-3">
                  {(Object.entries(examTypeInfo) as [keyof typeof examTypeInfo, typeof examTypeInfo[keyof typeof examTypeInfo]][]).map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedExamType(type)}
                      className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        selectedExamType === type
                          ? `bg-gradient-to-r ${info.color} text-white`
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className={`font-semibold ${selectedExamType === type ? 'text-white' : 'text-foreground'}`}>
                          {info.label}
                        </div>
                        <div className={`text-sm ${selectedExamType === type ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {info.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="bg-card rounded-xl p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">Select Subject</h3>
                <SubjectTabs
                  currentSubject={selectedSubject}
                  onSelectSubject={(s) => setSelectedSubject(s)}
                />
              </div>

              {/* Topic Selection */}
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Select Topics</h3>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    {selectedTopics.length === availableTopics.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                {availableTopics.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No topics available for this subject
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map(topic => (
                      <button
                        key={topic}
                        onClick={() => handleToggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTopics.includes(topic)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {topic.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Strict Mode Toggle */}
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {strictMode ? (
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <EyeOff className="w-5 h-5 text-destructive" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-success" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">Strict Exam Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        {strictMode 
                          ? "No feedback until test ends — just like real exams" 
                          : "See correct/incorrect after each question"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStrictMode(!strictMode)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      strictMode ? 'bg-destructive' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        strictMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <strong>Note:</strong> Once you start, you cannot pause the test. 
                  Make sure you have enough time to complete it in one sitting.
                  {strictMode && (
                    <span className="block mt-1 text-destructive">
                      Strict mode is ON — you won't see answers until the test ends.
                    </span>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartTest}
                disabled={availableTopics.length === 0}
              >
                <Play className="w-5 h-5 mr-2" />
                Start {examTypeInfo[selectedExamType].label} Test
              </Button>
            </motion.div>
          ) : olympiad.state.isComplete && olympiad.getResults ? (
            /* Results Screen */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OlympiadResults
                results={olympiad.getResults}
                questionResults={olympiad.state.questionResults}
                strictMode={strictMode}
                onRetry={handleRetry}
                onHome={handleHome}
              />
            </motion.div>
          ) : olympiad.currentQuestion ? (
            /* Active Test */
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Progress Bar */}
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{olympiad.state.currentQuestionIndex + 1} / {olympiad.state.questions.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${olympiad.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <OlympiadQuizCard
                question={olympiad.currentQuestion}
                questionNumber={olympiad.state.currentQuestionIndex + 1}
                totalQuestions={olympiad.state.questions.length}
                onAnswer={handleAnswer}
                onNext={handleNext}
                showFeedback={!strictMode}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
