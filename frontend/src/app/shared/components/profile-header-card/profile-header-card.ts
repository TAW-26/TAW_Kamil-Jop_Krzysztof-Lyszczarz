import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Button } from '../button/button';

@Component({
  selector: 'app-profile-header-card',
  imports: [Button],
  templateUrl: './profile-header-card.html',
  styleUrl: './profile-header-card.css',
})
export class ProfileHeaderCard {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  @Input() nickname = 'Twój_Nick_123';
  @Input() createdAt = 'Konto utworzone: Marzec 2026';
  @Input() badge = 'ZŁOTY RECENZENT';
  @Input() icon = '🍿';

  protected goToProfileSettings(): void {
    void this.router.navigate(['/profile-settings']);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
