import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-how-to-play-card',
  imports: [],
  templateUrl: './how-to-play-card.html',
  styleUrl: './how-to-play-card.css',
})
export class HowToPlayCard {
  @Input() step = 1;
  @Input() title = 'Wybierz bilet';
  @Input() description =
    'Zdecyduj sie na jedna z 5 kategorii. Masz ochote na kino grozy, czy moze wolisz klasyki z listy TOP 250?';
}
