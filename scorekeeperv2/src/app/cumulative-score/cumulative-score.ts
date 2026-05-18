import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';

export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface RoundInput {
  [playerId: string]: number | null;
}

@Component({
  selector: 'app-cumulative-score',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cumulative-score.html',
  styleUrl: './cumulative-score.scss'
})
export class CumulativeScore {
  public roomService = inject(RoomService);
  
  phase = signal<'setup' | 'playing'>('setup');
  players = signal<Player[]>([]);
  newPlayerName = signal<string>('');
  winCondition = signal<'highest' | 'lowest'>('highest');
  
  // State for the current round input
  roundInput = signal<RoundInput>({});
  animatingPlayers = signal<Record<string, boolean>>({});

  // Computed Leaderboard (sorted by totalScore depending on winCondition)
  leaderboard = computed(() => {
    return [...this.players()].sort((a, b) => {
      return this.winCondition() === 'highest' 
        ? b.totalScore - a.totalScore 
        : a.totalScore - b.totalScore;
    });
  });

  constructor() {
    const saved = localStorage.getItem('cumulative_score_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.phase.set(state.phase || 'setup');
        this.players.set(state.players || []);
        this.winCondition.set(state.winCondition || 'highest');
        this.roundInput.set(state.roundInput || {});
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }

    effect(() => {
      const state: any = {
        mode: 'cumulative',
        phase: this.phase(),
        players: this.players(),
        winCondition: this.winCondition(),
        roundInput: this.roundInput()
      };
      localStorage.setItem('cumulative_score_state', JSON.stringify(state));
      this.roomService.updateRoomState(state);
    });
  }

  async toggleHost() {
    if (this.roomService.isHosting()) {
      this.roomService.stopHosting();
    } else {
      await this.roomService.hostRoom({
        mode: 'cumulative',
        players: this.players(),
        phase: this.phase(),
        winCondition: this.winCondition(),
        roundInput: this.roundInput()
      } as any);
    }
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  addPlayer() {
    const name = this.newPlayerName().trim();
    if (name) {
      this.players.update(p => [...p, { id: this.generateId(), name, totalScore: 0 }]);
      this.newPlayerName.set('');
    }
  }

  removePlayer(id: string) {
    this.players.update(p => p.filter(player => player.id !== id));
  }

  startGame() {
    if (this.players().length > 0) {
      this.phase.set('playing');
      this.initRoundInput();
    }
  }

  initRoundInput() {
    const initialInput: RoundInput = {};
    this.players().forEach(p => {
      initialInput[p.id] = null;
    });
    this.roundInput.set(initialInput);
  }

  setPlayerRoundScore(id: string, score: number | null) {
    this.roundInput.update(inputs => ({
      ...inputs,
      [id]: score
    }));
  }

  submitRound() {
    this.players.update(players => 
      players.map(p => {
        const addedScore = Number(this.roundInput()[p.id] || 0);
        if (addedScore !== 0) {
          this.animatingPlayers.update(state => ({ ...state, [p.id]: true }));
          setTimeout(() => {
            this.animatingPlayers.update(state => ({ ...state, [p.id]: false }));
          }, 300);
        }
        return {
          ...p,
          totalScore: p.totalScore + addedScore
        };
      })
    );
    this.initRoundInput();
  }

  resetGame() {
    if (confirm('Are you sure you want to end this game and start over?')) {
      this.phase.set('setup');
      this.players.update(players => players.map(p => ({ ...p, totalScore: 0 })));
    }
  }
}
