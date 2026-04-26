import { Component, Input } from '@angular/core';

export type TabButtonState = 'default' | 'active';

@Component({
  selector: 'app-tab-button',
  imports: [],
  templateUrl: './tab-button.html',
  styleUrl: './tab-button.css',
})
export class TabButton {
  @Input() label = 'AWATARY';
  @Input() state: TabButtonState = 'default';

  protected get isActive(): boolean {
    return this.state === 'active';
  }
}
