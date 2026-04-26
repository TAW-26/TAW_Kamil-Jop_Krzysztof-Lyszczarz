import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RankListRow } from '../rank-list-row/rank-list-row';
import { ShopCard } from '../shop-card/shop-card';
import { TabButtons } from '../tab-buttons/tab-buttons';

@Component({
  selector: 'app-profile-tabs-section',
  imports: [CommonModule, TabButtons, RankListRow, ShopCard],
  templateUrl: './profile-tabs-section.html',
  styleUrl: './profile-tabs-section.css',
})
export class ProfileTabsSection {
  @Input() activeTabIndex = 0;

  protected setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }
}
