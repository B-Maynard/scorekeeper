import { Component, signal, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from './services/room.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('scorekeeperv2');
  public roomService = inject(RoomService);
  
  public activeCheers = signal<{id: string, emoji: string, left: number, name?: string, avatar?: string}[]>([]);

  constructor() {
    let lastAnimatedId = '';
    effect(() => {
      const cheer = this.roomService.latestCheer();
      if (cheer && cheer.id !== lastAnimatedId) {
        lastAnimatedId = cheer.id;
        // Add to active cheers with a random horizontal position
        const newCheer = {
          id: cheer.id + Math.random(),
          emoji: cheer.emoji,
          left: Math.floor(Math.random() * 80) + 10, // 10% to 90%
          name: cheer.name,
          avatar: cheer.avatar
        };
        this.activeCheers.update(cheers => [...cheers, newCheer]);
        
        // Remove after animation completes
        setTimeout(() => {
          this.activeCheers.update(cheers => cheers.filter(c => c.id !== newCheer.id));
        }, 3000);
      }
    });
  }
}
