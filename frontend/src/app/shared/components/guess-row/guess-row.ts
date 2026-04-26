import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AttributeTile,
  AttributeTileState,
  AttributeTileVariant,
} from '../attribute-tile/attribute-tile';
import { GUESS_ROW_TILE_COUNT } from '../../../constants/guess-row.constants';

export type GuessRowTile = {
  state: AttributeTileState;
  text?: string;
  imageSrc?: string;
  uppercaseText?: boolean;
  tileVariant?: AttributeTileVariant;
  stackCommaSeparated?: boolean;
};

@Component({
  selector: 'app-guess-row',
  imports: [CommonModule, AttributeTile],
  templateUrl: './guess-row.html',
  styleUrl: './guess-row.css',
})
export class GuessRow {
  @Input() animateReveal = false;
  @Input() tiles: GuessRowTile[] = Array.from({ length: GUESS_ROW_TILE_COUNT }, () => ({
    state: 'empty' as const,
  }));
}
