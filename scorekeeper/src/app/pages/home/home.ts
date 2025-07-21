import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardsService } from '../../services/cards.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  public cards: any = [];

  constructor(
     private cardsService: CardsService,
     private router: Router
  ) {}
  

  ngOnInit(): void {
    this.cards = this.cardsService.getCards();
  }

  navigateTo(route: any) {

  }


}
