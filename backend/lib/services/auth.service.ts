import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';
import { config } from '../config.js';
import {
    ChangePasswordDto,
    JwtPayload,
    LoginDto,
    LoginResponse,
    RegisterDto,
    SafeUser,
} from '../interfaces/auth.interface.js';

class AuthService {
    private readonly jwtSecretKey = config.jwtSecret;
    private readonly jwtExpiresIn = config.jwtExpiresIn || '12h';

    private toSafeUser(user: any): SafeUser {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            lifetime_points: user.lifetime_points,
            points_balance: user.points_balance,
            current_streak: user.current_streak,
            equipped_avatar_id: user.equipped_avatar_id,
            created_at: user.created_at,
        };
    }

    private validateRegisterData(userData: RegisterDto): void {
        const { username, email, password } = userData;

        if (!username || !email || !password) {
            throw new Error('Wszystkie pola są wymagane');
        }

        if (username.trim().length < 3) {
            throw new Error('Nazwa użytkownika musi mieć co najmniej 3 znaki');
        }

        if (username.trim().length > 30) {
            throw new Error('Nazwa użytkownika może mieć maksymalnie 30 znaków');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Nieprawidłowy adres e-mail');
        }

        if (password.length < 6) {
            throw new Error('Hasło musi mieć co najmniej 6 znaków');
        }
    }

    private validateLoginData(loginData: LoginDto): void {
        const { username, password } = loginData;

        if (!username || !password) {
            throw new Error('Username i password są wymagane');
        }
    }

    public async register(userData: RegisterDto): Promise<SafeUser> {
        this.validateRegisterData(userData);

        const normalizedUsername = userData.username.trim();
        const normalizedEmail = userData.email.trim().toLowerCase();

        const existingUserByUsername = await prisma.users.findUnique({
            where: { username: normalizedUsername },
        });

        if (existingUserByUsername) {
            throw new Error('Użytkownik o takiej nazwie już istnieje');
        }

        const existingUserByEmail = await prisma.users.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUserByEmail) {
            throw new Error('Użytkownik z takim adresem e-mail już istnieje');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        try {
            const newUser = await prisma.users.create({
                data: {
                    username: normalizedUsername,
                    email: normalizedEmail,
                    password_hash: hashedPassword,
                    role: 'user',
                },
            });

            return this.toSafeUser(newUser);
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new Error('Username lub e-mail są już zajęte');
            }

            console.error('Registration error:', error.message);
            throw new Error('Nie udało się zarejestrować użytkownika');
        }
    }

    public async login(loginData: LoginDto): Promise<LoginResponse> {
        this.validateLoginData(loginData);

        const normalizedUsername = loginData.username.trim();

        const user = await prisma.users.findUnique({
            where: { username: normalizedUsername },
        });

        if (!user) {
            throw new Error('Nieprawidłowy username lub hasło');
        }

        const isPasswordValid = await bcrypt.compare(
            loginData.password,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new Error('Nieprawidłowy username lub hasło');
        }

        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
            role: user.role || 'user',
        };

        const token = jwt.sign(payload, this.jwtSecretKey, {
            expiresIn: this.jwtExpiresIn as jwt.SignOptions['expiresIn'],
        });

        return {
            token,
            user: this.toSafeUser(user),
        };
    }

    public async changePassword(
        userId: string,
        data: ChangePasswordDto
    ): Promise<void> {
        const { currentPassword, newPassword } = data;

        if (!currentPassword || !newPassword) {
            throw new Error('currentPassword i newPassword są wymagane');
        }

        if (newPassword.length < 6) {
            throw new Error('Nowe hasło musi mieć co najmniej 6 znaków');
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('Użytkownik nie istnieje');
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );

        if (!isCurrentPasswordValid) {
            throw new Error('Aktualne hasło jest nieprawidłowe');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: hashedPassword,
            },
        });
    }


}

export default AuthService;