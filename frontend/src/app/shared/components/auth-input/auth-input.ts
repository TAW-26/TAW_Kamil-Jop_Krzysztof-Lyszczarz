import { Component, EventEmitter, Input, Output, model } from '@angular/core';

@Component({
  selector: 'app-auth-input',
  imports: [],
  templateUrl: './auth-input.html',
  styleUrl: './auth-input.css',
})
export class AuthInput {
  @Input() label = 'ADRES E-MAIL';
  @Input() placeholder = 'Enter your email';
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() focused = false;
  @Input() disabled = false;
  @Input() autocomplete = '';
  @Output() enterPressed = new EventEmitter<void>();

  readonly value = model('');
}
