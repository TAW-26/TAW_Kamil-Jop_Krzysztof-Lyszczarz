import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Button } from '../button/button';

export type NavbarLayout = 'auto' | 'log-sign';

type NavbarLink =
  | { label: string; type: 'section'; targetId: string }
  | { label: string; type: 'route'; commands: (string | number)[] };

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, Button],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(AuthService);

  /** `log-sign` — strony logowania (tylko logo). `auto` — linki + gość albo zalogowany użytkownik. */
  @Input() layout: NavbarLayout = 'auto';
  /** Przy zalogowanym: pokaż bilet / saldo obok awatara (np. sklep, profil). */
  @Input() showWallet = false;
  /** Nadpisanie tekstu portfela; puste = `points_balance` z `/auth/me`. */
  @Input() walletAmount?: string;

  @Output() navLinkSelect = new EventEmitter<string>();

  protected readonly links: NavbarLink[] = [
    { label: 'Kategorie', type: 'section', targetId: 'home-genre' },
    { label: 'Ranking', type: 'route', commands: ['/rank'] },
    { label: 'Zasady', type: 'section', targetId: 'home-how-to-play' },
    { label: 'Sklep', type: 'route', commands: ['/shop'] },
  ];

  constructor(private readonly router: Router) {}

  protected get showLinks(): boolean {
    return this.layout !== 'log-sign';
  }

  protected get showGuestAuthButton(): boolean {
    return this.layout === 'auto' && !this.auth.isAuthenticated();
  }

  protected get showUserWallet(): boolean {
    return this.layout === 'auto' && this.auth.isAuthenticated() && this.showWallet;
  }

  protected get showUserCompact(): boolean {
    return this.layout === 'auto' && this.auth.isAuthenticated() && !this.showWallet;
  }

  protected get walletLabel(): string {
    const override = this.walletAmount?.trim();
    if (override) {
      return override;
    }
    const b = this.auth.currentUser()?.points_balance;
    if (b == null || Number.isNaN(b)) {
      return '0';
    }
    return b.toLocaleString('pl-PL');
  }

  protected displayName(): string | null {
    return this.auth.username();
  }

  protected onLinkClick(link: NavbarLink): void {
    if (link.type === 'route') {
      void this.router.navigate(link.commands);
      return;
    }

    const isOnHome = this.router.url === '/' || this.router.url.startsWith('/#');
    if (isOnHome) {
      this.navLinkSelect.emit(link.targetId);
      return;
    }

    void this.router.navigate(['/'], { fragment: link.targetId });
  }

  protected goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  protected goToHome(): void {
    void this.router.navigate(['/']);
  }

  protected goToProfile(): void {
    void this.router.navigate(['/profile']);
  }
}
