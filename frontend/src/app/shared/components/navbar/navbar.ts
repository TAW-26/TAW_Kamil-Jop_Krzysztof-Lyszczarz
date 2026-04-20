import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  protected readonly links = ['Kategorie', 'Ranking', 'Zasady', 'Sklep'];

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
}
