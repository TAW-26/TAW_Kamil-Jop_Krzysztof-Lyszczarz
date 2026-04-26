import { Component } from '@angular/core';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ProfileHeaderCard } from '../../shared/components/profile-header-card/profile-header-card';

@Component({
  selector: 'app-profile-settings',
  imports: [Navbar, Footer, ProfileHeaderCard, AuthInput, Button],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {}
