import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageConfig {

  public readonly GAME_TYPES = {
    CARDS: "cards",
    TEAMS: "teams"
  }
  
}
