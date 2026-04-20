import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket',
  imports: [],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class Ticket {
  @Input() title = 'MOVIEGUESS';
  protected readonly logoUrl = '/assets/logo-movie-guess.png';
}
