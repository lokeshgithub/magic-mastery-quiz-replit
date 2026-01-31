import type { Subject } from '@/types/quiz';
import { fetchPracticeSchedules, upsertPracticeSchedule } from '@/lib/api';

export interface PracticeSchedule {
  id: string;
  userId: string;
  topicName: string;
  subject: Subject;
  nextPracticeDate: string;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lastPracticed: string | null;
  lastPerformance: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DueTopic {
  topicName: string;
  subject: Subject;
  dueDate: string;
  intervalDays: number;
  reviewCount: number;
  isOverdue: boolean;
  daysOverdue: number;
  urgency: 'high' | 'medium' | 'low';
}

const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL = 1;
const SECOND_INTERVAL = 6;

export function calculateNextReview(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number,
  reviewCount: number
): { intervalDays: number; easeFactor: number; reviewCount: number } {
  const q = Math.max(0, Math.min(5, quality));
  
  let newEaseFactor = previousEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);
  
  let newInterval: number;
  let newReviewCount = reviewCount;
  
  if (q < 3) {
    newInterval = INITIAL_INTERVAL;
    newReviewCount = 0;
  } else {
    newReviewCount = reviewCount + 1;
    
    if (newReviewCount === 1) {
      newInterval = INITIAL_INTERVAL;
    } else if (newReviewCount === 2) {
      newInterval = SECOND_INTERVAL;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
  }
  
  return {
    intervalDays: newInterval,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    reviewCount: newReviewCount,
  };
}

export function accuracyToQuality(accuracy: number): number {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 4;
  if (accuracy >= 70) return 3;
  if (accuracy >= 50) return 2;
  if (accuracy >= 30) return 1;
  return 0;
}

export async function getDueTopics(
  userId: string,
  subject?: Subject
): Promise<{ data: DueTopic[] | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: 'Not authenticated' };
    }

    const schedules = await fetchPracticeSchedules(userId);
    
    const now = new Date();
    const filteredSchedules = subject 
      ? schedules.filter(s => s.subject === subject)
      : schedules;
    
    const dueTopics: DueTopic[] = filteredSchedules
      .filter(s => new Date(s.nextPracticeDate) <= now)
      .map(schedule => {
        const dueDate = new Date(schedule.nextPracticeDate);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let urgency: 'high' | 'medium' | 'low' = 'low';
        if (daysOverdue >= 7) urgency = 'high';
        else if (daysOverdue >= 3) urgency = 'medium';
        
        return {
          topicName: schedule.topicName,
          subject: schedule.subject as Subject,
          dueDate: schedule.nextPracticeDate,
          intervalDays: schedule.intervalDays,
          reviewCount: schedule.reviewCount,
          isOverdue: daysOverdue > 0,
          daysOverdue: Math.max(0, daysOverdue),
          urgency,
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return { data: dueTopics, error: null };
  } catch (err) {
    console.error('Error fetching due topics:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function getAllSchedules(
  userId: string,
  subject?: Subject
): Promise<{ data: PracticeSchedule[] | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: 'Not authenticated' };
    }

    const schedules = await fetchPracticeSchedules(userId);
    
    const filteredSchedules = subject 
      ? schedules.filter(s => s.subject === subject)
      : schedules;
    
    const mapped = filteredSchedules.map(s => ({
      id: s.id,
      userId: s.userId,
      topicName: s.topicName,
      subject: s.subject as Subject,
      nextPracticeDate: s.nextPracticeDate,
      intervalDays: s.intervalDays,
      easeFactor: parseFloat(s.easeFactor),
      reviewCount: s.reviewCount,
      lastPracticed: s.lastPracticed,
      lastPerformance: s.lastPerformance,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    console.error('Error fetching schedules:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function updatePracticeSchedule(
  userId: string,
  topicName: string,
  subject: Subject,
  accuracy: number
): Promise<{ success: boolean; error?: string; nextDate?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const quality = accuracyToQuality(accuracy);
    
    const schedules = await fetchPracticeSchedules(userId);
    const existing = schedules.find(
      s => s.topicName === topicName && s.subject === subject
    );

    const now = new Date();
    
    if (existing) {
      const { intervalDays, easeFactor, reviewCount } = calculateNextReview(
        quality,
        existing.intervalDays,
        parseFloat(existing.easeFactor),
        existing.reviewCount
      );
      
      const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      
      await upsertPracticeSchedule({
        userId,
        topicName,
        subject,
        nextPracticeDate: nextDate.toISOString(),
        intervalDays,
        easeFactor: String(easeFactor),
        reviewCount,
        lastPracticed: now.toISOString(),
        lastPerformance: quality,
      });

      return { success: true, nextDate: nextDate.toISOString() };
    } else {
      const { intervalDays, easeFactor, reviewCount } = calculateNextReview(
        quality,
        INITIAL_INTERVAL,
        2.5,
        0
      );
      
      const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      
      await upsertPracticeSchedule({
        userId,
        topicName,
        subject,
        nextPracticeDate: nextDate.toISOString(),
        intervalDays,
        easeFactor: String(easeFactor),
        reviewCount,
        lastPracticed: now.toISOString(),
        lastPerformance: quality,
      });

      return { success: true, nextDate: nextDate.toISOString() };
    }
  } catch (err) {
    console.error('Error updating practice schedule:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function initializeFromWeakTopics(
  userId: string,
  weakTopics: Array<{ topicName: string; subject: Subject; accuracy: number }>
): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    if (!userId) {
      return { success: false, error: 'Not authenticated', count: 0 };
    }

    let count = 0;
    
    for (const topic of weakTopics) {
      const result = await updatePracticeSchedule(userId, topic.topicName, topic.subject, topic.accuracy);
      if (result.success) count++;
    }

    return { success: true, count };
  } catch (err) {
    console.error('Error initializing schedules:', err);
    return { success: false, error: 'An unexpected error occurred', count: 0 };
  }
}

export async function getDueTopicsCount(userId: string): Promise<number> {
  try {
    if (!userId) return 0;

    const schedules = await fetchPracticeSchedules(userId);
    const now = new Date();
    
    return schedules.filter(s => new Date(s.nextPracticeDate) <= now).length;
  } catch {
    return 0;
  }
}
