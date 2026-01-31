import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initFunElementTracking } from '@/services/funElementTrackingService';
import { initFunElementCache } from '@/data/funElements';
import {
  fetchProfile,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
  hasRole,
  DBProfile,
} from '@/lib/api';

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalStars: number;
  topicsMastered: number;
  questionsAnswered: number;
  currentStreak: number;
  longestStreak: number;
  grade: number;
}

function generateUserId(): string {
  return crypto.randomUUID();
}

function getStoredUser(): { id: string } | null {
  const stored = localStorage.getItem('quiz_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function storeUser(user: { id: string }): void {
  localStorage.setItem('quiz_user', JSON.stringify(user));
}

function dbProfileToProfile(p: DBProfile): Profile {
  return {
    id: p.id,
    userId: p.userId,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    totalStars: p.totalStars,
    topicsMastered: p.topicsMastered,
    questionsAnswered: p.questionsAnswered,
    currentStreak: p.currentStreak,
    longestStreak: p.longestStreak,
    grade: p.grade,
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const isAdminUser = await hasRole(userId, 'admin');
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const data = await fetchProfile(userId);
      if (data) {
        setProfile(dbProfileToProfile(data));
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const createProfile = useCallback(async (userId: string, displayName: string, grade: number = 7) => {
    try {
      const data = await apiCreateProfile({
        userId,
        displayName,
        grade,
      });

      const newProfile = dbProfileToProfile(data);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const updateGrade = useCallback(async (grade: number) => {
    if (!user) return;

    try {
      await apiUpdateProfile(user.id, { grade } as any);
      setProfile(prev => prev ? { ...prev, grade } : null);
      toast({
        title: 'Grade updated!',
        description: `You're now in Class ${grade}`,
      });
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  }, [user, toast]);

  const updateStats = useCallback(async (stats: {
    totalStars?: number;
    topicsMastered?: number;
    questionsAnswered?: number;
    currentStreak?: number;
    longestStreak?: number;
  }) => {
    if (!user) return;

    try {
      await apiUpdateProfile(user.id, stats as any);
      setProfile(prev => prev ? { ...prev, ...stats } : null);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      let storedUser = getStoredUser();
      
      if (!storedUser) {
        const newId = generateUserId();
        storedUser = { id: newId };
        storeUser(storedUser);
      }
      
      setUser(storedUser);
      
      try {
        await loadProfile(storedUser.id);
        await checkAdminRole(storedUser.id);
        await initFunElementTracking(storedUser.id);
        initFunElementCache();
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [loadProfile, checkAdminRole]);

  const signUp = async (email: string, password: string, displayName: string, grade: number = 7) => {
    const newId = generateUserId();
    const newUser = { id: newId };
    storeUser(newUser);
    setUser(newUser);

    localStorage.removeItem('magical-mastery-quiz');
    localStorage.removeItem('quiz-seen-fun-elements');

    await createProfile(newId, displayName, grade);

    toast({
      title: 'Welcome!',
      description: `Account created for Class ${grade}!`,
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    toast({
      title: 'Welcome back!',
      description: 'Signed in successfully!',
    });

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('quiz_user');
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    
    toast({
      title: 'Signed out',
      description: 'See you next time!',
    });
  };

  return {
    user,
    session: user ? { user } : null,
    profile,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    updateStats,
    updateGrade,
    fetchProfile: loadProfile,
    createProfile,
  };
};
