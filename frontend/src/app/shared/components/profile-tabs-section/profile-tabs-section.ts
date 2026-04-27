import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { OwnedAvatar } from '../../../interfaces/avatar-shop.interface';
import { GameHistoryItem } from '../../../interfaces/auth.interface';
import { AuthService } from '../../../services/auth.service';
import { AvatarShopApiService } from '../../../services/avatar-shop-api.service';
import { ToastService } from '../../../services/toast.service';
import { RankListRow } from '../rank-list-row/rank-list-row';
import { ShopCard, ShopCardVariant } from '../shop-card/shop-card';
import { TabButtons } from '../tab-buttons/tab-buttons';

@Component({
  selector: 'app-profile-tabs-section',
  imports: [CommonModule, TabButtons, RankListRow, ShopCard],
  templateUrl: './profile-tabs-section.html',
  styleUrl: './profile-tabs-section.css',
})
export class ProfileTabsSection implements OnInit {
  private readonly noAvatarsMessage = 'You do not have any avatars yet. Buy some in the shop.';
  @Input() activeTabIndex = 0;

  private readonly avatarShop = inject(AvatarShopApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly ownedAvatars = this.avatarShop.ownedAvatars;
  protected readonly equippingId = signal<number | null>(null);
  protected readonly historyItems = signal<GameHistoryItem[]>([]);
  protected readonly equippedAvatarId = computed(
    () => this.auth.currentUser()?.equipped_avatar_id ?? null,
  );
  protected readonly emptyInventoryMessage = this.noAvatarsMessage.replace(/\\n/g, ' ');

  ngOnInit(): void {
    this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
    this.auth.fetchGameHistory().subscribe({
      next: (history) => this.historyItems.set(history),
      error: console.error,
    });
  }

  protected setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }

  protected equipmentVariant(movieId: number): ShopCardVariant {
    return this.equippedAvatarId() === movieId ? 'card-eq-equipped' : 'card-eq-to-equip';
  }

  protected trackByAvatarId(_index: number, avatar: OwnedAvatar): number {
    return avatar.id;
  }

  protected onEquipAvatar(movieId: number): void {
    if (this.equippingId() !== null) {
      return;
    }
    this.equippingId.set(movieId);
    this.avatarShop
      .equipAvatar(movieId)
      .pipe(finalize(() => this.equippingId.set(null)))
      .subscribe({
        next: (res) => {
          this.toast.show(res.message);
          this.auth.fetchCurrentUser().subscribe({ error: console.error });
          this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
        },
        error: (err: Error) => this.toast.show(err.message),
      });
  }

  protected formatHistoryDate(isoDate: string | null): string {
    if (!isoDate) return 'UNKNOWN DATE';

    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) return 'UNKNOWN DATE';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(parsedDate).toUpperCase();
  }

  protected formatHistoryAttemptText(attempts: number, isWon: boolean): string {
    if (!isWon) return 'NOT GUESSED';
    if (attempts <= 1) return 'GUESSED ON 1ST TRY';
    if (attempts === 2) return 'GUESSED ON 2ND TRY';
    if (attempts === 3) return 'GUESSED ON 3RD TRY';
    return `GUESSED ON ${attempts}TH TRY`;
  }

  protected formatHistoryResult(isWon: boolean): string {
    return isWon ? 'WIN' : 'LOSS';
  }

  protected formatCategoryBadge(categoryName: string): string {
    return categoryName.toUpperCase();
  }
}
