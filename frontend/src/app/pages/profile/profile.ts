import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ProfileHeaderCard } from '../../shared/components/profile-header-card/profile-header-card';
import { ProfileTabsSection } from '../../shared/components/profile-tabs-section/profile-tabs-section';
import { StatsCards } from '../../shared/components/stats-cards/stats-cards';

@Component({
  selector: 'app-profile',
  imports: [Navbar, Footer, ProfileHeaderCard, StatsCards, ProfileTabsSection],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {}
