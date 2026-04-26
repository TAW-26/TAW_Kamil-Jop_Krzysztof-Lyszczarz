import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MovieSearchResult } from '../../../interfaces/movie.interface';
import { MovieSearchApiService } from '../../../services/movie-search-api.service';

const TMDB_POSTER_W92 = 'https://image.tmdb.org/t/p/w92';

@Component({
  selector: 'app-search-input',
  imports: [CommonModule],
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInput implements OnChanges {
  @Input() categorySlug = '';

  readonly guess = output<MovieSearchResult>();
  readonly guessInvalid = output<void>();

  private readonly movieSearch = inject(MovieSearchApiService);
  private readonly lockedMovie = signal<MovieSearchResult | null>(null);
  private readonly querySubject = new Subject<string>();

  protected query = '';
  protected readonly showDropdown = signal(false);
  protected readonly isSearchPending = signal(false);
  protected readonly showNoMatchesMessage = signal(false);
  protected readonly apiSuggestions = signal<MovieSearchResult[]>([]);
  protected readonly shimmerRowIndexes = [0, 1, 2];

  constructor() {
    this.querySubject
      .pipe(
        tap((rawQuery) => {
          const term = rawQuery.trim();
          const category = this.categorySlug.trim();
          if (!term || !category) {
            this.isSearchPending.set(false);
            this.showDropdown.set(false);
            return;
          }
          this.isSearchPending.set(true);
          this.showDropdown.set(true);
        }),
        debounceTime(80),
        distinctUntilChanged(),
        switchMap((q) => {
          const term = q.trim();
          const cat = this.categorySlug.trim();
          if (!term || !cat) {
            return of<MovieSearchResult[]>([]);
          }
          return this.movieSearch.searchMovies(term, cat).pipe(
            catchError(() => of<MovieSearchResult[]>([])),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((results) => {
        const term = this.query.trim();
        const category = this.categorySlug.trim();
        this.isSearchPending.set(false);
        this.apiSuggestions.set(results);
        if (!term || !category) {
          this.showDropdown.set(false);
          this.showNoMatchesMessage.set(false);
          return;
        }
        this.showDropdown.set(true);
        this.showNoMatchesMessage.set(results.length === 0);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categorySlug'] && !changes['categorySlug'].firstChange) {
      this.querySubject.next(this.query);
    }
  }

  protected posterUrl(posterPath: string): string {
    const p = posterPath.trim();
    if (!p) {
      return '';
    }
    const path = p.startsWith('/') ? p : `/${p}`;
    return `${TMDB_POSTER_W92}${path}`;
  }

  protected onInput(value: string): void {
    this.query = value;
    const lock = this.lockedMovie();
    if (lock && !this.movieMatchesTypedQuery(lock, value)) {
      this.lockedMovie.set(null);
    }
    this.querySubject.next(value);
  }

  protected onGuessClick(): void {
    const movie = this.resolveMovieForGuess();
    if (!movie) {
      this.guessInvalid.emit();
      return;
    }
    this.guess.emit(movie);
  }

  protected selectSuggestion(movie: MovieSearchResult): void {
    this.lockedMovie.set(null);
    this.query = '';
    this.apiSuggestions.set([]);
    this.showDropdown.set(false);
    this.isSearchPending.set(false);
    this.showNoMatchesMessage.set(false);
    this.querySubject.next('');
    this.guess.emit(movie);
  }

  protected closeSuggestions(): void {
    setTimeout(() => {
      this.showDropdown.set(false);
      this.isSearchPending.set(false);
      this.showNoMatchesMessage.set(false);
    }, 120);
  }

  protected trackByMovieId(_index: number, movie: MovieSearchResult): number {
    return movie.id;
  }

  protected trackByShimmerRow(_index: number, row: number): number {
    return row;
  }

  private resolveMovieForGuess(): MovieSearchResult | null {
    const raw = this.query.trim();
    if (!raw) {
      return null;
    }
    const locked = this.lockedMovie();
    if (locked && this.movieMatchesTypedQuery(locked, raw)) {
      return locked;
    }
    for (const movie of this.apiSuggestions()) {
      if (this.movieMatchesTypedQuery(movie, raw)) {
        return movie;
      }
    }
    return null;
  }

  private movieMatchesTypedQuery(movie: MovieSearchResult, typed: string): boolean {
    const q = this.normalizeTitle(typed);
    if (!q) {
      return false;
    }
    if (this.normalizeTitle(movie.title) === q) {
      return true;
    }
    if (movie.original_title && this.normalizeTitle(movie.original_title) === q) {
      return true;
    }
    return false;
  }

  private normalizeTitle(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
