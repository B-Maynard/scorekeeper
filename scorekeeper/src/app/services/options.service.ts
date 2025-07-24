import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

  getOptions() {
    return [
      {title: 'Cards', description: 'For most card games where score increments/decrements on the fly', icon: 'pi pi-id-card', route: '/cards'},
      {title: 'Team-Based', description: 'For team vs. team games. Can create as many teams as you want', icon: 'pi pi-id-card', route: '/teams'}
    ]
  }
}
