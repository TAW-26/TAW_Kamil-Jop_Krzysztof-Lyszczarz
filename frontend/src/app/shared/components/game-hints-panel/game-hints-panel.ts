import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import {
  GAME_HINT_OVERVIEW_MIN_ATTEMPTS,
  GAME_HINT_POSTER_MIN_ATTEMPTS,
} from '../../../constants/game-hints.constants';
import { GameApiService } from '../../../services/game-api.service';
import { ToastService } from '../../../services/toast.service';
import { tmdbPosterW342Url } from '../../../utils/tmdb-image.util';

@Component({
  selector: 'app-game-hints-panel',
  imports: [CommonModule],
  templateUrl: './game-hints-panel.html',
  styleUrl: './game-hints-panel.css',
})
export class GameHintsPanel {
  private static readonly HINTS_ENABLED_STORAGE_KEY =
    'game-hints-panel:hints-enabled';

  readonly categorySlug = input.required<string>();
  readonly attemptCount = input.required<number>();
  readonly isLoggedIn = input(false);

  private readonly gameApi = inject(GameApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly posterMin = GAME_HINT_POSTER_MIN_ATTEMPTS;
  protected readonly overviewMin = GAME_HINT_OVERVIEW_MIN_ATTEMPTS;

  protected readonly hintsEnabled = signal(this.readHintsEnabledFromSession());
  protected readonly posterUrl = signal<string | null>(null);
  protected readonly posterModalOpen = signal(false);
  protected readonly overviewText = signal<string | null>(null);
  protected readonly posterLoading = signal(false);
  protected readonly overviewLoading = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.posterModalOpen()) {
        document.body.style.overflow = '';
      }
    });

    effect(() => {
      this.categorySlug();
      untracked(() => {
        this.posterUrl.set(null);
        this.posterModalOpen.set(false);
        this.overviewText.set(null);
        this.posterLoading.set(false);
        this.overviewLoading.set(false);
        document.body.style.overflow = '';
      });
    });
  }

  protected toggleHintsEnabled(checked: boolean): void {
    this.hintsEnabled.set(checked);
    this.saveHintsEnabledToSession(checked);
    if (!checked) {
      this.closePosterModal();
      this.posterUrl.set(null);
      this.overviewText.set(null);
      this.posterLoading.set(false);
      this.overviewLoading.set(false);
    }
  }

  protected posterRemaining(): number {
    return Math.max(0, this.posterMin - this.attemptCount());
  }

  protected overviewRemaining(): number {
    return Math.max(0, this.overviewMin - this.attemptCount());
  }

  protected revealPoster(): void {
    if (!this.hintsEnabled() || this.posterLoading() || this.posterUrl()) {
      return;
    }
    this.posterLoading.set(true);
    const guestAttempts = this.guestAttemptsParam();
    this.gameApi.fetchHint(this.categorySlug(), 0, guestAttempts).subscribe({
      next: (res) => {
        this.posterLoading.set(false);
        const path = res.hintType === 'posterPath' ? res.hintValue : null;
        const url = tmdbPosterW342Url(path);
        this.posterUrl.set(url ? url : null);
        if (!url) {
          this.toast.show('No poster available for this title.');
        } else {
          this.openPosterModal();
        }
      },
      error: (err: Error) => {
        this.posterLoading.set(false);
        this.toast.show(err.message);
      },
    });
  }

  protected revealOverview(): void {
    if (!this.hintsEnabled() || this.overviewLoading() || this.overviewText()) {
      return;
    }
    this.overviewLoading.set(true);
    const guestAttempts = this.guestAttemptsParam();
    this.gameApi.fetchHint(this.categorySlug(), 1, guestAttempts).subscribe({
      next: (res) => {
        this.overviewLoading.set(false);
        const text =
          res.hintType === 'overview' ? (res.hintValue ?? '').trim() : '';
        this.overviewText.set(text || '—');
      },
      error: (err: Error) => {
        this.overviewLoading.set(false);
        this.toast.show(err.message);
      },
    });
  }

  private guestAttemptsParam(): number | undefined {
    return this.isLoggedIn() ? undefined : this.attemptCount();
  }

  private readHintsEnabledFromSession(): boolean {
    try {
      return (
        sessionStorage.getItem(GameHintsPanel.HINTS_ENABLED_STORAGE_KEY) ===
        'true'
      );
    } catch {
      return false;
    }
  }

  private saveHintsEnabledToSession(enabled: boolean): void {
    try {
      sessionStorage.setItem(
        GameHintsPanel.HINTS_ENABLED_STORAGE_KEY,
        enabled ? 'true' : 'false',
      );
    } catch {
      // Ignore storage write failures (e.g. restricted browser mode).
    }
  }

  protected openPosterModal(): void {
    if (!this.posterUrl()) {
      return;
    }
    this.posterModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closePosterModal(): void {
    if (!this.posterModalOpen()) {
      return;
    }
    this.posterModalOpen.set(false);
    document.body.style.overflow = '';
  }

  protected onPosterBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePosterModal();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected onPosterModalEscape(event: Event): void {
    if (!this.posterModalOpen()) {
      return;
    }
    this.closePosterModal();
    event.stopPropagation();
  }

  protected lockedPosterMessage(): string {
    return this.remainingTriesPhrase(this.posterRemaining());
  }

  protected lockedOverviewMessage(): string {
    return this.remainingTriesPhrase(this.overviewRemaining());
  }

  private remainingTriesPhrase(remaining: number): string {
    if (remaining <= 0) {
      return '';
    }
    if (remaining === 1) {
      return '1 more guess to unlock.';
    }
    return `${remaining} more guesses to unlock.`;
  }
}
