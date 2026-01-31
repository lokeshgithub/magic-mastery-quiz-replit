-- Add grade column to profiles table for class/grade selection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS grade integer DEFAULT 7 CHECK (grade >= 1 AND grade <= 12);

-- Add index for grade-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON public.profiles(grade);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.grade IS 'Student grade/class level (1-12), defaults to 7';