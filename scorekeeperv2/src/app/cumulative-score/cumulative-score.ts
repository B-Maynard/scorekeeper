import { Component, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';
import { ContextText } from '../enums/context.enum';

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  isSpectator?: boolean;
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
export class CumulativeScore implements OnDestroy {
  public roomService = inject(RoomService);

  ContextText = ContextText;

  phase = signal<'setup' | 'playing'>('setup');
  players = signal<Player[]>([]);
  newPlayerName = signal<string>('');
  winCondition = signal<'highest' | 'lowest'>('highest');
  allowViewerJoin = signal<boolean>(false);

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
        this.allowViewerJoin.set(state.allowViewerJoin || false);
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
        roundInput: this.roundInput(),
        allowViewerJoin: this.allowViewerJoin()
      };
      localStorage.setItem('cumulative_score_state', JSON.stringify(state));
      this.roomService.updateRoomState(state);
    });

    // Ingest spectator join requests as new players during the setup phase
    effect(() => {
      const requests = this.roomService.hostPlayerRequests();
      if (requests && this.roomService.isHosting() && this.allowViewerJoin() && this.phase() === 'setup') {
        const currentPlayers = this.players();
        let updated = false;
        const newPlayers = [...currentPlayers];

        Object.entries(requests).forEach(([id, req]) => {
          if (!newPlayers.some(p => p.id === id)) {
            newPlayers.push({ id, name: req.name, totalScore: 0, isSpectator: true });
            updated = true;
          }
          // Resolve immediately so it clears from the request queue
          this.roomService.resolvePlayerRequest(id);
        });

        if (updated) {
          this.players.set(newPlayers);
        }
      }
    });

    // Monitor spectator players for immediate disconnection cleanup in setup phase
    effect(() => {
      const activeSpectators = this.roomService.hostSpectators();
      const currentPlayers = this.players();
      const isHosting = this.roomService.isHosting();
      const isSetup = this.phase() === 'setup';

      if (isHosting && isSetup) {
        const offlineSpectatorIds = currentPlayers
          .filter(p => p.isSpectator && activeSpectators[p.id] === undefined)
          .map(p => p.id);

        if (offlineSpectatorIds.length > 0) {
          console.log('Spectator players offline. Immediately auto-removing from roster:', offlineSpectatorIds);
          this.players.update(players => players.filter(p => !offlineSpectatorIds.includes(p.id)));
        }
      }
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
        roundInput: this.roundInput(),
        allowViewerJoin: this.allowViewerJoin()
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

  ngOnDestroy() { }
}
