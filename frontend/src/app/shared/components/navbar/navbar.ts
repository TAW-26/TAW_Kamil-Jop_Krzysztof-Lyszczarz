import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../button/button';

export type NavbarVariant =
  | 'default-logged'
  | 'with-wallet'
  | 'default-not-logged'
  | 'log-sign';

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
  @Input() variant: NavbarVariant = 'default-logged';
  @Input() walletAmount = '1,250';
  @Output() navLinkSelect = new EventEmitter<string>();

  protected readonly links: NavbarLink[] = [
    { label: 'Kategorie', type: 'section', targetId: 'home-genre' },
    { label: 'Ranking', type: 'route', commands: ['/rank'] },
    { label: 'Zasady', type: 'section', targetId: 'home-how-to-play' },
    { label: 'Sklep', type: 'route', commands: ['/shop'] },
  ];

  constructor(private readonly router: Router) {}

  protected get showLinks(): boolean {
    return this.variant !== 'log-sign';
  }

  protected get showAvatarOnly(): boolean {
    return this.variant === 'default-logged';
  }

  protected get showWalletWithAvatar(): boolean {
    return this.variant === 'with-wallet';
  }

  protected get showSignButton(): boolean {
    return this.variant === 'default-not-logged';
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
