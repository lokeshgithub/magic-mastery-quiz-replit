import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FriendWithProfile, FriendChallenge, SearchResult } from '@/types/friends';
import { toast } from 'sonner';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<FriendChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriendships = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/friends/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch friendships');
      
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pending || []);
      setSentRequests(data.sent || []);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchIncomingChallenges = useCallback(async () => {
    if (!user?.id) return;
    setIncomingChallenges([]);
  }, [user?.id]);

  const searchUsers = async (query: string): Promise<SearchResult[]> => {
    if (!user?.id || query.length < 2) return [];
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&userId=${user.id}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user?.id) return false;

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: user.id, addresseeId }),
      });

      if (!response.ok) throw new Error('Failed to send request');
      
      toast.success('Friend request sent!');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      });

      if (!response.ok) throw new Error('Failed to respond to request');
      
      toast.success(accept ? 'Friend added!' : 'Request declined');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove friend');
      
      toast.success('Friend removed');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      return false;
    }
  };

  const sendChallenge = async (_friendId: string, _subject: string, _topic: string) => {
    toast.info('Challenge feature is coming soon!');
    return false;
  };

  const respondToChallenge = async (_challengeId: string, _accept: boolean) => {
    toast.info('Challenge feature is coming soon!');
    return false;
  };

  useEffect(() => {
    fetchFriendships();
    fetchIncomingChallenges();
  }, [fetchFriendships, fetchIncomingChallenges]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    incomingChallenges,
    loading,
    searchUsers,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    sendChallenge,
    respondToChallenge,
    refreshFriends: fetchFriendships,
  };
};
