-- Drop and recreate the questions_public view with security_invoker
DROP VIEW IF EXISTS public.questions_public;

CREATE VIEW public.questions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  topic_id,
  level,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  created_at
FROM public.questions;

-- Note: explanation is intentionally excluded along with correct_answer
-- The view inherits RLS from the base questions table via security_invoker

-- Grant SELECT on the view to both roles
GRANT SELECT ON public.questions_public TO authenticated;
GRANT SELECT ON public.questions_public TO anon;

-- Create a permissive SELECT policy on questions table for the public view access
-- This allows reading question data (but correct_answer is not in the view)
CREATE POLICY "Allow select for public view"
ON public.questions
FOR SELECT
TO authenticated, anon
USING (true);