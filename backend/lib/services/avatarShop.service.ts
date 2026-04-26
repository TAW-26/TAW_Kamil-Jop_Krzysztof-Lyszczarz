import { prisma } from '../app.js';
import { Prisma } from '@prisma/client';

interface ShopItem {
    id: number;
    title: string | null;
    posterPath: string | null;
    releaseDate: Date | null;
    price: number;
    isOwned: boolean;
}

interface ShopItemsResponse {
    items: ShopItem[];
    meta: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
    };
}

interface OwnedAvatar {
    id: number;
    title: string | null;
    posterPath: string | null;
}

class AvatarShopService {
    private AVATAR_PRICE = 500;

    public async getShopItems(
        userId: string,
        page: number = 1,
        limit: number = 20,
        filters: {
            ownership?: 'all' | 'owned' | 'unowned',
            sortYear?: 'asc' | 'desc',
            genre?: number,
            search?: string
        }
    ): Promise<ShopItemsResponse> {
        if (typeof page !== 'number' || page < 1) page = 1;
        if (typeof limit !== 'number' || limit < 1 || limit > 100) limit = 20;
        const offset = (page - 1) * limit;

        const ownedAvatars = await prisma.user_avatars.findMany({
                where: { user_id: userId },
                select: { movie_id: true }
            });
        const ownedIds = ownedAvatars.map(a => a.movie_id).filter((id): id is number => id !== null);
        const ownedIdsSet = new Set(ownedIds);

        const whereClause: Prisma.moviesWhereInput = {};

        if (filters.search) {
                whereClause.title = { contains: filters.search, mode: 'insensitive' };
        }
        if (filters.genre) {
                whereClause.genres = { has: filters.genre };
        }
        if (filters.ownership === 'owned') {
            whereClause.tmdb_id = { in: ownedIds };
        } else if (filters.ownership === 'unowned') {
            whereClause.tmdb_id = { notIn: ownedIds.length > 0 ? ownedIds : [0] }; 
        }

        const orderByClause: Prisma.moviesOrderByWithRelationInput = {};
            if (filters.sortYear) {
                orderByClause.release_date = filters.sortYear;
            } else {
                orderByClause.revenue = 'desc'; 
        }

        const [totalItems, movies] = await Promise.all([
            prisma.movies.count({ where: whereClause }),
            prisma.movies.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: offset,
                take: limit,
                select: { 
                    tmdb_id: true, 
                    title: true, 
                    poster_path: true, 
                    release_date: true 
                }
            })
        ]);
        return {
            items: movies.map(movie => ({
                id: movie.tmdb_id,
                title: movie.title,
                posterPath: movie.poster_path,
                releaseDate: movie.release_date,
                price: this.AVATAR_PRICE,
                isOwned: ownedIdsSet.has(movie.tmdb_id) 
            })),
            meta: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                itemsPerPage: limit
            }
        };



    }

    public async purchaseAvatar(userId: string, movieId: number): Promise<void> {
        const response = await prisma.$transaction(async (tx) => {
            const user = await tx.users.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            const existing = await tx.user_avatars.findFirst({ where: { user_id: userId, movie_id: movieId } });
            if (existing) {
                throw new Error('Avatar already owned');
            }
            const pointsBalance = user.points_balance ?? 0;
            if (pointsBalance < this.AVATAR_PRICE) {
                throw new Error('Not enough points');
            }

            await tx.users.update({
                where: { id: userId },
                data: { points_balance: { decrement: this.AVATAR_PRICE } }
            });
            await tx.user_avatars.create({
                data: {
                    user_id: userId,
                    movie_id: movieId,
                    purchased_at: new Date()
                }
            });
        });
        return response;
    }

    public async equipAvatar(userId: string, movieId: unknown): Promise<void> {
        if (movieId === null || movieId === undefined) {
            throw new Error('movieId jest wymagane');
        }
        const id =
            typeof movieId === 'string' ? parseInt(movieId, 10) : Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Nieprawidłowy movieId');
        }

        const owned = await prisma.user_avatars.findFirst({
            where: { user_id: userId, movie_id: id },
        });
        if (!owned) {
            throw new Error('Nie posiadasz tego awatara');
        }

        const movie = await prisma.movies.findUnique({
            where: { tmdb_id: id },
            select: { poster_path: true },
        });
        if (!movie) {
            throw new Error('Nie znaleziono filmu w katalogu');
        }

        await prisma.users.update({
            where: { id: userId },
            data: {
                equipped_avatar_id: id,
                equipped_avatar_url: movie.poster_path,
            },
        });
    }

    public async getOwnedAvatars(userId: string): Promise<OwnedAvatar[]> {
        const ownedAvatars = await prisma.user_avatars.findMany({
            where: { user_id: userId },
            select: { movie_id: true }
        });
        const ownedIds = ownedAvatars.map(a => a.movie_id).filter((id): id is number => id !== null);
        const movies = await prisma.movies.findMany({
            where: { tmdb_id: { in: ownedIds } },
            select: { tmdb_id: true, title: true, poster_path: true, }
        });
        return movies.map(movie => ({
            id: movie.tmdb_id,
            title: movie.title,
            posterPath: movie.poster_path,
        }));
    }


}

export default AvatarShopService;