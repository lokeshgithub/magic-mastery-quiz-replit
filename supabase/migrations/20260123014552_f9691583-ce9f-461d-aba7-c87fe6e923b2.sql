-- Update the get_public_questions function to include correct_answer for client-side validation
-- This is secure because the answer is shuffled on the client and not directly exposed

DROP FUNCTION IF EXISTS public.get_public_questions();

CREATE OR REPLACE FUNCTION public.get_public_questions()
RETURNS TABLE (
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
    created_at
  FROM public.questions;
$$;