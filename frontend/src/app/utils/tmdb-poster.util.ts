const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export function tmdbPosterUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath?.trim()) {
    return null;
  }
  const p = posterPath.trim();
  if (p.startsWith('http')) {
    return p;
  }
  return `${TMDB_IMAGE_BASE}${p.startsWith('/') ? p : `/${p}`}`;
}
