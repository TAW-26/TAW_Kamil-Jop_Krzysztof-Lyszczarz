import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TabButton } from '../tab-button/tab-button';

@Component({
  selector: 'app-tab-buttons',
  imports: [CommonModule, TabButton],
  templateUrl: './tab-buttons.html',
  styleUrl: './tab-buttons.css',
})
export class TabButtons {
  @Input() tabs: string[] = ['AVATARS', 'AVATARS', 'AVATARS', 'AVATARS'];
  @Input() activeIndex = 0;
  @Output() activeIndexChange = new EventEmitter<number>();

  protected setActiveTab(index: number): void {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
