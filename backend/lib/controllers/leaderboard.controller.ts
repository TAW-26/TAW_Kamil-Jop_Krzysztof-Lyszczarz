import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js';
import LeaderboardService from '../services/leaderboard.service.js';

class LeaderboardController implements Controller {
    public path = '/leaderboard';
    public router = Router();
    public leaderboardService = new LeaderboardService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/points`, this.getPointsLeaderboard);
        this.router.get(`${this.path}/streaks`, this.getStreakLeaderboard);
        this.router.get(`${this.path}/tries`, this.getTriesLeaderboard);
    }

    private getPointsLeaderboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const leaderboard = await this.leaderboardService.getTotalPointsLeaderboard();
            res.status(200).json(leaderboard);
        } catch (error) {
            console.error('Error in getPointsLeaderboard:', error);
            res.status(500).json({ error: 'Nie udało się pobrać rankingu punktów' });
        }
    };

    private getStreakLeaderboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const leaderboard = await this.leaderboardService.getStreakLeaderboard();
            res.status(200).json(leaderboard);
        } catch (error) {
            console.error('Error in getStreakLeaderboard:', error);
            res.status(500).json({ error: 'Nie udało się pobrać rankingu streaków' });
        }
    };

    private getTriesLeaderboard = async (req: Request, res: Response): Promise<void> => {
        const categorySlug = req.query.categorySlug as string;
        if (!categorySlug) {
            res.status(400).json({ error: 'Parametr "categorySlug" jest wymagany' });
            return;
        }
        const dateStr = new Date().toISOString().split('T')[0];
        try {
            const histogram = await this.leaderboardService.getTriesLeaderboard(categorySlug, dateStr);
            res.status(200).json(histogram);
        } catch (error) {
            console.error('Error in getTriesLeaderboard:', error);
            res.status(400).json({ error: (error as Error).message });
        }
    };
}

export default LeaderboardController;