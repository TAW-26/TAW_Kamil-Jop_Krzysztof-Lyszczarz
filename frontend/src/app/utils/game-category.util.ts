export function resolveGameCategoryKey(
  pathCategory: string | null,
  queryCategory: string | null
): string {
  const raw = pathCategory || queryCategory || 'daily';
  return raw.replace(/[-_]+/g, ' ').trim().toLowerCase();
}

export function isDailyCategoryKey(key: string): boolean {
  const compact = key.replace(/\s+/g, '');
  return (
    compact === 'daily' ||
    compact === 'dailychallenge' ||
    compact === 'top500revenue'
  );
}

export function toApiCategorySlug(routeSegment: string | null | undefined): string {
  const raw = (routeSegment ?? '').trim();
  const s = raw.toLowerCase();
  const compact = s.replace(/[\s_-]+/g, '');
  if (!s || compact === 'top250') {
    return 'top-500-revenue';
  }
  if (s === 'daily' || s === 'daily-challenge' || compact === 'top500revenue') {
    return 'top-500-revenue';
  }
  if (s === 'horror' || s === 'horrors') {
    return 'horrors';
  }
  if (s === 'cartoon') {
    return 'cartoons';
  }
  return raw.toLowerCase();
}
