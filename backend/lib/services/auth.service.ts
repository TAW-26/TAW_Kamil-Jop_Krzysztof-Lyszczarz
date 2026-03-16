import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js'; 
import { prisma } from '../app.js';
import { users } from '@prisma/client';
import { IToken, LoginDto, RegisterDto } from '../interfaces/auth.interface.js';
class AuthService {
    private jwtSecretKey = config.jwtSecret;

    public async register(userData: RegisterDto) : Promise<users> {
        try{
            if(!userData.password || !userData.email || !userData.username) {
            throw new Error('Missing required fields');
        }

        const existingUser = await prisma.users.findUnique({ where: { email: userData.email } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = await prisma.users.create({
            data: {
                username: userData.username,
                email: userData.email,
                password_hash: hashedPassword,
                role: 'user',
            }
            
        });
        const { password_hash, ...userWithoutPassword } = newUser;
        return userWithoutPassword as users;

        }
        catch(error:any) {
            if (error.code === 'P2002') {
                throw new Error('Email or Username already taken');
            }
            console.error('Registration error:', (error as Error).message);
            throw error;
        }
    }

    public async login(loginData : LoginDto) : Promise<IToken | null> {
        const user = await prisma.users.findUnique({ where: { email: loginData.email } });
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
        if (!isPasswordValid) {
            return null;
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username }, 
            this.jwtSecretKey, 
            { expiresIn: '12h' }
        );
        return { token };
    }
}