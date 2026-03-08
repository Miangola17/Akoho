import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StatistiqueService } from '../../services/statistique.service';
import { LotService } from '../../services/lot.service';
import { MortService } from '../../services/mort.service';
import { StatistiqueLot } from '../../models/statistique.model';
import { Lot } from '../../models/lot.model';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css'
})
export class StatistiquesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private statService = inject(StatistiqueService);
  private lotService = inject(LotService);
  private mortService = inject(MortService);

  lots = signal<Lot[]>([]);
  stats = signal<StatistiqueLot[]>([]);
  selectedLotId = signal<number | null>(null);
  selectedLot = signal<Lot | null>(null);
  loading = signal(false);
  error = signal('');
  showStatForm = signal(false);
  showMortForm = signal(false);
  editingStat = signal<StatistiqueLot | null>(null);

  statForm = { lot_id: 0, semaine: 0, date_stat: '', poids_g: 0, nourriture_g: 0 };
  mortForm = { lot_id: 0, date_mort: '', nombre: 0 };

  ngOnInit() {
    this.lotService.getAll().subscribe((lots: Lot[]) => {
      this.lots.set(lots);
      const routeLotId = this.route.snapshot.paramMap.get('lot_id');
      if (routeLotId) {
        this.selectLot(parseInt(routeLotId));
      }
    });
  }

  selectLot(id: number) {
    this.selectedLotId.set(id);
    const lot = this.lots().find((l: Lot) => l.id === id) || null;
    this.selectedLot.set(lot);
    this.loadStats(id);
  }

  loadStats(lotId: number) {
    this.loading.set(true);
    this.statService.getByLot(lotId).subscribe({
      next: (data: StatistiqueLot[]) => { this.stats.set(data); this.loading.set(false); },
      error: (err: any) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  get nextSemaine(): number {
    const list = this.stats();
    if (!list.length) return 0;
    return Math.max(...list.map((s: StatistiqueLot) => s.semaine)) + 1;
  }

  openStatForm(stat?: StatistiqueLot) {
    const lotId = this.selectedLotId()!;
    if (stat) {
      this.editingStat.set(stat);
      this.statForm = { lot_id: lotId, semaine: stat.semaine, date_stat: stat.date_stat?.slice(0,10), poids_g: stat.poids_g, nourriture_g: stat.nourriture_g };
    } else {
      this.editingStat.set(null);
      this.statForm = { lot_id: lotId, semaine: this.nextSemaine, date_stat: new Date().toISOString().slice(0, 10), poids_g: 0, nourriture_g: 0 };
    }
    this.showStatForm.set(true);
  }

  saveStat() {
    const editing = this.editingStat();
    if (editing) {
      this.statService.update(editing.id, this.statForm).subscribe({
        next: () => { this.showStatForm.set(false); this.loadStats(this.selectedLotId()!); },
        error: (err: any) => this.error.set(err.message)
      });
    } else {
      this.statService.create(this.statForm).subscribe({
        next: () => { this.showStatForm.set(false); this.loadStats(this.selectedLotId()!); },
        error: (err: any) => this.error.set(err.message)
      });
    }
  }

  deleteStat(id: number) {
    if (!confirm('Supprimer cette statistique ?')) return;
    this.statService.delete(id).subscribe({
      next: () => this.loadStats(this.selectedLotId()!),
      error: (err: any) => this.error.set(err.message)
    });
  }

  openMortForm() {
    this.mortForm = { lot_id: this.selectedLotId()!, date_mort: new Date().toISOString().slice(0,10), nombre: 0 };
    this.showMortForm.set(true);
  }

  saveMort() {
    this.mortService.create(this.mortForm).subscribe({
      next: () => {
        this.showMortForm.set(false);
        this.lotService.getById(this.selectedLotId()!).subscribe((lot: Lot) => {
          this.selectedLot.set(lot);
          const idx = this.lots().findIndex((l: Lot) => l.id === lot.id);
          const updated = [...this.lots()];
          updated[idx] = lot;
          this.lots.set(updated);
        });
      },
      error: (err: any) => this.error.set(err.message)
    });
  }

  cancel() { this.showStatForm.set(false); this.showMortForm.set(false); }

  aKohoAVendre(stat: StatistiqueLot): boolean {
    return stat.semaine > 0 && stat.poids_g === 0;
  }
}
