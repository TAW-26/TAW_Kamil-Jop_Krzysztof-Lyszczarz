import { ComparisonStatus } from "../interfaces/game.interface.js";
import { MovieData } from "../interfaces/game.interface.js";
import { prisma, redis } from '../app.js';
import { games } from "@prisma/client";
class GameService {

    public async checkGuess(guessMovieId : number, categorySlug : string, dateStr : string, userId : string | null) {
        if (typeof guessMovieId !== 'number' || isNaN(guessMovieId)) {
            throw new Error('guessMovieId musi być liczbą');
        }
        if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
            throw new Error('categorySlug musi być niepustym stringiem');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error('Nieprawidłowy format daty');
        }
        try {
            if (!userId && categorySlug !== 'top-500-revenue'){
                throw new Error('Goście mogą grać tylko w kategorii Top 500 Revenue');
            }
            const correctMovieData = await this.getMovieDataFromRedis(categorySlug, dateStr);
            const guessMovieData = await this.getMovieDataFromId(guessMovieId);
            let attempts = 0;
            const isCorrect = guessMovieData.id === correctMovieData.id;
            const guessResult = {
                isCorrect: isCorrect,
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
            if (userId) {
                let currentGame = await this.getCurrentGameObject(categorySlug, userId , dateStr);
                if (currentGame && currentGame.is_won) {
                    throw new Error('Już wygrałeś to wyzwanie! Spróbuj jutro nowe wyzwanie.');
                }
                if (currentGame?.guesses?.includes(guessMovieId)) {
                    throw new Error('Już próbowałeś tego filmu. Spróbuj innego.');
                }
                const currentAttemptCount = currentGame?.attempts || 0;
                let pointsEarned = 100 - 10 * currentAttemptCount;
                if (pointsEarned < 10) pointsEarned = 10;

                if (!currentGame) {
                    currentGame = await this.createGameObject(categorySlug, userId, dateStr, isCorrect, guessMovieId);
                }else {
                    currentGame = await prisma.games.update({
                        where: { id: currentGame.id },
                        data: {
                            attempts: currentGame.attempts ? currentGame.attempts + 1 : 1,
                            is_won: isCorrect || currentGame.is_won,
                            points_earned: isCorrect ? pointsEarned : currentGame.points_earned,
                            guesses: [...(currentGame.guesses || []), guessMovieId]
                        }
                    });
                }
                attempts = currentGame.attempts? currentGame.attempts : 0;
                if (isCorrect) {
                    const user = await prisma.users.findUnique({ where: { id: userId } });
                    
                    let newStreak = user?.current_streak || 0;
                    let lifetimeStreak = user?.lifetime_streak || 0;
                    const lastWon = user?.last_won_date;
                    const todayStr = dateStr; 

                    if (lastWon) {
                        const lastWonStr = lastWon.toISOString().split('T')[0];
                        const yesterday = new Date(dateStr);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];

                        if (lastWonStr === todayStr) {
                            newStreak = user!.current_streak ?? 0;
                        } else if (lastWonStr === yesterdayStr) {
                            newStreak += 1;
                        } else {
                            newStreak = 1;
                        }
                    } else {
                        newStreak = 1;
                    }
                    if (newStreak > lifetimeStreak) {
                        lifetimeStreak = newStreak;
                    }

                    await prisma.users.update({
                        where: { id: userId },
                        data: {
                            points_balance: { increment: pointsEarned },
                            lifetime_points: { increment: pointsEarned },
                            current_streak: newStreak,
                            last_won_date: new Date(),
                            games : {connect: { id: currentGame.id }},
                            lifetime_streak: lifetimeStreak
                        }
                    });
                    await redis.del('leaderboard:points');
                    await redis.del('leaderboard:streaks');
                    await redis.del(`leaderboard:tries:${categorySlug}:${dateStr}`);
                }
            }
            return {guessResult, attempts };
        }
        catch (error) {
            console.error('Błąd podczas sprawdzania zgadywania:', error);
            throw new Error((error as Error).message || 'Nie można sprawdzić zgadywania');
        }
    }

    public async getHint(categorySlug: string, dateStr: string, hintIndex: number, userId: string | null, guestAttempts: number = 0) {
        if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
            throw new Error('categorySlug musi być niepustym stringiem');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error('Nieprawidłowy format daty');
        }
        if (typeof hintIndex !== 'number' || isNaN(hintIndex)) {
            throw new Error('hintIndex musi być liczbą');
        }
            try {
                let currentAttempts = guestAttempts;

                if (userId) {
                    const game = await this.getCurrentGameObject(categorySlug, userId, dateStr);
                    currentAttempts = game?.attempts || 0;
                }

                const requiredAttempts = hintIndex === 0 ? 4 : 8; 

                if (currentAttempts < requiredAttempts) {
                    throw new Error(` Potrzebujesz co najmniej ${requiredAttempts} prób, aby zobaczyć tę podpowiedź.`);
                }

                const movieData = await this.getMovieDataFromRedis(categorySlug, dateStr);

                switch (hintIndex) {
                    case 0:
                        return { hintType: 'posterPath', hintValue: movieData.posterPath };
                    case 1:
                        return { hintType: 'overview', hintValue: movieData.overview };
                    default:
                        throw new Error('Nieznany indeks podpowiedzi');
                }
            }
            catch (error) {            
                console.error('Błąd podczas pobierania podpowiedzi:', error);
                throw new Error((error as Error).message || 'Nie można pobrać podpowiedzi');
            }
        }


    public async getGameState(categorySlug: string, dateStr: string, userId: string) {
        if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
            throw new Error('categorySlug musi być niepustym stringiem');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error('Nieprawidłowy format daty');
        }
        try {
            const game = await this.getCurrentGameObject(categorySlug, userId, dateStr);
            
            if (!game || !game.guesses || game.guesses.length === 0) {
                return { guesses: [], attempts: 0, isWon: false };
            }

            const correctMovieData = await this.getMovieDataFromRedis(categorySlug, dateStr);
            const guessList = game.guesses;

            const response = await Promise.all(guessList.map(async (guessId) => {
                const guessMovieData = await this.getMovieDataFromId(guessId);
                return {
                    id: guessMovieData.id,
                    title: guessMovieData.title,
                    comparison: {
                        releaseDate: this.compareReleaseDate(guessMovieData.releaseDate ? new Date(guessMovieData.releaseDate) : new Date(), correctMovieData.releaseDate ? new Date(correctMovieData.releaseDate) : new Date()),
                        imdbRating: this.compareIMDBRating(guessMovieData.imdbRating || 0, correctMovieData.imdbRating || 0),
                        genres: this.compareGenres(guessMovieData.genres, correctMovieData.genres),
                        revenue: this.compareRevenue(guessMovieData.revenue || 0, correctMovieData.revenue || 0),
                        director: this.compareDirector(guessMovieData.director || '', correctMovieData.director || ''),
                        studios: this.compareStudios(guessMovieData.studios, correctMovieData.studios),
                        actors: this.compareActors(guessMovieData.actors, correctMovieData.actors),
                    }
                };
            }));

            return {
                guesses: response,
                attempts: game.attempts,
                isWon: game.is_won
            };

        } catch (error) {
            console.error('Błąd podczas pobierania stanu gry:', error);
            throw new Error((error as Error).message || 'Nie można pobrać stanu gry');
        }
        }
    
    private async getMovieDataFromId(movieId: number) : Promise<MovieData> {
        if (typeof movieId !== 'number' || isNaN(movieId)) {
            throw new Error('movieId musi być liczbą');
        }
        try {
            const movie = await prisma.movies.findUnique({
                where: { tmdb_id: movieId }});
            if (!movie) {
                throw new Error('Nie można znaleźć filmu o podanym ID');
            }    
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
        if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
            throw new Error('categorySlug musi być niepustym stringiem');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error('Nieprawidłowy format daty');
        }
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
                    imdbRating: parsedData.imdbRating,
                    overview: parsedData.overview,
                    posterPath: parsedData.posterPath
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

    private async getCurrentGameObject(categorySlug : string, userId : string, dateStr : string) : Promise<games | null>{
        try{
            const category = await prisma.categories.findUnique({
                where: { slug: categorySlug }
            });
            if (!category) {
                throw new Error('Nie można znaleźć kategorii o podanym slug');
            }
            
            const dailyChallenge = await prisma.daily_challenges.findFirst({
                where: {
                    category_id: category?.id,
                    challenge_date: new Date(dateStr)
                }
            });

            if (!dailyChallenge) {
                throw new Error('Nie można znaleźć dziennego wyzwania dla tej kategorii');
            }

            const game = await prisma.games.findFirst({
                where: {
                    user_id: userId,
                    challenge_id: dailyChallenge.id
                }
            });
            
            return game;

        }
        catch (error) {
            console.error('Błąd podczas pobierania danych z bazy:', error);
            throw new Error('Błąd serwera');
        }
    
    }

    private async createGameObject(categorySlug : string, userId : string, dateStr : string, isCorrect : boolean, movieId : number) : Promise<games> {
        const category = await prisma.categories.findUnique({ where: { slug: categorySlug } });
        const challenge = await prisma.daily_challenges.findFirst({
        where: {
            category_id: category?.id,
            challenge_date: new Date(dateStr)
        }
    });

    if (!challenge) {
        throw new Error("Wyzwanie nie istnieje dla podanej daty");
    }
        return await prisma.games.create({
            data: {
                user_id: userId,
                challenge_id: challenge.id,
                attempts: 1,
                is_won: isCorrect,
                points_earned: isCorrect ? 100 : 0,
                played_at: new Date(),
                guesses: [movieId]
            }
        });
    }
}


export default GameService;