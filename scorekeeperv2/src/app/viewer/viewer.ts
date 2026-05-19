import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss'
})
export class Viewer implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public roomService = inject(RoomService);
  
  errorMsg = signal<string | null>(null);
  fullscreenMode = signal<boolean>(false);

  rounds = computed(() => {
    const state = this.roomService.viewerState();
    if (!state || state.mode !== 'tournament' || !state.tournamentState || !state.tournamentState.matches) {
      return [];
    }
    const matchVals = Object.values(state.tournamentState.matches) as any[];
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

  hasJoinedAsPlayer = computed(() => {
    const state = this.roomService.viewerState();
    if (!state) return false;
    const myId = this.viewerId();
    if (!myId) return false;

    if (state.teams) {
      return state.teams.some(t => t.id === myId);
    }
    if (state.players) {
      return state.players.some(p => p.id === myId);
    }
    return false;
  });

  // Spectator Identity
  viewerId = signal<string>('');
  viewerName = signal<string>('');
  viewerEmoji = signal<string>('😎');
  hasJoinedAsSpectator = signal<boolean>(false);
  
  emojis = ['😎', '🚀', '🔥', '👾', '🎉', '🌟', '🐶', '🍕', '🎲', '💯'];
  cheerEmojis = ['🔥', '👏', '😮', '🎉', '💩', '👎', '🍅', '😡'];

  constructor() {
    this.viewerId.set(Math.random().toString(36).substr(2, 9));
    const savedName = localStorage.getItem('last_viewer_name');
    if (savedName) {
      this.viewerName.set(savedName);
    }
    const savedEmoji = localStorage.getItem('last_viewer_emoji');
    if (savedEmoji) {
      this.viewerEmoji.set(savedEmoji);
    }
  }

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

  joinAsSpectator() {
    const code = this.roomService.viewerRoomCode();
    const name = this.viewerName().trim();
    if (code && name) {
      this.hasJoinedAsSpectator.set(true);
      this.roomService.setSpectatorInfo(code, this.viewerId(), name, this.viewerEmoji());
      localStorage.setItem('last_viewer_name', name);
      localStorage.setItem('last_viewer_emoji', this.viewerEmoji());
    }
  }

  joinAsPlayer() {
    const code = this.roomService.viewerRoomCode();
    const name = this.viewerName().trim();
    if (code && name) {
      this.roomService.submitPlayerRequest(code, this.viewerId(), name);
    }
  }

  sendCheer(emoji: string) {
    const code = this.roomService.viewerRoomCode();
    if (code) {
      this.roomService.sendCheer(code, emoji, this.viewerName(), this.viewerEmoji());
    }
  }

  ngOnDestroy() {
    if (this.hasJoinedAsSpectator()) {
      this.roomService.leaveRoom(this.viewerId());
    } else {
      this.roomService.leaveRoom();
    }
  }
}
