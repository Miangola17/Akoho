import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaceService } from '../../services/race.service';
import { Race } from '../../models/race.model';

@Component({
  selector: 'app-races',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class RacesPage implements OnInit {
  private raceService = inject(RaceService);

  races = signal<Race[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingRace = signal<Race | null>(null);

  form = {
    nom: '',
    prix_unitaire_akoho: 0,
    prix_unitaire_oeuf: 0,
    prix_nourriture_par_gramme: 0
  };

  ngOnInit() { this.loadRaces(); }

  loadRaces() {
    this.loading.set(true);
    this.raceService.getAll().subscribe({
      next: (data) => { this.races.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  openCreateForm() {
    this.editingRace.set(null);
    this.form = { nom: '', prix_unitaire_akoho: 0, prix_unitaire_oeuf: 0, prix_nourriture_par_gramme: 0 };
    this.showForm.set(true);
  }

  openEditForm(race: Race) {
    this.editingRace.set(race);
    this.form = {
      nom: race.nom,
      prix_unitaire_akoho: race.prix_unitaire_akoho,
      prix_unitaire_oeuf: race.prix_unitaire_oeuf,
      prix_nourriture_par_gramme: race.prix_nourriture_par_gramme
    };
    this.showForm.set(true);
  }

  save() {
    const editing = this.editingRace();
    if (editing) {
      this.raceService.update(editing.id, this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadRaces(); },
        error: (err) => this.error.set(err.message)
      });
    } else {
      this.raceService.create(this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadRaces(); },
        error: (err) => this.error.set(err.message)
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cette race ?')) return;
    this.raceService.delete(id).subscribe({
      next: () => this.loadRaces(),
      error: (err) => this.error.set(err.message)
    });
  }

  cancel() { this.showForm.set(false); }
}
