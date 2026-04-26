import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { OwnedAvatar } from '../../../interfaces/avatar-shop.interface';
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
  @Input() activeTabIndex = 0;

  private readonly avatarShop = inject(AvatarShopApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly ownedAvatars = this.avatarShop.ownedAvatars;
  protected readonly equippingId = signal<number | null>(null);
  protected readonly equippedAvatarId = computed(
    () => this.auth.currentUser()?.equipped_avatar_id ?? null,
  );

  ngOnInit(): void {
    this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
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
}
