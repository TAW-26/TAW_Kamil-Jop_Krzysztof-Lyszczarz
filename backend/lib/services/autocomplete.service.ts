import {prisma, redis} from '../app.js';
import { CATEGORIES } from '../constants/categories.map.js';
type MovieCache = {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string;
  release_date: string | null;
};
class AutoCompleteService {

    public async searchMovie(query : string, categorySlug : string, limit : number = 10): Promise<MovieCache[]> {
        const redisKey = CATEGORIES[categorySlug]?.redisKey;
        if (!redisKey) {
            console.warn(`No Redis key mapping found for category ${categorySlug}. Cannot perform search.`);
            return [];
        }
        try {
            let cacheDataRaw = await redis.get(redisKey);
            if (!cacheDataRaw) {
                await this.ensureCacheInitialized(categorySlug);
                cacheDataRaw = await redis.get(redisKey);
                if (!cacheDataRaw) {
                    console.warn(`Cache for category ${categorySlug} is empty. Cannot perform search.`);
                    return [];
                }
            }
            let cacheData: MovieCache[];
            try {
                cacheData = JSON.parse(cacheDataRaw);
            } catch {
                await this.initializeCacheForCategory(categorySlug);
                return [];
            }
            const lowerCaseQuery = query.toLowerCase();
            const results = cacheData.filter((movie: MovieCache) => 
                movie.title.toLowerCase().includes(lowerCaseQuery) ||
                (movie.original_title && movie.original_title.toLowerCase().includes(lowerCaseQuery))
            );
            return results.slice(0, limit);
        } catch (error) {
            console.error(`Error during search in category ${categorySlug}:`, error);
            return [];
        }


    }

    public async initializeCacheIfNeeded(): Promise<void> {
        try {
            const categorySlugs = Object.keys(CATEGORIES);
            await Promise.all(
                categorySlugs.map(slug => this.ensureCacheInitialized(slug))
            );
        } catch (error) {
            console.error('Error during cache initialization:', error);
        }
    }

    private async ensureCacheInitialized(categorySlug: string): Promise<void> {
        const cacheExists = await this.checkIfCacheExists(categorySlug);
        if (!cacheExists) {
            console.log(`Cache for category ${categorySlug} not found. Initializing...`);
            await this.initializeCacheForCategory(categorySlug);
        }
    }

    private async initializeCacheForCategory(categorySlug: string): Promise<void> {
        const viewName = CATEGORIES[categorySlug]?.viewName;
        const redisKey = CATEGORIES[categorySlug]?.redisKey;
        if (!viewName || !redisKey) {
            console.warn(`No view or Redis key mapping found for category ${categorySlug}. Cannot initialize cache.`);
            return;
        }
        if (!CATEGORIES[categorySlug]) {
            throw new Error("Invalid category");
        }
        try {

            const result = await prisma.$queryRawUnsafe<any[]>(`
                SELECT tmdb_id, title, original_title, poster_path, release_date 
                FROM public.${viewName}
            `);
            const cacheData: MovieCache[] = result.map(movie => ({
                id: movie.tmdb_id,
                title: movie.title,
                original_title : (movie.original_title && movie.original_title !== movie.title) ? movie.original_title : undefined,
                poster_path: movie.poster_path,
                release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : null
            }));
            await redis.set(redisKey, JSON.stringify(cacheData));
            console.log(`Cache for category ${categorySlug} initialized successfully.`);
        } catch (error) {
            console.error(`Error occurred while initializing cache for category ${categorySlug}:`, error);
        }
    }
    
    private async checkIfCacheExists(categorySlug : string): Promise<boolean> {
        const redisKey = CATEGORIES[categorySlug]?.redisKey;
        if (!redisKey) {
            console.warn(`No Redis key mapping found for category ${categorySlug}.`);
            return false;
        }

        const exists = await redis.exists(redisKey);
        return !!exists;
    }
}


export default AutoCompleteService;