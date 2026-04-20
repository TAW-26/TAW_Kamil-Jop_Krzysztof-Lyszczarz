import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type ButtonVariant =
  | 'default'
  | 'sign-up-log-in'
  | 'log-in'
  | 'sign-up'
  | 'sign-up-with-google'
  | 'buy'
  | 'locked'
  | 'owned'
  | 'profile-settings';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input() variant: ButtonVariant = 'default';
  @Input() tickets = '300';
  @Input() fullWidth = false;

  protected get isGold(): boolean {
    return ['default', 'sign-up-log-in', 'log-in', 'sign-up', 'buy'].includes(
      this.variant
    );
  }

  protected get text(): string {
    switch (this.variant) {
      case 'default':
        return 'ZAGRAJ TERAZ';
      case 'sign-up-log-in':
        return 'SIGN UP/LOG IN';
      case 'log-in':
        return 'WEJDZ DO GRY';
      case 'sign-up':
        return 'ZALOZ KONTO';
      case 'buy':
        return `🎟️ ${this.tickets} Kup`;
      case 'locked':
        return `🎟️ ${this.tickets} Kup Brak biletow`;
      case 'owned':
        return 'Posiadasz to';
      case 'profile-settings':
        return 'Ustawienia Konta';
      default:
        return '';
    }
  }

  protected hasVariant(...variants: ButtonVariant[]): boolean {
    return variants.includes(this.variant);
  }
}
