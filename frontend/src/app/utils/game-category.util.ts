export function resolveGameCategoryKey(
  pathCategory: string | null,
  queryCategory: string | null
): string {
  const raw = pathCategory || queryCategory || 'top-250';
  return raw.replace(/[-_]+/g, ' ').trim().toLowerCase();
}

export function isDailyCategoryKey(key: string): boolean {
  const compact = key.replace(/\s+/g, '');
  return compact === 'daily' || compact === 'dailychallenge';
}
