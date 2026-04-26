import { GUESS_ROW_TILE_COUNT } from '../constants/guess-row.constants';
import type { GuessRowTile } from '../shared/components/guess-row/guess-row';

const PREFIX = 'movieGuessUI';
const STORAGE_VERSION = 3;

function isValidGuessRowsPayload(data: unknown): data is GuessRowTile[][] {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  return data.every(
    (row) =>
      Array.isArray(row) &&
      row.length === GUESS_ROW_TILE_COUNT &&
      row.every((t) => t && typeof t === 'object' && 'state' in t),
  );
}

export function utcTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function gameSessionStorageKey(categorySlug: string, dateUtc: string): string {
  return `${PREFIX}:${categorySlug}:${dateUtc}`;
}

export function loadGuessRowsFromStorage(
  categorySlug: string,
  dateUtc: string,
): GuessRowTile[][] | null {
  try {
    const raw = localStorage.getItem(gameSessionStorageKey(categorySlug, dateUtc));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'rows' in parsed) {
      const rows = (parsed as { rows?: unknown }).rows;
      if (!isValidGuessRowsPayload(rows)) {
        return null;
      }
      return rows;
    }

    if (isValidGuessRowsPayload(parsed)) {
      return [...parsed].reverse();
    }
    return null;
  } catch {
    return null;
  }
}

export function saveGuessRowsToStorage(
  categorySlug: string,
  dateUtc: string,
  rows: GuessRowTile[][],
): void {
  try {
    const payload = { v: STORAGE_VERSION, rows };
    localStorage.setItem(gameSessionStorageKey(categorySlug, dateUtc), JSON.stringify(payload));
  } catch {
  }
}
