export type ComparisonStatus = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

export interface GuessRequest {
  categorySlug: string
  guessMovieId: number
}

export interface GuessComparisonResults {
  releaseDate: ComparisonStatus
  imdbRating: ComparisonStatus
  genres: ComparisonStatus
  revenue: ComparisonStatus
  director: ComparisonStatus
  studios: ComparisonStatus
  actors: ComparisonStatus
}

export interface GuessedMovieDisplay {
  posterPath: string | null
  genresLabel: string
  directorLabel: string
  actorsLabel: string
  releaseYearLabel: string
  imdbLabel: string
  revenueLabel: string
  studiosLabel: string
}

export interface GuessResult {
  isCorrect: boolean
  movieTitle: string | null
  guessedDisplay?: GuessedMovieDisplay
  results: GuessComparisonResults
}

export interface GuessResponse {
  guessResult: GuessResult
  attempts: number
  ticketsAwarded?: number | null
}

export interface HintResponse {
  hintType: 'posterPath' | 'overview'
  hintValue: string | null
}

export interface GameStateGuess {
  id: number
  title: string | null
  isCorrect: boolean
  guessedDisplay?: GuessedMovieDisplay
  comparison: GuessComparisonResults
}

export interface GameStateResponse {
  guesses: GameStateGuess[]
  attempts: number | null
  isWon: boolean | null
}
