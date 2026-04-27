CREATE OR REPLACE VIEW view_oscar_winners AS
SELECT *
FROM public.movies
WHERE is_oscar_winner = true;
