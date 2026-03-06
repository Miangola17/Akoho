import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BilanService } from '../../services/bilan.service';
import { LotService } from '../../services/lot.service';
import { BilanGlobal, BilanLot } from '../../models/bilan.model';
import { Lot } from '../../models/lot.model';

@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bilan.html',
  styleUrl: './bilan.css'
})
export class BilanPage implements OnInit {
  private bilanService = inject(BilanService);
  private lotService = inject(LotService);

  bilan = signal<BilanGlobal | null>(null);
  lots = signal<Lot[]>([]);
  loading = signal(false);
  error = signal('');

  // Filtres
  dateFiltre = '';
  lotFiltre = 0;
  vue: 'par-lot' | 'par-date' = 'par-lot';

  ngOnInit() {
    this.lotService.getAll().subscribe(l => this.lots.set(l));
    this.loadBilan();
  }

  loadBilan() {
    this.loading.set(true);
    const params: any = {};
    if (this.dateFiltre) params.date = this.dateFiltre;
    if (this.lotFiltre) params.lot_id = this.lotFiltre;
    this.bilanService.getBilan(params).subscribe({
      next: (data) => { this.bilan.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  resetFilters() {
    this.dateFiltre = '';
    this.lotFiltre = 0;
    this.loadBilan();
  }

  abs(n: number): number { return Math.abs(n); }
}
