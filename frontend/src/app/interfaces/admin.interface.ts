import { SafeUser } from './auth.interface'

export type UserRole = 'user' | 'admin'

export interface AdminCreateUserRequest {
  username: string
  email: string
  password: string
  role: UserRole
  lifetime_points?: number
  points_balance?: number
  current_streak?: number
  equipped_avatar_id?: number | null
}

export interface AdminUpdateUserRequest {
  username?: string
  email?: string
  role?: UserRole
  lifetime_points?: number
  points_balance?: number
  current_streak?: number
  equipped_avatar_id?: number | null
}

export interface AdminChangeRoleRequest {
  role: UserRole
}

export interface AdminChangePasswordRequest {
  newPassword: string
}

export interface AdminUserResponse {
  message: string
  user: SafeUser
}
