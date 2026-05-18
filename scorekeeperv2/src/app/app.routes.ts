import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TeamScore } from './team-score/team-score';
import { CumulativeScore } from './cumulative-score/cumulative-score';
import { Viewer } from './viewer/viewer';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'team', component: TeamScore },
  { path: 'cumulative', component: CumulativeScore },
  { path: 'viewer/:code', component: Viewer },
  { path: '**', redirectTo: '' }
];
