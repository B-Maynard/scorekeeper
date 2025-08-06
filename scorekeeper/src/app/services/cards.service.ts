import { Injectable } from '@angular/core';
import { LocalStorageConfig } from '../configs/localStorage.config';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor(
    private localStorageConfig: LocalStorageConfig
  ) {}

  setupGame(): Player[]  {

    let newGameData: CardsGame = {
      playerData: []
    }

    localStorage.setItem(this.localStorageConfig.GAME_TYPES.CARDS, JSON.stringify(newGameData));
    return newGameData.playerData;
  }

  getGameData() {
    let currentCardsGame = localStorage.getItem(this.localStorageConfig.GAME_TYPES.CARDS);

    if (!currentCardsGame) {
      return this.setupGame();
    }
    else {
      let cardsGame = JSON.parse(currentCardsGame);
      return cardsGame?.playerData;
    }
  }

  saveGameData(playerData: Player[]) {
    let gameData: CardsGame = {
      playerData: playerData
    };

    localStorage.setItem(this.localStorageConfig.GAME_TYPES.CARDS, JSON.stringify(gameData));
  }
  
}
