import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { JwtPayload } from '../interfaces/auth.interface.js';

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Response | void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, config.jwtSecret) as JwtPayload;
        next();
    } catch (error) {
        console.error('JWT error:', (error as Error).message);
        return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
    }
};