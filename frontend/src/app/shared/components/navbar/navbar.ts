import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../button/button';

export type NavbarVariant =
  | 'default-logged'
  | 'with-wallet'
  | 'default-not-logged'
  | 'log-sign';

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

  protected readonly links = [
    { label: 'Kategorie', targetId: 'home-genre' },
    { label: 'Ranking', targetId: 'home-hero' },
    { label: 'Zasady', targetId: 'home-how-to-play' },
    { label: 'Sklep', targetId: 'home-footer' },
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

  protected onLinkClick(targetId: string): void {
    this.navLinkSelect.emit(targetId);
  }

  protected goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  protected goToHome(): void {
    void this.router.navigate(['/']);
  }
}
