-- Create usage_logs table to track all API and edge function usage
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  estimated_cost NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage logs
CREATE POLICY "Admins can view all usage logs"
ON public.usage_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert usage logs (edge functions need this)
CREATE POLICY "Anyone can insert usage logs"
ON public.usage_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_action_type ON public.usage_logs(action_type);