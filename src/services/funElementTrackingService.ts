import { fetchSeenFunElements, markFunElementSeen } from '@/lib/api';

const LOCAL_STORAGE_KEY = 'quiz_seen_fun_elements';

let cachedSeenElements: Set<string> | null = null;
let currentUserId: string | null = null;

export const initFunElementTracking = async (userId: string | null): Promise<void> => {
  currentUserId = userId;
  cachedSeenElements = null;
  
  if (userId) {
    await getSeenElements();
  }
};

export const getSeenElements = async (): Promise<Set<string>> => {
  if (cachedSeenElements !== null) {
    return cachedSeenElements;
  }

  if (currentUserId) {
    try {
      const elements = await fetchSeenFunElements(currentUserId);
      cachedSeenElements = new Set(elements);
    } catch (e) {
      console.error('Error fetching seen elements:', e);
      cachedSeenElements = new Set();
    }
  } else {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      cachedSeenElements = stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      cachedSeenElements = new Set();
    }
  }

  return cachedSeenElements;
};

export const markElementSeen = async (elementId: string): Promise<void> => {
  if (!cachedSeenElements) {
    cachedSeenElements = new Set();
  }
  cachedSeenElements.add(elementId);

  if (currentUserId) {
    try {
      await markFunElementSeen(currentUserId, elementId);
    } catch (e) {
      console.error('Error saving seen element:', e);
    }
  } else {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...cachedSeenElements]));
    } catch {
    }
  }
};

export const resetSeenElements = async (levelElementIds?: string[]): Promise<void> => {
  if (currentUserId) {
    console.log('Resetting seen elements for user');
  } else {
    try {
      if (levelElementIds && levelElementIds.length > 0) {
        const remaining = [...(cachedSeenElements || [])].filter(
          id => !levelElementIds.includes(id)
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
    }
  }

  if (levelElementIds && levelElementIds.length > 0) {
    levelElementIds.forEach(id => cachedSeenElements?.delete(id));
  } else {
    cachedSeenElements = new Set();
  }
};

export const getUnseenCount = async (allElementIds: string[]): Promise<number> => {
  const seen = await getSeenElements();
  return allElementIds.filter(id => !seen.has(id)).length;
};
