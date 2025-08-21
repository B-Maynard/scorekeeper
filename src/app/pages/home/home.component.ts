
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamesService } from '../../services/games.service.service';
import { GameOption } from '../../interfaces/games.interface';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private gameService: GamesService
  ) {}

  gameOptions: GameOption[] | null = null;

  ngOnInit(): void {
    this.gameOptions = this.gameService.getGameOptions();
  }
}
