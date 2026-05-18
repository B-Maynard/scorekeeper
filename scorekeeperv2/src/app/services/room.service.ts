import { Injectable, inject, signal } from '@angular/core';
import { Database } from '@angular/fire/database';
import { ref, set, onValue, off, update, get, onDisconnect } from 'firebase/database';

export interface RoomState {
  mode: 'team' | 'cumulative';
  teams?: any[];
  players?: any[];
  phase?: string;
  roundInput?: any;
  winCondition?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private db: Database = inject(Database);
  
  // State for viewers
  public viewerRoomCode = signal<string | null>(null);
  public viewerState = signal<RoomState | null>(null);
  public isHosting = signal<boolean>(false);
  public hostRoomCode = signal<string | null>(null);
  
  public isOnline = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const connectedRef = ref(this.db, '.info/connected');
      onValue(connectedRef, (snap) => {
        const connected = snap.val();
        this.isOnline.set(connected === true);
        if (connected !== true) {
          this.stopHosting();
        }
      });
    }
  }

  // Generate a 4 character alphanumeric code
  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Host a game
  async hostRoom(initialState: RoomState): Promise<string> {
    const code = this.generateRoomCode();
    const roomRef = ref(this.db, `rooms/${code}`);
    
    // Check if exists (unlikely with 4 chars, but good practice)
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      return this.hostRoom(initialState); // retry
    }

    // Ensure room is automatically deleted if the host disconnects or refreshes
    await onDisconnect(roomRef).remove();

    await set(roomRef, initialState);
    this.isHosting.set(true);
    this.hostRoomCode.set(code);
    return code;
  }

  // Update room state as host
  updateRoomState(fullState: RoomState) {
    if (this.isHosting() && this.hostRoomCode()) {
      const roomRef = ref(this.db, `rooms/${this.hostRoomCode()}`);
      set(roomRef, fullState);
    }
  }

  stopHosting() {
    if (this.isHosting() && this.hostRoomCode()) {
      const roomRef = ref(this.db, `rooms/${this.hostRoomCode()}`);
      set(roomRef, null); // Delete the room
      onDisconnect(roomRef).cancel(); // Cancel the disconnect hook
      this.isHosting.set(false);
      this.hostRoomCode.set(null);
    }
  }

  // Join a game as viewer
  async joinRoom(code: string): Promise<boolean> {
    const upperCode = code.toUpperCase();
    const roomRef = ref(this.db, `rooms/${upperCode}`);
    
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      return false; // Room doesn't exist
    }

    this.viewerRoomCode.set(upperCode);
    
    // Listen for updates
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.viewerState.set(data as RoomState);
      } else {
        // Room was deleted/closed
        this.leaveRoom();
      }
    });

    return true;
  }

  leaveRoom() {
    if (this.viewerRoomCode()) {
      const roomRef = ref(this.db, `rooms/${this.viewerRoomCode()}`);
      off(roomRef); // stop listening
      this.viewerRoomCode.set(null);
      this.viewerState.set(null);
    }
  }
}
