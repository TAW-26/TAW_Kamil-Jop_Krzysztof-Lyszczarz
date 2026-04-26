export type ComparisonStatus = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower';

export interface GuessedMovieDisplay {
    posterPath: string | null;
    genresLabel: string;
    directorLabel: string;
    actorsLabel: string;
    releaseYearLabel: string;
    imdbLabel: string;
    revenueLabel: string;
    studiosLabel: string;
}

export interface AttributeResult {
    attribute: string;
    value: string | number | boolean | string[] | number[] | null;
    status: ComparisonStatus;
}

export interface GuessResponse {
    isCorrect: boolean;
    results: AttributeResult[];
}

export interface MovieData {
    id: number;
    title: string | null;
    releaseDate: Date | null;
    genres: number[];
    revenue: number | null;
    director: string | null ;
    studios: string[];
    actors: string[];
    imdbRating: number | null;
    overview?: string;
    posterPath?: string;
    backdropPath?: string;
    isOscarWinner?: boolean;
}