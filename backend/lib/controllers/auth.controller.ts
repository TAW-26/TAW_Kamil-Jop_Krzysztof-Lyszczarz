import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';

class AuthController implements Controller {
    public path = '/auth';
    public router = Router();
    private authService = new AuthService();
    private userService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(`${this.path}/register`, this.register);
        this.router.post(`${this.path}/login`, this.login);
        this.router.get(`${this.path}/me`, authMiddleware, this.me);
        this.router.patch(`${this.path}/change-password`, authMiddleware, this.changePassword);
        this.router.post(`${this.path}/google`, this.googleLogin);
    }

    private register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const user = await this.authService.register(req.body);

            return res.status(201).json({
                message: 'Rejestracja zakończona sukcesem',
                user,
            });
        } catch (error) {
            return res.status(400).json({
                message: (error as Error).message,
            });
        }
    };

    private login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const result = await this.authService.login(req.body);

            return res.status(200).json({
                message: 'Logowanie zakończone sukcesem',
                ...result,
            });
        } catch (error) {
            return res.status(401).json({
                message: (error as Error).message,
            });
        }
    };

    private me = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({
                    message: 'Brak danych użytkownika w tokenie',
                });
            }

            const user = await this.userService.getMe(req.user.userId);

            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({
                message: (error as Error).message,
            });
        }
    };

    private changePassword = async (
        req: AuthRequest,
        res: Response
    ): Promise<Response> => {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({
                    message: 'Brak danych użytkownika w tokenie',
                });
            }

            await this.authService.changePassword(req.user.userId, req.body);

            return res.status(200).json({
                message: 'Hasło zostało zmienione',
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === 'Użytkownik nie istnieje') {
                return res.status(404).json({ message });
            }

            return res.status(400).json({ message });
        }
    };

    private googleLogin = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Brak tokena Google w zapytaniu (wymagane pole "token")' });
            return;
        }
        try {
            const result = await this.authService.loginWithGoogle(token);

            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({
                message: (error as Error).message,
            });
        }
    };
}

export default AuthController;