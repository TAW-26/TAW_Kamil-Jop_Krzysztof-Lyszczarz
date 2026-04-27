import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import {
  PointsLeaderboardEntry,
  StreakLeaderboardEntry,
  TriesHistogramEntry
} from '../interfaces/leaderboard.interface'
import { ApiError } from '../interfaces/api-error.interface'

@Injectable({ providedIn: 'root' })
export class LeaderboardApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/leaderboard`

  fetchPointsLeaderboard(): Observable<PointsLeaderboardEntry[]> {
    return this.http.get<PointsLeaderboardEntry[]>(`${this.baseUrl}/points`).pipe(
      catchError(this.handleError)
    )
  }

  fetchStreaksLeaderboard(): Observable<StreakLeaderboardEntry[]> {
    return this.http.get<StreakLeaderboardEntry[]>(`${this.baseUrl}/streaks`).pipe(
      catchError(this.handleError)
    )
  }

  fetchTriesHistogram(categorySlug: string): Observable<TriesHistogramEntry[]> {
    const params = new HttpParams().set('categorySlug', categorySlug)

    return this.http.get<TriesHistogramEntry[]>(`${this.baseUrl}/tries`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'Failed to load leaderboard'
    return throwError(() => new Error(message))
  }
}
