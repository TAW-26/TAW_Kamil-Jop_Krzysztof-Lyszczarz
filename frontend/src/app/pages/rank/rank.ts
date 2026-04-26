import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { GAME_CATEGORY_ITEMS, TicketCarouselItem } from '../../constants/game-categories';
import { AuthService } from '../../services/auth.service';
import { LeaderboardApiService } from '../../services/leaderboard-api.service';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { PodiumItem } from '../../shared/components/podium-item/podium-item';
import { RankListRow } from '../../shared/components/rank-list-row/rank-list-row';
import { TabButtons } from '../../shared/components/tab-buttons/tab-buttons';
import { Ticket } from '../../shared/components/ticket/ticket';
import {
  PointsLeaderboardEntry,
  StreakLeaderboardEntry,
  TriesHistogramEntry,
} from '../../interfaces/leaderboard.interface';
import { tmdbPosterUrl } from '../../utils/tmdb-poster.util';
import { ticketThemeFromSlug } from '../../utils/ticket-theme.util';

const LEADERBOARD_TABS = ['TOTAL POINTS', 'BEST STREAK'];

type PodiumSlot = {
  variant: '1' | '2' | '3';
  entry: PointsLeaderboardEntry | StreakLeaderboardEntry | null;
};

@Component({
  selector: 'app-rank',
  imports: [CommonModule, Navbar, Footer, PodiumItem, RankListRow, TabButtons, Ticket],
  templateUrl: './rank.html',
  styleUrl: './rank.css',
})
export class Rank implements OnInit {
  private readonly leaderboardApi = inject(LeaderboardApiService);
  private readonly auth = inject(AuthService);

  protected readonly leaderboardTabs = LEADERBOARD_TABS;
  protected readonly leaderTabIndex = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly pointsLeaders = signal<PointsLeaderboardEntry[]>([]);
  protected readonly streakLeaders = signal<StreakLeaderboardEntry[]>([]);

  protected readonly categoryItems = signal<TicketCarouselItem[]>(GAME_CATEGORY_ITEMS);
  protected readonly histogramSlug = signal<string | null>(null);
  protected readonly histogram = signal<TriesHistogramEntry[]>([]);
  protected readonly histogramLoading = signal(false);

  protected readonly isPointsTab = computed(() => this.leaderTabIndex() === 0);

  protected readonly podiumSlots = computed<PodiumSlot[]>(() => {
    const list = this.isPointsTab() ? this.pointsLeaders() : this.streakLeaders();
    const at = (i: number) => list[i] ?? null;
    return [
      { variant: '2', entry: at(1) },
      { variant: '1', entry: at(0) },
      { variant: '3', entry: at(2) },
    ];
  });

  protected readonly tablePointsRows = computed(() => {
    const list = this.pointsLeaders();
    return list.slice(3).map((entry, i) => ({
      entry,
      rank: i + 4,
    }));
  });

  protected readonly tableStreakRows = computed(() => {
    const list = this.streakLeaders();
    return list.slice(3).map((entry, i) => ({
      entry,
      rank: i + 4,
    }));
  });

  protected readonly histogramMax = computed(() => {
    const rows = this.histogram();
    if (!rows.length) {
      return 1;
    }
    return Math.max(...rows.map((r) => r.count), 1);
  });

  protected readonly meOutsideLeaderboard = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return null;
    }
    if (this.isPointsTab()) {
      const inList = this.pointsLeaders().some((e) => e.id === u.id);
      if (!inList) {
        return { kind: 'points' as const, user: u };
      }
    } else {
      const inList = this.streakLeaders().some((e) => e.id === u.id);
      if (!inList) {
        return { kind: 'streak' as const, user: u };
      }
    }
    return null;
  });

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      points: this.leaderboardApi.fetchPointsLeaderboard().pipe(
        catchError((err: Error) => {
          this.error.set(err.message);
          return of([] as PointsLeaderboardEntry[]);
        }),
      ),
      streaks: this.leaderboardApi.fetchStreaksLeaderboard().pipe(
        catchError((err: Error) => {
          this.error.set(err.message);
          return of([] as StreakLeaderboardEntry[]);
        }),
      ),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ points, streaks }) => {
        this.pointsLeaders.set(points);
        this.streakLeaders.set(streaks);
        const first = GAME_CATEGORY_ITEMS[0]?.slug ?? null;
        this.histogramSlug.set(first);
        if (first) {
          this.loadHistogram(first);
        }
      });
  }

  protected onLeaderTabChange(index: number): void {
    this.leaderTabIndex.set(index);
  }

  protected onCategoryPicked(slug: string): void {
    if (this.histogramSlug() === slug) {
      return;
    }
    this.loadHistogram(slug);
  }

  protected themeForSlug(slug: string) {
    return ticketThemeFromSlug(slug);
  }

  protected avatarForLeader(e: PointsLeaderboardEntry | StreakLeaderboardEntry): string | null {
    return tmdbPosterUrl(e.equipped_avatar_url);
  }

  protected formatPoints(n: number | null | undefined): string {
    return `🎟️ ${(n ?? 0).toLocaleString('en-US')}`;
  }

  protected formatStreak(n: number | null | undefined): string {
    const v = n ?? 0;
    const unit = v === 1 ? 'day' : 'days';
    return `🔥 ${v} ${unit}`;
  }

  protected podiumScore(slot: PodiumSlot): string {
    if (!slot.entry) {
      return '—';
    }
    if (this.isPointsTab()) {
      return this.formatPoints((slot.entry as PointsLeaderboardEntry).lifetime_points);
    }
    return this.formatStreak((slot.entry as StreakLeaderboardEntry).lifetime_streak);
  }

  protected isCurrentUser(id: string): boolean {
    return this.auth.currentUser()?.id === id;
  }

  protected posterUrl(path: string | null | undefined): string | null {
    return tmdbPosterUrl(path);
  }

  private loadHistogram(slug: string): void {
    this.histogramSlug.set(slug);
    this.histogramLoading.set(true);
    this.leaderboardApi
      .fetchTriesHistogram(slug)
      .pipe(finalize(() => this.histogramLoading.set(false)))
      .subscribe({
        next: (rows) => this.histogram.set(rows),
        error: () => this.histogram.set([]),
      });
  }
}
