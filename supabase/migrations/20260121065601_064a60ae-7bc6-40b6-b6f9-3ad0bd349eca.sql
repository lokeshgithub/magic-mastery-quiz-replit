-- Remove the overly permissive policy that exposes correct_answer
DROP POLICY IF EXISTS "Allow select for public view" ON public.questions;

-- The questions table should only have restrictive policies:
-- - "No direct select on questions" (USING false) blocks direct access
-- - Admins can manage via their admin policies
-- - The validate-answer edge function uses service role key to bypass RLS

-- For the public view, since it uses security_invoker=on, it inherits 
-- the base table's RLS. We need a policy that allows SELECT but only 
-- through the view (which excludes correct_answer).

-- Create a policy that allows reading only the columns exposed in the view
-- Since RLS can't restrict columns, we rely on the view definition + edge function
-- The view excludes correct_answer, so we can allow select on questions
-- BUT this would expose correct_answer if queried directly

-- Better approach: Keep the restrictive policy on questions table
-- The edge function uses service_role which bypasses RLS
-- The public view needs its own mechanism

-- Since questions_public is a view, we can't add RLS to it directly
-- Instead, we create a function that returns question data safely

-- Actually, the cleanest solution is:
-- 1. Keep questions table locked down (only service role/admin can read)
-- 2. Create a security definer function to fetch public question data

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
  explanation text,
  created_at timestamptz
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
    explanation,
    created_at
  FROM public.questions;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION public.get_public_questions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_questions() TO anon;