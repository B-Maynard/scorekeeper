
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { History, Team, uuid } from '../../models';
import { StorageSvc } from '../../storage';

interface SeriesSettings {
  pointsToWin: number;
  bestOf: number;   // 1,3,5,7,9...
  winByTwo: boolean;
}

interface TeamsState {
  teams: Team[]; // exactly 2
  settings: SeriesSettings;
  gamesWon: [number, number];
  matchOver: boolean;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent {
  state: TeamsState = {
    teams: [
      { id: uuid(), name: 'Team A', score: 0 },
      { id: uuid(), name: 'Team B', score: 0 }
    ],
    settings: {
      pointsToWin: 11,
      bestOf: 3,
      winByTwo: true
    },
    gamesWon: [0, 0],
    matchOver: false
  };
  sessionId = '';
  history = new History<TeamsState>();

  constructor() {
    const loaded = StorageSvc.loadLatest<TeamsState>('teams');
    if (loaded.state && Array.isArray(loaded.state.teams)) {
      const teams = loaded.state.teams.slice(0,2);
      while (teams.length < 2) teams.push({ id: uuid(), name: teams.length === 0 ? 'Team A' : 'Team B', score: 0 });
      this.state = {
        teams,
        settings: loaded.state.settings ?? { pointsToWin: 11, bestOf: 3, winByTwo: true },
        gamesWon: loaded.state.gamesWon ?? [0,0],
        matchOver: loaded.state.matchOver ?? false
      };
      this.sessionId = loaded.id;
    } else {
      this.sessionId = StorageSvc.newSession('teams');
    }
    this.commit();
  }

  // Helpers for template (no Math in HTML)
  get neededWins(): number {
    return Math.ceil(this.state.settings.bestOf / 2);
  }
  slots(n: number): number[] {
    return Array.from({ length: n }).map((_, i) => i);
  }

  private saveSnapshot() {
    if (!this.sessionId) {
      this.sessionId = StorageSvc.newSession('teams');
    }
    StorageSvc.save('teams', this.sessionId, this.state);
  }

  commit() {
    this.saveSnapshot();
    this.history.push(this.state);
  }

  flashScore(id: string) {
    const el = document.getElementById('score-' + id);
    if (!el) return;
    el.classList.remove('score-pulse');
    void (el as any).offsetWidth;
    el.classList.add('score-pulse');
  }

  rename(team: Team, name: string) {
    team.name = name;
    this.commit();
  }

  private checkGameWinner(): void {
    if (this.state.matchOver) return;
    const a = this.state.teams[0].score;
    const b = this.state.teams[1].score;
    const pts = this.state.settings.pointsToWin;
    const need2 = this.state.settings.winByTwo;

    const aWins = a >= pts && (!need2 || (a - b) >= 2);
    const bWins = b >= pts && (!need2 || (b - a) >= 2);
    let winner: 0 | 1 | null = null;
    if (aWins) winner = 0;
    else if (bWins) winner = 1;

    if (winner !== null) {
      const [aw, bw] = this.state.gamesWon;
      const updatedWins: [number, number] = winner === 0 ? [aw + 1, bw] : [aw, bw + 1];
      this.state.gamesWon = updatedWins;

      // reset scores for next game
      this.state.teams[0].score = 0;
      this.state.teams[1].score = 0;

      const needToWinMatch = this.neededWins;
      const champWins = winner === 0 ? updatedWins[0] : updatedWins[1];
      if (champWins >= needToWinMatch) {
        this.state.matchOver = true;
      }
    }
  }

  inc(team: Team) {
    if (this.state.matchOver) return;
    team.score += 1;
    this.flashScore(team.id);
    this.checkGameWinner();
    this.commit();
  }

  dec(team: Team) {
    if (this.state.matchOver) return;
    team.score = Math.max(0, team.score - 1);
    this.flashScore(team.id);
    this.commit();
  }

  // Settings handlers
  setBestOf(v: number) {
    const val = Number(v) || 1;
    this.state.settings.bestOf = val;
    this.commit();
  }
  setPointsToWin(v: number) {
    const val = Math.max(1, Math.floor(Number(v) || 1));
    this.state.settings.pointsToWin = val;
    this.commit();
  }
  toggleWinByTwo() {
    this.state.settings.winByTwo = !this.state.settings.winByTwo;
    this.commit();
  }

  // Series management
  nextGame() {
    if (!this.state.matchOver) {
      this.state.teams[0].score = 0;
      this.state.teams[1].score = 0;
      this.commit();
    }
  }

  undo() {
    this.state = this.history.undo(this.state);
    this.saveSnapshot();
  }

  reset() {
    this.state = {
      teams: [
        { id: uuid(), name: 'Team A', score: 0 },
        { id: uuid(), name: 'Team B', score: 0 }
      ],
      settings: { pointsToWin: 11, bestOf: 3, winByTwo: true },
      gamesWon: [0,0],
      matchOver: false
    };
    this.history.reset();
    this.sessionId = StorageSvc.newSession('teams');
    this.commit();
  }
}
