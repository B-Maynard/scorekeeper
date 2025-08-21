import { Component, OnInit } from '@angular/core';
import { GamesService } from '../../services/games.service.service';
import { GameOption } from '../../interfaces/games.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {

  constructor(
    private gameService: GamesService
  ) {}

  gameOptions: GameOption[] | null = null;

  ngOnInit(): void {
    this.gameOptions = this.gameService.getGameOptions();
  }

}
