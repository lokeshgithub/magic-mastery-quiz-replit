-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "No direct select on questions" ON public.questions;

-- Create new policy that allows admins to read all questions
CREATE POLICY "Admins can select all questions"
ON public.questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));