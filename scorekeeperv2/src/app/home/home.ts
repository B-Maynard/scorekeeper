import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private router = inject(Router);
  public roomService = inject(RoomService);
  roomCode = signal<string>('');

  joinRoom() {
    const code = this.roomCode().trim().toUpperCase();
    if (code) {
      this.router.navigate(['/viewer', code]);
    }
  }
}
