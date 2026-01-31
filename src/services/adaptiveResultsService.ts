import type { AdaptiveState, TopicPerformance } from '@/types/adaptiveChallenge';
import { analyzeTopicPerformance } from '@/types/adaptiveChallenge';
import type { Subject } from '@/types/quiz';
import {
  createAdaptiveResult,
  fetchAdaptiveResults,
  fetchLeaderboard,
  fetchProfile,
  DBAdaptiveResult,
} from '@/lib/api';

interface SaveResultParams {
  state: AdaptiveState;
  maxLevel: number;
  sessionId?: string;
  userId?: string;
}

export async function saveAdaptiveChallengeResult({
  state,
  maxLevel,
  sessionId,
  userId,
}: SaveResultParams): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const duration = state.endTime ? Math.round((state.endTime - state.startTime) / 1000) : 0;
    const avgTime = state.questionHistory.length > 0
      ? state.questionHistory.reduce((sum, r) => sum + r.timeSpent, 0) / state.questionHistory.length
      : 0;
    
    const topicPerformances = analyzeTopicPerformance(state.questionHistory);
    
    const questionResults = state.questionHistory.map(q => ({
      questionId: q.question.id,
      topicName: q.topicName,
      level: q.levelAtTime,
      isCorrect: q.isCorrect,
      timeSpent: Math.round(q.timeSpent * 100) / 100,
    }));
    
    const topicPerformanceData = topicPerformances.map((tp: TopicPerformance) => ({
      topicName: tp.topicName,
      questionsAttempted: tp.questionsAttempted,
      correctAnswers: tp.correctAnswers,
      accuracy: tp.accuracy,
      averageTime: tp.averageTime,
      highestLevel: tp.highestLevel,
      lowestLevel: tp.lowestLevel,
      isStrength: tp.isStrength,
      isWeakness: tp.isWeakness,
    }));

    const result = await createAdaptiveResult({
      userId: userId || null,
      sessionId: sessionId || null,
      subject: state.subject,
      topics: state.selectedTopics.length > 0 ? state.selectedTopics : ['All Topics'],
      totalQuestions: state.totalQuestions,
      correctAnswers: state.totalCorrect,
      skillScore: String(state.finalScore),
      skillTier: state.skillTier?.id || 'unknown',
      highestLevelReached: state.highestLevelReached,
      averageTimePerQuestion: String(Math.round(avgTime * 100) / 100),
      durationSeconds: duration,
      topicPerformance: topicPerformanceData,
      questionResults: questionResults,
    });

    return { success: true, id: result.id };
  } catch (err) {
    console.error('Unexpected error saving adaptive challenge result:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getUserAdaptiveResults(userId: string, limit = 10): Promise<{
  data: DBAdaptiveResult[] | null;
  error: string | null;
}> {
  try {
    if (!userId) {
      return { data: null, error: 'Not authenticated' };
    }

    const data = await fetchAdaptiveResults(userId);
    return { data: data.slice(0, limit), error: null };
  } catch (err) {
    console.error('Error fetching adaptive results:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function calculatePercentile(
  subject: string,
  skillScore: number
): Promise<{ percentile: number | null; totalResults: number }> {
  return { percentile: null, totalResults: 0 };
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  skillScore: number;
  skillTier: string;
  highestLevel: number;
  accuracy: number;
  challengesCompleted: number;
  bestResultDate: string;
}

export async function getAdaptiveLeaderboard(
  subject?: string,
  limit: number = 50
): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
  try {
    const data = await fetchLeaderboard(subject, limit);
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export interface UserRankInfo {
  rank: number;
  totalParticipants: number;
  skillScore: number;
  skillTier: string;
  highestLevel: number;
  accuracy: number;
  challengesCompleted: number;
}

export async function getUserRank(
  userId: string,
  subject?: string
): Promise<{ data: UserRankInfo | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: 'Not authenticated' };
    }

    const leaderboard = await fetchLeaderboard(subject, 1000);
    const profile = await fetchProfile(userId);

    if (!profile) {
      return { data: null, error: null };
    }

    const userEntry = leaderboard.find(
      (entry) => entry.displayName === profile.displayName
    );

    if (!userEntry) {
      return { data: null, error: null };
    }

    return {
      data: {
        rank: userEntry.rank,
        totalParticipants: leaderboard.length,
        skillScore: userEntry.skillScore,
        skillTier: userEntry.skillTier,
        highestLevel: userEntry.highestLevel,
        accuracy: userEntry.accuracy,
        challengesCompleted: userEntry.challengesCompleted,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error fetching user rank:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export interface WeakTopic {
  topicName: string;
  subject: Subject;
  accuracy: number;
  questionsAttempted: number;
  highestLevel: number;
  averageTime: number;
  lastPracticed: string;
  improvementNeeded: 'high' | 'medium' | 'low';
}

export async function getWeakTopics(
  userId: string,
  subject?: Subject
): Promise<{ data: WeakTopic[] | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: 'Not authenticated' };
    }

    const results = await fetchAdaptiveResults(userId);

    if (!results || results.length === 0) {
      return { data: [], error: null };
    }

    const filtered = subject 
      ? results.filter(r => r.subject === subject)
      : results;

    const topicAggregates = new Map<string, {
      subject: Subject;
      totalAttempts: number;
      totalCorrect: number;
      totalTime: number;
      levels: number[];
      lastPracticed: string;
    }>();

    for (const result of filtered.slice(0, 20)) {
      const performances = (result.topicPerformance || []) as TopicPerformance[];
      const resultSubject = result.subject as Subject;
      
      for (const perf of performances) {
        const key = `${resultSubject}::${perf.topicName}`;
        const existing = topicAggregates.get(key) || {
          subject: resultSubject,
          totalAttempts: 0,
          totalCorrect: 0,
          totalTime: 0,
          levels: [],
          lastPracticed: result.createdAt,
        };
        
        existing.totalAttempts += perf.questionsAttempted;
        existing.totalCorrect += perf.correctAnswers;
        existing.totalTime += perf.averageTime * perf.questionsAttempted;
        existing.levels.push(perf.highestLevel);
        
        if (result.createdAt > existing.lastPracticed) {
          existing.lastPracticed = result.createdAt;
        }
        
        topicAggregates.set(key, existing);
      }
    }

    const weakTopics: WeakTopic[] = [];
    
    for (const [key, data] of topicAggregates) {
      const topicName = key.split('::')[1];
      const accuracy = data.totalAttempts > 0 
        ? Math.round((data.totalCorrect / data.totalAttempts) * 100)
        : 0;
      
      if (accuracy < 70 || data.totalAttempts >= 3) {
        let improvementNeeded: 'high' | 'medium' | 'low' = 'low';
        if (accuracy < 40) improvementNeeded = 'high';
        else if (accuracy < 60) improvementNeeded = 'medium';
        
        weakTopics.push({
          topicName,
          subject: data.subject,
          accuracy,
          questionsAttempted: data.totalAttempts,
          highestLevel: Math.max(...data.levels),
          averageTime: data.totalAttempts > 0 
            ? Math.round(data.totalTime / data.totalAttempts)
            : 0,
          lastPracticed: data.lastPracticed,
          improvementNeeded,
        });
      }
    }

    weakTopics.sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.questionsAttempted - a.questionsAttempted;
    });

    return { data: weakTopics, error: null };
  } catch (err) {
    console.error('Error fetching weak topics:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
