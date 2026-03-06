import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MortLot {
  id: number;
  lot_id: number;
  date_mort: string;
  nombre: number;
}

@Injectable({ providedIn: 'root' })
export class MortService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/morts';

  getByLot(lotId: number): Observable<MortLot[]> {
    return this.http.get<MortLot[]>(`${this.base}/lot/${lotId}`);
  }

  create(mort: Partial<MortLot>): Observable<any> {
    return this.http.post(this.base, mort);
  }
}
