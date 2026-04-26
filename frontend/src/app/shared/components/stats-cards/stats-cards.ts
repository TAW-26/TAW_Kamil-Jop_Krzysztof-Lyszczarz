import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AvatarShopApiService } from '../../../services/avatar-shop-api.service';
import { StatCard } from '../stat-card/stat-card';

type ProfileStat = {
  value: string;
  label: string;
};

const MOCK_GAMES_PLAYED = '142';
const MOCK_BEST_STREAK = '14🔥';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule, StatCard],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css',
})
export class StatsCards implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly avatarShop = inject(AvatarShopApiService);

  ngOnInit(): void {
    this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
  }

  protected readonly stats = computed<ProfileStat[]>(() => {
    const streak = this.auth.currentUser()?.current_streak ?? 0;
    const ownedCount = this.avatarShop.ownedAvatars().length;
    return [
      { value: `${MOCK_GAMES_PLAYED} (mock)`, label: 'GAMES PLAYED' },
      { value: `${ownedCount}`, label: 'AVATARS OWNED' },
      { value: `${streak}🔥`, label: 'CURRENT STREAK' },
      { value: `${MOCK_BEST_STREAK} (mock)`, label: 'BEST STREAK' },
    ];
  });
}
