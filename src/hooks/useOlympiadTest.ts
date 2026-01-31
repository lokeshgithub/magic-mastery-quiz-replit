import { useState, useCallback, useMemo, useRef } from 'react';
import type { Question, QuestionBank, Subject } from '@/types/quiz';
import { logAnswerToServer } from '@/services/questionService';

export interface OlympiadQuestionResult {
  question: Question;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topicName: string;
}

export interface OlympiadState {
  isActive: boolean;
  isComplete: boolean;
  subject: Subject;
  selectedTopics: string[];
  questions: Question[];
  currentQuestionIndex: number;
  questionResults: OlympiadQuestionResult[];
  totalCorrect: number;
  startTime: number;
  endTime: number | null;
  // Exam metadata
  examType: 'foundation' | 'regional' | 'national';
  timeLimit: number; // in minutes
}

export interface OlympiadConfig {
  foundation: { questionCount: number; timeLimit: number }; // Class 6-7
  regional: { questionCount: number; timeLimit: number };   // Class 8-9
  national: { questionCount: number; timeLimit: number };   // Class 10+
}

const DEFAULT_CONFIG: OlympiadConfig = {
  foundation: { questionCount: 15, timeLimit: 30 },  // 15 questions, 30 min
  regional: { questionCount: 20, timeLimit: 45 },    // 20 questions, 45 min
  national: { questionCount: 25, timeLimit: 60 },    // 25 questions, 60 min
};

const initialState: OlympiadState = {
  isActive: false,
  isComplete: false,
  subject: 'math',
  selectedTopics: [],
  questions: [],
  currentQuestionIndex: 0,
  questionResults: [],
  totalCorrect: 0,
  startTime: 0,
  endTime: null,
  examType: 'foundation',
  timeLimit: 30,
};

/**
 * Generate Olympiad-style question sequence with varied difficulty pattern
 * Mimics real exam patterns: not sequential, strategic distribution
 */
function generateOlympiadSequence(
  banks: QuestionBank,
  subject: Subject,
  topics: string[],
  questionCount: number,
  examType: 'foundation' | 'regional' | 'national'
): { questions: Question[]; difficultyMap: Map<string, 'easy' | 'medium' | 'hard'> } {
  const allQuestions: { question: Question; level: number; topic: string }[] = [];
  
  // Collect all questions from selected topics
  for (const topic of topics) {
    const topicQuestions = banks[subject]?.[topic] || [];
    for (const q of topicQuestions) {
      allQuestions.push({ question: q, level: q.level, topic });
    }
  }

  if (allQuestions.length === 0) {
    return { questions: [], difficultyMap: new Map() };
  }

  // Determine level thresholds for difficulty classification
  const levels = allQuestions.map(q => q.level);
  const maxLevel = Math.max(...levels);
  const easyThreshold = Math.ceil(maxLevel / 3);
  const mediumThreshold = Math.ceil((maxLevel * 2) / 3);

  // Classify questions by difficulty
  const easy = allQuestions.filter(q => q.level <= easyThreshold);
  const medium = allQuestions.filter(q => q.level > easyThreshold && q.level <= mediumThreshold);
  const hard = allQuestions.filter(q => q.level > mediumThreshold);

  // Define distribution patterns based on exam type
  // These mimic real Olympiad patterns - not strictly ordered
  const patterns: Record<string, ('easy' | 'medium' | 'hard')[]> = {
    foundation: [
      'easy', 'easy', 'medium', 'easy', 'hard', 
      'medium', 'easy', 'medium', 'hard', 'easy',
      'medium', 'hard', 'easy', 'medium', 'hard'
    ],
    regional: [
      'easy', 'medium', 'easy', 'hard', 'medium',
      'easy', 'hard', 'medium', 'easy', 'hard',
      'medium', 'hard', 'easy', 'medium', 'hard',
      'medium', 'hard', 'easy', 'hard', 'hard'
    ],
    national: [
      'medium', 'easy', 'hard', 'medium', 'easy',
      'hard', 'hard', 'medium', 'easy', 'hard',
      'medium', 'easy', 'hard', 'medium', 'hard',
      'hard', 'medium', 'easy', 'hard', 'hard',
      'medium', 'hard', 'easy', 'hard', 'hard'
    ],
  };

  const pattern = patterns[examType];
  const selectedQuestions: Question[] = [];
  const difficultyMap = new Map<string, 'easy' | 'medium' | 'hard'>();
  const usedIds = new Set<string>();

  // Helper to pick random question from pool
  const pickRandom = (pool: typeof allQuestions): typeof allQuestions[0] | null => {
    const available = pool.filter(q => !usedIds.has(q.question.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  // Select questions following the pattern
  for (let i = 0; i < Math.min(questionCount, pattern.length); i++) {
    const targetDifficulty = pattern[i];
    let picked: typeof allQuestions[0] | null = null;

    // Try to get from target difficulty, fall back to others
    if (targetDifficulty === 'easy') {
      picked = pickRandom(easy) || pickRandom(medium) || pickRandom(hard);
    } else if (targetDifficulty === 'medium') {
      picked = pickRandom(medium) || pickRandom(easy) || pickRandom(hard);
    } else {
      picked = pickRandom(hard) || pickRandom(medium) || pickRandom(easy);
    }

    if (picked) {
      selectedQuestions.push(picked.question);
      difficultyMap.set(picked.question.id, targetDifficulty);
      usedIds.add(picked.question.id);
    }
  }

  // If we need more questions than the pattern, add randomly
  while (selectedQuestions.length < questionCount) {
    const remaining = allQuestions.filter(q => !usedIds.has(q.question.id));
    if (remaining.length === 0) break;
    
    const picked = remaining[Math.floor(Math.random() * remaining.length)];
    selectedQuestions.push(picked.question);
    
    // Assign difficulty based on level
    let diff: 'easy' | 'medium' | 'hard' = 'medium';
    if (picked.level <= easyThreshold) diff = 'easy';
    else if (picked.level > mediumThreshold) diff = 'hard';
    difficultyMap.set(picked.question.id, diff);
    usedIds.add(picked.question.id);
  }

  return { questions: selectedQuestions, difficultyMap };
}

export function useOlympiadTest(banks: QuestionBank) {
  const [state, setState] = useState<OlympiadState>(initialState);
  const [config] = useState<OlympiadConfig>(DEFAULT_CONFIG);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const difficultyMapRef = useRef<Map<string, 'easy' | 'medium' | 'hard'>>(new Map());
  const topicMapRef = useRef<Map<string, string>>(new Map());

  // Build topic map for questions
  const buildTopicMap = useCallback((subject: Subject, topics: string[]) => {
    const map = new Map<string, string>();
    for (const topic of topics) {
      const questions = banks[subject]?.[topic] || [];
      for (const q of questions) {
        map.set(q.id, topic);
      }
    }
    topicMapRef.current = map;
  }, [banks]);

  // Start a new Olympiad test
  const startTest = useCallback((
    subject: Subject,
    topics: string[],
    examType: 'foundation' | 'regional' | 'national' = 'foundation'
  ) => {
    const examConfig = config[examType];
    const { questions, difficultyMap } = generateOlympiadSequence(
      banks,
      subject,
      topics,
      examConfig.questionCount,
      examType
    );

    if (questions.length === 0) {
      console.error('No questions available for Olympiad test');
      return;
    }

    difficultyMapRef.current = difficultyMap;
    buildTopicMap(subject, topics);

    setState({
      isActive: true,
      isComplete: false,
      subject,
      selectedTopics: topics,
      questions,
      currentQuestionIndex: 0,
      questionResults: [],
      totalCorrect: 0,
      startTime: Date.now(),
      endTime: null,
      examType,
      timeLimit: examConfig.timeLimit,
    });

    setQuestionStartTime(Date.now());
  }, [banks, config, buildTopicMap]);

  // Answer current question
  const answerQuestion = useCallback(async (selectedIndex: number): Promise<{
    isCorrect: boolean;
    correctIndex: number;
  }> => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) {
      return { isCorrect: false, correctIndex: -1 };
    }

    const timeSpent = (Date.now() - questionStartTime) / 1000;

    // INSTANT LOCAL VALIDATION - no network call needed!
    // The correct answer is already loaded in memory
    const isCorrect = selectedIndex === currentQuestion.correct;
    const shuffledCorrectIndex = currentQuestion.correct;

    // Log to server in background (non-blocking, fire-and-forget)
    const originalSelectedIndex = currentQuestion.shuffleMap
      ? currentQuestion.shuffleMap[selectedIndex]
      : selectedIndex;
    logAnswerToServer(currentQuestion.id, originalSelectedIndex, isCorrect);

    const difficulty = difficultyMapRef.current.get(currentQuestion.id) || 'medium';
    const topicName = topicMapRef.current.get(currentQuestion.id) || 'Unknown';

    const result: OlympiadQuestionResult = {
      question: currentQuestion,
      selectedAnswer: selectedIndex,
      correctAnswer: shuffledCorrectIndex,
      isCorrect,
      timeSpent,
      difficulty,
      topicName,
    };

    const newTotalCorrect = state.totalCorrect + (isCorrect ? 1 : 0);
    const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

    setState(prev => ({
      ...prev,
      questionResults: [...prev.questionResults, result],
      totalCorrect: newTotalCorrect,
      isComplete: isLastQuestion,
      endTime: isLastQuestion ? Date.now() : null,
    }));

    return { isCorrect, correctIndex: shuffledCorrectIndex };
  }, [state.questions, state.currentQuestionIndex, state.totalCorrect, questionStartTime]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [state.currentQuestionIndex, state.questions.length]);

  // End test early (time up or user quits)
  const endTest = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: true,
      endTime: Date.now(),
    }));
  }, []);

  // Reset test
  const resetTest = useCallback(() => {
    setState(initialState);
    difficultyMapRef.current = new Map();
  }, []);

  // Calculate results statistics
  const getResults = useMemo(() => {
    if (!state.isComplete) return null;

    const totalQuestions = state.questionResults.length;
    const correctAnswers = state.totalCorrect;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const totalTime = state.endTime ? (state.endTime - state.startTime) / 1000 : 0;
    const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Calculate by difficulty
    const byDifficulty = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    // Calculate by topic
    const byTopic: Record<string, { correct: number; total: number }> = {};

    for (const result of state.questionResults) {
      // By difficulty
      byDifficulty[result.difficulty].total++;
      if (result.isCorrect) byDifficulty[result.difficulty].correct++;

      // By topic
      if (!byTopic[result.topicName]) {
        byTopic[result.topicName] = { correct: 0, total: 0 };
      }
      byTopic[result.topicName].total++;
      if (result.isCorrect) byTopic[result.topicName].correct++;
    }

    // Calculate Olympiad rank/tier
    const getOlympiadRank = (acc: number, examType: string): { rank: string; medal: string; emoji: string } => {
      if (examType === 'national') {
        if (acc >= 90) return { rank: 'INMO Qualifier', medal: 'Gold', emoji: '🥇' };
        if (acc >= 80) return { rank: 'RMO Topper', medal: 'Silver', emoji: '🥈' };
        if (acc >= 70) return { rank: 'State Ranker', medal: 'Bronze', emoji: '🥉' };
        if (acc >= 60) return { rank: 'Merit Certificate', medal: 'Merit', emoji: '📜' };
        return { rank: 'Participant', medal: 'Participant', emoji: '🎯' };
      } else if (examType === 'regional') {
        if (acc >= 85) return { rank: 'Pre-RMO Qualifier', medal: 'Gold', emoji: '🥇' };
        if (acc >= 75) return { rank: 'District Topper', medal: 'Silver', emoji: '🥈' };
        if (acc >= 65) return { rank: 'School Topper', medal: 'Bronze', emoji: '🥉' };
        if (acc >= 50) return { rank: 'Merit Certificate', medal: 'Merit', emoji: '📜' };
        return { rank: 'Participant', medal: 'Participant', emoji: '🎯' };
      } else {
        // Foundation
        if (acc >= 80) return { rank: 'Olympiad Star', medal: 'Gold', emoji: '⭐' };
        if (acc >= 70) return { rank: 'Rising Champion', medal: 'Silver', emoji: '🌟' };
        if (acc >= 60) return { rank: 'Young Achiever', medal: 'Bronze', emoji: '✨' };
        if (acc >= 50) return { rank: 'Promising Talent', medal: 'Merit', emoji: '🎖️' };
        return { rank: 'Explorer', medal: 'Participant', emoji: '🔍' };
      }
    };

    const rankInfo = getOlympiadRank(accuracy, state.examType);

    return {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy * 10) / 10,
      totalTimeSeconds: Math.round(totalTime),
      avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
      byDifficulty,
      byTopic,
      rank: rankInfo.rank,
      medal: rankInfo.medal,
      medalEmoji: rankInfo.emoji,
      examType: state.examType,
    };
  }, [state.isComplete, state.questionResults, state.totalCorrect, state.startTime, state.endTime, state.examType]);

  // Current question
  const currentQuestion = state.questions[state.currentQuestionIndex] || null;

  // Progress
  const progress = state.questions.length > 0
    ? ((state.currentQuestionIndex + (state.questionResults.length > state.currentQuestionIndex ? 1 : 0)) / state.questions.length) * 100
    : 0;

  // Time remaining
  const timeRemaining = useMemo(() => {
    if (!state.isActive || state.isComplete) return 0;
    const elapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    return Math.max(0, state.timeLimit - elapsed);
  }, [state.isActive, state.isComplete, state.startTime, state.timeLimit]);

  return {
    state,
    currentQuestion,
    progress,
    timeRemaining,
    startTest,
    answerQuestion,
    nextQuestion,
    endTest,
    resetTest,
    getResults,
    config,
  };
}
