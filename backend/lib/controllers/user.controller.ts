import { Router, Response } from 'express';
import Controller from '../interfaces/controller.interface.js';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';
import UserService from '../services/user.service.js';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private userService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.patch(`${this.path}/me`, authMiddleware, this.updateMe);
        this.router.get(`${this.path}/me/history`, authMiddleware, this.getGameHistory);
    }

    private updateMe = async (
        req: AuthRequest,
        res: Response
    ): Promise<Response> => {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({
                    message: 'Brak danych użytkownika w tokenie',
                });
            }

            const user = await this.userService.updateMe(req.user.userId, req.body);

            return res.status(200).json({
                message: 'Dane użytkownika zostały zaktualizowane',
                user,
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === 'Użytkownik nie istnieje') {
                return res.status(404).json({ message });
            }

            return res.status(400).json({ message });
        }
    };

    private getGameHistory = async (
        req: AuthRequest,
        res: Response
    ): Promise<Response> => {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({
                    message: 'Brak danych użytkownika w tokenie',
                });
            }

            const rawLimit = Number(req.query.limit);
            const limit = Number.isNaN(rawLimit) ? 20 : rawLimit;

            const history = await this.userService.getGameHistory(req.user.userId, limit);
            return res.status(200).json(history);
        } catch (error) {
            return res.status(500).json({
                message: (error as Error).message,
            });
        }
    };
}

export default UserController;