import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-shop',
  imports: [Navbar, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {}
