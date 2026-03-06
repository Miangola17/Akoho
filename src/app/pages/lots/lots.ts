import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { RaceService } from '../../services/race.service';
import { Lot } from '../../models/lot.model';
import { Race } from '../../models/race.model';

@Component({
  selector: 'app-lots',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lots.html',
  styleUrl: './lots.css'
})
export class LotsPage implements OnInit {
  private lotService = inject(LotService);
  private raceService = inject(RaceService);

  lots = signal<Lot[]>([]);
  races = signal<Race[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingLot = signal<Lot | null>(null);

  form: Partial<Lot> = {
    nom: '', race_id: 0, date_creation: '', nombre_initial: 0,
    prix_achat_unitaire: 0, nombre_morts: 0, description: ''
  };

  ngOnInit() {
    this.loadLots();
    this.raceService.getAll().subscribe(r => this.races.set(r));
  }

  loadLots() {
    this.loading.set(true);
    this.lotService.getAll().subscribe({
      next: (data) => { this.lots.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  openCreateForm() {
    this.editingLot.set(null);
    this.form = { nom: '', race_id: 0, date_creation: new Date().toISOString().slice(0, 10), nombre_initial: 0, prix_achat_unitaire: 0, nombre_morts: 0, description: '' };
    this.showForm.set(true);
  }

  openEditForm(lot: Lot) {
    this.editingLot.set(lot);
    this.form = { ...lot };
    this.showForm.set(true);
  }

  save() {
    const editing = this.editingLot();
    if (editing) {
      this.lotService.update(editing.id, this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadLots(); },
        error: (err) => this.error.set(err.message)
      });
    } else {
      this.lotService.create(this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadLots(); },
        error: (err) => this.error.set(err.message)
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer ce lot (toutes les statistiques et oeufs associés seront supprimés) ?')) return;
    this.lotService.delete(id).subscribe({
      next: () => this.loadLots(),
      error: (err) => this.error.set(err.message)
    });
  }

  cancel() { this.showForm.set(false); }
}
