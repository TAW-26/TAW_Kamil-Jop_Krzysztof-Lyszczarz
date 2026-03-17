import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import AdminService from '../services/admin.service.js';

class AdminController implements Controller {
    public path = '/admin';
    public router = Router();
    private adminService = new AdminService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            `${this.path}/users`,
            authMiddleware,
            requireRole('admin'),
            this.createUser
        );

        this.router.get(
            `${this.path}/users`,
            authMiddleware,
            requireRole('admin'),
            this.getAllUsers
        );

        this.router.get(
            `${this.path}/users/:id`,
            authMiddleware,
            requireRole('admin'),
            this.getUserById
        );

        this.router.patch(
            `${this.path}/users/:id`,
            authMiddleware,
            requireRole('admin'),
            this.updateUser
        );

        this.router.patch(
            `${this.path}/users/:id/role`,
            authMiddleware,
            requireRole('admin'),
            this.changeUserRole
        );

        this.router.patch(
            `${this.path}/users/:id/password`,
            authMiddleware,
            requireRole('admin'),
            this.changeUserPassword
        );

        this.router.delete(
            `${this.path}/users/:id`,
            authMiddleware,
            requireRole('admin'),
            this.deleteUser
        );
    }

    private createUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const user = await this.adminService.createUser(req.body);

            return res.status(201).json({
                message: 'Użytkownik został utworzony',
                user,
            });
        } catch (error) {
            return res.status(400).json({
                message: (error as Error).message,
            });
        }
    };

    private getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const users = await this.adminService.getAllUsers();

            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({
                message: (error as Error).message,
            });
        }
    };

    private getUserById = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<Response> => {
        try {
            const user = await this.adminService.getUserById(req.params.id);

            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({
                message: (error as Error).message,
            });
        }
    };

    private updateUser = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<Response> => {
        try {
            const user = await this.adminService.updateUser(req.params.id, req.body);

            return res.status(200).json({
                message: 'Użytkownik został zaktualizowany',
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

    private changeUserRole = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<Response> => {
        try {
            const user = await this.adminService.changeUserRole(req.params.id, req.body);

            return res.status(200).json({
                message: 'Rola użytkownika została zmieniona',
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

    private changeUserPassword = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<Response> => {
        try {
            await this.adminService.changeUserPassword(req.params.id, req.body);

            return res.status(200).json({
                message: 'Hasło użytkownika zostało zmienione',
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === 'Użytkownik nie istnieje') {
                return res.status(404).json({ message });
            }

            return res.status(400).json({ message });
        }
    };

    private deleteUser = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<Response> => {
        try {
            await this.adminService.deleteUser(req.params.id);

            return res.status(200).json({
                message: 'Użytkownik został usunięty',
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === 'Użytkownik nie istnieje') {
                return res.status(404).json({ message });
            }

            return res.status(400).json({ message });
        }
    };
}

export default AdminController;