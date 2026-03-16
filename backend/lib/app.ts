import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { PrismaClient } from '@prisma/client';
import Controller from "./interfaces/controller.interface.js"
import { Redis } from 'ioredis';
import { loggingMiddleware } from './middlewares/loggingMiddleware.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

export const prisma = new PrismaClient();
export const redis = new Redis(config.redisUrl);

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.connectToDatabase();
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(loggingMiddleware);
        this.app.use(authMiddleware);
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private async connectToDatabase(): Promise<void> {
        redis.on('connect', () => {console.log('Redis: Connected');});
        redis.on('error', (err) => {console.error('Redis connection error:', err);});
        try {
            await prisma.$connect();
            console.log('Connection with PostgreSQL established');
        } catch (error) {
            console.error('Error connecting to database:', error);
            process.exit(1);
        }


        process.on('SIGINT', async () => {
            await prisma.$disconnect();
            await redis.quit();
            console.log('Database connection closed');
            process.exit(0);
        });
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}

export default App;