import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AttributeTile, AttributeTileState } from '../attribute-tile/attribute-tile';

export type GuessRowTile = {
  state: AttributeTileState;
  text?: string;
};

@Component({
  selector: 'app-guess-row',
  imports: [CommonModule, AttributeTile],
  templateUrl: './guess-row.html',
  styleUrl: './guess-row.css',
})
export class GuessRow {
  @Input() tiles: GuessRowTile[] = [
    { state: 'empty' },
    { state: 'empty' },
    { state: 'empty' },
    { state: 'empty' },
    { state: 'empty' },
  ];
}
