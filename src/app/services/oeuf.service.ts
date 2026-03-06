import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Oeuf } from '../models/oeuf.model';

@Injectable({ providedIn: 'root' })
export class OeufService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/oeufs';

  getAll(lotId?: number): Observable<Oeuf[]> {
    const url = lotId ? `${this.base}?lot_id=${lotId}` : this.base;
    return this.http.get<Oeuf[]>(url);
  }

  getByLotAndDate(lotId: number, date: string): Observable<Oeuf[]> {
    return this.http.get<Oeuf[]>(`${this.base}/lot/${lotId}/date/${date}`);
  }

  create(oeuf: Partial<Oeuf>): Observable<Oeuf> {
    return this.http.post<Oeuf>(this.base, oeuf);
  }

  update(id: number, oeuf: Partial<Oeuf>): Observable<Oeuf> {
    return this.http.put<Oeuf>(`${this.base}/${id}`, oeuf);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
