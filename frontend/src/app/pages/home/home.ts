import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Ticket } from '../../shared/components/ticket/ticket';
import { TicketCarousel } from '../../shared/components/ticket-carousel/ticket-carousel';

@Component({
  selector: 'app-home',
  imports: [Ticket, Navbar, Button, Footer, TicketCarousel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
