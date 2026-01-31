-- Create table to track seen fun elements for logged-in users
CREATE TABLE public.seen_fun_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  element_id TEXT NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, element_id)
);

-- Create index for fast lookups by user
CREATE INDEX idx_seen_fun_elements_user_id ON public.seen_fun_elements(user_id);

-- Enable Row Level Security
ALTER TABLE public.seen_fun_elements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own seen elements
CREATE POLICY "Users can view their own seen elements" 
ON public.seen_fun_elements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own seen elements
CREATE POLICY "Users can insert their own seen elements" 
ON public.seen_fun_elements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own seen elements (for reset functionality)
CREATE POLICY "Users can delete their own seen elements" 
ON public.seen_fun_elements 
FOR DELETE 
USING (auth.uid() = user_id);