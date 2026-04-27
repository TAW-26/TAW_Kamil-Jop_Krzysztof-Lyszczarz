CREATE OR REPLACE VIEW view_top_rotten_tomatoes AS
SELECT *
FROM public.movies
WHERE rotten_tomatoes_score > 90;
