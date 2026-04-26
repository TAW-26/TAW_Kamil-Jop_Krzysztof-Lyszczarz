import bcrypt from 'bcrypt';
import { Prisma, users } from '@prisma/client';
import { prisma } from '../app.js';
import {
    AdminChangePasswordDto,
    AdminChangeRoleDto,
    AdminCreateUserDto,
    AdminUpdateUserDto,
    SafeUser,
} from '../interfaces/auth.interface.js';

class AdminService {
    private toSafeUser(user: users): SafeUser {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            lifetime_points: user.lifetime_points,
            points_balance: user.points_balance,
            current_streak: user.current_streak,
            lifetime_streak: user.lifetime_streak,
            equipped_avatar_id: user.equipped_avatar_id,
            equipped_avatar_url: user.equipped_avatar_url,
            created_at: user.created_at,
        };
    }

    private validateRole(role: string): void {
        if (!['user', 'admin'].includes(role)) {
            throw new Error('Nieprawidłowa rola. Dozwolone: user, admin');
        }
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error('Nieprawidłowy adres e-mail');
        }
    }

    private validateUsername(username: string): void {
        if (username.trim().length < 3) {
            throw new Error('Nazwa użytkownika musi mieć co najmniej 3 znaki');
        }

        if (username.trim().length > 30) {
            throw new Error('Nazwa użytkownika może mieć maksymalnie 30 znaków');
        }
    }

    private validatePassword(password: string): void {
        if (!password || password.length < 6) {
            throw new Error('Hasło musi mieć co najmniej 6 znaków');
        }
    }

    public async createUser(data: AdminCreateUserDto): Promise<SafeUser> {
        const {
            username,
            email,
            password,
            role,
            lifetime_points = 0,
            points_balance = 0,
            current_streak = 0,
            equipped_avatar_id = null,
        } = data;

        if (!username || !email || !password || !role) {
            throw new Error('Username, email, password i role są wymagane');
        }

        this.validateUsername(username);
        this.validateEmail(email);
        this.validatePassword(password);
        this.validateRole(role);

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

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

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.users.create({
                data: {
                    username: normalizedUsername,
                    email: normalizedEmail,
                    password_hash: hashedPassword,
                    role,
                    lifetime_points,
                    points_balance,
                    current_streak,
                    equipped_avatar_id,
                },
            });

            return this.toSafeUser(user);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error('Username lub e-mail są już zajęte');
            }

            console.error('Błąd podczas tworzenia użytkownika:', error);
            throw new Error('Nie udało się utworzyć użytkownika');
        }
    }

    public async getAllUsers(): Promise<SafeUser[]> {
        const users = await prisma.users.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });

        return users.map((user) => this.toSafeUser(user));
    }

    public async getUserById(userId: string): Promise<SafeUser> {
        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('Użytkownik nie istnieje');
        }

        return this.toSafeUser(user);
    }

    public async updateUser(
        userId: string,
        data: AdminUpdateUserDto
    ): Promise<SafeUser> {
        const existingUser = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error('Użytkownik nie istnieje');
        }

        const updateData: Prisma.usersUpdateInput = {};

        if (data.username !== undefined) {
            this.validateUsername(data.username);
            const normalizedUsername = data.username.trim();

            const userWithSameUsername = await prisma.users.findUnique({
                where: { username: normalizedUsername },
            });

            if (userWithSameUsername && userWithSameUsername.id !== userId) {
                throw new Error('Użytkownik o takiej nazwie już istnieje');
            }

            updateData.username = normalizedUsername;
        }

        if (data.email !== undefined) {
            this.validateEmail(data.email);
            const normalizedEmail = data.email.trim().toLowerCase();

            const userWithSameEmail = await prisma.users.findUnique({
                where: { email: normalizedEmail },
            });

            if (userWithSameEmail && userWithSameEmail.id !== userId) {
                throw new Error('Użytkownik z takim adresem e-mail już istnieje');
            }

            updateData.email = normalizedEmail;
        }

        if (data.role !== undefined) {
            this.validateRole(data.role);
            updateData.role = data.role;
        }

        if (data.lifetime_points !== undefined) {
            updateData.lifetime_points = data.lifetime_points;
        }

        if (data.points_balance !== undefined) {
            updateData.points_balance = data.points_balance;
        }

        if (data.current_streak !== undefined) {
            updateData.current_streak = data.current_streak;
        }

        if (data.equipped_avatar_id !== undefined) {
            updateData.equipped_avatar_id = data.equipped_avatar_id;
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData,
        });

        return this.toSafeUser(updatedUser);
    }

    public async changeUserRole(
        userId: string,
        data: AdminChangeRoleDto
    ): Promise<SafeUser> {
        const { role } = data;

        if (!role) {
            throw new Error('Pole role jest wymagane');
        }

        this.validateRole(role);

        const existingUser = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error('Użytkownik nie istnieje');
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { role },
        });

        return this.toSafeUser(updatedUser);
    }

    public async changeUserPassword(
        userId: string,
        data: AdminChangePasswordDto
    ): Promise<void> {
        const { newPassword } = data;

        if (!newPassword) {
            throw new Error('Pole newPassword jest wymagane');
        }

        this.validatePassword(newPassword);

        const existingUser = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error('Użytkownik nie istnieje');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: hashedPassword,
            },
        });
    }

    public async deleteUser(userId: string): Promise<void> {
        const existingUser = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error('Użytkownik nie istnieje');
        }

        await prisma.users.delete({
            where: { id: userId },
        });
    }
}

export default AdminService;