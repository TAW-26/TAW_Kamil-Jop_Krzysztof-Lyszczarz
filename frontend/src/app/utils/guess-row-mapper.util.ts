import type {
  ComparisonStatus,
  GuessResult,
  GuessedMovieDisplay,
  GameStateGuess,
} from '../interfaces/game.interface';
import type { GuessRowTile } from '../shared/components/guess-row/guess-row';
import { tmdbPosterW154Url } from './tmdb-image.util';

const EMPTY_DISPLAY: GuessedMovieDisplay = {
  posterPath: null,
  genresLabel: '—',
  directorLabel: '—',
  actorsLabel: '—',
  releaseYearLabel: '—',
  imdbLabel: '—',
  revenueLabel: '—',
  studiosLabel: '—',
};

function comparisonToTile(
  status: ComparisonStatus,
  detailText: string,
  stackCommaSeparated?: boolean,
): GuessRowTile {
  const normalized: 'correct' | 'partial' | 'wrong' =
    status === 'higher' || status === 'lower' ? 'partial' : status;
  return {
    state: normalized,
    text: detailText.trim() || '—',
    uppercaseText: false,
    ...(stackCommaSeparated ? { stackCommaSeparated: true } : {}),
  };
}

function numericHintTile(status: ComparisonStatus, valueLabel: string): GuessRowTile {
  const label = valueLabel.trim() || '—';
  if (status === 'correct') {
    return { state: 'correct', text: label, uppercaseText: false };
  }
  if (status === 'higher') {
    return { state: 'partial-year', text: `${label}↓`, uppercaseText: false };
  }
  if (status === 'lower') {
    return { state: 'partial-year', text: `${label}↑`, uppercaseText: false };
  }
  return { state: 'wrong', text: label, uppercaseText: false };
}

function releaseDateToTile(status: ComparisonStatus, yearLabel: string): GuessRowTile {
  const year = yearLabel?.trim() || '—';
  if (status === 'correct') {
    return { state: 'correct', text: year, uppercaseText: true };
  }
  if (status === 'higher') {
    return { state: 'partial-year', text: `${year}↓`, uppercaseText: true };
  }
  if (status === 'lower') {
    return { state: 'partial-year', text: `${year}↑`, uppercaseText: true };
  }
  return { state: 'wrong', text: year, uppercaseText: true };
}

export function mapGuessResultToTiles(guessResult: GuessResult): GuessRowTile[] {
  const display = guessResult.guessedDisplay ?? EMPTY_DISPLAY;
  const { results, movieTitle, isCorrect } = guessResult;
  const posterSrc = tmdbPosterW154Url(display.posterPath);

  const movieTile: GuessRowTile = {
    state: isCorrect ? 'correct' : 'wrong',
    text: (movieTitle ?? '—').toUpperCase(),
    imageSrc: posterSrc || undefined,
    uppercaseText: true,
    tileVariant: 'moviePoster',
  };

  return [
    movieTile,
    comparisonToTile(results.genres, display.genresLabel, true),
    comparisonToTile(results.studios, display.studiosLabel),
    comparisonToTile(results.actors, display.actorsLabel, true),
    numericHintTile(results.revenue, display.revenueLabel),
    numericHintTile(results.imdbRating, display.imdbLabel),
    releaseDateToTile(results.releaseDate, display.releaseYearLabel),
  ];
}

export function mapGameStateGuessToTiles(guess: GameStateGuess): GuessRowTile[] {
  return mapGuessResultToTiles({
    isCorrect: guess.isCorrect ?? false,
    movieTitle: guess.title,
    guessedDisplay: guess.guessedDisplay ?? EMPTY_DISPLAY,
    results: guess.comparison,
  });
}
