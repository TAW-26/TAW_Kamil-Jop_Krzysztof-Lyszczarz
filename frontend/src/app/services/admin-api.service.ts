import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import { SafeUser, MessageResponse } from '../interfaces/auth.interface'
import {
  AdminChangePasswordRequest,
  AdminChangeRoleRequest,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUserResponse
} from '../interfaces/admin.interface'
import { ApiError } from '../interfaces/api-error.interface'

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/admin`

  createUser(payload: AdminCreateUserRequest): Observable<AdminUserResponse> {
    return this.http.post<AdminUserResponse>(`${this.baseUrl}/users`, payload).pipe(
      catchError(this.handleError)
    )
  }

  fetchAllUsers(): Observable<SafeUser[]> {
    return this.http.get<SafeUser[]>(`${this.baseUrl}/users`).pipe(
      catchError(this.handleError)
    )
  }

  fetchUserById(userId: string): Observable<SafeUser> {
    return this.http.get<SafeUser>(`${this.baseUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    )
  }

  updateUser(userId: string, payload: AdminUpdateUserRequest): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/users/${userId}`, payload).pipe(
      catchError(this.handleError)
    )
  }

  changeUserRole(userId: string, payload: AdminChangeRoleRequest): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/users/${userId}/role`, payload).pipe(
      catchError(this.handleError)
    )
  }

  changeUserPassword(userId: string, payload: AdminChangePasswordRequest): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseUrl}/users/${userId}/password`, payload).pipe(
      catchError(this.handleError)
    )
  }

  deleteUser(userId: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'Blad podczas operacji administracyjnej'
    return throwError(() => new Error(message))
  }
}
