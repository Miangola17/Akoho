import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Race } from '../models/race.model';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/races';

  getAll(): Observable<Race[]> {
    return this.http.get<Race[]>(this.base);
  }

  getById(id: number): Observable<Race> {
    return this.http.get<Race>(`${this.base}/${id}`);
  }

  create(race: Partial<Race>): Observable<Race> {
    return this.http.post<Race>(this.base, race);
  }

  update(id: number, race: Partial<Race>): Observable<Race> {
    return this.http.put<Race>(`${this.base}/${id}`, race);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
