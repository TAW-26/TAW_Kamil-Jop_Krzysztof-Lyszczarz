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

export interface GuessResult {
  isCorrect: boolean
  movieTitle: string | null
  results: GuessComparisonResults
}

export interface GuessResponse {
  guessResult: GuessResult
  attempts: number
}

export interface HintResponse {
  hintType: 'posterPath' | 'overview'
  hintValue: string | null
}

export interface GameStateGuess {
  id: number
  title: string | null
  comparison: GuessComparisonResults
}

export interface GameStateResponse {
  guesses: GameStateGuess[]
  attempts: number | null
  isWon: boolean | null
}
