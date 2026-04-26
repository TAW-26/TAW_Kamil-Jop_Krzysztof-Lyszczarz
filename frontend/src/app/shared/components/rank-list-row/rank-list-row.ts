import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type RankListRowVariant = 'default' | 'me' | 'history';

@Component({
  selector: 'app-rank-list-row',
  imports: [CommonModule],
  templateUrl: './rank-list-row.html',
  styleUrl: './rank-list-row.css',
})
export class RankListRow {
  @Input() variant: RankListRowVariant = 'default';
  @Input() position = '4';
  @Input() nickname = 'PLAYER NAME';
  @Input() tickets = '🎟️ 385';
  @Input() streak = '🔥 14 DAYS';
  @Input() rowWidth = 800;
  @Input() rowMinHeight = 56;

  protected get isMe(): boolean {
    return this.variant === 'me';
  }

  protected get isHistory(): boolean {
    return this.variant === 'history';
  }
}
