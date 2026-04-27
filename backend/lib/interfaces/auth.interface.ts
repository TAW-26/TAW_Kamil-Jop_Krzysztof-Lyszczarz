//Logowanie rejestracja
export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface JwtPayload {
    userId: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface SafeUser {
    id: string;
    username: string;
    email: string;
    role: string | null;
    lifetime_points: number | null;
    points_balance: number | null;
    games_played: number | null;
    current_streak: number | null;
    lifetime_streak: number | null;
    equipped_avatar_id: number | null;
    equipped_avatar_url: string | null;
    created_at: Date | null;
}

export interface LoginResponse {
    token: string;
    user: SafeUser;
}
//Admin
export interface AdminCreateUserDto {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    lifetime_points?: number;
    points_balance?: number;
    current_streak?: number;
    equipped_avatar_id?: number | null;
}

export interface AdminUpdateUserDto {
    username?: string;
    email?: string;
    role?: 'user' | 'admin';
    lifetime_points?: number;
    points_balance?: number;
    current_streak?: number;
    equipped_avatar_id?: number | null;
}

export interface AdminChangeRoleDto {
    role: 'user' | 'admin';
}

export interface AdminChangePasswordDto {
    newPassword: string;
}

//Użytkownik
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateMeDto {
    username?: string;
    email?: string;
}