import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { GuessRow, GuessRowTile } from '../../shared/components/guess-row/guess-row';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Ticket, TicketTheme } from '../../shared/components/ticket/ticket';
import { GameWinDialog } from '../../shared/components/game-win-dialog/game-win-dialog';
import { GameHintsPanel } from '../../shared/components/game-hints-panel/game-hints-panel';
import { MovieSearchResult } from '../../interfaces/movie.interface';
import { AuthService } from '../../services/auth.service';
import { GameApiService } from '../../services/game-api.service';
import { ToastService } from '../../services/toast.service';
import {
  isDailyCategoryKey,
  toApiCategorySlug,
} from '../../utils/game-category.util';
import { ticketThemeFromSlug } from '../../utils/ticket-theme.util';
import {
  loadGuessRowsFromStorage,
  saveGuessRowsToStorage,
  utcTodayString,
} from '../../utils/game-session-storage.util';
import { mapGameStateGuessToTiles, mapGuessResultToTiles } from '../../utils/guess-row-mapper.util';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
    Navbar,
    Footer,
    SearchInput,
    GuessRow,
    Ticket,
    GameWinDialog,
    GameHintsPanel,
  ],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, AfterViewInit, OnDestroy {
  protected categoryTitle = 'DAILY';
  protected ticketTitle = 'DAILY';
  protected ticketTheme: TicketTheme = 'default';
  protected apiCategorySlug = 'top-500-revenue';
  protected readonly headers = [
    'MOVIE',
    'GENRE',
    'STUDIOS',
    'CAST',
    'REVENUE',
    'IMDB RATING',
    'YEAR',
  ];
  protected readonly guessRows = signal<GuessRowTile[][]>([]);
  protected readonly winSummary = signal<{
    movieTitle: string;
    guessCount: number;
    ticketsAwarded: number | null;
  } | null>(null);
  protected readonly animateNewestRow = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameApi = inject(GameApiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  private routeSubscription?: Subscription;
  private shouldAutoScrollToPlay = false;
  private hasAutoScrolledToPlay = false;
  private autoScrollTimeoutId?: number;
  private revealAnimationTimeoutId?: number;

  @ViewChild('playSection', { static: false })
  private playSectionRef?: ElementRef<HTMLElement>;

  protected get isGameAuthenticated(): boolean {
    const token = this.auth.getTokenValue();
    return !!token && !this.auth.isTokenExpired();
  }

  protected get watermarkClass(): string {
    switch (this.ticketTheme) {
      case 'horror':
        return 'game-page__watermark--horror';
      case 'cartoons':
        return 'game-page__watermark--cartoons';
      case 'daily-challenge':
        return 'game-page__watermark--daily';
      case 'polish':
        return 'game-page__watermark--polish';
      case 'oscar':
        return 'game-page__watermark--oscar';
      case 'rotten':
        return 'game-page__watermark--rotten';
      default:
        return 'text-gold-color';
    }
  }

  protected get isRevenueHiddenForCategory(): boolean {
    return this.apiCategorySlug === 'polish';
  }

  ngOnInit(): void {
    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe(([params, query]) => {
      this.winSummary.set(null);
      this.animateNewestRow.set(false);
      if (this.revealAnimationTimeoutId) {
        window.clearTimeout(this.revealAnimationTimeoutId);
        this.revealAnimationTimeoutId = undefined;
      }
      const pathCategory = params.get('category');
      if (pathCategory === 'daily') {
        const queryParamsToKeep: Record<string, string> = {};
        for (const paramName of query.keys) {
          const paramValue = query.get(paramName);
          if (paramValue !== null) {
            queryParamsToKeep[paramName] = paramValue;
          }
        }
        void this.router.navigate(['/game', 'top-500-revenue'], {
          replaceUrl: true,
          queryParams: queryParamsToKeep,
        });
        return;
      }
      const queryCategory = query.get('category');
      const raw = pathCategory || queryCategory || 'daily';
      this.apiCategorySlug = toApiCategorySlug(pathCategory || queryCategory);
      this.categoryTitle = this.toDisplayTitle(raw);
      this.ticketTitle = this.categoryTitle;
      this.ticketTheme = ticketThemeFromSlug(this.apiCategorySlug);
      this.shouldAutoScrollToPlay = query.get('autoscroll') === '1';
      this.hasAutoScrolledToPlay = false;

      const today = utcTodayString();
      const fromLocal = loadGuessRowsFromStorage(this.apiCategorySlug, today);
      if (fromLocal && fromLocal.length > 0) {
        this.guessRows.set(fromLocal);
        this.winSummary.set(this.restoreWinSummaryFromRows(fromLocal));
      } else {
        this.guessRows.set([]);
        const token = this.auth.getTokenValue();
        if (token && !this.auth.isTokenExpired()) {
          this.gameApi.fetchGameState(this.apiCategorySlug).subscribe({
            next: (state) => {
              if (!state.guesses?.length) {
                return;
              }
              const rowsChrono = state.guesses.map((g) => mapGameStateGuessToTiles(g));
              const rows = [...rowsChrono].reverse();
              this.guessRows.set(rows);
              saveGuessRowsToStorage(this.apiCategorySlug, today, rows);
              if (state.isWon) {
                const latestGuess = state.guesses[state.guesses.length - 1];
                this.winSummary.set({
                  movieTitle: latestGuess?.title ?? '—',
                  guessCount: state.attempts && state.attempts > 0 ? state.attempts : rows.length,
                  ticketsAwarded: null,
                });
              }
            },
            error: () => {},
          });
        }
      }

      this.scheduleAutoScrollToPlay();
    });
  }

  ngAfterViewInit(): void {
    this.scheduleAutoScrollToPlay();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    if (this.autoScrollTimeoutId) {
      window.clearTimeout(this.autoScrollTimeoutId);
    }
    if (this.revealAnimationTimeoutId) {
      window.clearTimeout(this.revealAnimationTimeoutId);
    }
  }

  protected onMovieGuess(movie: MovieSearchResult): void {
    this.gameApi
      .submitGuess({ categorySlug: this.apiCategorySlug, guessMovieId: movie.id })
      .subscribe({
        next: (res) => {
          this.animateNewestRow.set(false);
          if (this.revealAnimationTimeoutId) {
            window.clearTimeout(this.revealAnimationTimeoutId);
          }
          const row = mapGuessResultToTiles(res.guessResult);
          let guessCountAfter = 0;
          this.guessRows.update((rows) => {
            const next = [row, ...rows];
            guessCountAfter = next.length;
            saveGuessRowsToStorage(this.apiCategorySlug, utcTodayString(), next);
            return next;
          });
          this.animateNewestRow.set(true);
          this.revealAnimationTimeoutId = window.setTimeout(() => {
            this.animateNewestRow.set(false);
            this.revealAnimationTimeoutId = undefined;
          }, 950);
          if (res.guessResult.isCorrect) {
            const guessCount =
              res.attempts > 0 ? res.attempts : guessCountAfter;
            const tickets =
              res.ticketsAwarded === undefined || res.ticketsAwarded === null
                ? null
                : res.ticketsAwarded;
            this.winSummary.set({
              movieTitle: res.guessResult.movieTitle ?? '—',
              guessCount,
              ticketsAwarded: tickets,
            });
            this.auth.fetchCurrentUser().subscribe({ error: console.error });
          }
        },
        error: (err: Error) => this.toast.show(err.message),
      });
  }

  protected onGuessInvalid(): void {
    this.toast.show('Pick a movie from the list or type its exact title.');
  }

  protected closeWinDialog(): void {
    this.winSummary.set(null);
  }

  protected trackGuessRowIndex(index: number, _row: GuessRowTile[]): number {
    return index;
  }

  private restoreWinSummaryFromRows(rows: GuessRowTile[][]): {
    movieTitle: string;
    guessCount: number;
    ticketsAwarded: number | null;
  } | null {
    const winningRow = rows.find((row) => row[0]?.state === 'correct');
    if (!winningRow) {
      return null;
    }
    const movieTitle = winningRow[0]?.text?.trim() || '—';
    return {
      movieTitle,
      guessCount: rows.length,
      ticketsAwarded: null,
    };
  }

  private toDisplayTitle(raw: string): string {
    const resolved = raw.replace(/[-_]+/g, ' ').trim().toLowerCase();
    if (isDailyCategoryKey(resolved)) {
      return 'DAILY';
    }
    return raw
      .replace(/[-_]+/g, ' ')
      .trim()
      .toUpperCase();
  }

  private scheduleAutoScrollToPlay(): void {
    if (!this.shouldAutoScrollToPlay || this.hasAutoScrolledToPlay || !this.playSectionRef?.nativeElement) {
      return;
    }

    if (this.autoScrollTimeoutId) {
      window.clearTimeout(this.autoScrollTimeoutId);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    this.autoScrollTimeoutId = window.setTimeout(() => {
      const playSection = this.playSectionRef?.nativeElement;
      if (!playSection || this.hasAutoScrolledToPlay) {
        return;
      }

      playSection.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      this.hasAutoScrolledToPlay = true;
    }, 1100);
  }
}
