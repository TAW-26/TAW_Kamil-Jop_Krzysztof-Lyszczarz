import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from '../stat-card/stat-card';

type ProfileStat = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule, StatCard],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css',
})
export class StatsCards {
  protected readonly stats: ProfileStat[] = [
    { value: '142', label: 'ROZEGRANE GRY' },
    { value: '68%', label: 'PROCENT WYGRANYCH' },
    { value: '3🔥', label: 'AKTUALNA SERIA' },
    { value: '14🔥', label: 'NAJLEPSZA SERIA' },
  ];
}
