import { Component } from '@angular/core';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-contact',
  imports: [Navbar, Footer, AuthInput, Button],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
