import { RequestHandler, Request, Response, NextFunction } from 'express';
export const loggingMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Funkcja wywoła się, gdy serwer wyśle odpowiedź do klienta
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms - ${new Date().toISOString()}`);
    });

    next();
}