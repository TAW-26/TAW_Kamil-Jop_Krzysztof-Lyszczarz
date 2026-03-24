import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];

    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function getEnvNumber(name: string, defaultValue?: number): number {
    const value = process.env[name];

    if (!value || value.trim() === '') {
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`Missing required environment variable: ${name}`);
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number`);
    }

    return parsed;
}

export const config = {
    port: getEnvNumber('PORT', 3000),
    databaseUrl: getEnv('DATABASE_URL'),
    redisUrl: getEnv('REDIS_URL'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
    googleClientId: getEnv('GOOGLE_CLIENT_ID'),
};