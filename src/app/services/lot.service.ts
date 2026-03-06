import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lot } from '../models/lot.model';

@Injectable({ providedIn: 'root' })
export class LotService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/lots';

  getAll(): Observable<Lot[]> {
    return this.http.get<Lot[]>(this.base);
  }

  getById(id: number): Observable<Lot> {
    return this.http.get<Lot>(`${this.base}/${id}`);
  }

  create(lot: Partial<Lot>): Observable<Lot> {
    return this.http.post<Lot>(this.base, lot);
  }

  update(id: number, lot: Partial<Lot>): Observable<Lot> {
    return this.http.put<Lot>(`${this.base}/${id}`, lot);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
