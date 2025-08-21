
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CardsComponent } from './pages/cards/cards.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { TournamentComponent } from './pages/tournament/tournament.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cards', component: CardsComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'tournament', component: TournamentComponent },
  { path: '**', redirectTo: '' }
];
