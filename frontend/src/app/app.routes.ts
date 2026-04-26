import { Routes } from '@angular/router';
import { Contact } from './pages/contact/contact';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Game } from './pages/game/game';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Profile } from './pages/profile/profile';
import { ProfileSettings } from './pages/profile-settings/profile-settings';
import { Rank } from './pages/rank/rank';
import { Shop } from './pages/shop/shop';
import { Terms } from './pages/terms/terms';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Game },
  { path: 'game/:category', component: Game },
  { path: 'login', component: Login },
  { path: 'rank', component: Rank },
  { path: 'shop', component: Shop },
  { path: 'profile', component: Profile },
  { path: 'profile-settings', component: ProfileSettings },
  { path: 'terms', component: Terms },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'contact', component: Contact },
  { path: 'forgot-password', component: ForgotPassword },
];
