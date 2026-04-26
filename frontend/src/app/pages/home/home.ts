import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { HowToPlaySection } from '../../shared/components/how-to-play-section/how-to-play-section';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Ticket } from '../../shared/components/ticket/ticket';
import { TicketCarousel } from '../../shared/components/ticket-carousel/ticket-carousel';

@Component({
  selector: 'app-home',
  imports: [Ticket, Navbar, Button, Footer, TicketCarousel, HowToPlaySection],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private fragmentSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.fragmentSubscription = this.route.fragment.subscribe((fragment) => {
      if (!fragment) {
        return;
      }

      // Allow the view to settle after navigation before scrolling.
      setTimeout(() => this.scrollToSection(fragment), 0);
    });
  }

  ngOnDestroy(): void {
    this.fragmentSubscription?.unsubscribe();
  }

  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    const blockPosition = sectionId === 'home-genre' ? 'center' : 'start';
    element.scrollIntoView({
      behavior: 'smooth',
      block: blockPosition,
      inline: 'nearest',
    });
  }

  protected goToDailyGame(): void {
    void this.router.navigate(['/game', 'daily'], { queryParams: { autoscroll: '1' } });
  }
}
