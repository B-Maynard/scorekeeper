import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, set, onValue, off, update, get, onDisconnect } from '@angular/fire/database';

export interface RoomState {
  mode: 'team' | 'cumulative' | 'tournament';
  teams?: any[];
  players?: any[];
  phase?: string;
  roundInput?: any;
  winCondition?: string;
  tournamentState?: any;
  allowViewerJoin?: boolean;
  spectators?: Record<string, { name: string, emoji: string }>;
  cheerEvents?: Record<string, { emoji: string, timestamp: number, name?: string, avatar?: string }>;
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
  
  // Host tracking of viewers
  public hostSpectators = signal<Record<string, { name: string, emoji: string }>>({});
  public hostPlayerRequests = signal<Record<string, { name: string }>>({});
  public latestCheer = signal<{ emoji: string, id: string, name?: string, avatar?: string } | null>(null);
  
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
    
    // Listen for spectator actions specifically
    onValue(ref(this.db, `rooms/${code}/spectators`), (snapshot) => {
      this.hostSpectators.set(snapshot.val() || {});
    });
    
    onValue(ref(this.db, `rooms/${code}/playerRequests`), (snapshot) => {
      this.hostPlayerRequests.set(snapshot.val() || {});
    });
    
    onValue(ref(this.db, `rooms/${code}/cheerEvents`), (snapshot) => {
      const events: Record<string, { emoji: string, timestamp: number, name?: string, avatar?: string }> = snapshot.val();
      if (events) {
         const cheers = Object.entries(events);
         if (cheers.length > 0) {
             const latest = cheers.reduce((prev, curr) => (curr[1].timestamp > prev[1].timestamp ? curr : prev));
             this.latestCheer.set({ 
               emoji: latest[1].emoji, 
               id: latest[0],
               name: latest[1].name,
               avatar: latest[1].avatar
             });
         } else {
             this.latestCheer.set(null);
         }
      } else {
         this.latestCheer.set(null);
      }
    });

    return code;
  }

  // Update room state as host
  updateRoomState(fullState: Partial<RoomState>) {
    if (this.isHosting() && this.hostRoomCode()) {
      const roomRef = ref(this.db, `rooms/${this.hostRoomCode()}`);
      update(roomRef, fullState);
    }
  }

  stopHosting() {
    if (this.isHosting() && this.hostRoomCode()) {
      const code = this.hostRoomCode();
      const roomRef = ref(this.db, `rooms/${code}`);
      
      // Stop listeners gracefully
      off(ref(this.db, `rooms/${code}/spectators`));
      off(ref(this.db, `rooms/${code}/cheerEvents`));
      off(ref(this.db, `rooms/${code}/playerRequests`));
      
      set(roomRef, null); // Delete the room
      onDisconnect(roomRef).cancel(); // Cancel the disconnect hook
      this.isHosting.set(false);
      this.hostRoomCode.set(null);
      this.hostPlayerRequests.set({});
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

    // Listen for cheerEvents specifically for spectators as well!
    onValue(ref(this.db, `rooms/${upperCode}/cheerEvents`), (snapshot) => {
      const events: Record<string, { emoji: string, timestamp: number, name?: string, avatar?: string }> = snapshot.val();
      if (events) {
         const cheers = Object.entries(events);
         if (cheers.length > 0) {
             const latest = cheers.reduce((prev, curr) => (curr[1].timestamp > prev[1].timestamp ? curr : prev));
             this.latestCheer.set({ 
               emoji: latest[1].emoji, 
               id: latest[0],
               name: latest[1].name,
               avatar: latest[1].avatar
             });
         } else {
             this.latestCheer.set(null);
         }
      } else {
         this.latestCheer.set(null);
      }
    });

    return true;
  }

  leaveRoom(viewerId?: string) {
    if (this.viewerRoomCode()) {
      const code = this.viewerRoomCode();
      if (viewerId) {
        const specRef = ref(this.db, `rooms/${code}/spectators/${viewerId}`);
        set(specRef, null); // Gracefully remove spectator from database immediately on exit!
      }
      const roomRef = ref(this.db, `rooms/${code}`);
      off(roomRef); // stop listening
      off(ref(this.db, `rooms/${code}/cheerEvents`)); // stop listening to cheers for viewer as well!
      
      this.viewerRoomCode.set(null);
      this.viewerState.set(null);
      this.latestCheer.set(null);
    }
  }

  // Send a cheer as a viewer
  sendCheer(roomCode: string, emoji: string, name?: string, avatar?: string) {
    const cheerId = Date.now().toString() + Math.floor(Math.random() * 1000);
    const cheerRef = ref(this.db, `rooms/${roomCode}/cheerEvents/${cheerId}`);
    set(cheerRef, { 
      emoji, 
      timestamp: Date.now(),
      name: name || 'Spectator',
      avatar: avatar || '😎'
    });
    
    // Auto cleanup cheer after 5 seconds to prevent DB bloat
    setTimeout(() => {
      set(cheerRef, null);
    }, 5000);
  }

  // Set spectator info
  setSpectatorInfo(roomCode: string, viewerId: string, name: string, emoji: string) {
    const specRef = ref(this.db, `rooms/${roomCode}/spectators/${viewerId}`);
    set(specRef, { name, emoji });
    onDisconnect(specRef).remove();
  }

  // Submit a player join request
  submitPlayerRequest(roomCode: string, viewerId: string, name: string) {
    const reqRef = ref(this.db, `rooms/${roomCode}/playerRequests/${viewerId}`);
    set(reqRef, { name });
  }

  // Resolve a player join request (called by host)
  resolvePlayerRequest(viewerId: string) {
    if (this.isHosting() && this.hostRoomCode()) {
      const reqRef = ref(this.db, `rooms/${this.hostRoomCode()}/playerRequests/${viewerId}`);
      set(reqRef, null);
    }
  }
}
