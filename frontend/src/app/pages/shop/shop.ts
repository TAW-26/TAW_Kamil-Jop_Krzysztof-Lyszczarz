import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ShopCard } from '../../shared/components/shop-card/shop-card';
import { TabButtons } from '../../shared/components/tab-buttons/tab-buttons';

@Component({
  selector: 'app-shop',
  imports: [Navbar, Footer, ShopCard, TabButtons],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {}
