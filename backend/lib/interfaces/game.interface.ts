export type ComparisonStatus = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower';

export interface AttributeResult {
    attribute: string;
    value : any;
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
    revenue: bigint | null;
    director: string | null ;
    studios: string[];
    actors: string[];
    imdbRating: number;
}