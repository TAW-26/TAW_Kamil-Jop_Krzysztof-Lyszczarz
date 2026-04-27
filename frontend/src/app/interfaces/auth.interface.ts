export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface GoogleLoginRequest {
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateMeRequest {
  username?: string
  email?: string
}

export interface SafeUser {
  id: string
  username: string
  email: string
  role: string | null
  lifetime_points: number | null
  points_balance: number | null
  games_played: number | null
  current_streak: number | null
  lifetime_streak: number | null
  equipped_avatar_id: number | null
  equipped_avatar_url: string | null
  created_at: string | null
}

export interface LoginResponse {
  message: string
  token: string
  user: SafeUser
}

export interface RegisterResponse {
  message: string
  user: SafeUser
}

export interface GoogleLoginResponse {
  token: string
  user: SafeUser
}

export interface MessageResponse {
  message: string
}

export interface UserUpdateResponse {
  message: string
  user: SafeUser
}

export interface GameHistoryItem {
  playedAt: string | null
  categoryName: string
  attempts: number
  isWon: boolean
}

export interface JwtPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}
