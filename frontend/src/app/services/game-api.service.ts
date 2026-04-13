import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import {
  GameStateResponse,
  GuessRequest,
  GuessResponse,
  HintResponse
} from '../interfaces/game.interface'
import { ApiError } from '../interfaces/api-error.interface'

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/game`

  submitGuess(payload: GuessRequest): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(`${this.baseUrl}/guess`, payload).pipe(
      catchError(this.handleError)
    )
  }

  fetchHint(categorySlug: string, hintIndex: number, guestAttempts?: number): Observable<HintResponse> {
    let params = new HttpParams()
      .set('categorySlug', categorySlug)
      .set('hintIndex', hintIndex.toString())

    if (guestAttempts !== undefined) {
      params = params.set('guestAttempts', guestAttempts.toString())
    }

    return this.http.get<HintResponse>(`${this.baseUrl}/hint`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  fetchGameState(categorySlug: string): Observable<GameStateResponse> {
    const params = new HttpParams().set('categorySlug', categorySlug)

    return this.http.get<GameStateResponse>(`${this.baseUrl}/current`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'Blad podczas komunikacji z serwerem gry'
    return throwError(() => new Error(message))
  }
}
