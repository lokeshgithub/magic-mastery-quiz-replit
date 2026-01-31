import type { Question, Subject } from './quiz';

// Skill rating tiers with rich, meaningful feedback
export interface SkillTier {
  id: string;
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  description: string;
  capabilities: string[];
  encouragement: string;
  colorClass: string;
  glowClass: string;
}

export const SKILL_TIERS: SkillTier[] = [
  {
    id: 'beginner',
    minScore: 0,
    maxScore: 19,
    title: 'Rising Star',
    emoji: '🌱',
    description: 'You\'re building your foundation!',
    capabilities: [
      'You can solve basic conceptual questions',
      'Keep practicing to build stronger fundamentals',
    ],
    encouragement: 'Every expert was once a beginner. Keep practicing, and you\'ll see amazing progress!',
    colorClass: 'from-slate-400 to-slate-500',
    glowClass: 'shadow-slate-400/30',
  },
  {
    id: 'developing',
    minScore: 20,
    maxScore: 39,
    title: 'Promising Learner',
    emoji: '📚',
    description: 'You\'re developing solid skills!',
    capabilities: [
      'You can handle most school-level questions',
      'You understand basic concepts well',
      'Focus on advanced problem-solving techniques',
    ],
    encouragement: 'You\'re making great progress! A little more practice will take you to the next level.',
    colorClass: 'from-blue-400 to-blue-500',
    glowClass: 'shadow-blue-400/30',
  },
  {
    id: 'proficient',
    minScore: 40,
    maxScore: 54,
    title: 'Strong Performer',
    emoji: '⭐',
    description: 'You\'re among the top students in your class!',
    capabilities: [
      'You can easily solve school exam questions',
      'You handle complex problems with confidence',
      'You\'re ready for competitive exam preparation',
    ],
    encouragement: 'Excellent work! You\'re performing above average. Push yourself with harder challenges!',
    colorClass: 'from-emerald-400 to-emerald-500',
    glowClass: 'shadow-emerald-400/30',
  },
  {
    id: 'advanced',
    minScore: 55,
    maxScore: 69,
    title: 'Academic Achiever',
    emoji: '🏆',
    description: 'You\'re in the top 10% of students!',
    capabilities: [
      'You can tackle JEE Mains level questions',
      'Your problem-solving speed is impressive',
      'You understand concepts at a deeper level',
      'You\'re ready to start IIT preparation',
    ],
    encouragement: 'Outstanding! You have what it takes for competitive exams. Keep challenging yourself!',
    colorClass: 'from-amber-400 to-orange-500',
    glowClass: 'shadow-amber-400/30',
  },
  {
    id: 'elite',
    minScore: 70,
    maxScore: 84,
    title: 'IIT-Level Thinker',
    emoji: '🎯',
    description: 'You\'re in the top 5% of students in India!',
    capabilities: [
      'You can solve JEE Advanced level problems',
      'You have already reached IIT-level preparation',
      'You can tackle most competitive exam questions',
      'Your conceptual understanding is exceptional',
    ],
    encouragement: 'Remarkable! You\'re performing at IIT-entrance level. The top institutes are within your reach!',
    colorClass: 'from-purple-500 to-violet-600',
    glowClass: 'shadow-purple-500/30',
  },
  {
    id: 'exceptional',
    minScore: 85,
    maxScore: 94,
    title: 'Olympiad Contender',
    emoji: '🥇',
    description: 'You\'re in the top 1% of students in India!',
    capabilities: [
      'You can crack most questions that appear in Olympiad-level exams',
      'You easily solve IIT-level questions',
      'You think like a scientist or mathematician',
      'Your problem-solving approach is innovative',
    ],
    encouragement: 'Phenomenal! You have the potential to represent India in international Olympiads!',
    colorClass: 'from-rose-500 to-pink-600',
    glowClass: 'shadow-rose-500/30',
  },
  {
    id: 'genius',
    minScore: 95,
    maxScore: 100,
    title: 'Genius Level',
    emoji: '🧠✨',
    description: 'You stand in the top 0.1% of students in India!',
    capabilities: [
      'You can solve the hardest Olympiad problems',
      'You demonstrate exceptional logical reasoning',
      'You approach problems like a research scientist',
      'International medals are within your reach',
      'You\'re ready for IMO, IPhO, or IChO level challenges',
    ],
    encouragement: 'Extraordinary! You have a truly exceptional mind. The world\'s top universities would love to have you!',
    colorClass: 'from-yellow-400 via-amber-500 to-orange-500',
    glowClass: 'shadow-yellow-400/50',
  },
];

export interface AdaptiveState {
  isActive: boolean;
  currentQuestion: Question | null;
  questionHistory: AdaptiveQuestionResult[];
  currentLevel: number;
  highestLevelReached: number;
  questionsAtCurrentLevel: number;
  correctAtCurrentLevel: number;
  totalQuestions: number;
  totalCorrect: number;
  startTime: number;
  endTime?: number;
  subject: Subject;
  selectedTopics: string[];
  isComplete: boolean;
  finalScore: number;
  skillTier: SkillTier | null;
}

export interface AdaptiveQuestionResult {
  question: Question;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  levelAtTime: number;
  topicName: string; // Track which topic this question came from
}

// Topic performance analysis
export interface TopicPerformance {
  topicName: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  highestLevel: number;
  lowestLevel: number;
  isStrength: boolean;
  isWeakness: boolean;
}

// Recommendations based on performance
export interface StudyRecommendation {
  type: 'weakness' | 'slow' | 'improvement' | 'strength';
  topic: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  actionItems: string[];
}

export interface AdaptiveConfig {
  questionsToAdvance: number; // Correct answers needed to go up a level
  questionsToStay: number; // Max wrong before stopping at a level
  minQuestionsPerLevel: number;
  maxQuestions: number; // Maximum total questions
  startLevel: number;
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  questionsToAdvance: 3, // 3 correct to advance
  questionsToStay: 2, // 2 wrong at a level triggers level down or stop
  minQuestionsPerLevel: 3,
  maxQuestions: 20, // Assessment mode: fixed 20 questions
  startLevel: 3, // Start at middle level
};

// Estimated percentile ranges based on score (for when DB data is insufficient)
export const SCORE_PERCENTILE_MAP: { minScore: number; maxScore: number; percentile: number; message: string }[] = [
  { minScore: 95, maxScore: 100, percentile: 99, message: 'You\'re in the top 1% of students in India!' },
  { minScore: 85, maxScore: 94, percentile: 95, message: 'You\'re in the top 5% of students!' },
  { minScore: 70, maxScore: 84, percentile: 90, message: 'You\'re in the top 10% of students!' },
  { minScore: 55, maxScore: 69, percentile: 75, message: 'You\'re in the top 25% of students!' },
  { minScore: 40, maxScore: 54, percentile: 50, message: 'You\'re performing above average!' },
  { minScore: 20, maxScore: 39, percentile: 30, message: 'You\'re building a strong foundation!' },
  { minScore: 0, maxScore: 19, percentile: 15, message: 'Keep practicing to improve your ranking!' },
];

export function getEstimatedPercentile(score: number): { percentile: number; message: string } {
  const range = SCORE_PERCENTILE_MAP.find(r => score >= r.minScore && score <= r.maxScore);
  return range || { percentile: 15, message: 'Keep practicing to improve your ranking!' };
}

// Calculate skill score based on adaptive performance
export function calculateSkillScore(
  highestLevel: number,
  maxLevel: number,
  totalCorrect: number,
  totalQuestions: number,
  avgTimePerQuestion: number
): number {
  if (totalQuestions === 0) return 0;
  
  // Base score from highest level reached (0-60 points)
  const levelScore = (highestLevel / maxLevel) * 60;
  
  // Accuracy bonus (0-25 points)
  const accuracy = totalCorrect / totalQuestions;
  const accuracyScore = accuracy * 25;
  
  // Speed bonus (0-15 points) - faster = more points
  // Assume 30s is slow, 10s is fast
  const speedScore = Math.max(0, Math.min(15, (30 - avgTimePerQuestion) / 20 * 15));
  
  return Math.min(100, Math.round(levelScore + accuracyScore + speedScore));
}

export function getSkillTier(score: number): SkillTier {
  const tier = SKILL_TIERS.find(t => score >= t.minScore && score <= t.maxScore);
  return tier || SKILL_TIERS[0];
}

// Analyze topic performance from question history
export function analyzeTopicPerformance(questionHistory: AdaptiveQuestionResult[]): TopicPerformance[] {
  const topicMap = new Map<string, {
    attempts: number;
    correct: number;
    totalTime: number;
    levels: number[];
  }>();

  for (const result of questionHistory) {
    const existing = topicMap.get(result.topicName) || {
      attempts: 0,
      correct: 0,
      totalTime: 0,
      levels: [],
    };
    
    existing.attempts++;
    if (result.isCorrect) existing.correct++;
    existing.totalTime += result.timeSpent;
    existing.levels.push(result.levelAtTime);
    
    topicMap.set(result.topicName, existing);
  }

  const performances: TopicPerformance[] = [];
  const overallAccuracy = questionHistory.length > 0 
    ? questionHistory.filter(r => r.isCorrect).length / questionHistory.length 
    : 0;
  const overallAvgTime = questionHistory.length > 0
    ? questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / questionHistory.length
    : 0;

  for (const [topicName, data] of topicMap) {
    const accuracy = data.attempts > 0 ? data.correct / data.attempts : 0;
    const avgTime = data.attempts > 0 ? data.totalTime / data.attempts : 0;
    
    performances.push({
      topicName,
      questionsAttempted: data.attempts,
      correctAnswers: data.correct,
      accuracy: Math.round(accuracy * 100),
      averageTime: Math.round(avgTime),
      highestLevel: Math.max(...data.levels),
      lowestLevel: Math.min(...data.levels),
      isStrength: accuracy >= overallAccuracy + 0.15 && data.attempts >= 2,
      isWeakness: accuracy < overallAccuracy - 0.15 && data.attempts >= 2,
    });
  }

  // Sort by accuracy (weakest first)
  return performances.sort((a, b) => a.accuracy - b.accuracy);
}

// Generate study recommendations based on performance
export function generateRecommendations(
  performances: TopicPerformance[],
  questionHistory: AdaptiveQuestionResult[]
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];
  
  const overallAvgTime = questionHistory.length > 0
    ? questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / questionHistory.length
    : 0;

  // Find weaknesses (accuracy < 50% or significantly below average)
  const weakTopics = performances.filter(p => p.isWeakness || p.accuracy < 50);
  for (const topic of weakTopics.slice(0, 2)) {
    recommendations.push({
      type: 'weakness',
      topic: topic.topicName,
      message: `You struggled with ${topic.topicName} (${topic.accuracy}% accuracy)`,
      priority: topic.accuracy < 40 ? 'high' : 'medium',
      icon: '📚',
      actionItems: [
        `Review the fundamentals of ${topic.topicName}`,
        'Practice Level 1-2 questions before attempting harder ones',
        'Focus on understanding concepts rather than memorizing solutions',
        'Consider watching video explanations for this topic',
      ],
    });
  }

  // Find slow topics (significantly slower than average)
  const slowTopics = performances.filter(p => 
    p.averageTime > overallAvgTime * 1.5 && 
    p.questionsAttempted >= 2 &&
    !weakTopics.includes(p)
  );
  for (const topic of slowTopics.slice(0, 1)) {
    recommendations.push({
      type: 'slow',
      topic: topic.topicName,
      message: `You\'re taking extra time on ${topic.topicName} (${topic.averageTime}s avg)`,
      priority: 'medium',
      icon: '⏱️',
      actionItems: [
        'Practice more problems to build speed and confidence',
        'Learn shortcuts and quick solving techniques',
        'Time yourself during practice sessions',
      ],
    });
  }

  // Find strengths
  const strongTopics = performances.filter(p => p.isStrength || p.accuracy >= 80);
  for (const topic of strongTopics.slice(0, 1)) {
    recommendations.push({
      type: 'strength',
      topic: topic.topicName,
      message: `Excellent work on ${topic.topicName}! (${topic.accuracy}% accuracy)`,
      priority: 'low',
      icon: '🌟',
      actionItems: [
        'Challenge yourself with even harder problems',
        `Try Level ${topic.highestLevel + 1} questions in this topic`,
        'Help others learn this topic to reinforce your knowledge',
      ],
    });
  }

  // If all topics have room for improvement
  if (recommendations.length === 0 && performances.length > 0) {
    const lowestTopic = performances[0];
    recommendations.push({
      type: 'improvement',
      topic: lowestTopic.topicName,
      message: `Focus on improving ${lowestTopic.topicName} first`,
      priority: 'medium',
      icon: '🎯',
      actionItems: [
        'Start with basic concepts and build up',
        'Practice consistently, even 10 minutes daily helps',
        'Review mistakes to understand where you went wrong',
      ],
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
