import { useState, useCallback, useMemo } from 'react';
import type { Question, Subject, QuestionBank } from '@/types/quiz';
import type { 
  AdaptiveState, 
  AdaptiveQuestionResult, 
  AdaptiveConfig 
} from '@/types/adaptiveChallenge';
import { 
  DEFAULT_ADAPTIVE_CONFIG, 
  calculateSkillScore, 
  getSkillTier 
} from '@/types/adaptiveChallenge';
import { logAnswerToServer } from '@/services/questionService';

const initialState: AdaptiveState = {
  isActive: false,
  currentQuestion: null,
  questionHistory: [],
  currentLevel: 3,
  highestLevelReached: 3,
  questionsAtCurrentLevel: 0,
  correctAtCurrentLevel: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  startTime: 0,
  subject: 'math',
  selectedTopics: [],
  isComplete: false,
  finalScore: 0,
  skillTier: null,
};

export const useAdaptiveChallenge = (banks: QuestionBank) => {
  const [state, setState] = useState<AdaptiveState>(initialState);
  const [config] = useState<AdaptiveConfig>(DEFAULT_ADAPTIVE_CONFIG);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  // Get all questions for a subject, organized by level (also track topic names)
  const getQuestionsByLevel = useCallback((subject: Subject, topics: string[]): Map<number, Question[]> => {
    const levelMap = new Map<number, Question[]>();
    
    const subjectBank = banks[subject] || {};
    const topicsToUse = topics.length > 0 ? topics : Object.keys(subjectBank);
    
    for (const topicName of topicsToUse) {
      const topicQuestions = subjectBank[topicName] || [];
      for (const q of topicQuestions) {
        const level = q.level;
        if (!levelMap.has(level)) {
          levelMap.set(level, []);
        }
        levelMap.get(level)!.push(q);
      }
    }
    
    return levelMap;
  }, [banks]);

  // Get topic name for a question
  const getQuestionTopic = useCallback((questionId: string, subject: Subject, topics: string[]): string => {
    const subjectBank = banks[subject] || {};
    const topicsToSearch = topics.length > 0 ? topics : Object.keys(subjectBank);
    
    for (const topicName of topicsToSearch) {
      const topicQuestions = subjectBank[topicName] || [];
      if (topicQuestions.some(q => q.id === questionId)) {
        return topicName;
      }
    }
    return 'Unknown';
  }, [banks]);

  // Get max level available
  const getMaxLevel = useCallback((subject: Subject, topics: string[]): number => {
    const levelMap = getQuestionsByLevel(subject, topics);
    return Math.max(...Array.from(levelMap.keys()), 1);
  }, [getQuestionsByLevel]);

  // Pick a random question from a level that hasn't been used
  const pickQuestion = useCallback((level: number): Question | null => {
    const levelMap = getQuestionsByLevel(state.subject, state.selectedTopics);
    const maxLevel = getMaxLevel(state.subject, state.selectedTopics);
    
    // Try the requested level first, then nearby levels
    const levelsToTry = [level];
    for (let offset = 1; offset <= maxLevel; offset++) {
      if (level + offset <= maxLevel) levelsToTry.push(level + offset);
      if (level - offset >= 1) levelsToTry.push(level - offset);
    }
    
    for (const lvl of levelsToTry) {
      const questions = levelMap.get(lvl) || [];
      const available = questions.filter(q => !usedQuestionIds.has(q.id));
      
      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
      }
    }
    
    return null;
  }, [state.subject, state.selectedTopics, usedQuestionIds, getQuestionsByLevel, getMaxLevel]);

  // Start the adaptive challenge
  const startChallenge = useCallback((subject: Subject, topics: string[]) => {
    const maxLevel = getMaxLevel(subject, topics);
    const startLevel = Math.min(config.startLevel, maxLevel);
    
    setUsedQuestionIds(new Set());
    
    // Get first question
    const levelMap = getQuestionsByLevel(subject, topics);
    const questionsAtLevel = levelMap.get(startLevel) || [];
    const firstQuestion = questionsAtLevel.length > 0 
      ? questionsAtLevel[Math.floor(Math.random() * questionsAtLevel.length)]
      : null;
    
    if (firstQuestion) {
      setUsedQuestionIds(new Set([firstQuestion.id]));
    }
    
    setState({
      isActive: true,
      currentQuestion: firstQuestion,
      questionHistory: [],
      currentLevel: startLevel,
      highestLevelReached: startLevel,
      questionsAtCurrentLevel: 0,
      correctAtCurrentLevel: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      startTime: Date.now(),
      subject,
      selectedTopics: topics,
      isComplete: false,
      finalScore: 0,
      skillTier: null,
    });
    setQuestionStartTime(Date.now());
  }, [config.startLevel, getQuestionsByLevel, getMaxLevel]);

  // Answer current question
  const answerQuestion = useCallback(async (selectedIndex: number): Promise<{
    isCorrect: boolean;
    correctIndex: number;
  }> => {
    if (!state.currentQuestion) {
      return { isCorrect: false, correctIndex: -1 };
    }

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    // INSTANT LOCAL VALIDATION - no network call needed!
    // The correct answer is already loaded in memory
    const isCorrect = selectedIndex === state.currentQuestion.correct;
    const shuffledCorrectIndex = state.currentQuestion.correct;

    // Log to server in background (non-blocking, fire-and-forget)
    const originalSelectedIndex = state.currentQuestion.shuffleMap 
      ? state.currentQuestion.shuffleMap[selectedIndex] 
      : selectedIndex;
    logAnswerToServer(state.currentQuestion.id, originalSelectedIndex, isCorrect);

    const topicName = getQuestionTopic(state.currentQuestion.id, state.subject, state.selectedTopics);

    const result: AdaptiveQuestionResult = {
      question: state.currentQuestion,
      selectedAnswer: selectedIndex,
      correctAnswer: shuffledCorrectIndex,
      isCorrect,
      timeSpent,
      levelAtTime: state.currentLevel,
      topicName,
    };

    // Calculate new level
    const newCorrectAtLevel = state.correctAtCurrentLevel + (isCorrect ? 1 : 0);
    const newQuestionsAtLevel = state.questionsAtCurrentLevel + 1;
    const wrongAtLevel = newQuestionsAtLevel - newCorrectAtLevel;
    const maxLevel = getMaxLevel(state.subject, state.selectedTopics);
    
    let newLevel = state.currentLevel;
    let resetLevelStats = false;
    
    // Level up logic: 3 correct at current level
    if (newCorrectAtLevel >= config.questionsToAdvance) {
      if (state.currentLevel < maxLevel) {
        newLevel = state.currentLevel + 1;
        resetLevelStats = true;
      }
    }
    // Level down logic: 2 wrong at current level
    else if (wrongAtLevel >= config.questionsToStay) {
      if (state.currentLevel > 1) {
        newLevel = state.currentLevel - 1;
        resetLevelStats = true;
      }
    }

    const newHighest = Math.max(state.highestLevelReached, newLevel);
    const newTotalQuestions = state.totalQuestions + 1;
    const newTotalCorrect = state.totalCorrect + (isCorrect ? 1 : 0);

    // Check if challenge should end
    const shouldEnd = newTotalQuestions >= config.maxQuestions;

    // Calculate final score if ending
    let finalScore = 0;
    let skillTier = null;
    
    if (shouldEnd) {
      const avgTime = state.questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / 
        (state.questionHistory.length || 1);
      finalScore = calculateSkillScore(
        newHighest,
        maxLevel,
        newTotalCorrect,
        newTotalQuestions,
        avgTime
      );
      skillTier = getSkillTier(finalScore);
    }

    // Get next question
    let nextQuestion: Question | null = null;
    if (!shouldEnd) {
      // Mark current question as used
      setUsedQuestionIds(prev => new Set([...prev, state.currentQuestion!.id]));
      
      // Pick next question at new level
      const levelMap = getQuestionsByLevel(state.subject, state.selectedTopics);
      const questionsAtNewLevel = (levelMap.get(newLevel) || [])
        .filter(q => !usedQuestionIds.has(q.id) && q.id !== state.currentQuestion!.id);
      
      if (questionsAtNewLevel.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionsAtNewLevel.length);
        nextQuestion = questionsAtNewLevel[randomIndex];
        setUsedQuestionIds(prev => new Set([...prev, nextQuestion!.id]));
      } else {
        // No more questions available at this level, try to find any question
        for (let lvl = newLevel; lvl >= 1; lvl--) {
          const questions = (levelMap.get(lvl) || [])
            .filter(q => !usedQuestionIds.has(q.id) && q.id !== state.currentQuestion!.id);
          if (questions.length > 0) {
            nextQuestion = questions[Math.floor(Math.random() * questions.length)];
            setUsedQuestionIds(prev => new Set([...prev, nextQuestion!.id]));
            break;
          }
        }
      }
    }

    setState(prev => ({
      ...prev,
      questionHistory: [...prev.questionHistory, result],
      currentLevel: newLevel,
      highestLevelReached: newHighest,
      questionsAtCurrentLevel: resetLevelStats ? (isCorrect ? 1 : 0) : newQuestionsAtLevel,
      correctAtCurrentLevel: resetLevelStats ? (isCorrect ? 1 : 0) : newCorrectAtLevel,
      totalQuestions: newTotalQuestions,
      totalCorrect: newTotalCorrect,
      currentQuestion: shouldEnd ? null : nextQuestion,
      isComplete: shouldEnd || !nextQuestion,
      endTime: shouldEnd ? Date.now() : undefined,
      finalScore,
      skillTier,
    }));

    if (!shouldEnd && nextQuestion) {
      setQuestionStartTime(Date.now());
    }

    return { isCorrect, correctIndex: shuffledCorrectIndex };
  }, [
    state, 
    questionStartTime, 
    config, 
    getQuestionsByLevel, 
    getMaxLevel, 
    usedQuestionIds
  ]);

  // Complete the challenge early
  const endChallenge = useCallback(() => {
    const maxLevel = getMaxLevel(state.subject, state.selectedTopics);
    const avgTime = state.questionHistory.length > 0
      ? state.questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / state.questionHistory.length
      : 0;
    
    const finalScore = calculateSkillScore(
      state.highestLevelReached,
      maxLevel,
      state.totalCorrect,
      state.totalQuestions,
      avgTime
    );
    
    setState(prev => ({
      ...prev,
      isComplete: true,
      endTime: Date.now(),
      finalScore,
      skillTier: getSkillTier(finalScore),
    }));
  }, [state, getMaxLevel]);

  // Reset challenge
  const resetChallenge = useCallback(() => {
    setState(initialState);
    setUsedQuestionIds(new Set());
  }, []);

  // Available topics for the subject
  const availableTopics = useMemo(() => {
    return Object.keys(banks[state.subject] || {});
  }, [banks, state.subject]);

  // Get progress percentage
  const progressPercentage = useMemo(() => {
    return (state.totalQuestions / config.maxQuestions) * 100;
  }, [state.totalQuestions, config.maxQuestions]);

  return {
    state,
    config,
    availableTopics,
    progressPercentage,
    startChallenge,
    answerQuestion,
    endChallenge,
    resetChallenge,
    getMaxLevel,
  };
};
