import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OeufService } from '../../services/oeuf.service';
import { LotService } from '../../services/lot.service';
import { Oeuf } from '../../models/oeuf.model';
import { Lot } from '../../models/lot.model';

@Component({
  selector: 'app-oeufs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oeufs.html',
  styleUrl: './oeufs.css'
})
export class OeufsPage implements OnInit {
  private oeufService = inject(OeufService);
  private lotService = inject(LotService);

  oeufs = signal<Oeuf[]>([]);
  lots = signal<Lot[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingOeuf = signal<Oeuf | null>(null);

  form: Partial<Oeuf> = {
    lot_id: 0, date_pondement: '', nombre_oeufs: 0, nombre_oeufs_morts: 0, type: 'vendre'
  };

  filterLotId: number = 0;

  ngOnInit() {
    this.lotService.getAll().subscribe(lots => this.lots.set(lots));
    this.loadOeufs();
  }

  loadOeufs() {
    this.loading.set(true);
    this.oeufService.getAll(this.filterLotId || undefined).subscribe({
      next: (data) => { this.oeufs.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  openCreateForm() {
    this.editingOeuf.set(null);
    this.form = { lot_id: 0, date_pondement: new Date().toISOString().slice(0, 10), nombre_oeufs: 0, nombre_oeufs_morts: 0, type: 'vendre' };
    this.showForm.set(true);
  }

  openEditForm(oeuf: Oeuf) {
    this.editingOeuf.set(oeuf);
    this.form = { ...oeuf, date_pondement: oeuf.date_pondement?.slice(0, 10) };
    this.showForm.set(true);
  }

  save() {
    const editing = this.editingOeuf();
    if (editing) {
      this.oeufService.update(editing.id, this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadOeufs(); },
        error: (err) => this.error.set(err.message)
      });
    } else {
      this.oeufService.create(this.form).subscribe({
        next: () => { this.showForm.set(false); this.loadOeufs(); },
        error: (err) => this.error.set(err.message)
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    this.oeufService.delete(id).subscribe({
      next: () => this.loadOeufs(),
      error: (err) => this.error.set(err.message)
    });
  }

  cancel() { this.showForm.set(false); }
  onFilterChange() { this.loadOeufs(); }
}
