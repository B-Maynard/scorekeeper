import { Component, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';
import confetti from 'canvas-confetti';

export interface TournamentPlayer {
  id: string;
  name: string;
}

export interface TournamentMatch {
  id: string; // e.g., 'R1-M1'
  round: number;
  matchIndex: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  score1: number | null;
  score2: number | null;
  winnerId?: string;
  nextMatchId: string | null;
  nextMatchSlot: 'player1' | 'player2' | null;
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tournament.html',
  styleUrl: './tournament.scss'
})
export class Tournament {
  public roomService = inject(RoomService);
  
  phase = signal<'setup' | 'active' | 'completed'>('setup');
  participants = signal<{id: string, name: string}[]>([]);
  newParticipantName = signal<string>('');
  matches = signal<Record<string, TournamentMatch>>({});
  
  rounds = computed(() => {
    const matchVals = Object.values(this.matches());
    if (matchVals.length === 0) return [];
    
    const maxRound = Math.max(...matchVals.map(m => m.round));
    const roundsArray = [];
    for (let r = 1; r <= maxRound; r++) {
      roundsArray.push({
        roundNum: r,
        matches: matchVals.filter(m => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex)
      });
    }
    return roundsArray;
  });

  activeMatchId = signal<string | null>(null);
  activeScore1 = signal<number | null>(null);
  activeScore2 = signal<number | null>(null);

  constructor() {
    const saved = localStorage.getItem('tournament_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.phase.set(state.phase || 'setup');
        this.participants.set(state.participants || []);
        this.matches.set(state.matches || {});
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }

    effect(() => {
      const state = {
        phase: this.phase(),
        participants: this.participants(),
        matches: this.matches()
      };
      localStorage.setItem('tournament_state', JSON.stringify(state));
      
      this.roomService.updateRoomState({
        mode: 'tournament',
        tournamentState: state
      } as any);
    });
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  addParticipant() {
    const name = this.newParticipantName().trim();
    if (name) {
      this.participants.update(p => [...p, { id: this.generateId(), name }]);
      this.newParticipantName.set('');
    }
  }

  removeParticipant(id: string) {
    this.participants.update(p => p.filter(player => player.id !== id));
  }
  
  async toggleHost() {
    if (this.roomService.isHosting()) {
      this.roomService.stopHosting();
    } else {
      await this.roomService.hostRoom({
        mode: 'tournament',
        tournamentState: {
          phase: this.phase(),
          participants: this.participants(),
          matches: this.matches()
        }
      } as any);
    }
  }

  startTournament() {
    const players = [...this.participants()];
    if (players.length < 3) {
      alert("Need at least 3 players to start a tournament!");
      return;
    }
    
    // Shuffle the real players first
    const shuffledPlayers = [...players];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }

    let size = 4;
    while (size < players.length) size *= 2;
    
    const numMatchesInRound1 = size / 2;
    const numByes = size - players.length;
    const numDoubleRealMatches = numMatchesInRound1 - numByes;

    // Create a list of players designed to prevent BYE-vs-BYE matches
    const round1Players: (TournamentPlayer | null)[] = [];
    
    // First, add the pairs of real players
    for (let i = 0; i < numDoubleRealMatches; i++) {
      round1Players.push(shuffledPlayers[i * 2]);
      round1Players.push(shuffledPlayers[i * 2 + 1]);
    }
    
    // Then, pair the remaining real players with a BYE (null) each
    const remainingRealStartIndex = numDoubleRealMatches * 2;
    for (let i = 0; i < numByes; i++) {
      round1Players.push(shuffledPlayers[remainingRealStartIndex + i]);
      round1Players.push(null);
    }

    // Shuffle the match pairs themselves so BYEs are scattered randomly across the bracket
    const matchesPairs: [TournamentPlayer | null, TournamentPlayer | null][] = [];
    for (let m = 0; m < numMatchesInRound1; m++) {
      matchesPairs.push([round1Players[m * 2], round1Players[m * 2 + 1]]);
    }
    for (let i = matchesPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matchesPairs[i], matchesPairs[j]] = [matchesPairs[j], matchesPairs[i]];
    }
    
    // Flatten back to the standard padded players array
    const paddedPlayers: (TournamentPlayer | null)[] = [];
    for (const pair of matchesPairs) {
      paddedPlayers.push(pair[0]);
      paddedPlayers.push(pair[1]);
    }

    const newMatches: Record<string, TournamentMatch> = {};
    let totalRounds = Math.log2(size);
    
    for (let r = 1; r <= totalRounds; r++) {
      const numMatchesInRound = size / Math.pow(2, r);
      
      for (let m = 0; m < numMatchesInRound; m++) {
        const id = `R${r}-M${m+1}`;
        const nextRound = r + 1;
        const nextMatchIndex = Math.floor(m / 2) + 1;
        const nextMatchId = r < totalRounds ? `R${nextRound}-M${nextMatchIndex}` : null;
        const nextMatchSlot = r < totalRounds ? (m % 2 === 0 ? 'player1' : 'player2') : null;
        
        const match: TournamentMatch = {
          id,
          round: r,
          matchIndex: m + 1,
          player1: null,
          player2: null,
          score1: null,
          score2: null,
          nextMatchId,
          nextMatchSlot
        };
        
        if (r === 1) {
          match.player1 = paddedPlayers[m * 2];
          match.player2 = paddedPlayers[m * 2 + 1];
          
          if (match.player1 === null && match.player2 !== null) {
            match.winnerId = match.player2.id;
          } else if (match.player2 === null && match.player1 !== null) {
            match.winnerId = match.player1.id;
          }
        }
        
        newMatches[id] = match;
      }
    }
    
    for (const match of Object.values(newMatches)) {
      if (match.round === 1 && match.winnerId && match.nextMatchId) {
        const nextMatch = newMatches[match.nextMatchId];
        const winner = match.winnerId === match.player1?.id ? match.player1 : match.player2;
        if (match.nextMatchSlot === 'player1') nextMatch.player1 = winner;
        if (match.nextMatchSlot === 'player2') nextMatch.player2 = winner;
      }
    }
    
    this.matches.set(newMatches);
    this.phase.set('active');
  }

  openMatch(matchId: string) {
    const match = this.matches()[matchId];
    if (match.player1 && match.player2 && !match.winnerId) {
      this.activeMatchId.set(matchId);
      this.activeScore1.set(match.score1 || 0);
      this.activeScore2.set(match.score2 || 0);
    }
  }
  
  closeModal() {
    this.activeMatchId.set(null);
  }

  submitScore() {
    const id = this.activeMatchId();
    if (!id) return;
    
    const s1 = this.activeScore1() || 0;
    const s2 = this.activeScore2() || 0;
    
    if (s1 === s2) {
      alert("Ties are not allowed in elimination tournaments!");
      return;
    }
    
    this.matches.update(matches => {
      const newMatches = { ...matches };
      const match = { ...newMatches[id], score1: s1, score2: s2 };
      
      const winner = s1 > s2 ? match.player1 : match.player2;
      match.winnerId = winner?.id;
      newMatches[id] = match;
      
      if (match.nextMatchId && winner) {
        const nextMatch = { ...newMatches[match.nextMatchId] };
        if (match.nextMatchSlot === 'player1') nextMatch.player1 = winner;
        if (match.nextMatchSlot === 'player2') nextMatch.player2 = winner;
        newMatches[match.nextMatchId] = nextMatch;
      } else if (!match.nextMatchId && winner) {
        this.phase.set('completed');
        this.triggerConfetti();
      }
      
      return newMatches;
    });
    
    this.closeModal();
  }

  resetTournament() {
    if (confirm('Are you sure you want to end this tournament?')) {
      this.phase.set('setup');
      this.matches.set({});
    }
  }

  triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#6366f1']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#6366f1']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }
}
