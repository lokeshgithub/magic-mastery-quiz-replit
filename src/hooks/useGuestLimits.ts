import { useState, useEffect, useCallback } from 'react';

const GUEST_TOPIC_LIMIT = 2;
const SESSION_KEY = 'guest-topics-used';

interface GuestLimits {
  topicsUsed: string[];
  canAccessTopic: (topicName: string) => boolean;
  recordTopicAccess: (topicName: string) => void;
  remainingTopics: number;
  isLimitReached: boolean;
  resetSession: () => void;
}

export const useGuestLimits = (isLoggedIn: boolean): GuestLimits => {
  const [topicsUsed, setTopicsUsed] = useState<string[]>([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (!isLoggedIn) {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        setTopicsUsed(JSON.parse(stored));
      }
    }
  }, [isLoggedIn]);

  // Save to sessionStorage when topics change
  useEffect(() => {
    if (!isLoggedIn && topicsUsed.length > 0) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(topicsUsed));
    }
  }, [topicsUsed, isLoggedIn]);

  const canAccessTopic = useCallback((topicName: string): boolean => {
    // Logged in users have unlimited access
    if (isLoggedIn) return true;
    
    // Guest can access topics they've already started
    if (topicsUsed.includes(topicName)) return true;
    
    // Guest can access new topics if under limit
    return topicsUsed.length < GUEST_TOPIC_LIMIT;
  }, [isLoggedIn, topicsUsed]);

  const recordTopicAccess = useCallback((topicName: string) => {
    if (isLoggedIn) return;
    
    setTopicsUsed(prev => {
      if (prev.includes(topicName)) return prev;
      return [...prev, topicName];
    });
  }, [isLoggedIn]);

  const resetSession = useCallback(() => {
    setTopicsUsed([]);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const remainingTopics = isLoggedIn ? Infinity : Math.max(0, GUEST_TOPIC_LIMIT - topicsUsed.length);
  const isLimitReached = !isLoggedIn && topicsUsed.length >= GUEST_TOPIC_LIMIT;

  return {
    topicsUsed,
    canAccessTopic,
    recordTopicAccess,
    remainingTopics,
    isLimitReached,
    resetSession,
  };
};

export const GUEST_TOPIC_LIMIT_COUNT = GUEST_TOPIC_LIMIT;
