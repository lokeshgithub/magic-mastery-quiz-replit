-- Create friendships table for managing friend relationships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view their own friendships (both sent and received)
CREATE POLICY "Users can view own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = requester_id AND auth.uid() != addressee_id);

-- Users can update friendships they're part of (accept/decline)
CREATE POLICY "Users can update own friendships"
ON public.friendships
FOR UPDATE
USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- Users can delete friendships they're part of (unfriend)
CREATE POLICY "Users can delete own friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Create friend challenges table for direct challenge invites
CREATE TABLE public.friend_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  room_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable RLS
ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;

-- Users can view challenges they're involved in
CREATE POLICY "Users can view own challenges"
ON public.friend_challenges
FOR SELECT
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Users can create challenges
CREATE POLICY "Users can create challenges"
ON public.friend_challenges
FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

-- Users can update challenges they received
CREATE POLICY "Users can update received challenges"
ON public.friend_challenges
FOR UPDATE
USING (auth.uid() = challenged_id OR auth.uid() = challenger_id);

-- Add trigger for updated_at on friendships
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for friend challenges
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_challenges;

-- Create indexes for faster lookups
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_friend_challenges_challenged ON public.friend_challenges(challenged_id);
CREATE INDEX idx_friend_challenges_status ON public.friend_challenges(status);