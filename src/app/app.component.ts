
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="app-shell">
    <div class="toolbar">
      <h1>Score Keeper</h1>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/cards" routerLinkActive="active">Cards</a>
        <a routerLink="/teams" routerLinkActive="active">Teams</a>
        <a routerLink="/tournament" routerLinkActive="active">Tournament</a>
      </nav>
    </div>
    <router-outlet></router-outlet>
  </div>
  `
})
export class AppComponent {}
