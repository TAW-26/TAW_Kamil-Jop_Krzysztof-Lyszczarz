import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-rank',
  imports: [Navbar, Footer],
  templateUrl: './rank.html',
  styleUrl: './rank.css',
})
export class Rank {}
