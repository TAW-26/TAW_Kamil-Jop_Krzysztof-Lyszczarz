import { Component } from '@angular/core';
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
export class Home {
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
}
