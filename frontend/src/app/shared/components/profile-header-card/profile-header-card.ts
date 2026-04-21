import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../button/button';

@Component({
  selector: 'app-profile-header-card',
  imports: [Button],
  templateUrl: './profile-header-card.html',
  styleUrl: './profile-header-card.css',
})
export class ProfileHeaderCard {
  @Input() nickname = 'Twój_Nick_123';
  @Input() createdAt = 'Konto utworzone: Marzec 2026';
  @Input() badge = 'ZŁOTY RECENZENT';
  @Input() icon = '🍿';

  constructor(private readonly router: Router) {}

  protected goToProfileSettings(): void {
    void this.router.navigate(['/profile-settings']);
  }
}
