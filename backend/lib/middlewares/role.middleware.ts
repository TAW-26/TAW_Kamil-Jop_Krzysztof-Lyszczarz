import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Brak autoryzacji',
            });
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Brak uprawnień',
            });
        }

        next();
    };
};