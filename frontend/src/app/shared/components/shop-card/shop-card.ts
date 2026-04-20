import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Button } from '../button/button';

export type ShopCardVariant =
  | 'default-buy'
  | 'buy-new'
  | 'owned'
  | 'card-eq-to-equip'
  | 'card-eq-equipped';

@Component({
  selector: 'app-shop-card',
  imports: [CommonModule, Button],
  templateUrl: './shop-card.html',
  styleUrl: './shop-card.css',
})
export class ShopCard {
  @Input() variant: ShopCardVariant = 'default-buy';
  @Input() title = 'Kinowy Widz';
  @Input() description = 'Klasyczny awatar fana kina z popocornem.';
  @Input() icon = '🍿';
  @Input() buyTickets = '300';
  @Input() lockedTickets = '1000';
  @Input() lockedLabelOverride?: string;

  protected get isBuyNew(): boolean {
    return this.variant === 'buy-new';
  }

  protected get isEqToEquip(): boolean {
    return this.variant === 'card-eq-to-equip';
  }

  protected get isEqEquipped(): boolean {
    return this.variant === 'card-eq-equipped';
  }

  protected get showDescription(): boolean {
    return this.variant === 'default-buy' || this.variant === 'buy-new' || this.variant === 'owned';
  }

  protected get showAction(): boolean {
    return (
      this.variant === 'default-buy' ||
      this.variant === 'buy-new' ||
      this.variant === 'owned' ||
      this.variant === 'card-eq-to-equip'
    );
  }

  protected get lockedLabel(): string {
    return this.lockedLabelOverride?.trim() || `🎟️ ${this.lockedTickets} Brak biletów`;
  }
}
