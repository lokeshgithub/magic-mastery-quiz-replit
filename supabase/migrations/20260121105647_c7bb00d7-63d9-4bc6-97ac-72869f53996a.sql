-- Fix usage_logs RLS policy to prevent log poisoning attacks
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert usage logs" ON public.usage_logs;

-- Create a new policy that allows inserts from edge functions (service role) 
-- or authenticated users who can only set their own user_id
CREATE POLICY "Service role or authenticated users can insert usage logs"
ON public.usage_logs
FOR INSERT
WITH CHECK (
  -- Service role bypasses RLS, so this covers edge function inserts
  -- For authenticated users, they can only insert logs for themselves
  (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  OR
  -- Allow anon inserts only when user_id is null (for unauthenticated tracking)
  (auth.uid() IS NULL AND user_id IS NULL)
);