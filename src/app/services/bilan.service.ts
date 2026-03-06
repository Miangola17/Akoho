import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BilanGlobal } from '../models/bilan.model';

@Injectable({ providedIn: 'root' })
export class BilanService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/bilan';

  getBilan(params?: { date?: string; lot_id?: number }): Observable<BilanGlobal> {
    let query = '';
    if (params?.date) query += `date=${params.date}`;
    if (params?.lot_id) query += (query ? '&' : '') + `lot_id=${params.lot_id}`;
    const url = query ? `${this.base}?${query}` : this.base;
    return this.http.get<BilanGlobal>(url);
  }
}
