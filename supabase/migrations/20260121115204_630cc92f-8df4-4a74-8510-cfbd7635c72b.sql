-- Create a function that returns question counts per topic efficiently
CREATE OR REPLACE FUNCTION public.get_question_summary()
RETURNS TABLE(subject_name text, topic_name text, topic_id uuid, question_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.name AS subject_name,
    t.name AS topic_name,
    t.id AS topic_id,
    COUNT(q.id) AS question_count
  FROM subjects s
  LEFT JOIN topics t ON t.subject_id = s.id
  LEFT JOIN questions q ON q.topic_id = t.id
  GROUP BY s.name, t.name, t.id
  ORDER BY s.name, t.name;
$$;