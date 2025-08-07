
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <div style="margin-top:20px" class="grid">
      <div class="card">
        <h2>Cards</h2>
        <p>Track multiple players with notes and custom point amounts.</p>
        <div class="card-actions"><a routerLink="/cards" class="btn btn-cta">Open</a></div>
      </div>
      <div class="card">
        <h2>Teams</h2>
        <p>Create any number of teams, adjust by 1 or any amount.</p>
        <div class="card-actions"><a routerLink="/teams" class="btn btn-cta">Open</a></div>
      </div>
      <div class="card">
        <h2>Tournament</h2>
        <p>Bracket-style tournament with click-to-advance and animations.</p>
        <div class="card-actions"><a routerLink="/tournament" class="btn btn-cta">Open</a></div>
      </div>
    </div>
  `
})
export class HomeComponent {}
