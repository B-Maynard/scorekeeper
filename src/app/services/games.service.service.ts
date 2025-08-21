import { Injectable } from '@angular/core';
import { GameOption } from '../interfaces/games.interface';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor() { }

  getGameOptions(): GameOption[] {
    return [
      {
        headerText: 'Cards',
        descriptionText: 'Track multiple players with notes and custom point amounts.',
        actionRoute: '/cards'
      },
      {
        headerText: 'Teams',
        descriptionText: 'Team vs Team with single point increment/decrement.',
        actionRoute: '/teams'
      },
      {
        headerText: 'Tournament',
        descriptionText: 'Bracket-style tournament with click-to-advance and animations.',
        actionRoute: '/tournament'
      }
    ]
  }
}
