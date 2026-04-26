const TMDB_POSTER_W92 = 'https://image.tmdb.org/t/p/w92';
const TMDB_POSTER_W154 = 'https://image.tmdb.org/t/p/w154';
const TMDB_POSTER_W342 = 'https://image.tmdb.org/t/p/w342';

export function tmdbPosterW92Url(posterPath: string | null | undefined): string {
  if (!posterPath?.trim()) {
    return '';
  }
  const raw = posterPath.trim();
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${TMDB_POSTER_W92}${path}`;
}

export function tmdbPosterW154Url(posterPath: string | null | undefined): string {
  if (!posterPath?.trim()) {
    return '';
  }
  const raw = posterPath.trim();
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${TMDB_POSTER_W154}${path}`;
}

export function tmdbPosterW342Url(posterPath: string | null | undefined): string {
  if (!posterPath?.trim()) {
    return '';
  }
  const raw = posterPath.trim();
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${TMDB_POSTER_W342}${path}`;
}
