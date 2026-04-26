import { Injectable, computed, inject, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import {
  ChangePasswordRequest,
  GoogleLoginRequest,
  GoogleLoginResponse,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  SafeUser,
  UpdateMeRequest,
  UserUpdateResponse
} from '../interfaces/auth.interface'
import { ApiError } from '../interfaces/api-error.interface'

const TOKEN_KEY = 'auth_token'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl

  private readonly currentUserSignal = signal<SafeUser | null>(null)
  private readonly tokenSignal = signal<string | null>(this.getStoredToken())

  readonly currentUser = this.currentUserSignal.asReadonly()
  readonly token = this.tokenSignal.asReadonly()
  readonly isAuthenticated = computed(() => !!this.tokenSignal())
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin')
  readonly username = computed(() => this.currentUserSignal()?.username ?? null)

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      catchError(this.handleError)
    )
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap(response => {
        this.setToken(response.token)
        this.currentUserSignal.set(response.user)
      }),
      catchError(this.handleError)
    )
  }

  loginWithGoogle(payload: GoogleLoginRequest): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(`${this.baseUrl}/auth/google`, payload).pipe(
      tap(response => {
        this.setToken(response.token)
        this.currentUserSignal.set(response.user)
      }),
      catchError(this.handleError)
    )
  }

  fetchCurrentUser(): Observable<SafeUser> {
    return this.http.get<SafeUser>(`${this.baseUrl}/auth/me`).pipe(
      tap(user => this.currentUserSignal.set(user)),
      catchError(this.handleError)
    )
  }

  changePassword(payload: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseUrl}/auth/change-password`, payload).pipe(
      catchError(this.handleError)
    )
  }

  updateMe(payload: UpdateMeRequest): Observable<UserUpdateResponse> {
    return this.http.patch<UserUpdateResponse>(`${this.baseUrl}/users/me`, payload).pipe(
      tap(response => this.currentUserSignal.set(response.user)),
      catchError(this.handleError)
    )
  }

  logout(): void {
    this.removeToken()
    this.currentUserSignal.set(null)
  }

  getTokenValue(): string | null {
    return this.tokenSignal()
  }

  decodeToken(): JwtPayload | null {
    const token = this.tokenSignal()
    if (!token) return null

    try {
      const payloadBase64 = token.split('.')[1]
      const decoded = atob(payloadBase64)
      return JSON.parse(decoded) as JwtPayload
    } catch {
      return null
    }
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken()
    if (!payload?.exp) return true
    return Date.now() >= payload.exp * 1000
  }

  restoreSession(): void {
    const token = this.getStoredToken()
    if (token) {
      this.tokenSignal.set(token)
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      })
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    this.tokenSignal.set(token)
  }

  private removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    this.tokenSignal.set(null)
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'An unexpected error occurred'
    return throwError(() => new Error(message))
  }
}
