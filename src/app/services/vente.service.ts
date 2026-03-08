import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentePoulet, VenteOeuf, ResumeVentes, Estimation } from '../models/vente.model';

@Injectable({ providedIn: 'root' })
export class VenteService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/ventes';

  // === VENTES POULET ===
  getVentesPoulet(lotId?: number, date?: string): Observable<VentePoulet[]> {
    let params = new HttpParams();
    if (lotId) params = params.set('lot_id', lotId.toString());
    if (date) params = params.set('date', date);
    return this.http.get<VentePoulet[]>(`${this.base}/poulet`, { params });
  }

  getVentesPouletPeriode(dateDebut: string, dateFin: string): Observable<VentePoulet[]> {
    const params = new HttpParams()
      .set('date_debut', dateDebut)
      .set('date_fin', dateFin);
    return this.http.get<VentePoulet[]>(`${this.base}/poulet/periode`, { params });
  }

  createVentePoulet(vente: Partial<VentePoulet>): Observable<VentePoulet> {
    return this.http.post<VentePoulet>(`${this.base}/poulet`, vente);
  }

  deleteVentePoulet(id: number): Observable<any> {
    return this.http.delete(`${this.base}/poulet/${id}`);
  }

  // === VENTES OEUF ===
  getVentesOeuf(date?: string): Observable<VenteOeuf[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<VenteOeuf[]>(`${this.base}/oeuf`, { params });
  }

  getVentesOeufPeriode(dateDebut: string, dateFin: string): Observable<VenteOeuf[]> {
    const params = new HttpParams()
      .set('date_debut', dateDebut)
      .set('date_fin', dateFin);
    return this.http.get<VenteOeuf[]>(`${this.base}/oeuf/periode`, { params });
  }

  createVenteOeuf(vente: Partial<VenteOeuf>): Observable<VenteOeuf> {
    return this.http.post<VenteOeuf>(`${this.base}/oeuf`, vente);
  }

  deleteVenteOeuf(id: number): Observable<any> {
    return this.http.delete(`${this.base}/oeuf/${id}`);
  }

  // === RÉSUMÉ & ESTIMATION ===
  getResume(date?: string): Observable<ResumeVentes> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ResumeVentes>(`${this.base}/resume`, { params });
  }

  getEstimation(): Observable<Estimation> {
    return this.http.get<Estimation>(`${this.base}/estimation`);
  }
}
