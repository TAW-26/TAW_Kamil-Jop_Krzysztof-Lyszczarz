import { prisma, redis } from '../app.js';
import { TriesHistogramEntry, StreakLeaderboardEntry, PointsLeaderboardEntry } from '../interfaces/leaderboard.interface.js';
class LeaderboardService {
    private LEADERBOARD_CACHE_TTL = 300;

    public async getStreakLeaderboard(): Promise<StreakLeaderboardEntry[]> {
        const redisKey = 'leaderboard:streaks';
        try{
            const cachedDataRaw = await redis.get(redisKey);
            if (cachedDataRaw) {
                return JSON.parse(cachedDataRaw);
            } else {
                const leaderboardData = await this.fetchStreakLeaderboardFromDb();
                await redis.set(redisKey, JSON.stringify(leaderboardData), 'EX', this.LEADERBOARD_CACHE_TTL);
                return leaderboardData;
            }
        }
        catch (error) {
            console.error('Error fetching streak leaderboard:', error);
            return [];
        }
    }

    public async getTriesLeaderboard(categorySlug: string, dateStr: string): Promise<TriesHistogramEntry[]> {
        const redisKey = `leaderboard:tries:${categorySlug}:${dateStr}`;
        try{
            const cachedDataRaw = await redis.get(redisKey);
            if (cachedDataRaw) {
                return JSON.parse(cachedDataRaw);
            }
            else {
                const leaderboardData = await this.fetchTriesLeaderboardFromDb(categorySlug, dateStr);
                await redis.set(redisKey, JSON.stringify(leaderboardData), 'EX', this.LEADERBOARD_CACHE_TTL);
                return leaderboardData;
            }
        }
        catch (error) {
            console.error('Error fetching tries leaderboard:', error);
            return [];
        }
    }

    public async getTotalPointsLeaderboard(): Promise<PointsLeaderboardEntry[]> {
        const redisKey = 'leaderboard:points';
        try{
            const cachedDataRaw = await redis.get(redisKey);
            if (cachedDataRaw) {
                return JSON.parse(cachedDataRaw);
            } else {
                const leaderboardData = await this.fetchPointsLeaderboardFromDb();
                await redis.set(redisKey, JSON.stringify(leaderboardData), 'EX', this.LEADERBOARD_CACHE_TTL);
                return leaderboardData;
            }
        }
        catch (error) {
            console.error('Error fetching points leaderboard:', error);
            return [];
        }
    }

    private async fetchStreakLeaderboardFromDb(): Promise<StreakLeaderboardEntry[]> {
        const users = await prisma.users.findMany({
            orderBy: {
                lifetime_streak: 'desc',
            },
            select: {
                id: true,
                username: true,
                lifetime_streak: true,
                equipped_avatar_url: true,
            },
            take: 100,   
        });
        return users
    }

    private async fetchTriesLeaderboardFromDb(categorySlug: string, dateStr: string): Promise<TriesHistogramEntry[]> {
            const category = await prisma.categories.findUnique({
                where: { slug: categorySlug },
            });
            if (!category) {
                throw new Error('Kategoria nie istnieje');
            }

            const challenge = await prisma.daily_challenges.findFirst({
                where: {
                    category_id: category.id,
                    challenge_date: new Date(dateStr), 
                },
            });
            
            if (!challenge) {
                return []; 
            }

            const games = await prisma.games.findMany({
                where: {
                    challenge_id: challenge.id,
                    is_won: true,
                },
            });
            
            const guessAmountDict: Record<number, number> = {};

            for (const game of games) {
                const attempts = game.attempts || 0;
                guessAmountDict[attempts] = (guessAmountDict[attempts] || 0) + 1;
            }

            const histogramArray = Object.entries(guessAmountDict).map(([attemptsStr, count]) => {
                return {
                    attempts: Number(attemptsStr),
                    count: count
                };
            });

            histogramArray.sort((a, b) => a.attempts - b.attempts);
            return histogramArray;
    }

    private async fetchPointsLeaderboardFromDb(): Promise<PointsLeaderboardEntry[]> {
        const users = await prisma.users.findMany({
            orderBy: {
                lifetime_points: 'desc',
            },
            select: {
                id: true,
                username: true,
                lifetime_points: true,
                equipped_avatar_url: true,
            },
            take: 100,   
        });
        return users
    }


}


export default LeaderboardService;