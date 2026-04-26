import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-terms',
  imports: [Navbar, Footer],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {}
