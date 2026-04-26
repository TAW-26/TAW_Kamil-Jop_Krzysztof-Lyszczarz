import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type AttributeTileState =
  | 'empty'
  | 'wrong'
  | 'partial'
  | 'correct'
  | 'partial-year';

@Component({
  selector: 'app-attribute-tile',
  imports: [CommonModule],
  templateUrl: './attribute-tile.html',
  styleUrl: './attribute-tile.css',
})
export class AttributeTile {
  @Input() state: AttributeTileState = 'empty';
  @Input() text = 'TEKST';

  protected get isEmpty(): boolean {
    return this.state === 'empty';
  }
}
