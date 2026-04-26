import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { PodiumItem } from '../../shared/components/podium-item/podium-item';
import { RankListRow } from '../../shared/components/rank-list-row/rank-list-row';

@Component({
  selector: 'app-rank',
  imports: [Navbar, Footer, PodiumItem, RankListRow],
  templateUrl: './rank.html',
  styleUrl: './rank.css',
})
export class Rank {}
