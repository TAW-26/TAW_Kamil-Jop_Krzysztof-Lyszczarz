import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type AttributeTileState =
  | 'empty'
  | 'wrong'
  | 'partial'
  | 'correct'
  | 'partial-year';

export type AttributeTileVariant = 'default' | 'moviePoster';

@Component({
  selector: 'app-attribute-tile',
  imports: [CommonModule],
  templateUrl: './attribute-tile.html',
  styleUrl: './attribute-tile.css',
})
export class AttributeTile {
  @Input() state: AttributeTileState = 'empty';
  @Input() text = '';
  @Input() imageSrc = '';
  @Input() uppercaseText = true;
  @Input() tileVariant: AttributeTileVariant = 'default';
  @Input() stackCommaSeparated = false;

  protected get isEmpty(): boolean {
    return this.state === 'empty';
  }

  protected get hasImage(): boolean {
    return !!this.imageSrc?.trim();
  }

  protected get stackedLines(): string[] {
    const raw = this.text?.trim();
    if (!raw) {
      return [];
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  protected get comparisonHintArrow(): '↑' | '↓' | '' {
    const t = this.text?.trimEnd() ?? '';
    if (t.endsWith('↑')) {
      return '↑';
    }
    if (t.endsWith('↓')) {
      return '↓';
    }
    return '';
  }

  protected get valueWithoutHint(): string {
    const t = this.text ?? '';
    if (t.endsWith('↑') || t.endsWith('↓')) {
      return t.slice(0, -1).trimEnd();
    }
    return t;
  }
}
