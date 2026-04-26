import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { StatCard } from '../stat-card/stat-card';

type ProfileStat = {
  value: string;
  label: string;
};

const MOCK_GAMES_PLAYED = '142';
const MOCK_WIN_RATE = '68%';
const MOCK_BEST_STREAK = '14🔥';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule, StatCard],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css',
})
export class StatsCards {
  private readonly auth = inject(AuthService);

  protected readonly stats = computed<ProfileStat[]>(() => {
    const streak = this.auth.currentUser()?.current_streak ?? 0;
    return [
      { value: `${MOCK_GAMES_PLAYED} (mock)`, label: 'GAMES PLAYED' },
      { value: `${MOCK_WIN_RATE} (mock)`, label: 'WIN RATE' },
      { value: `${streak}🔥`, label: 'CURRENT STREAK' },
      { value: `${MOCK_BEST_STREAK} (mock)`, label: 'BEST STREAK' },
    ];
  });
}
