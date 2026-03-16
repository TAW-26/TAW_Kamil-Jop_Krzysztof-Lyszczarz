import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3100,
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key'
};


if (!config.databaseUrl) {
    console.error("FATAL ERROR: DATABASE_URL is not defined.");
    process.exit(1);
}