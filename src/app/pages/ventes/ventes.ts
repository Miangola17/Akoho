import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenteService } from '../../services/vente.service';
import { LotService } from '../../services/lot.service';
import { OeufService } from '../../services/oeuf.service';
import { VentePoulet, VenteOeuf, ResumeVentes, Estimation } from '../../models/vente.model';
import { Lot } from '../../models/lot.model';
import { Oeuf } from '../../models/oeuf.model';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventes.html',
  styleUrl: './ventes.css'
})
export class VentesPage implements OnInit {
  private venteService = inject(VenteService);
  private lotService = inject(LotService);
  private oeufService = inject(OeufService);

  // Data
  ventesPoulet = signal<VentePoulet[]>([]);
  ventesOeuf = signal<VenteOeuf[]>([]);
  resume = signal<ResumeVentes | null>(null);
  estimation = signal<Estimation | null>(null);
  lots = signal<Lot[]>([]);
  oeufs = signal<Oeuf[]>([]);

  // UI state
  loading = signal(false);
  error = signal('');
  activeTab: 'resume' | 'poulet' | 'oeuf' | 'estimation' = 'resume';
  showFormPoulet = signal(false);
  showFormOeuf = signal(false);

  // Filtres
  dateFiltre = new Date().toISOString().slice(0, 10);

  // Formulaires
  formPoulet: Partial<VentePoulet> = { lot_id: 0, date_vente: '', nombre_vendus: 0, montant_total: 0 };
  formOeuf: Partial<VenteOeuf> = { oeuf_id: 0, date_vente: '', nombre_vendus: 0, montant_total: 0 };

  ngOnInit() {
    this.lotService.getAll().subscribe((l: Lot[]) => this.lots.set(l));
    this.oeufService.getAll().subscribe((o: Oeuf[]) => this.oeufs.set(o.filter((oeuf: Oeuf) => oeuf.type === 'vendre')));
    this.loadResume();
    this.loadEstimation();
  }

  loadResume() {
    this.loading.set(true);
    this.venteService.getResume(this.dateFiltre).subscribe({
      next: (data: any) => { this.resume.set(data); this.loading.set(false); },
      error: (err: any) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadVentesPoulet() {
    this.loading.set(true);
    this.venteService.getVentesPoulet(undefined, this.dateFiltre).subscribe({
      next: (data: any) => { this.ventesPoulet.set(data); this.loading.set(false); },
      error: (err: any) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadVentesOeuf() {
    this.loading.set(true);
    this.venteService.getVentesOeuf(this.dateFiltre).subscribe({
      next: (data: any) => { this.ventesOeuf.set(data); this.loading.set(false); },
      error: (err: any) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadEstimation() {
    this.venteService.getEstimation().subscribe({
      next: (data: any) => this.estimation.set(data),
      error: (err: any) => this.error.set(err.message)
    });
  }

  onTabChange(tab: 'resume' | 'poulet' | 'oeuf' | 'estimation') {
    this.activeTab = tab;
    if (tab === 'resume') this.loadResume();
    else if (tab === 'poulet') this.loadVentesPoulet();
    else if (tab === 'oeuf') this.loadVentesOeuf();
    else if (tab === 'estimation') this.loadEstimation();
  }

  onDateChange() {
    if (this.activeTab === 'resume') this.loadResume();
    else if (this.activeTab === 'poulet') this.loadVentesPoulet();
    else if (this.activeTab === 'oeuf') this.loadVentesOeuf();
  }

  // === VENTES POULET ===
  openFormPoulet() {
    this.formPoulet = { lot_id: 0, date_vente: this.dateFiltre, nombre_vendus: 0, montant_total: 0 };
    this.showFormPoulet.set(true);
  }

  savePoulet() {
    this.venteService.createVentePoulet(this.formPoulet).subscribe({
      next: () => { this.showFormPoulet.set(false); this.loadVentesPoulet(); this.loadResume(); },
      error: (err: any) => this.error.set(err.message)
    });
  }

  deletePoulet(id: number) {
    if (!confirm('Supprimer cette vente ?')) return;
    this.venteService.deleteVentePoulet(id).subscribe({
      next: () => { this.loadVentesPoulet(); this.loadResume(); },
      error: (err: any) => this.error.set(err.message)
    });
  }

  onLotChange() {
    const lot = this.lots().find((l: Lot) => l.id === this.formPoulet.lot_id);
    if (lot && this.formPoulet.nombre_vendus) {
      this.formPoulet.montant_total = this.formPoulet.nombre_vendus * (lot.prix_unitaire_akoho || 0);
    }
  }

  onNombreVendusPouletChange() {
    this.onLotChange();
  }

  // === VENTES OEUF ===
  openFormOeuf() {
    this.formOeuf = { oeuf_id: 0, date_vente: this.dateFiltre, nombre_vendus: 0, montant_total: 0 };
    this.showFormOeuf.set(true);
  }

  saveOeuf() {
    this.venteService.createVenteOeuf(this.formOeuf).subscribe({
      next: () => { this.showFormOeuf.set(false); this.loadVentesOeuf(); this.loadResume(); },
      error: (err: any) => this.error.set(err.message)
    });
  }

  deleteOeuf(id: number) {
    if (!confirm('Supprimer cette vente ?')) return;
    this.venteService.deleteVenteOeuf(id).subscribe({
      next: () => { this.loadVentesOeuf(); this.loadResume(); },
      error: (err: any) => this.error.set(err.message)
    });
  }

  onOeufChange() {
    const oeuf = this.oeufs().find((o: Oeuf) => o.id === this.formOeuf.oeuf_id);
    if (oeuf && this.formOeuf.nombre_vendus) {
      this.formOeuf.montant_total = this.formOeuf.nombre_vendus * (oeuf.prix_unitaire_oeuf || 0);
    }
  }

  onNombreVendusOeufChange() {
    this.onOeufChange();
  }

  cancelPoulet() { this.showFormPoulet.set(false); }
  cancelOeuf() { this.showFormOeuf.set(false); }
}
