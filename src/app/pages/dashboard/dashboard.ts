import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { RaceService } from '../../services/race.service';
import { BilanService } from '../../services/bilan.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash">
      <h1>Tableau de bord — Akoho Manager</h1>
      <div class="stats-row">
        <div class="stat-card blue">
          <div class="stat-icon">🐔</div>
          <div class="stat-val">{{ nbLots() }}</div>
          <div class="stat-label">Lots actifs</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">🧬</div>
          <div class="stat-val">{{ nbRaces() }}</div>
          <div class="stat-label">Races</div>
        </div>
        <div class="stat-card green" *ngIf="bilan()">
          <div class="stat-icon">💰</div>
          <div class="stat-val">{{ bilan()!.totaux.benefice_total | number:'1.0-0' }} Ar</div>
          <div class="stat-label">Bénéfice total</div>
        </div>
        <div class="stat-card red" *ngIf="bilan()">
          <div class="stat-icon">📉</div>
          <div class="stat-val">{{ bilan()!.totaux.perte_totale | number:'1.0-0' }} Ar</div>
          <div class="stat-label">Perte totale</div>
        </div>
      </div>

      <div class="dash-links">
        <a routerLink="/races" class="dash-link">
          <span>🧬</span><span>Gérer les races</span>
        </a>
        <a routerLink="/lots" class="dash-link">
          <span>🐔</span><span>Gérer les lots</span>
        </a>
        <a routerLink="/statistiques" class="dash-link">
          <span>📊</span><span>Statistiques</span>
        </a>
        <a routerLink="/oeufs" class="dash-link">
          <span>🥚</span><span>Gestion des oeufs</span>
        </a>
        <a routerLink="/bilan" class="dash-link">
          <span>💼</span><span>Bilan financier</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dash { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { border-radius: 12px; padding: 1.5rem; color: white; text-align: center; }
    .stat-card.blue { background: #2980b9; }
    .stat-card.purple { background: #8e44ad; }
    .stat-card.green { background: #27ae60; }
    .stat-card.red { background: #e74c3c; }
    .stat-icon { font-size: 2rem; }
    .stat-val { font-size: 1.8rem; font-weight: 700; }
    .stat-label { font-size: .85rem; opacity: .85; }
    .dash-links { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 1rem; }
    .dash-link { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-decoration: none; color: #2c3e50; font-weight: 600; transition: transform .15s, box-shadow .15s; font-size: 1rem; }
    .dash-link span:first-child { font-size: 2rem; }
    .dash-link:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.15); }
  `]
})
export class DashboardPage implements OnInit {
  private lotService = inject(LotService);
  private raceService = inject(RaceService);
  private bilanService = inject(BilanService);

  nbLots = signal(0);
  nbRaces = signal(0);
  bilan = signal<any>(null);

  ngOnInit() {
    this.lotService.getAll().subscribe(l => this.nbLots.set(l.length));
    this.raceService.getAll().subscribe(r => this.nbRaces.set(r.length));
    this.bilanService.getBilan().subscribe(b => this.bilan.set(b));
  }
}
