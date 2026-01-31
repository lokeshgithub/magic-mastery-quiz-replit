export interface Question {
  id: string;
  level: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  concepts: string[];
  hint?: string; // Custom hint from database, or auto-generated
  // Maps shuffled index to original index: shuffleMap[shuffledIdx] = originalIdx
  // e.g., if shuffleMap = [2, 0, 3, 1], shuffled option 0 was originally option 2
  shuffleMap?: number[];
}

export interface QuestionBank {
  [subject: string]: {
    [topic: string]: Question[];
  };
}

export interface LevelProgress {
  correct: number;
  total: number;
  mastered: boolean;
}

export interface TopicProgress {
  [level: number]: LevelProgress;
}

export interface Progress {
  [topic: string]: TopicProgress;
}

export interface QuestionStatus {
  answeredCorrectly: boolean;
  solutionViewed: boolean;
}

export interface QuestionTracking {
  [questionId: string]: QuestionStatus;
}

// Track time spent on each question
export interface QuestionTiming {
  questionId: string;
  topic: string;
  level: number;
  timeSpentSeconds: number;
  wasCorrect: boolean;
  concepts: string[];
}

// Session performance data for analysis
export interface SessionPerformance {
  questionTimings: QuestionTiming[];
  startTime: number;
  endTime?: number;
}

export interface SessionStats {
  solved: number;
  correct: number;
  streak: number;
  mastered: number;
  stars: number;
  totalCorrect: number; // Lifetime correct answers for milestones
  maxStreak: number; // Best streak ever
}

export interface Milestone {
  type: 'streak' | 'total' | 'mastery';
  value: number;
  message: string;
  emoji: string;
}

export interface Character {
  name: string;
  emoji: string;
  correctMessages: string[];
  incorrectMessages: string[];
  encouragementMessages: string[];
  levelUpMessages: string[];
}

export interface ThemeLevel {
  level: number;
  theme: string;
  characters: Character[];
  bgClass: string;
  accentColor: string;
}

export type Subject = 'math' | 'physics' | 'chemistry';

// Session analysis types
export interface TopicAnalysis {
  topic: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
  isStrength: boolean;
  isWeakness: boolean;
}

export interface SessionAnalysis {
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
  topicAnalyses: TopicAnalysis[];
  strengths: string[];
  weaknesses: string[];
  slowTopics: string[]; // Topics where they took longer
  fastTopics: string[]; // Topics where they were quick
  recommendations?: string; // AI-generated recommendations
}
