-- Create table for quiz battles
CREATE TABLE public.quiz_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_id TEXT NOT NULL,
  guest_id TEXT,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  host_score INTEGER NOT NULL DEFAULT 0,
  guest_score INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 5,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.quiz_battles ENABLE ROW LEVEL SECURITY;

-- Anyone can view battles (needed for joining)
CREATE POLICY "Anyone can view battles"
ON public.quiz_battles
FOR SELECT
USING (true);

-- Anyone can create battles (no auth required for casual play)
CREATE POLICY "Anyone can create battles"
ON public.quiz_battles
FOR INSERT
WITH CHECK (true);

-- Anyone can update battles they're part of
CREATE POLICY "Participants can update battles"
ON public.quiz_battles
FOR UPDATE
USING (true);

-- Enable realtime for battles
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battles;

-- Add index for room code lookup
CREATE INDEX idx_battles_room_code ON public.quiz_battles(room_code);
CREATE INDEX idx_battles_status ON public.quiz_battles(status);