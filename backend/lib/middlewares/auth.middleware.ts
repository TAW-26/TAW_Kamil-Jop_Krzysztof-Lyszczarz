import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface TokenPayload {
    id: string;
    email?: string;
    iat: number;
    exp: number;
}

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const secretKey = config.jwtSecret;
        const decoded = jwt.verify(token, secretKey) as TokenPayload;
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Error:', (error as Error).message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}