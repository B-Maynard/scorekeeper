import { Component, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chess-timer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chess-timer.html',
  styleUrl: './chess-timer.scss'
})
export class ChessTimer implements OnDestroy {
  phase = signal<'setup' | 'playing'>('setup');
  
  initialTimeMinutes = signal<number>(5);
  
  time1 = signal<number>(300);
  time2 = signal<number>(300);
  
  activePlayer = signal<1 | 2 | null>(null);
  isPaused = signal<boolean>(true);
  
  private timerInterval: any = null;

  constructor() {}

  startGame() {
    this.time1.set(this.initialTimeMinutes() * 60);
    this.time2.set(this.initialTimeMinutes() * 60);
    this.phase.set('playing');
    this.isPaused.set(true);
    this.activePlayer.set(null);
  }

  toggleActive(player: 1 | 2) {
    if (this.isPaused()) {
      this.isPaused.set(false);
      this.startTimer();
    }
    
    if (this.time1() <= 0 || this.time2() <= 0) return;
    
    this.activePlayer.set(player === 1 ? 2 : 1);
  }

  pauseGame() {
    this.isPaused.set(true);
    this.stopTimer();
  }

  resumeGame() {
    if (this.activePlayer() !== null) {
      this.isPaused.set(false);
      this.startTimer();
    }
  }

  resetGame() {
    this.stopTimer();
    this.phase.set('setup');
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const active = this.activePlayer();
      if (active === 1) {
        if (this.time1() > 0) this.time1.update(t => t - 1);
        if (this.time1() <= 0) this.stopTimer();
      } else if (active === 2) {
        if (this.time2() > 0) this.time2.update(t => t - 1);
        if (this.time2() <= 0) this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    if (seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
