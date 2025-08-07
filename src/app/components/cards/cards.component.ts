
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { History, Player, uuid } from '../../models';
import { StorageSvc } from '../../storage';

interface CardsState {
  players: Player[];
  customAmount: number;
  newPlayer: string;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  state: CardsState = {
    players: [],
    customAmount: 5,
    newPlayer: ''
  };
  sessionId = '';
  history = new History<CardsState>();

  constructor() {
    const loaded = StorageSvc.loadLatest<CardsState>('cards');
    if (loaded.state) {
      this.sessionId = loaded.id;
      this.state = loaded.state;
    } else {
      this.sessionId = StorageSvc.newSession('cards');
    }
    this.commit();
  }

  private saveSnapshot() {
    if (!this.sessionId) {
      this.sessionId = StorageSvc.newSession('cards');
    }
    StorageSvc.save('cards', this.sessionId, this.state);
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

  addPlayer() {
    const name = this.state.newPlayer.trim();
    if (!name) return;
    this.state.players.push({ id: uuid(), name, score: 0, notes: '' });
    this.state.newPlayer = '';
    this.commit();
  }

  removePlayer(id: string) {
    this.state.players = this.state.players.filter(p => p.id !== id);
    this.commit();
  }

  plus(p: Player, amount: number) {
    p.score += amount;
    this.flashScore(p.id);
    this.commit();
  }

  minus(p: Player, amount: number) {
    p.score -= amount;
    this.flashScore(p.id);
    this.commit();
  }

  updateNotes() {
    this.commit();
  }

  undo() {
    this.state = this.history.undo(this.state);
    this.saveSnapshot();
  }

  reset() {
    this.state = { players: [], customAmount: 5, newPlayer: '' };
    this.history.reset();
    this.sessionId = StorageSvc.newSession('cards');
    this.commit();
  }
}
