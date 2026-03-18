import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { PrismaClient } from '@prisma/client';
import Controller from "./interfaces/controller.interface.js"
import { Redis } from 'ioredis';
import { loggingMiddleware } from './middlewares/loggingMiddleware.middleware.js';
import DailyRandomizerService from './services/dailyRandomizer.service.js';
import cron from 'node-cron';
import AutoCompleteService from './services/autocomplete.service.js';

export const prisma = new PrismaClient();
export const redis = new Redis(config.redisUrl);
export const autoCompleteService = new AutoCompleteService();
class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.connectToRedis();
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(loggingMiddleware);
    }

    public async init(): Promise<void> {
        await this.connectToDatabase();
        await this.initializeDailyRandomizer();
        await autoCompleteService.initializeCacheIfNeeded();
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private async connectToDatabase(): Promise<void> {
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

    private connectToRedis(): void {
        redis.on('connect', () => {
            console.log('Connected to Redis');
        });
        redis.on('error', (err) => {
            console.error('Redis connection error:', err);
        }
        );
    }

    private async initializeDailyRandomizer(): Promise<void> {
        try {
            const dailyRandomizerService = new DailyRandomizerService();
            await dailyRandomizerService.run(); 
            cron.schedule('0 2 * * *', async () => { 
                console.log('Running daily randomizer task at 2:00 AM');
                await dailyRandomizerService.run();},
                { timezone: 'Europe/Warsaw' }
            );
        } catch(error){
            console.error('Error scheduling daily randomizer task:', error);
        }
    }


    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}

export default App;