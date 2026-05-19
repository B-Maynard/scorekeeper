import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TeamScore } from './team-score/team-score';
import { CumulativeScore } from './cumulative-score/cumulative-score';
import { Tournament } from './tournament/tournament';
import { ChessTimer } from './chess-timer/chess-timer';
import { TallyMode } from './tally-mode/tally-mode';
import { Viewer } from './viewer/viewer';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'team', component: TeamScore },
  { path: 'cumulative', component: CumulativeScore },
  { path: 'tournament', component: Tournament },
  { path: 'chess-timer', component: ChessTimer },
  { path: 'tally-mode', component: TallyMode },
  { path: 'viewer/:code', component: Viewer },
  { path: '**', redirectTo: '' }
];
