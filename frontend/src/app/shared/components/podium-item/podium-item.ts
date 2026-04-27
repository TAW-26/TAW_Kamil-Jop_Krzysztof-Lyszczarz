import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type PodiumItemVariant = '1' | '2' | '3';

@Component({
  selector: 'app-podium-item',
  imports: [CommonModule],
  templateUrl: './podium-item.html',
  styleUrl: './podium-item.css',
})
export class PodiumItem {
  @Input() variant: PodiumItemVariant = '2';
  @Input() nick = 'KUBRICK_FAN';
  @Input() tickets = '412';
  @Input() icon = '🎥';
  @Input() avatarUrl: string | null = null;
  @Input() metricLabel = 'TICKETS';
  @Input() highlight = false;

  protected get isGold(): boolean {
    return this.variant === '1';
  }

  protected get isSilver(): boolean {
    return this.variant === '2';
  }
}
