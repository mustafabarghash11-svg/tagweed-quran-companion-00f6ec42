-- Add XP and streak columns to quiz_scores
ALTER TABLE public.quiz_scores 
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_played_at DATE;

-- Leaderboard view (public, top 50)
CREATE OR REPLACE VIEW public.quiz_leaderboard AS
SELECT 
  p.full_name,
  SUM(qs.xp) AS total_xp,
  SUM(qs.total_questions) AS total_questions,
  SUM(qs.correct_answers) AS correct_answers,
  CASE WHEN SUM(qs.total_questions) > 0 
    THEN ROUND(SUM(qs.correct_answers)::numeric / SUM(qs.total_questions) * 100) 
    ELSE 0 END AS accuracy
FROM public.quiz_scores qs
JOIN public.profiles p ON p.id = qs.user_id
GROUP BY qs.user_id, p.full_name
ORDER BY total_xp DESC
LIMIT 50;

-- Allow reading leaderboard
GRANT SELECT ON public.quiz_leaderboard TO authenticated, anon;
