import { Component, Input } from '@angular/core';

export type TicketTheme = 'default' | 'horror' | 'cartoons' | 'daily-challenge';

@Component({
  selector: 'app-ticket',
  imports: [],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class Ticket {
  @Input() title = 'MOVIEGUESS';
  @Input() theme: TicketTheme = 'default';
  protected readonly logoUrl = '/assets/logo-movie-guess.png';
}
