import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HowToPlayCard } from '../how-to-play-card/how-to-play-card';

type HowToPlayStep = {
  step: number;
  title: string;
  description: string;
};

@Component({
  selector: 'app-how-to-play-section',
  imports: [CommonModule, HowToPlayCard],
  templateUrl: './how-to-play-section.html',
  styleUrl: './how-to-play-section.css',
})
export class HowToPlaySection {
  protected readonly steps: HowToPlayStep[] = [
    {
      step: 1,
      title: 'Wybierz bilet',
      description:
        'Zdecyduj sie na jedna z 5 kategorii. Masz ochote na kino grozy, czy moze wolisz klasyki z listy TOP 250?',
    },
    {
      step: 2,
      title: 'Wybierz bilet',
      description:
        'Zdecyduj sie na jedna z 5 kategorii. Masz ochote na kino grozy, czy moze wolisz klasyki z listy TOP 250?',
    },
    {
      step: 3,
      title: 'Wybierz bilet',
      description:
        'Zdecyduj sie na jedna z 5 kategorii. Masz ochote na kino grozy, czy moze wolisz klasyki z listy TOP 250?',
    },
  ];
}
