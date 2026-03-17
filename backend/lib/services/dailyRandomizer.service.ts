import { prisma } from '../app.js';
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
        const alreadyRandomized = await this.checkIfAlreadyRandomized(category.id, targetDate);
        
        if (!alreadyRandomized) {
            await this.randomizeDailyChallenge(category, targetDate);
        }
        console.log(`Category ${category.slug} for date ${formattedDate} already randomized: ${alreadyRandomized}`);
    }

    private async checkIfAlreadyRandomized(categoryId: string, targetDate: Date): Promise<boolean> {
        try {
            const existing = await prisma.daily_challenges.findFirst({
                where: {
                    challenge_date: targetDate,
                    category_id: categoryId
                }
            });
            return !!existing;
        } catch (error) {
            console.error('Error checking if already randomized:', error);
            return false;
        }
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
                console.log(`Randomized challenge for category ${category.slug} on date ${formattedDate}: TMDB ID ${randomChallenge[0]?.tmdb_id}`);
            }
            else{
                console.warn(`No challenge found for category ${category.slug} on date ${formattedDate}.`);
            }
        } catch (error) {
            console.error('Error randomizing daily challenge:', error);
        }
    }


}

export default DailyRandomizerService;