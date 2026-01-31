-- Create a security definer function to get leaderboard data
-- This safely exposes only necessary data for the leaderboard
CREATE OR REPLACE FUNCTION public.get_adaptive_leaderboard(
  p_subject TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  rank BIGINT,
  display_name TEXT,
  avatar_url TEXT,
  skill_score NUMERIC,
  skill_tier TEXT,
  highest_level INTEGER,
  accuracy NUMERIC,
  challenges_completed BIGINT,
  best_result_date TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked_results AS (
    SELECT 
      acr.user_id,
      acr.skill_score,
      acr.skill_tier,
      acr.highest_level_reached,
      ROUND((acr.correct_answers::NUMERIC / NULLIF(acr.total_questions, 0)) * 100, 1) as accuracy,
      acr.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY acr.user_id, acr.subject 
        ORDER BY acr.skill_score DESC, acr.created_at DESC
      ) as rn
    FROM adaptive_challenge_results acr
    WHERE acr.user_id IS NOT NULL
      AND (p_subject IS NULL OR acr.subject = p_subject)
  ),
  best_scores AS (
    SELECT 
      rr.user_id,
      rr.skill_score,
      rr.skill_tier,
      rr.highest_level_reached,
      rr.accuracy,
      rr.created_at,
      COUNT(*) OVER (PARTITION BY rr.user_id) as challenges_completed
    FROM ranked_results rr
    WHERE rr.rn = 1
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY bs.skill_score DESC, bs.created_at ASC)::BIGINT as rank,
    COALESCE(p.display_name, 'Anonymous') as display_name,
    p.avatar_url,
    bs.skill_score,
    bs.skill_tier,
    bs.highest_level_reached as highest_level,
    bs.accuracy,
    bs.challenges_completed,
    bs.created_at as best_result_date
  FROM best_scores bs
  LEFT JOIN profiles p ON p.user_id = bs.user_id
  ORDER BY bs.skill_score DESC, bs.created_at ASC
  LIMIT p_limit;
$$;