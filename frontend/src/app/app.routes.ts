import { Routes } from '@angular/router';
import { Game } from './pages/game/game';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Rank } from './pages/rank/rank';
import { Shop } from './pages/shop/shop';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Game },
  { path: 'game/:category', component: Game },
  { path: 'login', component: Login },
  { path: 'rank', component: Rank },
  { path: 'shop', component: Shop },
];
