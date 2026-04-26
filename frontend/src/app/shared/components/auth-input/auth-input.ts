import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-input',
  imports: [],
  templateUrl: './auth-input.html',
  styleUrl: './auth-input.css',
})
export class AuthInput {
  @Input() label = 'ADRES E-MAIL';
  @Input() placeholder = 'Wpisz swój email';
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() focused = false;
}
