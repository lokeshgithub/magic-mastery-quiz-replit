-- Create practice schedule table for spaced repetition
CREATE TABLE public.practice_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  next_practice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  review_count INTEGER NOT NULL DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  last_performance INTEGER, -- 0-5 rating (0=complete fail, 5=perfect)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_name, subject)
);

-- Enable RLS
ALTER TABLE public.practice_schedules ENABLE ROW LEVEL SECURITY;

-- Users can view their own schedules
CREATE POLICY "Users can view own schedules"
ON public.practice_schedules
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own schedules
CREATE POLICY "Users can insert own schedules"
ON public.practice_schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY "Users can update own schedules"
ON public.practice_schedules
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY "Users can delete own schedules"
ON public.practice_schedules
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_practice_schedules_updated_at
BEFORE UPDATE ON public.practice_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying of due topics
CREATE INDEX idx_practice_schedules_user_due ON public.practice_schedules(user_id, next_practice_date);
CREATE INDEX idx_practice_schedules_subject ON public.practice_schedules(user_id, subject);