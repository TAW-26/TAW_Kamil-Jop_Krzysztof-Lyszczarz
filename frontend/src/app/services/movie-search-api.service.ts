import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { environment } from '../../environments/environment'
import { MovieSearchResult } from '../interfaces/movie.interface'
import { ApiError } from '../interfaces/api-error.interface'
import { toApiCategorySlug } from '../utils/game-category.util'

@Injectable({ providedIn: 'root' })
export class MovieSearchApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/movies`

  searchMovies(query: string, category: string): Observable<MovieSearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('category', toApiCategorySlug(category))

    return this.http.get<MovieSearchResult[]>(`${this.baseUrl}/search`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: { error: ApiError; status: number }): Observable<never> {
    const message = error.error?.message ?? error.error?.error ?? 'Movie search error'
    return throwError(() => new Error(message))
  }
}
