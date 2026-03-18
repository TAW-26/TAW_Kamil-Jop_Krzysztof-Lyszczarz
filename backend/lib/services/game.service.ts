import { GENRE_MAP } from "../constants/genres.map.js";
import { ComparisonStatus } from "../interfaces/game.interface.js";
import { MovieData } from "../interfaces/game.interface.js";
import { prisma, redis } from '../app.js';
class GameService {

    public async checkGuess(guessMovieId : number, categorySlug : string, dateStr : string) {
        try {
            const correctMovieData = await this.getMovieDataFromRedis(categorySlug, dateStr);
            const guessMovieData = await this.getMovieDataFromId(guessMovieId);

            return {
            isCorrect: guessMovieData.id === correctMovieData.id,
            movieTitle: guessMovieData.title, 
            results: {
            releaseDate: this.compareReleaseDate(guessMovieData.releaseDate ? new Date(guessMovieData.releaseDate) : new Date(), correctMovieData.releaseDate ? new Date(correctMovieData.releaseDate) : new Date()),
            imdbRating: this.compareIMDBRating(guessMovieData.imdbRating || 0, correctMovieData.imdbRating || 0),
            genres: this.compareGenres(guessMovieData.genres, correctMovieData.genres),
            revenue: this.compareRevenue(guessMovieData.revenue || 0, correctMovieData.revenue || 0),
            director: this.compareDirector(guessMovieData.director || '', correctMovieData.director || ''),
            studios: this.compareStudios(guessMovieData.studios, correctMovieData.studios),
            actors: this.compareActors(guessMovieData.actors, correctMovieData.actors),
        }
    };
        }
        catch (error) {
            console.error('Błąd podczas sprawdzania zgadywania:', error);
            throw new Error('Nie można sprawdzić zgadywania');
        }
    }

    private async getMovieDataFromId(movieId: number) : Promise<MovieData> {
        try {
            const movie = await prisma.movies.findUnique({
                where: { tmdb_id: movieId }});
            if (!movie) {
                throw new Error('Nie można znaleźć filmu o podanym ID');
            }    
            console.log(movie);
            const newMovieData : MovieData = {
                id: movie.tmdb_id,
                title: movie.title,
                releaseDate: movie.release_date,
                genres: movie.genres,
                revenue: Number(movie.revenue) || null,
                director: movie.director,
                studios: movie.production_companies,
                actors: movie.actors,
                imdbRating: movie.imdb_rating ? parseFloat(movie.imdb_rating) : null,
            };

            return newMovieData;
        }
        catch (error) {            
            console.error('Błąd podczas pobierania danych filmu:', error);
            throw new Error('Nie można pobrać danych filmu');
        }

    }

    private async getMovieDataFromRedis(categorySlug: string, dateStr: string) : Promise<MovieData> {
        const redisKey = `daily:${categorySlug}:${dateStr}`;
        try {
            const cachedData = await redis.get(redisKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                const newMovieData : MovieData = {
                    id: parsedData.id,
                    title: parsedData.title,
                    releaseDate: new Date(parsedData.releaseDate),
                    genres: parsedData.genres,
                    revenue: parsedData.revenue,
                    director: parsedData.director,
                    studios: parsedData.studios,
                    actors: parsedData.actors,
                    imdbRating: parsedData.imdbRating
                };
                return newMovieData;

            }
        } catch (error) {
            console.error(`Błąd podczas pobierania danych z Redis dla klucza ${redisKey}:`, error);
        }
        throw new Error('Nie można pobrać danych filmu z Redis');
    }

    private compareReleaseDate(guessDate : Date, correctDate : Date) : ComparisonStatus {
        const guessDateYear = guessDate.getFullYear();
        const correctDateYear = correctDate.getFullYear();
        if (guessDateYear === correctDateYear) {
            return 'correct';
        }
        return guessDateYear < correctDateYear ? 'lower' : 'higher';
    } 

    private compareIMDBRating(guessRating : number, correctRating : number) : ComparisonStatus {
        if (guessRating === correctRating) {
            return 'correct';
        }
        return guessRating < correctRating ? 'lower' : 'higher';
    }

    private compareGenres(guessGenres : number[], correctGenres : number[]) : ComparisonStatus {
        const correctCount = guessGenres.filter(genre => correctGenres.includes(genre)).length;
        if (guessGenres.length === correctGenres.length && correctCount === correctGenres.length) {
            return 'correct';
        }
        if (correctCount > 0) {
            return 'partial';
        }
        return 'wrong';
    }

    private compareRevenue(guessRevenue : number, correctRevenue : number) : ComparisonStatus {
        if (guessRevenue === correctRevenue) {
            return 'correct';
        }
        return guessRevenue < correctRevenue ? 'lower' : 'higher';
    }

    private compareDirector(guessDirector : string, correctDirector : string) : ComparisonStatus {
        if (guessDirector.toLowerCase() === correctDirector.toLowerCase()) {
            return 'correct';
        }
        return 'wrong';
    }

    private compareStudios(guessStudios : string[], correctStudios : string[]) : ComparisonStatus {
        const guessStudioNames = guessStudios.map(studio => studio.toLowerCase());
        const correctStudioNames = correctStudios.map(studio => studio.toLowerCase());
        const correctCount = guessStudioNames.filter(studio => correctStudioNames.includes(studio)).length;
        if (correctCount === correctStudioNames.length) {
            return 'correct';
        }
        if (correctCount > 0) {
            return 'partial';
        }
        return 'wrong';
    }

    private compareActors(guessActors : string[], correctActors : string[]) : ComparisonStatus {
        const guessActorNames = guessActors.map(actor => actor.toLowerCase());
        const correctActorNames = correctActors.map(actor => actor.toLowerCase());
        const correctCount = guessActorNames.filter(actor => correctActorNames.includes(actor)).length;
        if (correctCount === correctActorNames.length) {
            return 'correct';
        }
        if (correctCount > 0) {
            return 'partial';
        }
        return 'wrong';
    }


}


export default GameService;