import { Injectable, inject, signal } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import {
  OwnedAvatar,
  PurchaseAvatarRequest,
  ShopItemsParams,
  ShopItemsResponse
} from '../interfaces/avatar-shop.interface'
import { MessageResponse } from '../interfaces/auth.interface'
import { ApiError } from '../interfaces/api-error.interface'

@Injectable({ providedIn: 'root' })
export class AvatarShopApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/avatar-shop`

  private readonly ownedAvatarsSignal = signal<OwnedAvatar[]>([])
  readonly ownedAvatars = this.ownedAvatarsSignal.asReadonly()

  fetchShopItems(filters: ShopItemsParams = {}): Observable<ShopItemsResponse> {
    let params = new HttpParams()

    if (filters.page) params = params.set('page', filters.page.toString())
    if (filters.limit) params = params.set('limit', filters.limit.toString())
    if (filters.ownership) params = params.set('ownership', filters.ownership)
    if (filters.sortYear) params = params.set('sortYear', filters.sortYear)
    if (filters.genre) params = params.set('genre', filters.genre.toString())
    if (filters.search) params = params.set('search', filters.search)

    return this.http.get<ShopItemsResponse>(`${this.baseUrl}/avatars`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  fetchOwnedAvatars(): Observable<OwnedAvatar[]> {
    return this.http.get<OwnedAvatar[]>(`${this.baseUrl}/owned-avatars`).pipe(
      tap(avatars => this.ownedAvatarsSignal.set(avatars)),
      catchError(this.handleError)
    )
  }

  purchaseAvatar(movieId: number): Observable<MessageResponse> {
    const body: PurchaseAvatarRequest = { movieId }

    return this.http.post<MessageResponse>(`${this.baseUrl}/purchase`, body).pipe(
      catchError(this.handleError)
    )
  }

  equipAvatar(movieId: number): Observable<MessageResponse> {
    const body: PurchaseAvatarRequest = { movieId }

    return this.http.post<MessageResponse>(`${this.baseUrl}/equip`, body).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'Avatar shop error'
    return throwError(() => new Error(message))
  }
}
