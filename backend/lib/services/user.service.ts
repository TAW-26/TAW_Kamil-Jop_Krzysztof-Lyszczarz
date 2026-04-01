import { users } from '@prisma/client';
import { prisma } from '../app.js';
import { SafeUser, UpdateMeDto } from '../interfaces/auth.interface.js';

class UserService {
    private toSafeUser(user: users): SafeUser {
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

    public async getMe(userId: string): Promise<SafeUser> {
        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('Użytkownik nie istnieje');
        }

        return this.toSafeUser(user);
    }

    public async updateMe(userId: string, data: UpdateMeDto): Promise<SafeUser> {
        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('Użytkownik nie istnieje');
        }

        const updateData: Partial<{ username: string; email: string }> = {};

        if (data.username !== undefined) {
            if (!data.username || data.username.trim().length < 3) {
                throw new Error('Nazwa użytkownika musi mieć co najmniej 3 znaki');
            }

            if (data.username.trim().length > 30) {
                throw new Error('Nazwa użytkownika może mieć maksymalnie 30 znaków');
            }

            const normalizedUsername = data.username.trim();

            const existingUserByUsername = await prisma.users.findUnique({
                where: { username: normalizedUsername },
            });

            if (existingUserByUsername && existingUserByUsername.id !== userId) {
                throw new Error('Użytkownik o takiej nazwie już istnieje');
            }

            updateData.username = normalizedUsername;
        }

        if (data.email !== undefined) {
            const normalizedEmail = data.email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                throw new Error('Nieprawidłowy adres e-mail');
            }

            const existingUserByEmail = await prisma.users.findUnique({
                where: { email: normalizedEmail },
            });

            if (existingUserByEmail && existingUserByEmail.id !== userId) {
                throw new Error('Użytkownik z takim adresem e-mail już istnieje');
            }

            updateData.email = normalizedEmail;
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData,
        });

        return this.toSafeUser(updatedUser);
    }
}

export default UserService;