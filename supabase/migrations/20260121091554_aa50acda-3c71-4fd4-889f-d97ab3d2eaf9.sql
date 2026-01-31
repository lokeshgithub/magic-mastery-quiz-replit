-- Create table for storing adaptive challenge results
CREATE TABLE public.adaptive_challenge_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  subject TEXT NOT NULL,
  topics TEXT[] NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  skill_score NUMERIC NOT NULL,
  skill_tier TEXT NOT NULL,
  highest_level_reached INTEGER NOT NULL,
  average_time_per_question NUMERIC NOT NULL,
  duration_seconds INTEGER NOT NULL,
  topic_performance JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adaptive_challenge_results ENABLE ROW LEVEL SECURITY;

-- Anyone can insert results (for guests and authenticated users)
CREATE POLICY "Anyone can insert adaptive results"
ON public.adaptive_challenge_results
FOR INSERT
WITH CHECK (true);

-- Users can view their own results
CREATE POLICY "Users can view own results"
ON public.adaptive_challenge_results
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Admins can view all results for analytics
CREATE POLICY "Admins can view all results"
ON public.adaptive_challenge_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_adaptive_results_user_id ON public.adaptive_challenge_results(user_id);
CREATE INDEX idx_adaptive_results_subject ON public.adaptive_challenge_results(subject);
CREATE INDEX idx_adaptive_results_skill_score ON public.adaptive_challenge_results(skill_score);
CREATE INDEX idx_adaptive_results_created_at ON public.adaptive_challenge_results(created_at DESC);