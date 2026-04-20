import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '../button/button';
import { AuthInput } from '../auth-input/auth-input';
import { AuthMode, AuthToggle } from '../auth-toggle/auth-toggle';

@Component({
  selector: 'app-auth-form',
  imports: [CommonModule, Button, AuthInput, AuthToggle],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.css',
})
export class AuthForm {
  protected mode: AuthMode = 'login';

  protected setMode(mode: AuthMode): void {
    this.mode = mode;
  }
}
