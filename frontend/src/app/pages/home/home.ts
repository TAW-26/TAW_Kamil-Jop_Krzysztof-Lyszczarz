import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Ticket } from '../../shared/components/ticket/ticket';

@Component({
  selector: 'app-home',
  imports: [Ticket, Navbar, Button],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
