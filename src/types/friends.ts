export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_stars: number;
  topics_mastered: number;
  current_streak: number;
  grade: number | null;
}

export interface FriendWithProfile extends Friendship {
  friend: FriendProfile;
}

export interface FriendChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  subject: string;
  topic: string;
  room_code: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  challenger?: FriendProfile;
}

export interface SearchResult {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_stars: number;
  grade: number | null;
  friendship_status?: 'pending' | 'accepted' | 'none' | 'incoming';
}
