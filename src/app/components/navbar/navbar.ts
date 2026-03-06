import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">🐔</span>
        <span class="brand-text">Akoho Manager</span>
      </div>
      <ul class="navbar-links">
        <li><a routerLink="/dashboard" routerLinkActive="active">Tableau de bord</a></li>
        <li><a routerLink="/races" routerLinkActive="active">Races</a></li>
        <li><a routerLink="/lots" routerLinkActive="active">Lots</a></li>
        <li><a routerLink="/statistiques" routerLinkActive="active">Statistiques</a></li>
        <li><a routerLink="/oeufs" routerLinkActive="active">Oeufs</a></li>
        <li><a routerLink="/bilan" routerLinkActive="active">Bilan</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #2c3e50;
      color: white;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      height: 56px;
      box-shadow: 0 2px 6px rgba(0,0,0,.3);
    }
    .navbar-brand { display: flex; align-items: center; gap: .5rem; font-size: 1.2rem; font-weight: 700; }
    .brand-icon { font-size: 1.5rem; }
    .navbar-links { display: flex; list-style: none; gap: 1rem; margin: 0; padding: 0; }
    .navbar-links a { color: #ccc; text-decoration: none; padding: .4rem .8rem; border-radius: 4px; transition: background .2s; }
    .navbar-links a:hover, .navbar-links a.active { background: #3d5166; color: white; }
  `]
})
export class NavbarComponent {}
