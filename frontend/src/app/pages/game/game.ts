import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { GuessRow, GuessRowTile } from '../../shared/components/guess-row/guess-row';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Ticket } from '../../shared/components/ticket/ticket';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [CommonModule, Navbar, Footer, SearchInput, GuessRow, Ticket],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, OnDestroy {
  protected categoryTitle = 'TOP 250';
  protected ticketTitle = 'TOP 250';
  protected readonly headers = ['TYTUŁ', 'ROK', 'GATUNEK', 'REŻYSER', 'GŁÓWNY AKTOR'];

  protected readonly rows: GuessRowTile[][] = [
    [
      { state: 'correct', text: 'TEKST' },
      { state: 'correct', text: 'TEKST' },
      { state: 'correct', text: 'TEKST' },
      { state: 'correct', text: 'TEKST' },
      { state: 'correct', text: 'TEKST' },
    ],
    [
      { state: 'wrong', text: 'TEKST' },
      { state: 'partial-year', text: '2020↑' },
      { state: 'partial', text: 'TEKST' },
      { state: 'correct', text: 'TEKST' },
      { state: 'wrong', text: 'TEKST' },
    ],
    [
      { state: 'empty' },
      { state: 'empty' },
      { state: 'empty' },
      { state: 'empty' },
      { state: 'empty' },
    ],
  ];

  private routeSubscription?: Subscription;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe(([params, query]) => {
      const pathCategory = params.get('category');
      const queryCategory = query.get('category');
      const raw = pathCategory || queryCategory || 'top-250';
      this.categoryTitle = this.toDisplayTitle(raw);
      this.ticketTitle = this.categoryTitle;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private toDisplayTitle(raw: string): string {
    return raw
      .replace(/[-_]+/g, ' ')
      .trim()
      .toUpperCase();
  }
}
