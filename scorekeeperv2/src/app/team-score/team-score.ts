import { Component, signal, effect, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';

export interface Team {
  id: string;
  name: string;
  score: number;
  isSpectator?: boolean;
}

@Component({
  selector: 'app-team-score',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './team-score.html',
  styleUrl: './team-score.scss'
})
export class TeamScore implements OnDestroy {
  public roomService = inject(RoomService);
  teams = signal<Team[]>([]);
  newTeamName = signal<string>('');
  fullscreenMode = signal<boolean>(false);
  allowViewerJoin = signal<boolean>(false);
  animatingTeams = signal<Record<string, boolean>>({});

  constructor() {
    // Load from local storage
    const saved = localStorage.getItem('team_score_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Handle backwards compatibility where saved was just an array
        if (Array.isArray(state)) {
          this.teams.set(state);
        } else {
          this.teams.set(state.teams || []);
          this.fullscreenMode.set(state.fullscreenMode || false);
          this.allowViewerJoin.set(state.allowViewerJoin || false);
        }
      } catch (e) {
        console.error('Failed to parse saved state', e);
        this.initDefaultTeams();
      }
    } else {
      this.initDefaultTeams();
    }

    // Auto-save effect
    effect(() => {
      const state: any = {
        mode: 'team',
        teams: this.teams(),
        fullscreenMode: this.fullscreenMode(),
        allowViewerJoin: this.allowViewerJoin()
      };
      localStorage.setItem('team_score_state', JSON.stringify(state));
      this.roomService.updateRoomState(state);
    });

    // Ingest spectator join requests as new players/teams
    effect(() => {
      const requests = this.roomService.hostPlayerRequests();
      if (requests && this.roomService.isHosting() && this.allowViewerJoin()) {
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

    // Monitor spectator players for immediate disconnection cleanup
    effect(() => {
      const activeSpectators = this.roomService.hostSpectators();
      const currentTeams = this.teams();
      const isHosting = this.roomService.isHosting();
      
      if (isHosting) {
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

  async toggleHost() {
    if (this.roomService.isHosting()) {
      this.roomService.stopHosting();
    } else {
      await this.roomService.hostRoom({
        mode: 'team',
        teams: this.teams(),
        fullscreenMode: this.fullscreenMode(),
        allowViewerJoin: this.allowViewerJoin()
      } as any);
    }
  }

  initDefaultTeams() {
    this.teams.set([
      { id: this.generateId(), name: 'Team A', score: 0 },
      { id: this.generateId(), name: 'Team B', score: 0 }
    ]);
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  addScore(id: string, amount: number) {
    this.teams.update(teams => 
      teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t)
    );
    this.animatingTeams.update(state => ({ ...state, [id]: true }));
    setTimeout(() => {
      this.animatingTeams.update(state => ({ ...state, [id]: false }));
    }, 300);
  }

  addTeam() {
    const name = this.newTeamName().trim();
    if (name) {
      this.teams.update(teams => [
        ...teams, 
        { id: this.generateId(), name, score: 0 }
      ]);
      this.newTeamName.set('');
    }
  }

  removeTeam(id: string) {
    this.teams.update(teams => teams.filter(t => t.id !== id));
  }

  resetScores() {
    if (confirm('Are you sure you want to reset all scores to 0?')) {
      this.teams.update(teams => teams.map(t => ({ ...t, score: 0 })));
    }
  }

  ngOnDestroy() {}
}
