-- Add hint column to questions table (if not already added)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS hint text;

-- Drop the existing function to allow return type change
DROP FUNCTION IF EXISTS public.get_public_questions();

-- Recreate the RPC with hint column included
CREATE FUNCTION public.get_public_questions()
RETURNS TABLE(
  id uuid, 
  topic_id uuid, 
  level integer, 
  question text, 
  option_a text, 
  option_b text, 
  option_c text, 
  option_d text, 
  correct_answer text, 
  explanation text,
  hint text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    topic_id,
    level,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
    hint,
    created_at
  FROM public.questions;
$$;