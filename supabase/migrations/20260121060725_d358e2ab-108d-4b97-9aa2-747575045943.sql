-- Create a public view that excludes correct_answer
CREATE VIEW public.questions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  topic_id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  level,
  explanation,
  created_at
FROM public.questions;

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Create a restrictive policy that denies direct SELECT access
CREATE POLICY "No direct select on questions"
ON public.questions
FOR SELECT
USING (false);

-- Keep INSERT policy for admin uploads (we'll secure this next)