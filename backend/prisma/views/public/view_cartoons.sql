SELECT
  tmdb_id,
  imdb_id,
  title,
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
FROM
  movies
WHERE
  (
    (
      production_companies & & ARRAY ['Walt Disney Pictures'::text, 'Walt Disney Animation Studios'::text, 'Pixar'::text, 'Pixar Animation Studios'::text, 'DreamWorks Animation'::text, 'Illumination'::text, 'Illumination Entertainment'::text]
    )
    AND (16 = ANY (genres))
  )
ORDER BY
  revenue DESC NULLS LAST
LIMIT
  500;