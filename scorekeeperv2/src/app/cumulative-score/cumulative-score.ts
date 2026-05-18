import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  phase = signal<'setup' | 'playing'>('setup');
  players = signal<Player[]>([]);
  newPlayerName = signal<string>('');
  winCondition = signal<'highest' | 'lowest'>('highest');
  
  // State for the current round input
  roundInput = signal<RoundInput>({});

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
      const state = {
        phase: this.phase(),
        players: this.players(),
        winCondition: this.winCondition(),
        roundInput: this.roundInput()
      };
      localStorage.setItem('cumulative_score_state', JSON.stringify(state));
    });
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
    const inputs = this.roundInput();
    this.players.update(players => {
      return players.map(p => {
        const roundPoints = inputs[p.id] || 0;
        return {
          ...p,
          totalScore: p.totalScore + Number(roundPoints)
        };
      });
    });
    this.initRoundInput(); // Reset inputs for next round
  }

  resetGame() {
    if (confirm('Are you sure you want to end this game and start over?')) {
      this.phase.set('setup');
      this.players.update(players => players.map(p => ({ ...p, totalScore: 0 })));
    }
  }
}
