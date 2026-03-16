import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3100,
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL || '',
    jwtSecret: process.env.JWT_SECRET || ''
};


if (!config.databaseUrl) {
    console.error("FATAL ERROR: DATABASE_URL is not defined.");
    process.exit(1);
}

if (!config.redisUrl) {
    console.error("FATAL ERROR: REDIS_URL is not defined.");
    process.exit(1);
}

if (!config.jwtSecret) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}