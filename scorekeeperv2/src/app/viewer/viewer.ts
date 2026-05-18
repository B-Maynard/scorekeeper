import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss'
})
export class Viewer implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);
  
  errorMsg = signal<string | null>(null);
  fullscreenMode = signal<boolean>(false);

  async ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      const success = await this.roomService.joinRoom(code);
      if (!success) {
        this.errorMsg.set(`Room ${code} not found or no longer active.`);
      }
    } else {
      this.errorMsg.set('No room code provided.');
    }
  }

  ngOnDestroy() {
    this.roomService.leaveRoom();
  }
}
