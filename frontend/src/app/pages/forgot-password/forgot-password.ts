import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-forgot-password',
  imports: [Navbar, Footer, AuthInput, Button, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {}
