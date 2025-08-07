
export interface Player {
  id: string;
  name: string;
  score: number;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface MatchSlot {
  id: string;        // player id or placeholder
  name: string;      // display name
  bye?: boolean;
}

export interface Match {
  id: string;
  a: MatchSlot | null;
  b: MatchSlot | null;
  winner?: MatchSlot | null;
}

export interface Round {
  id: string;
  matches: Match[];
}

export function uuid(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export class History<T> {
  private stack: T[] = [];
  private pointer = -1;

  push(state: T) {
    // drop any redo states
    if (this.pointer < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.pointer + 1);
    }
    this.stack.push(structuredClone(state));
    this.pointer++;
  }

  undo(current: T): T {
    if (this.pointer <= 0) return current;
    this.pointer--;
    return structuredClone(this.stack[this.pointer]);
  }

  canUndo(): boolean { return this.pointer > 0; }

  reset() {
    this.stack = [];
    this.pointer = -1;
  }
}
