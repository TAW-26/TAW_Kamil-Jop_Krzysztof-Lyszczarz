import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-how-to-play-card',
  imports: [],
  templateUrl: './how-to-play-card.html',
  styleUrl: './how-to-play-card.css',
})
export class HowToPlayCard {
  @Input() step = 1;
  @Input() title = 'Pick a category';
  @Input() description =
    'Choose from genres like horror, cartoons, or the IMDb Top 250. There is also a daily challenge open to everyone.';
}
