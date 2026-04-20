import { Component } from '@angular/core';
import { Ticket } from '../../shared/components/ticket/ticket';

@Component({
  selector: 'app-home',
  imports: [Ticket],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
