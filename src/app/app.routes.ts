import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard/dashboard';
import { RacesPage } from './pages/races/races';
import { LotsPage } from './pages/lots/lots';
import { StatistiquesPage } from './pages/statistiques/statistiques';
import { OeufsPage } from './pages/oeufs/oeufs';
import { BilanPage } from './pages/bilan/bilan';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'races', component: RacesPage },
  { path: 'lots', component: LotsPage },
  { path: 'statistiques', component: StatistiquesPage },
  { path: 'statistiques/:lot_id', component: StatistiquesPage },
  { path: 'oeufs', component: OeufsPage },
  { path: 'bilan', component: BilanPage },
];
