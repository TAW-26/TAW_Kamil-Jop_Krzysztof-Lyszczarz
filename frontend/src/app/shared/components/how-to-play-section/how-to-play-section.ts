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
      title: 'Pick a category',
      description:
        'Choose from genres like horror, cartoons, or the IMDb Top 250. There is also a daily challenge open to everyone.',
    },
    {
      step: 2,
      title: 'Guess the title',
      description:
        'After each hint, search for a movie title. Tiles show how close you are on year, genre, director, cast, and more.',
    },
    {
      step: 3,
      title: 'Earn tickets',
      description:
        'Correct guesses award tickets, and the reward depends on how many attempts you used. Spend them on profile avatars and other items in the shop.',
    },
  ];
}
