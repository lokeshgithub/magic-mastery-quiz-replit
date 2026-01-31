-- Fix 1: Restrict profiles table to authenticated users only
-- The get_adaptive_leaderboard() SECURITY DEFINER function handles public leaderboard access
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Require authentication for adaptive_challenge_results INSERT
-- This prevents data pollution attacks and fake leaderboard entries
DROP POLICY IF EXISTS "Anyone can insert adaptive results" ON public.adaptive_challenge_results;

CREATE POLICY "Authenticated users can insert adaptive results"
ON public.adaptive_challenge_results
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be authenticated and can only insert results for themselves
  auth.uid() IS NOT NULL AND 
  (user_id IS NULL OR user_id = auth.uid())
);

-- Also fix the SELECT policy to remove session_id bypass for better security
DROP POLICY IF EXISTS "Users can view own results" ON public.adaptive_challenge_results;

CREATE POLICY "Authenticated users can view own results"
ON public.adaptive_challenge_results
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);