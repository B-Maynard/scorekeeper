import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  getCards() {
    return [
      {title: 'Cards', description: 'For most card games where score increments/decrements on the fly', icon: 'pi pi-id-card', route: '/cards'},
    ]
  }
}
