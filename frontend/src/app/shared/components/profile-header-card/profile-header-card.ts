import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AvatarShopApiService } from '../../../services/avatar-shop-api.service';
import { ToastService } from '../../../services/toast.service';
import { equippedAvatarImageUrl } from '../../../utils/equipped-avatar-url.util';
import { Button } from '../button/button';

const MOCK_AVATAR_ICON = '?';

function formatAccountCreatedLabel(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return 'Account created: —';
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Account created: —';
  }
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
  const withCapitalMonth = formatted.replace(/^(\S)/, (m) => m.toUpperCase());
  return `Account created: ${withCapitalMonth}`;
}

@Component({
  selector: 'app-profile-header-card',
  imports: [Button, CommonModule],
  templateUrl: './profile-header-card.html',
  styleUrl: './profile-header-card.css',
})
export class ProfileHeaderCard implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly avatarShop = inject(AvatarShopApiService);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
  }

  protected readonly nickname = computed(
    () => this.auth.currentUser()?.username ?? '—',
  );

  protected readonly createdAt = computed(() =>
    formatAccountCreatedLabel(this.auth.currentUser()?.created_at),
  );

  protected readonly avatarPosterUrl = computed(() =>
    equippedAvatarImageUrl(this.auth.currentUser(), this.avatarShop.ownedAvatars()),
  );

  protected readonly icon = MOCK_AVATAR_ICON;

  protected goToProfileSettings(): void {
    void this.router.navigate(['/profile-settings']);
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.show('Signed out successfully.');
    void this.router.navigate(['/']);
  }
}
