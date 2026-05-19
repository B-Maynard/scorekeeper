import { Component, signal, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';

export interface TallyTeam {
  id: string;
  name: string;
  score: number;
  isSpectator?: boolean;
}

@Component({
  selector: 'app-tally-mode',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tally-mode.html',
  styleUrl: './tally-mode.scss'
})
export class TallyMode implements OnDestroy {
  public roomService = inject(RoomService);
  
  phase = signal<'setup' | 'playing'>('setup');
  teams = signal<TallyTeam[]>([]);
  newTeamName = signal<string>('');
  allowViewerJoin = signal<boolean>(false);
  
  roundTimeSeconds = signal<number>(60);
  timeRemaining = signal<number>(60);
  isTimerRunning = signal<boolean>(false);
  showTimeUpBanner = signal<boolean>(false);
  private timerInterval: any = null;

  constructor() {
    const saved = localStorage.getItem('tally_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.teams.set(state.teams || []);
      } catch (e) {}
    } else {
      this.teams.set([
        { id: this.generateId(), name: 'Team 1', score: 0 },
        { id: this.generateId(), name: 'Team 2', score: 0 }
      ]);
    }

    effect(() => {
      const state = { 
        mode: 'team', 
        teams: this.teams(),
        phase: this.phase(),
        allowViewerJoin: this.allowViewerJoin()
      };
      localStorage.setItem('tally_state', JSON.stringify({ teams: this.teams() }));
      this.roomService.updateRoomState(state as any);
    });

    // Ingest spectator join requests as new teams during the setup phase
    effect(() => {
      const requests = this.roomService.hostPlayerRequests();
      if (requests && this.roomService.isHosting() && this.allowViewerJoin() && this.phase() === 'setup') {
        const currentTeams = this.teams();
        let updated = false;
        const newTeams = [...currentTeams];
        
        Object.entries(requests).forEach(([id, req]) => {
          if (!newTeams.some(t => t.id === id)) {
            newTeams.push({ id, name: req.name, score: 0, isSpectator: true });
            updated = true;
          }
          // Resolve immediately so it clears from the request queue
          this.roomService.resolvePlayerRequest(id);
        });
        
        if (updated) {
          this.teams.set(newTeams);
        }
      }
    });

    // Monitor spectator players for immediate disconnection cleanup in setup phase
    effect(() => {
      const activeSpectators = this.roomService.hostSpectators();
      const currentTeams = this.teams();
      const isHosting = this.roomService.isHosting();
      const isSetup = this.phase() === 'setup';
      
      if (isHosting && isSetup) {
        const offlineSpectatorIds = currentTeams
          .filter(t => t.isSpectator && activeSpectators[t.id] === undefined)
          .map(t => t.id);
          
        if (offlineSpectatorIds.length > 0) {
          console.log('Spectator players offline. Immediately auto-removing from roster:', offlineSpectatorIds);
          this.teams.update(teams => teams.filter(t => !offlineSpectatorIds.includes(t.id)));
        }
      }
    });
  }

  generateId() { return Math.random().toString(36).substr(2, 9); }

  addTeam() {
    const name = this.newTeamName().trim();
    if (name) {
      this.teams.update(t => [...t, { id: this.generateId(), name, score: 0 }]);
      this.newTeamName.set('');
    }
  }

  removeTeam(id: string) {
    this.teams.update(t => t.filter(team => team.id !== id));
  }

  startGame() {
    this.phase.set('playing');
    this.resetTimer();
  }
  
  async toggleHost() {
    if (this.roomService.isHosting()) {
      this.roomService.stopHosting();
    } else {
      await this.roomService.hostRoom({
        mode: 'team',
        teams: this.teams(),
        phase: this.phase(),
        allowViewerJoin: this.allowViewerJoin()
      } as any);
    }
  }

  addScore(id: string, amount: number) {
    this.teams.update(teams => 
      teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t)
    );
  }

  toggleTimer() {
    if (this.isTimerRunning()) {
      this.stopTimer();
    } else {
      this.showTimeUpBanner.set(false);
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timeRemaining() <= 0) return;
    this.isTimerRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.timeRemaining.update(t => t - 1);
      if (this.timeRemaining() <= 0) {
        this.stopTimer();
        this.showTimeUpBanner.set(true);
      }
    }, 1000);
  }

  stopTimer() {
    this.isTimerRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timeRemaining.set(this.roundTimeSeconds());
    this.showTimeUpBanner.set(false);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  resetGame() {
    if (confirm('Reset all scores?')) {
      this.teams.update(t => t.map(team => ({...team, score: 0})));
      this.resetTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
