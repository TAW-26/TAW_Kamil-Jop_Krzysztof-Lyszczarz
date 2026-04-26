import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { GuessRow, GuessRowTile } from '../../shared/components/guess-row/guess-row';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Ticket, TicketTheme } from '../../shared/components/ticket/ticket';
import { isDailyCategoryKey, resolveGameCategoryKey } from '../../utils/game-category.util';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [CommonModule, Navbar, Footer, SearchInput, GuessRow, Ticket],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, AfterViewInit, OnDestroy {
  protected categoryTitle = 'TOP 250';
  protected ticketTitle = 'TOP 250';
  protected ticketTheme: TicketTheme = 'default';
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
  private shouldAutoScrollToPlay = false;
  private hasAutoScrolledToPlay = false;
  private autoScrollTimeoutId?: number;

  @ViewChild('playSection', { static: false })
  private playSectionRef?: ElementRef<HTMLElement>;

  constructor(private readonly route: ActivatedRoute) {}

  protected get watermarkClass(): string {
    switch (this.ticketTheme) {
      case 'horror':
        return 'game-page__watermark--horror';
      case 'cartoons':
        return 'game-page__watermark--cartoons';
      case 'daily-challenge':
        return 'game-page__watermark--daily';
      default:
        return 'text-gold-color';
    }
  }

  ngOnInit(): void {
    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe(([params, query]) => {
      const pathCategory = params.get('category');
      const queryCategory = query.get('category');
      const raw = pathCategory || queryCategory || 'top-250';
      const categoryKey = resolveGameCategoryKey(pathCategory, queryCategory);
      this.categoryTitle = this.toDisplayTitle(raw);
      this.ticketTitle = this.categoryTitle;
      this.ticketTheme = this.ticketThemeFromCategoryKey(categoryKey);
      this.shouldAutoScrollToPlay = query.get('autoscroll') === '1';
      this.hasAutoScrolledToPlay = false;
      this.scheduleAutoScrollToPlay();
    });
  }

  ngAfterViewInit(): void {
    this.scheduleAutoScrollToPlay();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    if (this.autoScrollTimeoutId) {
      window.clearTimeout(this.autoScrollTimeoutId);
    }
  }

  private toDisplayTitle(raw: string): string {
    return raw
      .replace(/[-_]+/g, ' ')
      .trim()
      .toUpperCase();
  }

  private ticketThemeFromCategoryKey(categoryKey: string): TicketTheme {
    if (categoryKey === 'horror') {
      return 'horror';
    }
    if (categoryKey === 'cartoons') {
      return 'cartoons';
    }
    if (isDailyCategoryKey(categoryKey)) {
      return 'daily-challenge';
    }

    return 'default';
  }

  private scheduleAutoScrollToPlay(): void {
    if (!this.shouldAutoScrollToPlay || this.hasAutoScrolledToPlay || !this.playSectionRef?.nativeElement) {
      return;
    }

    if (this.autoScrollTimeoutId) {
      window.clearTimeout(this.autoScrollTimeoutId);
    }

    // Ensure user sees the hero/top part first.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    this.autoScrollTimeoutId = window.setTimeout(() => {
      const playSection = this.playSectionRef?.nativeElement;
      if (!playSection || this.hasAutoScrolledToPlay) {
        return;
      }

      playSection.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      this.hasAutoScrolledToPlay = true;
    }, 1100);
  }
}
