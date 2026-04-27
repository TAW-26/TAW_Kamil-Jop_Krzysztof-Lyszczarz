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
  @Input() labelOverride?: string;
  @Input() disabled = false;

  protected get isGold(): boolean {
    return ['default', 'sign-up-log-in', 'log-in', 'sign-up', 'buy'].includes(
      this.variant
    );
  }

  protected get text(): string {
    if (this.labelOverride?.trim()) {
      return this.labelOverride;
    }

    switch (this.variant) {
      case 'default':
        return 'PLAY NOW';
      case 'sign-up-log-in':
        return 'SIGN UP/LOG IN';
      case 'log-in':
        return 'ENTER GAME';
      case 'sign-up':
        return 'CREATE ACCOUNT';
      case 'buy':
        return `🎟️ ${this.tickets} Buy`;
      case 'locked':
        return `🎟️ ${this.tickets} Not enough tickets`;
      case 'owned':
        return 'Already owned';
      case 'profile-settings':
        return 'Account settings';
      default:
        return '';
    }
  }

  protected hasVariant(...variants: ButtonVariant[]): boolean {
    return variants.includes(this.variant);
  }
}
