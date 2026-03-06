import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatistiqueLot } from '../models/statistique.model';

@Injectable({ providedIn: 'root' })
export class StatistiqueService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/statistiques';

  getByLot(lotId: number): Observable<StatistiqueLot[]> {
    return this.http.get<StatistiqueLot[]>(`${this.base}/lot/${lotId}`);
  }

  getByLotAndDate(lotId: number, date: string): Observable<StatistiqueLot[]> {
    return this.http.get<StatistiqueLot[]>(`${this.base}/lot/${lotId}/date/${date}`);
  }

  create(stat: Partial<StatistiqueLot>): Observable<StatistiqueLot> {
    return this.http.post<StatistiqueLot>(this.base, stat);
  }

  update(id: number, stat: Partial<StatistiqueLot>): Observable<StatistiqueLot> {
    return this.http.put<StatistiqueLot>(`${this.base}/${id}`, stat);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
