import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth-toggle',
  imports: [CommonModule],
  templateUrl: './auth-toggle.html',
  styleUrl: './auth-toggle.css',
})
export class AuthToggle {
  @Input({ required: true }) mode: AuthMode = 'login';
  @Output() modeChange = new EventEmitter<AuthMode>();

  protected setMode(mode: AuthMode): void {
    if (this.mode === mode) {
      return;
    }
    this.modeChange.emit(mode);
  }
}
