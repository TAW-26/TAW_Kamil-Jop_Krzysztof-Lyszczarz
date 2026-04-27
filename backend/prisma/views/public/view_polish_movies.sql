CREATE OR REPLACE VIEW view_polish_movies AS
SELECT
  tmdb_id,
  imdb_id,
  original_title AS title,
  original_title,
  original_language,
  release_date,
  budget,
  revenue,
  poster_path,
  backdrop_path,
  overview,
  genres,
  production_companies,
  director,
  actors,
  imdb_rating,
  rotten_tomatoes_score,
  is_oscar_winner
FROM public.movies
WHERE original_language = 'pl'
  AND revenue IS NOT NULL;
