import { Component } from '@angular/core';
import { AuthForm } from '../../shared/components/auth-form/auth-form';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-login',
  imports: [Navbar, Footer, AuthForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
