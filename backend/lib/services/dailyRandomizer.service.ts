import { prisma, redis } from '../app.js';
import { CATEGORIES } from '../constants/categories.map.js';
type Category = { name: string; id: string; slug: string; };
class DailyRandomizerService {
    private allCategories: Category[] = [];
    public async run(): Promise<void> {
        try {
            await this.fetchCategories();
            console.log('Categories loaded successfully');

            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const tomorrow = new Date();
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            tomorrow.setUTCHours(0, 0, 0, 0);

            for (const category of this.allCategories) {
                await this.processCategoryForDate(category, today);
                await this.processCategoryForDate(category, tomorrow);
            }
            console.log('Daily randomizer check finished.');
        } catch (error) {
            console.error('Error running DailyRandomizerService:', error);
        }
    }

    private async fetchCategories(): Promise<void> {
        try{
            this.allCategories = await prisma.categories.findMany();
        } catch (error) {
            console.error('Error fetching categories:', error);
        }

    }

    private async processCategoryForDate(category: Category, targetDate: Date): Promise<void> {
        const formattedDate = targetDate.toISOString().split('T')[0];
        const existingChallenge = await prisma.daily_challenges.findFirst({
            where: {
                challenge_date: targetDate,
                category_id: category.id
            }
        });
        
        if (!existingChallenge) {
            await this.randomizeDailyChallenge(category, targetDate);
        }
        else{
            await this.ensureMovieInRedis(category.slug, formattedDate, existingChallenge.movie_id? existingChallenge.movie_id : -1);
        }

        console.log(`Category ${category.slug} for date ${formattedDate} already randomized: ${!!existingChallenge}`);
    }



    private async randomizeDailyChallenge(category: Category, targetDate: Date): Promise<void> {
        const formattedDate = targetDate.toISOString().split('T')[0];
        console.log(`Randomizing challenge for category ${category.slug} on date ${formattedDate}...`);
        const viewName = CATEGORIES[category.slug]?.viewName;
        if (!viewName) {
            console.warn(`No view mapping found for category ${category.slug}, skipping.`);
            return;
        }
        try {
            const randomChallenge = await prisma.$queryRawUnsafe<{ tmdb_id: number }[]>(`
                SELECT tmdb_id FROM ${viewName} 
                ORDER BY RANDOM() 
                LIMIT 1
            `);
            if (randomChallenge?.length > 0) {
                await prisma.daily_challenges.create({
                    data: {
                        category_id: category.id,
                        challenge_date: targetDate,
                        movie_id: randomChallenge[0]?.tmdb_id || null
                    }
                });
                await this.ensureMovieInRedis(category.slug, formattedDate, randomChallenge[0]?.tmdb_id || -1);
                console.log(`Randomized challenge for category ${category.slug} on date ${formattedDate}: TMDB ID ${randomChallenge[0]?.tmdb_id}`);
            }
            else{
                console.warn(`No challenge found for category ${category.slug} on date ${formattedDate}.`);
            }
        } catch (error) {
            console.error('Error randomizing daily challenge:', error);
        }
    }

    private async ensureMovieInRedis(categorySlug: string, dateStr: string, movieId: number): Promise<void> {
        const redisKey = `daily:${categorySlug}:${dateStr}`;
        const exists = await redis.exists(redisKey);
        if (exists) return;

        try {
            const movie = await prisma.movies.findUnique({
                where: { tmdb_id: movieId }
            });

            if (movie) {
                const movieData = {
                    id: movie.tmdb_id,
                    title: movie.title,
                    releaseDate: movie.release_date,
                    genres: movie.genres,
                    revenue: Number(movie.revenue),
                    director: movie.director,
                    studios: movie.production_companies,
                    actors: movie.actors,
                    imdbRating: parseFloat(movie.imdb_rating || '0'),
                    overview: movie.overview,
                    posterPath: movie.poster_path,
                    backdropPath: movie.backdrop_path,
                    isOscarWinner: movie.is_oscar_winner
                };
                await redis.set(redisKey, JSON.stringify(movieData), 'EX', 172800); 
                console.log(`Redis cache updated for ${redisKey}`);
            }
        } catch (error) {
            console.error(`Error syncing to Redis for ${redisKey}:`, error);
        }
    }


}

export default DailyRandomizerService;