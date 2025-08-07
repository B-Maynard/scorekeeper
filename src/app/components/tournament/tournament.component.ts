
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { History, MatchSlot, Round, uuid } from '../../models';
import { StorageSvc } from '../../storage';

interface TournamentState {
  entrants: string;
  rounds: Round[];
  started: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  rot: number;
  dur: number;
  delay: number;
  color: string;
  scale: number;
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent {
  state: TournamentState = { entrants: '', rounds: [], started: false };
  sessionId = '';
  history = new History<TournamentState>();

  champion: string | null = null;
  showCelebration = false;
  confetti: ConfettiPiece[] = [];

  constructor() {
    const loaded = StorageSvc.loadLatest<TournamentState>('tournament');
    if (loaded.state) {
      this.sessionId = loaded.id;
      this.state = loaded.state;
    } else {
      this.sessionId = StorageSvc.newSession('tournament');
    }
    this.commit();
  }

  private saveSnapshot(): void {
    if (!this.sessionId) this.sessionId = StorageSvc.newSession('tournament');
    StorageSvc.save('tournament', this.sessionId, this.state);
  }

  commit(): void {
    this.saveSnapshot();
    this.history.push(this.state);
  }

  // ---------- Celebration ----------
  celebrate(name: string): void {
    this.champion = name;
    this.buildConfetti(140);
    this.showCelebration = true;
  }
  buildConfetti(n: number): void {
    const colors = ['#5b8cff','#7df0c2','#ff8bd1','#ffe27a','#96a8ff','#57d6a2'];
    this.confetti = Array.from({ length: n }).map(() => ({
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rot: Math.random() * 360,
      dur: 2.6 + Math.random() * 2.4,
      delay: Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.7 + Math.random() * 1.3
    }));
  }
  playAgain(): void {
    const entrantsStr = this.state.entrants;
    this.showCelebration = false;
    this.champion = null;
    this.state.rounds = [];
    this.state.started = false;
    this.state.entrants = entrantsStr || this.state.entrants;
    this.start();
  }
  resetAndHide(): void {
    this.showCelebration = false;
    this.champion = null;
    this.reset();
  }

  // ---------- Controls ----------
  reset(): void {
    this.state = { entrants: '', rounds: [], started: false };
    this.history.reset();
    this.sessionId = StorageSvc.newSession('tournament');
    this.commit();
  }
  undo(): void {
    this.state = this.history.undo(this.state);
    this.saveSnapshot();
  }

  // ---------- Build bracket: players-first + one BYE (R1) ----------
  start(): void {
    const names = this.state.entrants
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (names.length < 2) return;

    const first: Round = { id: uuid(), matches: [] };

    // Pair player vs player first
    let i = 0;
    for (; i + 1 < names.length; i += 2) {
      first.matches.push({
        id: uuid(),
        a: { id: uuid(), name: names[i] },
        b: { id: uuid(), name: names[i + 1] },
        winner: undefined
      });
    }
    // If odd, a single BYE in R1
    if (i < names.length) {
      const last = names[i];
      first.matches.push({
        id: uuid(),
        a: { id: uuid(), name: last },
        b: { id: uuid(), name: 'BYE', bye: true },
        winner: undefined
      });
    }

    const rounds: Round[] = [first];
    // Build subsequent rounds: ceil( prev/2 ) matches per round
    let prev = first;
    while (prev.matches.length > 1) {
      const nextCount = Math.ceil(prev.matches.length / 2);
      const r: Round = { id: uuid(), matches: [] };
      for (let j = 0; j < nextCount; j++) {
        r.matches.push({ id: uuid(), a: null, b: null });
      }
      rounds.push(r);
      prev = r;
    }

    this.state.rounds = rounds;
    this.state.started = true;

    this.autoAdvanceByes();
    this.commit();
  }

  // ---------- Auto-advance rules ----------
  // R1: player vs BYE => player advances
  // Later rounds: if only one source exists (odd previous round) and exactly one entrant is present in the match, auto-advance that entrant one round.
  private autoAdvanceByes(): void {
    const rounds = this.state.rounds;
    if (!rounds.length) return;

    // First round BYEs
    const firstRound = rounds[0];
    firstRound.matches.forEach((m, mIdx) => {
      if (m.winner) return;
      const aBye = !!m.a?.bye;
      const bBye = !!m.b?.bye;
      if ((aBye || bBye) && !(aBye && bBye)) {
        const winner = aBye ? m.b : m.a;
        if (winner) this.selectWinner(0, mIdx, winner);
      }
    });

    // Later rounds oddness
    for (let r = 1; r < rounds.length; r++) {
      const prev = rounds[r - 1];
      const cur = rounds[r];
      cur.matches.forEach((match, i) => {
        if (match.winner) return;
        const leftIdx = 2 * i;
        const rightIdx = 2 * i + 1;
        const leftExists = leftIdx < prev.matches.length;
        const rightExists = rightIdx < prev.matches.length;
        const siblingMissing = !(leftExists && rightExists);
        if (!siblingMissing) return;

        const hasA = !!match.a;
        const hasB = !!match.b;
        const aBye = !!match.a?.bye;
        const bBye = !!match.b?.bye;

        if ((hasA && !hasB) || (hasB && !hasA) || (aBye !== bBye)) {
          const winner = (hasA && (!hasB || bBye)) ? match.a : match.b;
          if (winner) this.selectWinner(r, i, winner);
        }
      });
    }
  }

  selectWinner(roundIndex: number, matchIndex: number, slot: MatchSlot): void {
    const rounds = this.state.rounds;
    const current = rounds[roundIndex];
    const match = current.matches[matchIndex];

    match.winner = slot;

    if (roundIndex < rounds.length - 1) {
      const nextRound = rounds[roundIndex + 1];
      const targetMatch = nextRound.matches[Math.floor(matchIndex / 2)];
      const isA = matchIndex % 2 === 0;
      if (isA) {
        targetMatch.a = slot;
      } else {
        targetMatch.b = slot;
      }
    }

    this.commit();
    this.flash(slot.id);

    if (roundIndex === rounds.length - 1) {
      const name = slot?.name || 'Winner';
      this.celebrate(name);
    }
  }

  flash(id: string): void {
    const el = document.getElementById('slot-' + id);
    if (!el) return;
    el.classList.remove('advance-anim');
    void (el as any).offsetWidth;
    el.classList.add('advance-anim');
  }

  private nextPow2(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }
}
