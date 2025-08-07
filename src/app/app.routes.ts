
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { CardsComponent } from './components/cards/cards.component';
import { TeamsComponent } from './components/teams/teams.component';
import { TournamentComponent } from './components/tournament/tournament.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cards', component: CardsComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'tournament', component: TournamentComponent },
  { path: '**', redirectTo: '' }
];
